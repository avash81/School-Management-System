import { randomUUID } from 'node:crypto';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { prisma } from '@schoolos/database';

type Input = Record<string, unknown>;

@Injectable()
export class ExamService {
  listExams(schoolId: string) {
    return prisma.exam.findMany({ where: { schoolId, deletedAt: null }, orderBy: { startDate: 'desc' } });
  }

  findExam(schoolId: string, id: string) {
    return prisma.exam.findFirst({ where: { id, schoolId, deletedAt: null } }).then((exam) => {
      if (!exam) throw new NotFoundException('Exam not found.');
      return exam;
    });
  }

  async createExam(schoolId: string, userId: string, payload: Input) {
    const year = await prisma.academicYear.findFirst({ where: { id: String(payload.academicYearId), schoolId, deletedAt: null } });
    if (!year) throw new NotFoundException('Academic year not found.');
    const exam = await prisma.exam.create({ data: { schoolId, academicYearId: year.id, name: String(payload.name), startDate: new Date(String(payload.startDate)), endDate: new Date(String(payload.endDate)), resultPublishDate: payload.resultPublishDate ? new Date(String(payload.resultPublishDate)) : null } });
    await this.audit(schoolId, userId, 'EXAM_CREATED', 'Examination created', exam.id);
    return exam;
  }

  async updateExam(schoolId: string, userId: string, id: string, payload: Input) {
    await this.findExam(schoolId, id);
    const exam = await prisma.exam.update({ where: { id }, data: { ...(payload.name ? { name: String(payload.name) } : {}), ...(payload.status ? { status: payload.status as never } : {}), ...(payload.startDate ? { startDate: new Date(String(payload.startDate)) } : {}), ...(payload.endDate ? { endDate: new Date(String(payload.endDate)) } : {}) } });
    await this.audit(schoolId, userId, 'EXAM_UPDATED', 'Examination updated', id);
    return exam;
  }

  async addSubject(schoolId: string, userId: string, examId: string, payload: Input) {
    await this.findExam(schoolId, examId);
    const offering = await prisma.subjectOffering.findFirst({ where: { id: String(payload.subjectOfferingId), schoolId, deletedAt: null } });
    if (!offering) throw new NotFoundException('Subject offering not found.');
    const blueprintId = String(payload.blueprintId ?? offering.blueprintId ?? '');
    if (!blueprintId.trim()) throw new BadRequestException('A blueprint is required before attaching a subject to an exam.');
    const blueprint = await prisma.assessmentBlueprint.findFirst({ where: { id: blueprintId, schoolId, deletedAt: null } });
    if (!blueprint) throw new NotFoundException('Assessment blueprint not found.');
    const existing = await prisma.examSubject.findFirst({ where: { examId, subjectOfferingId: offering.id, schoolId, deletedAt: null } });
    if (existing) throw new BadRequestException('This subject offering already exists in this exam.');
    const examSubject = await prisma.examSubject.create({ data: { schoolId, examId, subjectOfferingId: offering.id, blueprintId: blueprint.id, isOptional: Boolean(payload.isOptional) } });
    await this.audit(schoolId, userId, 'EXAM_SUBJECT_ADDED', 'Subject added to exam', examId);
    return examSubject;
  }

  async listBlueprints(schoolId: string) {
    const blueprints = await prisma.assessmentBlueprint.findMany({
      where: { schoolId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!blueprints.length) return [];

    const subjects = await prisma.subject.findMany({
      where: { schoolId, deletedAt: null, id: { in: blueprints.map((blueprint) => blueprint.subjectId).filter((id): id is string => Boolean(id)) } },
    });

    return blueprints.map((blueprint) => ({
      ...blueprint,
      subject: blueprint.subjectId ? subjects.find((subject) => subject.id === blueprint.subjectId) ?? null : null,
    }));
  }

  async getBlueprint(schoolId: string, id: string) {
    const blueprint = await prisma.assessmentBlueprint.findFirst({
      where: { id, schoolId, deletedAt: null },
    });
    if (!blueprint) throw new NotFoundException('Assessment blueprint not found.');

    const subject = blueprint.subjectId ? await prisma.subject.findFirst({ where: { id: blueprint.subjectId, schoolId, deletedAt: null } }) : null;
    return { ...blueprint, subject };
  }

  async createBlueprint(schoolId: string, userId: string, payload: Input) {
    const required = ['curriculumVersionId', 'name', 'totalMarks'];
    for (const key of required) {
      if (!payload[key] || !String(payload[key]).trim()) throw new BadRequestException(`${key} is required.`);
    }
    const curriculumVersion = await prisma.curriculumVersion.findFirst({ where: { id: String(payload.curriculumVersionId), schoolId, deletedAt: null } });
    if (!curriculumVersion) throw new NotFoundException('Curriculum version not found.');
    const subjectId = payload.subjectId ? String(payload.subjectId) : null;
    if (subjectId) {
      const subject = await prisma.subject.findFirst({ where: { id: subjectId, schoolId, deletedAt: null } });
      if (!subject) throw new NotFoundException('Subject not found.');
    }

    const blueprint = await prisma.assessmentBlueprint.create({
      data: {
        schoolId,
        curriculumVersionId: curriculumVersion.id,
        name: String(payload.name),
        subjectId,
        totalMarks: Number(payload.totalMarks),
      },
    });
    await this.audit(schoolId, userId, 'BLUEPRINT_CREATED', 'Assessment blueprint created', blueprint.id);
    return blueprint;
  }

  async listBlueprintComponents(schoolId: string, blueprintId: string) {
    await this.getBlueprint(schoolId, blueprintId);
    return prisma.assessmentComponent.findMany({
      where: { schoolId, blueprintId, deletedAt: null },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async createBlueprintComponent(schoolId: string, userId: string, blueprintId: string, payload: Input) {
    await this.getBlueprint(schoolId, blueprintId);
    const name = String(payload.name ?? '').trim();
    const maxMarks = Number(payload.maxMarks ?? 0);
    const orderIndex = Number(payload.orderIndex ?? 0);
    if (!name) throw new BadRequestException('Component name is required.');
    if (!Number.isFinite(maxMarks) || maxMarks <= 0) throw new BadRequestException('Component maxMarks must be greater than zero.');
    if (!Number.isInteger(orderIndex) || orderIndex < 0) throw new BadRequestException('Component orderIndex must be a non-negative integer.');
    const duplicate = await prisma.assessmentComponent.findFirst({ where: { blueprintId, orderIndex, deletedAt: null } });
    if (duplicate) throw new BadRequestException('A component with this order index already exists for the blueprint.');
    const component = await prisma.assessmentComponent.create({
      data: { schoolId, blueprintId, name, maxMarks, orderIndex },
    });
    await this.audit(schoolId, userId, 'BLUEPRINT_COMPONENT_CREATED', 'Blueprint component added', blueprintId);
    return component;
  }

  async listGradingBands(schoolId: string) {
    return prisma.gradingBand.findMany({ where: { schoolId, deletedAt: null }, orderBy: { minPercent: 'desc' } });
  }

  async upsertGradingBand(schoolId: string, userId: string, payload: Input) {
    const grade = String(payload.grade ?? '').trim();
    const minPercent = Number(payload.minPercent ?? 0);
    const maxPercent = Number(payload.maxPercent ?? 0);
    if (!grade) throw new BadRequestException('Grade is required.');
    if (!Number.isFinite(minPercent) || !Number.isFinite(maxPercent)) throw new BadRequestException('Grade band percentages must be numeric.');
    if (minPercent > maxPercent) throw new BadRequestException('minPercent cannot exceed maxPercent.');

    const band = await prisma.gradingBand.upsert({
      where: { schoolId_grade: { schoolId, grade } },
      update: { minPercent: new Prisma.Decimal(minPercent), maxPercent: new Prisma.Decimal(maxPercent), gpa: new Prisma.Decimal(Number(payload.gpa ?? 0)) },
      create: { schoolId, name: grade, grade, minPercent: new Prisma.Decimal(minPercent), maxPercent: new Prisma.Decimal(maxPercent), gpa: new Prisma.Decimal(Number(payload.gpa ?? 0)) },
    });
    await this.audit(schoolId, userId, 'GRADING_BAND_UPDATED', `Updated grade band ${grade}`, band.id);
    return band;
  }

  listMarks(schoolId: string) {
    return prisma.markEntry.findMany({ where: { schoolId, deletedAt: null }, orderBy: { updatedAt: 'desc' }, take: 1000 });
  }

  async enterMarks(schoolId: string, userId: string, payload: Input) {
    const examSubject = await prisma.examSubject.findFirst({ where: { id: String(payload.examSubjectId), schoolId, deletedAt: null } });
    const exam = await prisma.exam.findFirst({ where: { id: String(payload.examId), schoolId, deletedAt: null } });
    const enrollment = await prisma.enrollment.findFirst({ where: { id: String(payload.enrollmentId), schoolId, deletedAt: null } });
    const component = await prisma.assessmentComponent.findFirst({ where: { id: String(payload.assessmentComponentId), schoolId, deletedAt: null } });
    const offering = examSubject ? await prisma.subjectOffering.findFirst({ where: { id: String(examSubject.subjectOfferingId), schoolId, deletedAt: null } }) : null;
    if (!examSubject || !exam || !enrollment || !component || !offering || examSubject.examId !== exam.id || enrollment.academicYearId !== exam.academicYearId || enrollment.classId !== offering.classId || enrollment.sectionId !== offering.sectionId) throw new NotFoundException('Mark entry reference not found.');
    const attendance = String(payload.attendanceStatus ?? 'present');
    const value = payload.markValue === null || attendance !== 'present' ? null : Number(payload.markValue);
    if (value !== null && (!Number.isFinite(value) || value < 0 || value > component.maxMarks)) throw new BadRequestException(`Mark must be between 0 and ${component.maxMarks}.`);
    const existing = await prisma.markEntry.findUnique({ where: { examSubjectId_enrollmentId_assessmentComponentId: { examSubjectId: examSubject.id, enrollmentId: enrollment.id, assessmentComponentId: component.id } } });
    if (existing?.status === 'published') throw new BadRequestException('Published marks require an authorized correction workflow.');
    const mark = await prisma.markEntry.upsert({ where: { examSubjectId_enrollmentId_assessmentComponentId: { examSubjectId: examSubject.id, enrollmentId: enrollment.id, assessmentComponentId: component.id } }, update: { markValue: value === null ? null : new Prisma.Decimal(value), attendanceStatus: attendance as never, enteredById: userId, source: 'manual', status: 'draft' }, create: { schoolId, examId: String(payload.examId), examSubjectId: examSubject.id, studentId: enrollment.studentId, enrollmentId: enrollment.id, assessmentComponentId: component.id, markValue: value === null ? null : new Prisma.Decimal(value), attendanceStatus: attendance as never, enteredById: userId, source: 'manual', status: 'draft' } });
    await this.audit(schoolId, userId, 'MARK_CHANGED', 'Mark entered or corrected', mark.id, existing?.markValue?.toString(), value?.toString());
    return mark;
  }

  async transitionMarks(schoolId: string, userId: string, payload: Input, status: 'pending' | 'verified' | 'approved' | 'published' | 'rejected') {
    const allowedStatuses = status === 'pending' ? ['draft', 'rejected'] : status === 'verified' ? ['pending'] : status === 'approved' ? ['verified'] : ['approved'];
    const result = await prisma.markEntry.updateMany({ where: { schoolId, ...(payload.examId ? { examId: String(payload.examId) } : {}), ...(payload.examSubjectId ? { examSubjectId: String(payload.examSubjectId) } : {}), status: { in: allowedStatuses as never[] } }, data: { status, ...(status === 'verified' ? { verifiedById: userId } : {}) } });
    await this.audit(schoolId, userId, `MARKS_${status.toUpperCase()}`, `Marks moved to ${status}`);
    return { updated: result.count, status };
  }

  async importPreview(schoolId: string, userId: string, rows: unknown[]) {
    const records = rows.map((row, index) => {
      const value = row as Input;
      const validationErrors = ['examId', 'examSubjectId', 'enrollmentId', 'assessmentComponentId'].filter((key) => !value[key]);
      return { rowNumber: index + 1, extractedData: value, validationErrors };
    });
    const upload = await prisma.upload.create({ data: { schoolId, uploadedById: userId, fileName: 'marks-import.csv', fileKey: `imports/${randomUUID()}`, contentType: 'text/csv', sizeBytes: 0 } });
    const session = await prisma.importSession.create({ data: { schoolId, uploadId: upload.id, startedById: userId, type: 'marks', status: 'review' } });
    await prisma.importRecord.createMany({ data: records.map((record) => ({ schoolId, importSessionId: session.id, rowNumber: record.rowNumber, extractedData: record.extractedData as Prisma.InputJsonObject, validationErrors: record.validationErrors.length ? record.validationErrors : undefined })) });
    return { jobId: session.id, total: records.length, valid: records.filter((record) => !record.validationErrors.length).length, errors: records.filter((record) => record.validationErrors.length).length };
  }

  async importStatus(schoolId: string, id: string) {
    const session = await prisma.importSession.findFirst({ where: { id, schoolId, type: 'marks' } });
    if (!session) throw new NotFoundException('Mark import not found.');
    return { ...session, records: await prisma.importRecord.findMany({ where: { importSessionId: id, schoolId }, orderBy: { rowNumber: 'asc' } }) };
  }

  async confirmImport(schoolId: string, userId: string, id: string) {
    const session = await this.importStatus(schoolId, id);
    const valid = session.records.filter((record) => !record.validationErrors);
    const imported = await prisma.$transaction(async (tx) => {
      for (const record of valid) {
        const value = record.extractedData as Input;
        const examSubject = await tx.examSubject.findFirst({ where: { id: String(value.examSubjectId), examId: String(value.examId), schoolId, deletedAt: null } });
        const enrollment = await tx.enrollment.findFirst({ where: { id: String(value.enrollmentId), schoolId, deletedAt: null } });
        const component = await tx.assessmentComponent.findFirst({ where: { id: String(value.assessmentComponentId), schoolId, deletedAt: null } });
        const exam = await tx.exam.findFirst({ where: { id: String(value.examId), schoolId, deletedAt: null } });
        const offering = examSubject ? await tx.subjectOffering.findFirst({ where: { id: examSubject.subjectOfferingId, schoolId, deletedAt: null } }) : null;
        if (!examSubject || !enrollment || !component || !exam || !offering || enrollment.academicYearId !== exam.academicYearId || enrollment.classId !== offering.classId || enrollment.sectionId !== offering.sectionId) throw new BadRequestException(`Invalid mark reference on import row ${record.rowNumber}.`);
        const attendance = String(value.attendanceStatus ?? 'present');
        const markValue = value.markValue === null || attendance !== 'present' ? null : Number(value.markValue);
        if (markValue !== null && (!Number.isFinite(markValue) || markValue < 0 || markValue > component.maxMarks)) throw new BadRequestException(`Invalid mark on import row ${record.rowNumber}.`);
        await tx.markEntry.upsert({
          where: { examSubjectId_enrollmentId_assessmentComponentId: { examSubjectId: examSubject.id, enrollmentId: enrollment.id, assessmentComponentId: component.id } },
          update: { markValue: markValue === null ? null : new Prisma.Decimal(markValue), attendanceStatus: attendance as never, enteredById: userId, source: 'bulk_import', status: 'draft' },
          create: { schoolId, examId: String(value.examId), examSubjectId: examSubject.id, studentId: enrollment.studentId, enrollmentId: enrollment.id, assessmentComponentId: component.id, markValue: markValue === null ? null : new Prisma.Decimal(markValue), attendanceStatus: attendance as never, enteredById: userId, source: 'bulk_import', status: 'draft' },
        });
      }
      await tx.importSession.update({ where: { id }, data: { status: 'imported', approvedById: userId, approvedAt: new Date() } });
      return valid.length;
    });
    return { imported, failed: session.records.length - imported };
  }

  async calculateResults(schoolId: string, userId: string, examId: string) {
    await this.findExam(schoolId, examId);
    const marks = await prisma.markEntry.findMany({ where: { schoolId, examId, status: { in: ['approved', 'published'] }, deletedAt: null } });
    const componentIds = [...new Set(marks.map((mark) => mark.assessmentComponentId))];
    const enrollmentIds = [...new Set(marks.map((mark) => mark.enrollmentId))];
    const components = await prisma.assessmentComponent.findMany({ where: { id: { in: componentIds }, schoolId } });
    const componentById = new Map(components.map((component) => [component.id, component]));
    const enrollments = await prisma.enrollment.findMany({ where: { id: { in: enrollmentIds }, schoolId } });
    const enrollmentById = new Map(enrollments.map((enrollment) => [enrollment.id, enrollment]));
    const bands = await prisma.gradingBand.findMany({ where: { schoolId, deletedAt: null }, orderBy: { minPercent: 'desc' } });
    const byEnrollment = new Map<string, typeof marks>();
    for (const mark of marks) byEnrollment.set(mark.enrollmentId, [...(byEnrollment.get(mark.enrollmentId) ?? []), mark]);
    const results = [];
    for (const [enrollmentId, entries] of byEnrollment) {
      const total = entries.reduce((sum, entry) => sum + Number(entry.markValue ?? 0), 0);
      const maximum = entries.reduce((sum, entry) => {
        const component = componentById.get(entry.assessmentComponentId);
        if (!component) throw new BadRequestException(`Assessment component missing for enrollment ${enrollmentId} mark entry ${entry.id ?? '?'}. Confirm assessment component configuration is complete before calculating results.`);
        return sum + Number(component.maxMarks);
      }, 0);
      if (!Number.isFinite(maximum) || maximum <= 0) throw new BadRequestException(`Invalid assessment component maxMarks for enrollment ${enrollmentId}. Expected positive integer sum.`);
      const percentage = (total / maximum) * 100;
      const absent = entries.some((entry) => entry.attendanceStatus === 'absent');
      const band = bands.find((item) => percentage >= Number(item.minPercent) && percentage <= Number(item.maxPercent));
      const enrollment = enrollmentById.get(enrollmentId);
      if (!enrollment) continue;
      results.push(await prisma.result.upsert({ where: { examId_enrollmentId: { examId, enrollmentId } }, update: { totalMarks: new Prisma.Decimal(total), percentage: new Prisma.Decimal(percentage), grade: band?.grade ?? 'N/A', gpa: new Prisma.Decimal(band?.gpa ?? 0), passStatus: absent ? 'FAIL' : band ? 'PASS' : 'FAIL', status: 'calculated' }, create: { schoolId, examId, studentId: enrollment.studentId, enrollmentId, totalMarks: new Prisma.Decimal(total), percentage: new Prisma.Decimal(percentage), grade: band?.grade ?? 'N/A', gpa: new Prisma.Decimal(band?.gpa ?? 0), passStatus: absent ? 'FAIL' : band ? 'PASS' : 'FAIL', status: 'calculated' } }));
    }
    await this.audit(schoolId, userId, 'RESULTS_CALCULATED', 'Results calculated', examId);
    return results;
  }

  async transitionResults(schoolId: string, userId: string, examId: string, status: 'verified' | 'approved' | 'published' | 'reopened', reason?: string) {
    if (status === 'reopened' && !reason?.trim()) throw new BadRequestException('A reason is required to reopen published results.');
    const results = await prisma.result.findMany({ where: { schoolId, examId, deletedAt: null } });
    const allowed = status === 'verified' ? ['calculated', 'reopened'] : status === 'approved' ? ['verified'] : status === 'published' ? ['approved'] : ['published'];
    if (results.some((result) => !allowed.includes(result.status))) throw new BadRequestException(`Results cannot transition to ${status} from their current state.`);
    if (status === 'published' && results.some((result) => result.status !== 'approved')) throw new BadRequestException('All results must be approved before publication.');
    for (const result of results) {
      const updated = await prisma.result.update({ where: { id: result.id }, data: { status, ...(status === 'approved' ? { approvedAt: new Date() } : {}), ...(status === 'published' ? { publishedAt: new Date() } : {}) } });
      if (status === 'approved' || status === 'reopened') {
        await prisma.resultApproval.create({ data: { schoolId, examId, userId, role: 'authorized-user', status, remarks: reason?.trim() } });
      }
      if (status === 'published') {
        const latest = await prisma.resultSnapshot.findFirst({ where: { resultId: result.id }, orderBy: { version: 'desc' } });
        await prisma.resultSnapshot.create({
          data: {
            schoolId,
            resultId: result.id,
            version: (latest?.version ?? 0) + 1,
            snapshot: updated as unknown as Prisma.InputJsonValue,
            createdById: userId,
          },
        });
      }
    }
    await this.audit(schoolId, userId, `RESULTS_${status.toUpperCase()}`, `Results moved to ${status}`, examId);
    return { updated: results.length, status };
  }

  studentResult(schoolId: string, studentId: string) {
    return prisma.result.findMany({ where: { schoolId, studentId, deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }

  private audit(schoolId: string, userId: string, action: string, message: string, entityId?: string, oldValue?: string, newValue?: string) {
    return prisma.auditLog.create({ data: { schoolId, userId, module: 'EXAMINATIONS', action, message, entityId, oldValue, newValue } });
  }
}
