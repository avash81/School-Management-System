import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@schoolos/database';
import type { UpdateSchoolProfileInput, UpdateSchoolSettingsInput } from '@schoolos/validation';

@Injectable()
export class SchoolService {
  async getCurrentSchool(schoolId: string) {
    const school = await prisma.school.findFirst({ where: { id: schoolId, deletedAt: null } });
    if (!school) throw new NotFoundException('School not found.');
    return { success: true, message: 'School fetched successfully', data: school, meta: {} };
  }

  async updateCurrentSchool(schoolId: string, payload: UpdateSchoolProfileInput, userId: string) {
    const school = await prisma.$transaction(async (tx) => {
      const updated = await tx.school.updateMany({
        where: { id: schoolId, deletedAt: null },
        data: payload,
      });
      if (updated.count === 0) throw new NotFoundException('School not found.');

      const record = await tx.school.findFirst({ where: { id: schoolId, deletedAt: null } });
      if (!record) throw new NotFoundException('School not found.');
      await tx.auditLog.create({
        data: {
          schoolId,
          userId,
          module: 'SCHOOL_SETUP',
          action: 'SCHOOL_UPDATED',
          message: 'School profile updated',
        },
      });
      return record;
    });
    return { success: true, message: 'School updated successfully', data: school, meta: {} };
  }

  async getCurrentSettings(schoolId: string) {
    const school = await prisma.school.findFirst({ where: { id: schoolId, deletedAt: null } });
    if (!school) throw new NotFoundException('School not found.');
    const settings = await prisma.schoolSetting.findFirst({
      where: { schoolId, deletedAt: null },
    });
    if (!settings) throw new NotFoundException('School settings not found.');
    return {
      success: true,
      message: 'School settings fetched successfully',
      data: settings,
      meta: {},
    };
  }

  async updateCurrentSettings(
    schoolId: string,
    payload: UpdateSchoolSettingsInput,
    userId: string,
  ) {
    const settings = await prisma.$transaction(async (tx) => {
      const school = await tx.school.findFirst({ where: { id: schoolId, deletedAt: null } });
      if (!school) throw new NotFoundException('School not found.');

      const updated = await tx.schoolSetting.upsert({
        where: { schoolId },
        update: { ...payload, deletedAt: null },
        create: { schoolId, ...payload },
      });
      await tx.auditLog.create({
        data: {
          schoolId,
          userId,
          module: 'SCHOOL_SETUP',
          action: 'SCHOOL_SETTINGS_UPDATED',
          message: `School settings updated: ${Object.keys(payload).sort().join(', ')}`,
        },
      });
      return updated;
    });
    return {
      success: true,
      message: 'School settings updated successfully',
      data: settings,
      meta: {},
    };
  }

  async getSetupStatus(schoolId: string) {
    const school = await prisma.school.findFirst({ where: { id: schoolId, deletedAt: null } });
    if (!school) throw new NotFoundException('School not found.');

    const [academicYear, classes, sections, subjects, teachers] = await Promise.all([
      prisma.academicYear.count({ where: { schoolId, deletedAt: null, isActive: true } }),
      prisma.class.count({ where: { schoolId, deletedAt: null } }),
      prisma.section.count({ where: { schoolId, deletedAt: null } }),
      prisma.subject.count({ where: { schoolId, deletedAt: null } }),
      prisma.teacher.count({ where: { schoolId, deletedAt: null } }),
    ]);
    return {
      success: true,
      message: 'Setup status fetched successfully',
      data: {
        schoolProfile: Boolean(school?.name),
        academicYear: academicYear > 0,
        classes: classes > 0,
        sections: sections > 0,
        subjects: subjects > 0,
        teachers: teachers > 0,
      },
      meta: {},
    };
  }
}
