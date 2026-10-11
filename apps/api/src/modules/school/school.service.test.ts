import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  schoolFindFirst,
  schoolUpdateMany,
  schoolSettingFindFirst,
  schoolSettingUpsert,
  transaction,
  academicYearCount,
  classCount,
  sectionCount,
  subjectCount,
  teacherCount,
  auditCreate,
} = vi.hoisted(() => {
  const schoolFindFirst = vi.fn();
  const schoolUpdateMany = vi.fn();
  const schoolSettingFindFirst = vi.fn();
  const schoolSettingUpsert = vi.fn();
  const transaction = vi.fn();

  return {
    schoolFindFirst,
    schoolUpdateMany,
    schoolSettingFindFirst,
    schoolSettingUpsert,
    transaction,
    academicYearCount: vi.fn(),
    classCount: vi.fn(),
    sectionCount: vi.fn(),
    subjectCount: vi.fn(),
    teacherCount: vi.fn(),
    auditCreate: vi.fn(),
  };
});

vi.mock('@schoolos/database', () => ({
  prisma: {
    school: { findFirst: schoolFindFirst },
    schoolSetting: { findFirst: schoolSettingFindFirst },
    academicYear: { count: academicYearCount },
    class: { count: classCount },
    section: { count: sectionCount },
    subject: { count: subjectCount },
    teacher: { count: teacherCount },
    $transaction: transaction,
    auditLog: { create: auditCreate },
  },
}));

import { SchoolService } from './school.service.js';

describe('SchoolService', () => {
  const service = new SchoolService();

  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation((callback) =>
      callback({
        school: {
          updateMany: schoolUpdateMany,
          findFirst: schoolFindFirst,
        },
        schoolSetting: { upsert: schoolSettingUpsert },
        auditLog: { create: auditCreate },
      }),
    );
  });

  it('updates only an active school and records an audit entry', async () => {
    const schoolId = 'school-1';
    const userId = 'user-1';
    const payload = {
      name: 'Example School',
      email: 'contact@example.test',
      establishedYear: 1995,
      address: null,
    };
    const updatedSchool = { id: schoolId, ...payload };
    schoolUpdateMany.mockResolvedValue({ count: 1 });
    schoolFindFirst.mockResolvedValue(updatedSchool);
    auditCreate.mockResolvedValue({});

    const result = await service.updateCurrentSchool(schoolId, payload, userId);

    expect(schoolUpdateMany).toHaveBeenCalledWith({
      where: { id: schoolId, deletedAt: null },
      data: payload,
    });
    expect(schoolFindFirst).toHaveBeenCalledWith({
      where: { id: schoolId, deletedAt: null },
    });
    expect(auditCreate).toHaveBeenCalledWith({
      data: {
        schoolId,
        userId,
        module: 'SCHOOL_SETUP',
        action: 'SCHOOL_UPDATED',
        message: 'School profile updated',
      },
    });
    expect(result.data).toBe(updatedSchool);
  });

  it('does not update or audit a missing or deleted school', async () => {
    schoolUpdateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.updateCurrentSchool('deleted-school', { name: 'Renamed' }, 'user-1'),
    ).rejects.toThrow(NotFoundException);

    expect(schoolUpdateMany).toHaveBeenCalledWith({
      where: { id: 'deleted-school', deletedAt: null },
      data: { name: 'Renamed' },
    });
    expect(schoolFindFirst).not.toHaveBeenCalled();
    expect(auditCreate).not.toHaveBeenCalled();
  });

  it('fails the school update when the transactional audit write fails', async () => {
    schoolUpdateMany.mockResolvedValue({ count: 1 });
    schoolFindFirst.mockResolvedValue({ id: 'school-1', name: 'Example School' });
    auditCreate.mockRejectedValue(new Error('Audit storage unavailable'));

    await expect(
      service.updateCurrentSchool('school-1', { name: 'Updated School' }, 'user-1'),
    ).rejects.toThrow('Audit storage unavailable');

    expect(auditCreate).toHaveBeenCalledWith({
      data: {
        schoolId: 'school-1',
        userId: 'user-1',
        module: 'SCHOOL_SETUP',
        action: 'SCHOOL_UPDATED',
        message: 'School profile updated',
      },
    });
  });

  it('reports setup status only for the requested active school', async () => {
    schoolFindFirst.mockResolvedValue({ id: 'school-1', name: 'Example School' });
    academicYearCount.mockResolvedValue(1);
    classCount.mockResolvedValue(1);
    sectionCount.mockResolvedValue(0);
    subjectCount.mockResolvedValue(1);
    teacherCount.mockResolvedValue(0);

    const result = await service.getSetupStatus('school-1');

    expect(schoolFindFirst).toHaveBeenCalledWith({
      where: { id: 'school-1', deletedAt: null },
    });
    for (const count of [academicYearCount, classCount, sectionCount, subjectCount, teacherCount]) {
      expect(count).toHaveBeenCalledWith({
        where: {
          schoolId: 'school-1',
          deletedAt: null,
          ...(count === academicYearCount ? { isActive: true } : {}),
        },
      });
    }
    expect(result.data).toEqual({
      schoolProfile: true,
      academicYear: true,
      classes: true,
      sections: false,
      subjects: true,
      teachers: false,
    });
  });

  it('does not return setup status for a missing or deleted school', async () => {
    schoolFindFirst.mockResolvedValue(null);

    await expect(service.getSetupStatus('deleted-school')).rejects.toThrow(NotFoundException);

    expect(academicYearCount).not.toHaveBeenCalled();
    expect(classCount).not.toHaveBeenCalled();
    expect(sectionCount).not.toHaveBeenCalled();
    expect(subjectCount).not.toHaveBeenCalled();
    expect(teacherCount).not.toHaveBeenCalled();
  });

  it('lists settings only for the authenticated school', async () => {
    const settings = { schoolId: 'school-1', timeZone: 'Asia/Kathmandu' };
    schoolFindFirst.mockResolvedValue({ id: 'school-1', name: 'Example School' });
    schoolSettingFindFirst.mockResolvedValue(settings);

    const result = await service.getCurrentSettings('school-1');

    expect(schoolFindFirst).toHaveBeenCalledWith({
      where: { id: 'school-1', deletedAt: null },
    });
    expect(schoolSettingFindFirst).toHaveBeenCalledWith({
      where: { schoolId: 'school-1', deletedAt: null },
    });
    expect(result.data).toBe(settings);
  });

  it('returns not-found when the school has no active settings row', async () => {
    schoolFindFirst.mockResolvedValue({ id: 'school-1', name: 'Example School' });
    schoolSettingFindFirst.mockResolvedValue(null);

    await expect(service.getCurrentSettings('school-1')).rejects.toThrow(NotFoundException);
  });

  it('does not expose settings when the school is missing or deleted', async () => {
    schoolFindFirst.mockResolvedValue(null);

    await expect(service.getCurrentSettings('deleted-school')).rejects.toThrow(NotFoundException);

    expect(schoolSettingFindFirst).not.toHaveBeenCalled();
  });

  it('updates school settings and audits changed fields in the same transaction', async () => {
    schoolFindFirst.mockResolvedValue({ id: 'school-1', name: 'Example School' });
    const payload = {
      timeZone: 'Asia/Kathmandu',
      language: 'ne' as const,
      currency: 'NPR',
    };
    const settings = { schoolId: 'school-1', ...payload };
    schoolSettingUpsert.mockResolvedValue(settings);
    auditCreate.mockResolvedValue({});

    const result = await service.updateCurrentSettings('school-1', payload, 'user-1');

    expect(schoolSettingUpsert).toHaveBeenCalledWith({
      where: { schoolId: 'school-1' },
      update: { ...payload, deletedAt: null },
      create: { schoolId: 'school-1', ...payload },
    });
    expect(auditCreate).toHaveBeenCalledWith({
      data: {
        schoolId: 'school-1',
        userId: 'user-1',
        module: 'SCHOOL_SETUP',
        action: 'SCHOOL_SETTINGS_UPDATED',
        message: 'School settings updated: currency, language, timeZone',
      },
    });
    expect(result.data).toBe(settings);
  });

  it('surfaces a failed settings audit instead of reporting a successful update', async () => {
    schoolFindFirst.mockResolvedValue({ id: 'school-1', name: 'Example School' });
    schoolSettingUpsert.mockResolvedValue({ schoolId: 'school-1' });
    auditCreate.mockRejectedValue(new Error('Audit storage unavailable'));

    await expect(
      service.updateCurrentSettings('school-1', { timeZone: 'Asia/Kathmandu' }, 'user-1'),
    ).rejects.toThrow('Audit storage unavailable');
  });

  it('does not create settings for a missing or deleted school', async () => {
    schoolFindFirst.mockResolvedValue(null);

    await expect(
      service.updateCurrentSettings('deleted-school', { timeZone: 'Asia/Kathmandu' }, 'user-1'),
    ).rejects.toThrow(NotFoundException);

    expect(schoolSettingUpsert).not.toHaveBeenCalled();
    expect(auditCreate).not.toHaveBeenCalled();
  });
});
