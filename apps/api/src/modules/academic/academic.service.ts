import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { prisma } from '@schoolos/database';
import type {
  AcademicYearCreateInput,
  AcademicYearUpdateInput,
  ClassCreateInput,
  ClassUpdateInput,
  SectionCreateInput,
  SectionUpdateInput,
  SubjectCreateInput,
  SubjectOfferingCreateInput,
  SubjectUpdateInput,
} from '@schoolos/validation';

@Injectable()
export class AcademicService {
  private readonly academicYearConflictMessage =
    'An academic year conflicts with an existing school record. Refresh and try again.';

  async list(model: 'academicYear' | 'class' | 'section' | 'subject', schoolId: string) {
    if (model === 'academicYear')
      return prisma.academicYear.findMany({
        where: { schoolId, deletedAt: null },
        orderBy: { createdAt: 'asc' },
      });
    if (model === 'class')
      return prisma.class.findMany({
        where: { schoolId, deletedAt: null },
        orderBy: { orderIndex: 'asc' },
      });
    if (model === 'section')
      return prisma.section.findMany({
        where: { schoolId, deletedAt: null },
        orderBy: { createdAt: 'asc' },
      });
    return prisma.subject.findMany({
      where: { schoolId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listOfferings(schoolId: string) {
    const offerings = await prisma.subjectOffering.findMany({
      where: { schoolId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!offerings.length) return [];

    const [academicYears, classes, sections, subjects, teachers] = await Promise.all([
      prisma.academicYear.findMany({
        where: {
          schoolId,
          deletedAt: null,
          id: { in: offerings.map((offering) => offering.academicYearId) },
        },
      }),
      prisma.class.findMany({
        where: {
          schoolId,
          deletedAt: null,
          id: { in: offerings.map((offering) => offering.classId) },
        },
      }),
      prisma.section.findMany({
        where: {
          schoolId,
          deletedAt: null,
          id: { in: offerings.map((offering) => offering.sectionId) },
        },
      }),
      prisma.subject.findMany({
        where: {
          schoolId,
          deletedAt: null,
          id: { in: offerings.map((offering) => offering.subjectId) },
        },
      }),
      prisma.teacher.findMany({
        where: {
          schoolId,
          deletedAt: null,
          id: { in: offerings.map((offering) => offering.teacherId) },
        },
      }),
    ]);

    return offerings.map((offering) => ({
      ...offering,
      academicYear: academicYears.find((record) => record.id === offering.academicYearId) ?? null,
      class: classes.find((record) => record.id === offering.classId) ?? null,
      section: sections.find((record) => record.id === offering.sectionId) ?? null,
      subject: subjects.find((record) => record.id === offering.subjectId) ?? null,
      teacher: teachers.find((record) => record.id === offering.teacherId) ?? null,
    }));
  }

  async getOffering(schoolId: string, id: string) {
    const offering = await prisma.subjectOffering.findFirst({
      where: { id, schoolId, deletedAt: null },
    });
    if (!offering) throw new NotFoundException('Subject offering not found.');

    const [academicYear, classRecord, section, subject, teacher] = await Promise.all([
      prisma.academicYear.findFirst({
        where: { id: offering.academicYearId, schoolId, deletedAt: null },
      }),
      prisma.class.findFirst({ where: { id: offering.classId, schoolId, deletedAt: null } }),
      prisma.section.findFirst({ where: { id: offering.sectionId, schoolId, deletedAt: null } }),
      prisma.subject.findFirst({ where: { id: offering.subjectId, schoolId, deletedAt: null } }),
      prisma.teacher.findFirst({ where: { id: offering.teacherId, schoolId, deletedAt: null } }),
    ]);

    return { ...offering, academicYear, class: classRecord, section, subject, teacher };
  }

  async createAcademicYear(schoolId: string, userId: string, payload: AcademicYearCreateInput) {
    try {
      return await prisma.$transaction(async (tx) => {
        await tx.$queryRaw(Prisma.sql`
          SELECT pg_advisory_xact_lock(hashtextextended(${schoolId}, 0))
        `);
        const data = {
          schoolId,
          name: payload.name,
          startDate: new Date(payload.startDate),
          endDate: new Date(payload.endDate),
          isActive: payload.isActive,
        };
        const overlappingYear = await tx.academicYear.findFirst({
          where: {
            schoolId,
            deletedAt: null,
            startDate: { lte: data.endDate },
            endDate: { gte: data.startDate },
          },
          select: { id: true, name: true },
        });
        if (overlappingYear) this.throwAcademicYearOverlap(overlappingYear);
        if (data.isActive)
          await tx.academicYear.updateMany({
            where: { schoolId, isActive: true, deletedAt: null },
            data: { isActive: false },
          });
        const year = await tx.academicYear.create({ data });
        await tx.auditLog.create({
          data: {
            schoolId,
            userId,
            module: 'SCHOOL_SETUP',
            action: 'ACADEMIC_YEAR_CREATED',
            message: 'Academic year created',
          },
        });
        return year;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(this.academicYearConflictMessage);
      }
      throw error;
    }
  }

  async updateAcademicYear(
    schoolId: string,
    userId: string,
    id: string,
    payload: AcademicYearUpdateInput,
  ) {
    const existing = await prisma.academicYear.findFirst({
      where: { id, schoolId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Academic year not found.');
    const requestedStartDate = payload.startDate ? new Date(payload.startDate) : existing.startDate;
    const requestedEndDate = payload.endDate ? new Date(payload.endDate) : existing.endDate;
    if (requestedStartDate >= requestedEndDate)
      throw new BadRequestException('End date must be after start date.');

    try {
      return await prisma.$transaction(async (tx) => {
        await tx.$queryRaw(Prisma.sql`
          SELECT pg_advisory_xact_lock(hashtextextended(${schoolId}, 0))
        `);
        const current = await tx.academicYear.findFirst({
          where: { id, schoolId, deletedAt: null },
        });
        if (!current) throw new NotFoundException('Academic year not found.');
        const startDate = payload.startDate ? new Date(payload.startDate) : current.startDate;
        const endDate = payload.endDate ? new Date(payload.endDate) : current.endDate;
        if (startDate >= endDate)
          throw new BadRequestException('End date must be after start date.');
        const overlappingYear = await tx.academicYear.findFirst({
          where: {
            schoolId,
            deletedAt: null,
            id: { not: id },
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
          select: { id: true, name: true },
        });
        if (overlappingYear) this.throwAcademicYearOverlap(overlappingYear);
        if (payload.isActive) {
          await tx.academicYear.updateMany({
            where: { schoolId, isActive: true, deletedAt: null, id: { not: id } },
            data: { isActive: false },
          });
        }
        const updated = await tx.academicYear.updateMany({
          where: { id, schoolId, deletedAt: null },
          data: {
            ...(payload.name !== undefined ? { name: payload.name } : {}),
            ...(payload.startDate ? { startDate } : {}),
            ...(payload.endDate ? { endDate } : {}),
            ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
          },
        });
        if (updated.count === 0) throw new NotFoundException('Academic year not found.');
        const record = await tx.academicYear.findFirst({
          where: { id, schoolId, deletedAt: null },
        });
        if (!record) throw new NotFoundException('Academic year not found.');
        if (payload.isActive) {
          await tx.auditLog.create({
            data: {
              schoolId,
              userId,
              module: 'SCHOOL_SETUP',
              action: 'ACADEMIC_YEAR_ACTIVATED',
              message: 'Academic year activated',
            },
          });
        }
        return record;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(this.academicYearConflictMessage);
      }
      throw error;
    }
  }

  async createClass(schoolId: string, userId: string, payload: ClassCreateInput) {
    const item = await prisma.class.create({ data: { schoolId, ...payload } });
    await this.audit(schoolId, userId, 'CLASS_CREATED', 'Class created');
    return item;
  }

  async updateClass(schoolId: string, id: string, payload: ClassUpdateInput) {
    const existing = await prisma.class.findFirst({ where: { id, schoolId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Resource not found.');
    const minimumAge = payload.minimumAge === undefined ? existing.minimumAge : payload.minimumAge;
    const maximumAge = payload.maximumAge === undefined ? existing.maximumAge : payload.maximumAge;
    if (minimumAge !== null && maximumAge !== null && minimumAge > maximumAge) {
      throw new BadRequestException('Minimum age must not exceed maximum age.');
    }
    return prisma.class.update({ where: { id, schoolId, deletedAt: null }, data: payload });
  }

  async createSection(schoolId: string, userId: string, payload: SectionCreateInput) {
    const classId = payload.classId;
    await this.requireById('class', schoolId, classId);
    const item = await prisma.section.create({ data: { schoolId, ...payload } });
    await this.audit(schoolId, userId, 'SECTION_CREATED', 'Section created');
    return item;
  }

  async updateSection(schoolId: string, id: string, payload: SectionUpdateInput) {
    await this.requireById('section', schoolId, id);
    return prisma.section.update({ where: { id, schoolId, deletedAt: null }, data: payload });
  }

  async createSubject(schoolId: string, userId: string, payload: SubjectCreateInput) {
    const item = await prisma.subject.create({ data: { schoolId, ...payload } });
    await this.audit(schoolId, userId, 'SUBJECT_CREATED', 'Subject created');
    return item;
  }

  async updateSubject(schoolId: string, id: string, payload: SubjectUpdateInput) {
    await this.requireById('subject', schoolId, id);
    return prisma.subject.update({ where: { id, schoolId, deletedAt: null }, data: payload });
  }

  async createSubjectOffering(
    schoolId: string,
    userId: string,
    payload: SubjectOfferingCreateInput,
  ) {
    const [academicYear, classRecord, section, subject, teacher] = await Promise.all([
      prisma.academicYear.findFirst({
        where: { id: payload.academicYearId, schoolId, deletedAt: null },
      }),
      prisma.class.findFirst({ where: { id: payload.classId, schoolId, deletedAt: null } }),
      prisma.section.findFirst({ where: { id: payload.sectionId, schoolId, deletedAt: null } }),
      prisma.subject.findFirst({ where: { id: payload.subjectId, schoolId, deletedAt: null } }),
      prisma.teacher.findFirst({ where: { id: payload.teacherId, schoolId, deletedAt: null } }),
    ]);

    if (!academicYear) throw new NotFoundException('Academic year not found.');
    if (!classRecord) throw new NotFoundException('Class not found.');
    if (!section || section.classId !== classRecord.id)
      throw new NotFoundException('Section does not belong to the selected class.');
    if (!subject) throw new NotFoundException('Subject not found.');
    if (!teacher) throw new NotFoundException('Teacher not found.');

    const duplicate = await prisma.subjectOffering.findFirst({
      where: {
        schoolId,
        academicYearId: academicYear.id,
        classId: classRecord.id,
        sectionId: section.id,
        subjectId: subject.id,
        deletedAt: null,
      },
    });
    if (duplicate) {
      throw new BadRequestException(
        'This subject is already offered to the selected class and section for the academic year.',
      );
    }

    const offering = await prisma.subjectOffering.create({
      data: {
        schoolId,
        academicYearId: academicYear.id,
        classId: classRecord.id,
        sectionId: section.id,
        subjectId: subject.id,
        teacherId: teacher.id,
        blueprintId: payload.blueprintId ?? 'default-blueprint',
        isElective: payload.isElective,
      },
    });
    await this.audit(schoolId, userId, 'SUBJECT_OFFERING_CREATED', 'Subject offering created');
    return offering;
  }

  async dashboard(schoolId: string) {
    const [activeAcademicYear, totalClasses, totalSections, totalSubjects, teacherAssignments] =
      await Promise.all([
        prisma.academicYear.findFirst({ where: { schoolId, isActive: true, deletedAt: null } }),
        prisma.class.count({ where: { schoolId, deletedAt: null } }),
        prisma.section.count({ where: { schoolId, deletedAt: null } }),
        prisma.subject.count({ where: { schoolId, deletedAt: null } }),
        prisma.teacherAssignment.count({ where: { schoolId, deletedAt: null } }),
      ]);
    return { activeAcademicYear, totalClasses, totalSections, totalSubjects, teacherAssignments };
  }

  private async requireAcademicYear(schoolId: string, id: string) {
    const item = await prisma.academicYear.findFirst({ where: { id, schoolId, deletedAt: null } });
    if (!item) throw new NotFoundException('Academic year not found.');
  }

  private async requireById(model: 'class' | 'section' | 'subject', schoolId: string, id: string) {
    const item =
      model === 'class'
        ? await prisma.class.findFirst({ where: { id, schoolId, deletedAt: null } })
        : model === 'section'
          ? await prisma.section.findFirst({ where: { id, schoolId, deletedAt: null } })
          : await prisma.subject.findFirst({ where: { id, schoolId, deletedAt: null } });
    if (!item) throw new NotFoundException('Resource not found.');
  }

  private audit(schoolId: string, userId: string, action: string, message: string) {
    return prisma.auditLog.create({
      data: { schoolId, userId, module: 'SCHOOL_SETUP', action, message },
    });
  }

  private throwAcademicYearOverlap(year: { id: string; name: string }): never {
    throw new UnprocessableEntityException({
      code: 'YEAR_DATE_OVERLAP',
      message: `Academic year dates overlap with "${year.name}".`,
      meta: { academicYearId: year.id },
    });
  }
}
