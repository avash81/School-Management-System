import { randomUUID } from 'node:crypto';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@schoolos/database';

@Injectable()
export class DocumentService {
  async createTemplate(schoolId: string, userId: string, payload: Record<string, unknown>) {
    if (payload.isActive) await prisma.documentTemplate.updateMany({ where: { schoolId, type: 'marksheet' }, data: { isActive: false } });
    const template = await prisma.documentTemplate.create({ data: { schoolId, type: 'marksheet', name: String(payload.name ?? 'Marksheet'), version: String(payload.version ?? '1.0'), isActive: Boolean(payload.isActive ?? true), canvasJson: payload.canvasJson as never, htmlTemplate: payload.htmlTemplate ? String(payload.htmlTemplate) : null, cssTemplate: payload.cssTemplate ? String(payload.cssTemplate) : null } });
    await prisma.auditLog.create({ data: { schoolId, userId, module: 'DOCUMENTS', action: 'TEMPLATE_CREATED', message: 'Marksheet template created', entityId: template.id } });
    return template;
  }

  async preview(schoolId: string, examId: string, studentId: string) {
    const result = await prisma.result.findFirst({ where: { schoolId, examId, studentId, status: { in: ['approved', 'published'] }, deletedAt: null } });
    if (!result) throw new BadRequestException('An approved result is required before marksheet generation.');
    const student = await prisma.student.findFirst({ where: { id: studentId, schoolId, deletedAt: null } });
    const exam = await prisma.exam.findFirst({ where: { id: examId, schoolId, deletedAt: null } });
    if (!student || !exam) throw new NotFoundException('Student or examination not found.');
    return { schoolId, exam, student, result, templateVariables: { 'student.name': `${student.firstName} ${student.lastName}`, 'student.admissionNumber': student.admissionNo, 'exam.name': exam.name, 'result.percentage': result.percentage.toString(), 'result.grade': result.grade, 'result.status': result.passStatus } };
  }

  async generate(schoolId: string, userId: string, examId: string, studentId: string) {
    const template = await prisma.documentTemplate.findFirst({ where: { schoolId, type: 'marksheet', isActive: true, deletedAt: null }, orderBy: { createdAt: 'desc' } });
    if (!template) throw new BadRequestException('An active marksheet template is required.');
    const data = await this.preview(schoolId, examId, studentId);
    const document = await prisma.generatedDocument.create({ data: { schoolId, templateId: template.id, type: 'marksheet', status: 'queued', title: `Marksheet - ${data.student.firstName} ${data.student.lastName}`, sourceEntityType: 'result', sourceEntityId: data.result.id, verificationCode: randomUUID().replaceAll('-', '').slice(0, 16), templateVersion: template.version, sourceDataVersion: data.result.updatedAt.toISOString(), generatedByUserId: userId } });
    await prisma.documentHistory.create({ data: { schoolId, generatedDocumentId: document.id, action: 'QUEUED', performedByUserId: userId, notes: 'Marksheet generation queued' } });
    return { ...document, preview: data };
  }

  async generateBulk(schoolId: string, userId: string, examId: string) {
    const results = await prisma.result.findMany({ where: { schoolId, examId, status: { in: ['approved', 'published'] }, deletedAt: null }, select: { studentId: true } });
    if (!results.length) throw new BadRequestException('No approved results are available.');
    const documents = [];
    for (const result of results) documents.push(await this.generate(schoolId, userId, examId, result.studentId));
    return { status: 'queued', total: documents.length, documents };
  }

  getDocument(schoolId: string, id: string) {
    return prisma.generatedDocument.findFirst({ where: { id, schoolId, deletedAt: null } }).then((document) => {
      if (!document) throw new NotFoundException('Document not found.');
      return document;
    });
  }

  verifyDocument(verificationCode: string) {
    return prisma.generatedDocument.findUnique({ where: { verificationCode }, select: { verificationCode: true, type: true, title: true, status: true, generatedAt: true } }).then((document) => ({ verified: Boolean(document), document }));
  }
}
