import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { prisma } from '@schoolos/database';
import type { TeacherAssignmentCreateInput, TeacherCreateInput } from '@schoolos/validation';

@Injectable()
export class TeacherService {
  list(schoolId: string) {
    return prisma.teacher.findMany({
      where: { schoolId, deletedAt: null },
      orderBy: { lastName: 'asc' },
    });
  }

  async listAssignments(schoolId: string) {
    const assignments = await prisma.teacherAssignment.findMany({
      where: { schoolId, deletedAt: null },
      orderBy: [
        { academicYearId: 'asc' },
        { classId: 'asc' },
        { sectionId: 'asc' },
        { subjectId: 'asc' },
      ],
    });
    if (!assignments.length) return [];

    const [teachers, academicYears, classes, sections, subjects] = await Promise.all([
      prisma.teacher.findMany({
        where: {
          schoolId,
          deletedAt: null,
          id: { in: assignments.map((assignment) => assignment.teacherId) },
        },
      }),
      prisma.academicYear.findMany({
        where: {
          schoolId,
          deletedAt: null,
          id: { in: assignments.map((assignment) => assignment.academicYearId) },
        },
      }),
      prisma.class.findMany({
        where: {
          schoolId,
          deletedAt: null,
          id: { in: assignments.map((assignment) => assignment.classId) },
        },
      }),
      prisma.section.findMany({
        where: {
          schoolId,
          deletedAt: null,
          id: { in: assignments.map((assignment) => assignment.sectionId) },
        },
      }),
      prisma.subject.findMany({
        where: {
          schoolId,
          deletedAt: null,
          id: { in: assignments.map((assignment) => assignment.subjectId) },
        },
      }),
    ]);

    return assignments.map((assignment) => ({
      ...assignment,
      teacher: teachers.find((item) => item.id === assignment.teacherId) ?? null,
      academicYear: academicYears.find((item) => item.id === assignment.academicYearId) ?? null,
      class: classes.find((item) => item.id === assignment.classId) ?? null,
      section: sections.find((item) => item.id === assignment.sectionId) ?? null,
      subject: subjects.find((item) => item.id === assignment.subjectId) ?? null,
    }));
  }

  async findOne(schoolId: string, id: string) {
    await this.require(schoolId, id);
    return prisma.teacher.findUnique({ where: { id } });
  }

  async workload(schoolId: string, id: string) {
    await this.require(schoolId, id);
    const total = await prisma.teacherAssignment.count({
      where: { schoolId, teacherId: id, deletedAt: null },
    });
    return { teacherId: id, totalAssignments: total };
  }

  async create(schoolId: string, userId: string, payload: TeacherCreateInput) {
    const teacher = await prisma.teacher.create({
      data: {
        schoolId,
        employeeId: payload.employeeId,
        firstName: payload.firstName,
        lastName: payload.lastName,
        middleName: payload.middleName || null,
        email: payload.email || null,
        phone: payload.phone || null,
        designation: payload.designation || null,
        joiningDate: payload.joiningDate ? new Date(payload.joiningDate) : null,
      },
    });
    await this.audit(schoolId, userId, 'TEACHER_CREATED', 'Teacher created');
    return teacher;
  }

  async update(schoolId: string, id: string, payload: Record<string, unknown>) {
    await this.require(schoolId, id);
    return prisma.teacher.update({
      where: { id },
      data: {
        ...(payload.firstName ? { firstName: String(payload.firstName) } : {}),
        ...(payload.lastName ? { lastName: String(payload.lastName) } : {}),
        ...(payload.email !== undefined
          ? { email: payload.email ? String(payload.email) : null }
          : {}),
        ...(payload.phone !== undefined
          ? { phone: payload.phone ? String(payload.phone) : null }
          : {}),
        ...(payload.designation !== undefined
          ? { designation: payload.designation ? String(payload.designation) : null }
          : {}),
      },
    });
  }

  async createAssignment(schoolId: string, userId: string, payload: TeacherAssignmentCreateInput) {
    const [teacher, academicYear, classRecord, section, subject] = await Promise.all([
      prisma.teacher.findFirst({ where: { id: payload.teacherId, schoolId, deletedAt: null } }),
      prisma.academicYear.findFirst({
        where: { id: payload.academicYearId, schoolId, deletedAt: null },
      }),
      prisma.class.findFirst({ where: { id: payload.classId, schoolId, deletedAt: null } }),
      prisma.section.findFirst({ where: { id: payload.sectionId, schoolId, deletedAt: null } }),
      prisma.subject.findFirst({ where: { id: payload.subjectId, schoolId, deletedAt: null } }),
    ]);

    if (!teacher) throw new NotFoundException('Teacher not found.');
    if (!academicYear) throw new NotFoundException('Academic year not found.');
    if (!classRecord) throw new NotFoundException('Class not found.');
    if (!section) throw new NotFoundException('Section not found.');
    if (!subject) throw new NotFoundException('Subject not found.');
    if (section.classId !== classRecord.id) {
      throw new BadRequestException('Section does not belong to the selected class.');
    }

    const existing = await prisma.teacherAssignment.findFirst({
      where: {
        schoolId,
        teacherId: teacher.id,
        academicYearId: academicYear.id,
        classId: classRecord.id,
        sectionId: section.id,
        subjectId: subject.id,
        deletedAt: null,
      },
    });
    if (existing) {
      throw new ConflictException(
        'This teacher is already assigned to the selected class, section, and subject for the academic year.',
      );
    }

    const assignment = await prisma.teacherAssignment
      .create({
        data: {
          schoolId,
          teacherId: teacher.id,
          academicYearId: academicYear.id,
          classId: classRecord.id,
          sectionId: section.id,
          subjectId: subject.id,
        },
      })
      .catch((error: unknown) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new ConflictException(
            'This teacher is already assigned to the selected class, section, and subject for the academic year.',
          );
        }
        throw error;
      });
    await this.audit(schoolId, userId, 'TEACHER_ASSIGNED', 'Teacher assignment created');
    return assignment;
  }

  private async require(schoolId: string, id: string) {
    const teacher = await prisma.teacher.findFirst({ where: { id, schoolId, deletedAt: null } });
    if (!teacher) throw new NotFoundException('Teacher not found.');
  }

  private audit(schoolId: string, userId: string, action: string, message: string) {
    return prisma.auditLog.create({
      data: { schoolId, userId, module: 'SCHOOL_SETUP', action, message },
    });
  }
}
