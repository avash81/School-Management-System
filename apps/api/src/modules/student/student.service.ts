import { randomUUID } from 'node:crypto';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@schoolos/database';
import { prisma } from '@schoolos/database';

type StudentInput = Record<string, unknown>;

@Injectable()
export class StudentService {
  async create(schoolId: string, userId: string, payload: StudentInput) {
    this.requireStudentFields(payload);
    const student = await prisma.student.create({ data: this.studentData(schoolId, payload) });
    await this.audit(schoolId, userId, 'STUDENT_CREATED', 'Student created', student.id);
    return student;
  }

  async list(schoolId: string, query: StudentInput) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
    const search = query.search ? String(query.search).trim() : undefined;
    const where: Prisma.StudentWhereInput = {
      schoolId,
      deletedAt: null,
      ...(query.status ? { status: String(query.status) as never } : {}),
      ...(search ? { OR: [{ firstName: { contains: search, mode: 'insensitive' as const } }, { lastName: { contains: search, mode: 'insensitive' as const } }, { admissionNo: { contains: search, mode: 'insensitive' as const } }, { academicId: { contains: search, mode: 'insensitive' as const } }, { phone: { contains: search, mode: 'insensitive' as const } }] } : {}),
    };
    const enrollmentFilter = query.academicYearId || query.classId || query.sectionId || query.rollNumber ? { academicYearId: query.academicYearId ? String(query.academicYearId) : undefined, classId: query.classId ? String(query.classId) : undefined, sectionId: query.sectionId ? String(query.sectionId) : undefined, rollNumber: query.rollNumber ? { contains: String(query.rollNumber), mode: 'insensitive' as const } : undefined, schoolId, deletedAt: null } : null;
    if (enrollmentFilter) {
      const matches = await prisma.enrollment.findMany({ where: enrollmentFilter, select: { studentId: true } });
      Object.assign(where, { id: { in: matches.map((match) => match.studentId) } });
    }
    const [data, total] = await Promise.all([
      prisma.student.findMany({ where, select: { id: true, academicId: true, admissionNo: true, firstName: true, middleName: true, lastName: true, dateOfBirth: true, gender: true, status: true }, orderBy: { lastName: 'asc' }, skip: (page - 1) * limit, take: limit }),
      prisma.student.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async fts(schoolId: string, query: StudentInput) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(query.limit ?? 10)));
    const q = String(query.q ?? query.search ?? '').trim();
    if (!q) return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
    const emailGuardian = query.email || query.phone || query.guardian ? true : false;
    const where: Prisma.StudentWhereInput = {
      schoolId,
      deletedAt: null,
      OR: [
        { firstName: { startsWith: q, mode: 'insensitive' as const } },
        { lastName: { startsWith: q, mode: 'insensitive' as const } },
        { preferredName: { startsWith: q, mode: 'insensitive' as const } },
        { admissionNo: { startsWith: q, mode: 'insensitive' as const } },
        { academicId: { startsWith: q, mode: 'insensitive' as const } },
        ...(emailGuardian ? [{ email: { startsWith: q, mode: 'insensitive' as const } }, { phone: { startsWith: q, mode: 'insensitive' as const } }] : []),
      ],
    };
    const [data, total] = await Promise.all([
      prisma.student.findMany({ where, select: { id: true, academicId: true, admissionNo: true, firstName: true, middleName: true, lastName: true, preferredName: true, dateOfBirth: true, gender: true, status: true }, orderBy: { lastName: 'asc' }, skip: (page - 1) * limit, take: limit }),
      prisma.student.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(schoolId: string, id: string) {
    const student = await prisma.student.findFirst({ where: { id, schoolId, deletedAt: null } });
    if (!student) throw new NotFoundException('Student not found.');
    return student;
  }

  async update(schoolId: string, userId: string, id: string, payload: StudentInput) {
    await this.findOne(schoolId, id);
    const student = await prisma.student.update({ where: { id }, data: this.studentData(schoolId, payload, false) });
    await this.audit(schoolId, userId, 'STUDENT_UPDATED', 'Student updated', id);
    return student;
  }

  async enrollments(schoolId: string, studentId: string) {
    await this.findOne(schoolId, studentId);
    return prisma.enrollment.findMany({ where: { schoolId, studentId, deletedAt: null }, orderBy: { enrolledAt: 'desc' } });
  }

  async createEnrollment(schoolId: string, userId: string, studentId: string, payload: StudentInput) {
    await this.findOne(schoolId, studentId);
    const ids = ['academicYearId', 'classId', 'sectionId'];
    for (const id of ids) if (!payload[id]) throw new BadRequestException(`${id} is required.`);
    const [year, classRecord, section] = await Promise.all([
      prisma.academicYear.findFirst({ where: { id: String(payload.academicYearId), schoolId, deletedAt: null } }),
      prisma.class.findFirst({ where: { id: String(payload.classId), schoolId, deletedAt: null } }),
      prisma.section.findFirst({ where: { id: String(payload.sectionId), schoolId, classId: String(payload.classId), deletedAt: null } }),
    ]);
    if (!year || !classRecord || !section) throw new NotFoundException('Academic placement is invalid.');
    const existing = await prisma.enrollment.findFirst({ where: { schoolId, studentId, academicYearId: year.id, deletedAt: null } });
    if (existing) throw new BadRequestException('Student is already enrolled for this academic year.');
    const enrollment = await prisma.enrollment.create({ data: { schoolId, studentId, academicYearId: year.id, classId: classRecord.id, sectionId: section.id, rollNumber: payload.rollNumber ? String(payload.rollNumber) : null, status: 'active' } });
    await this.audit(schoolId, userId, 'ENROLLMENT_CREATED', 'Student enrolled', studentId);
    return enrollment;
  }

  async guardians(schoolId: string, studentId: string) {
    await this.findOne(schoolId, studentId);
    const relations = await prisma.studentGuardian.findMany({ where: { schoolId, studentId, deletedAt: null } });
    const guardians = await prisma.guardian.findMany({ where: { schoolId, id: { in: relations.map((relation) => relation.guardianId) }, deletedAt: null } });
    return relations.map((relation) => ({ ...relation, guardian: guardians.find((guardian) => guardian.id === relation.guardianId) }));
  }

  async createGuardian(schoolId: string, userId: string, studentId: string, payload: StudentInput) {
    await this.findOne(schoolId, studentId);
    const guardian = await prisma.guardian.create({ data: { schoolId, name: String(payload.name), relationship: String(payload.relationship), phone: payload.phone ? String(payload.phone) : null, email: payload.email ? String(payload.email) : null, occupation: payload.occupation ? String(payload.occupation) : null, address: payload.address ? String(payload.address) : null, emergencyContact: payload.emergencyContact ? String(payload.emergencyContact) : null } });
    const relation = await prisma.studentGuardian.create({ data: { schoolId, studentId, guardianId: guardian.id, isPrimary: Boolean(payload.isPrimary) } });
    await this.audit(schoolId, userId, 'GUARDIAN_ADDED', 'Guardian added', studentId);
    return { guardian, relation };
  }

  async importPreview(schoolId: string, userId: string, rows: unknown[]) {
    const normalizedRows = rows.map((row) => row as StudentInput);
    const identifiers = normalizedRows.flatMap((row) => [row.admissionNo, row.academicId].filter(Boolean).map(String));
    const existing = await prisma.student.findMany({ where: { schoolId, deletedAt: null, OR: [{ admissionNo: { in: identifiers } }, { academicId: { in: identifiers } }] }, select: { id: true, admissionNo: true, academicId: true } });
    const seen = new Set<string>();
    const records = normalizedRows.map((value, index) => {
      const errors: string[] = [];
      if (!value.admissionNo) errors.push('Missing admission number');
      if (!value.academicId) errors.push('Missing academic ID');
      if (!value.firstName || !value.lastName) errors.push('Missing student name');
      if (value.dateOfBirth && Number.isNaN(new Date(String(value.dateOfBirth)).getTime())) errors.push('Invalid date of birth');
      const admissionKey = value.admissionNo ? `admission:${String(value.admissionNo)}` : '';
      const academicKey = value.academicId ? `academic:${String(value.academicId)}` : '';
      const match = existing.find((student) => student.admissionNo === String(value.admissionNo) || student.academicId === String(value.academicId));
      if ((admissionKey && seen.has(admissionKey)) || (academicKey && seen.has(academicKey))) errors.push('Duplicate identifier in import');
      if (match) return { rowNumber: index + 1, extractedData: value, validationErrors: errors, status: errors.length ? 'ERROR' : 'EXISTING', matchedStudentId: match.id };
      if (admissionKey) seen.add(admissionKey);
      if (academicKey) seen.add(academicKey);
      return { rowNumber: index + 1, extractedData: value, validationErrors: errors, status: errors.length ? 'ERROR' : 'NEW' };
    });
    const upload = await prisma.upload.create({ data: { schoolId, uploadedById: userId, fileName: 'student-import.csv', fileKey: `imports/${randomUUID()}`, contentType: 'text/csv', sizeBytes: 0 } });
    const session = await prisma.importSession.create({ data: { schoolId, uploadId: upload.id, startedById: userId, type: 'students', status: 'review' } });
    await prisma.importRecord.createMany({ data: records.map((record) => ({ schoolId, importSessionId: session.id, rowNumber: record.rowNumber, extractedData: record.extractedData as Prisma.InputJsonObject, validationErrors: record.validationErrors.length ? record.validationErrors : undefined })) });
    return { jobId: session.id, total: records.length, valid: records.filter((record) => !record.validationErrors.length).length, errors: records.filter((record) => record.validationErrors.length).length, records };
  }

  async importStatus(schoolId: string, id: string) {
    const session = await prisma.importSession.findFirst({ where: { id, schoolId, type: 'students' } });
    if (!session) throw new NotFoundException('Import job not found.');
    const records = await prisma.importRecord.findMany({ where: { importSessionId: id, schoolId }, orderBy: { rowNumber: 'asc' } });
    return { ...session, records };
  }

  async confirmImport(schoolId: string, userId: string, id: string) {
    const session = await this.importStatus(schoolId, id);
    const valid = session.records.filter((record) => !record.validationErrors);
    const result = await prisma.$transaction(async (tx) => {
      let imported = 0;
      for (const record of valid) {
        const value = record.extractedData as StudentInput;
        await tx.student.upsert({ where: { schoolId_admissionNo: { schoolId, admissionNo: String(value.admissionNo) } }, update: this.studentData(schoolId, value, false), create: this.studentData(schoolId, value) });
        imported += 1;
      }
      await tx.importSession.update({ where: { id }, data: { status: 'imported', approvedById: userId, approvedAt: new Date() } });
      return imported;
    });
    await this.audit(schoolId, userId, 'STUDENT_IMPORT_COMPLETED', `Imported ${result} students`);
    return { imported: result, failed: session.records.length - result };
  }

  private studentData(schoolId: string, payload: StudentInput): Prisma.StudentCreateInput;
  private studentData(schoolId: string, payload: StudentInput, create: false): Prisma.StudentUpdateInput;
  private studentData(schoolId: string, payload: StudentInput, create = true): Prisma.StudentCreateInput | Prisma.StudentUpdateInput {
    const common = { ...(create ? { schoolId } : {}), ...(payload.preferredName !== undefined ? { preferredName: payload.preferredName ? String(payload.preferredName) : null } : {}), ...(payload.middleName !== undefined ? { middleName: payload.middleName ? String(payload.middleName) : null } : {}), ...(payload.dateOfBirth !== undefined ? { dateOfBirth: payload.dateOfBirth ? new Date(String(payload.dateOfBirth)) : null } : {}), ...(payload.gender !== undefined ? { gender: payload.gender as never } : {}), ...(payload.phone !== undefined ? { phone: payload.phone ? String(payload.phone) : null } : {}), ...(payload.email !== undefined ? { email: payload.email ? String(payload.email) : null } : {}), ...(payload.currentAddress !== undefined ? { currentAddress: payload.currentAddress ? String(payload.currentAddress) : null } : {}), ...(payload.permanentAddress !== undefined ? { permanentAddress: payload.permanentAddress ? String(payload.permanentAddress) : null } : {}), ...(payload.admissionDate !== undefined ? { admissionDate: payload.admissionDate ? new Date(String(payload.admissionDate)) : null } : {}), ...(payload.status !== undefined ? { status: payload.status as never } : {}) };
    return create ? { ...common, academicId: String(payload.academicId), admissionNo: String(payload.admissionNo), firstName: String(payload.firstName), lastName: String(payload.lastName) } : common;
  }

  private requireStudentFields(payload: StudentInput) {
    for (const field of ['academicId', 'admissionNo', 'firstName', 'lastName']) {
      if (!String(payload[field] ?? '').trim()) throw new BadRequestException(`${field} is required.`);
    }
  }

  private audit(schoolId: string, userId: string, action: string, message: string, entityId?: string) {
    return prisma.auditLog.create({ data: { schoolId, userId, module: 'STUDENTS', action, message, metadata: entityId ? { entityId } : undefined } });
  }
}
