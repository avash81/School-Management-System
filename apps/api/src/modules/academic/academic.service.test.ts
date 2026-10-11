import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, transactionAcademicYear, transaction, transactionQueryRaw, auditCreate } =
  vi.hoisted(() => {
    const transactionAcademicYear = {
      updateMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
    };
    const transactionQueryRaw = vi.fn();

    return {
      prismaMock: {
        academicYear: {
          findMany: vi.fn(),
          findFirst: vi.fn(),
        },
        class: {
          findFirst: vi.fn(),
          update: vi.fn(),
        },
        section: {
          create: vi.fn(),
          findFirst: vi.fn(),
          update: vi.fn(),
        },
        subject: {
          findFirst: vi.fn(),
          update: vi.fn(),
        },
        $transaction: vi.fn(),
        auditLog: { create: vi.fn() },
      },
      transactionAcademicYear,
      transaction: vi.fn(),
      transactionQueryRaw,
      auditCreate: vi.fn(),
    };
  });

vi.mock('@schoolos/database', () => ({
  prisma: {
    ...prismaMock,
    academicYear: prismaMock.academicYear,
    class: prismaMock.class,
    section: prismaMock.section,
    subject: prismaMock.subject,
    auditLog: { create: auditCreate },
    $transaction: transaction,
  },
}));

import { AcademicService } from './academic.service.js';

describe('AcademicService academic year lifecycle', () => {
  const service = new AcademicService();
  const schoolId = 'school-1';
  const userId = 'user-1';

  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation((callback) =>
      callback({
        academicYear: transactionAcademicYear,
        auditLog: { create: auditCreate },
        $queryRaw: transactionQueryRaw,
      }),
    );
  });

  it('lists only non-deleted academic years for the requested school', async () => {
    prismaMock.academicYear.findMany.mockResolvedValue([]);

    await service.list('academicYear', schoolId);

    expect(prismaMock.academicYear.findMany).toHaveBeenCalledWith({
      where: { schoolId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('activates a created year and deactivates only active years in the same school transaction', async () => {
    const created = { id: 'year-2', schoolId, isActive: true };
    transactionAcademicYear.findFirst.mockResolvedValue(null);
    transactionAcademicYear.updateMany.mockResolvedValue({ count: 1 });
    transactionAcademicYear.create.mockResolvedValue(created);
    auditCreate.mockResolvedValue({});

    const result = await service.createAcademicYear(schoolId, userId, {
      name: '2027',
      startDate: '2027-01-01',
      endDate: '2027-12-31',
      isActive: true,
    });

    expect(transactionAcademicYear.updateMany).toHaveBeenCalledWith({
      where: { schoolId, isActive: true, deletedAt: null },
      data: { isActive: false },
    });
    expect(transactionAcademicYear.findFirst).toHaveBeenCalledWith({
      where: {
        schoolId,
        deletedAt: null,
        startDate: { lte: new Date('2027-12-31') },
        endDate: { gte: new Date('2027-01-01') },
      },
      select: { id: true, name: true },
    });
    expect(transactionQueryRaw).toHaveBeenCalledOnce();
    expect(transactionAcademicYear.create).toHaveBeenCalledWith({
      data: {
        schoolId,
        name: '2027',
        startDate: new Date('2027-01-01'),
        endDate: new Date('2027-12-31'),
        isActive: true,
      },
    });
    expect(auditCreate).toHaveBeenCalledWith({
      data: {
        schoolId,
        userId,
        module: 'SCHOOL_SETUP',
        action: 'ACADEMIC_YEAR_CREATED',
        message: 'Academic year created',
      },
    });
    expect(result).toBe(created);
  });

  it('maps a database uniqueness race on active-year creation to a conflict', async () => {
    const uniqueError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target: ['school_id'] },
    });
    transactionAcademicYear.findFirst.mockResolvedValue(null);
    transactionAcademicYear.updateMany.mockResolvedValue({ count: 0 });
    transactionAcademicYear.create.mockRejectedValue(uniqueError);

    await expect(
      service.createAcademicYear(schoolId, userId, {
        name: '2027',
        startDate: '2027-01-01',
        endDate: '2027-12-31',
        isActive: true,
      }),
    ).rejects.toThrow(ConflictException);

    expect(auditCreate).not.toHaveBeenCalled();
  });

  it('maps a database uniqueness race on year activation to a conflict', async () => {
    const uniqueError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target: ['school_id'] },
    });
    prismaMock.academicYear.findFirst.mockResolvedValue({
      id: 'year-2',
      schoolId,
      startDate: new Date('2027-01-01'),
      endDate: new Date('2027-12-31'),
    });
    transactionAcademicYear.findFirst.mockResolvedValueOnce({
      id: 'year-2',
      schoolId,
      startDate: new Date('2027-01-01'),
      endDate: new Date('2027-12-31'),
    });
    transactionAcademicYear.findFirst.mockResolvedValueOnce(null);
    transactionAcademicYear.updateMany.mockRejectedValue(uniqueError);

    await expect(
      service.updateAcademicYear(schoolId, userId, 'year-2', { isActive: true }),
    ).rejects.toThrow(ConflictException);

    expect(auditCreate).not.toHaveBeenCalled();
  });

  it('does not report an academic year created when its audit fails', async () => {
    const created = { id: 'year-2', schoolId, isActive: false };
    transactionAcademicYear.findFirst.mockResolvedValue(null);
    transactionAcademicYear.create.mockResolvedValue(created);
    auditCreate.mockRejectedValue(new Error('Audit storage unavailable'));

    await expect(
      service.createAcademicYear(schoolId, userId, {
        name: '2027',
        startDate: '2027-01-01',
        endDate: '2027-12-31',
        isActive: false,
      }),
    ).rejects.toThrow('Audit storage unavailable');
  });

  it('rejects an academic year that is not in the requested school', async () => {
    prismaMock.academicYear.findFirst.mockResolvedValue(null);

    await expect(
      service.updateAcademicYear(schoolId, userId, 'other-school-year', { isActive: true }),
    ).rejects.toThrow(NotFoundException);

    expect(prismaMock.academicYear.findFirst).toHaveBeenCalledWith({
      where: { id: 'other-school-year', schoolId, deletedAt: null },
    });
    expect(transaction).not.toHaveBeenCalled();
  });

  it('rejects a new academic year whose inclusive dates overlap an existing year', async () => {
    transactionAcademicYear.findFirst.mockResolvedValue({
      id: 'year-1',
      name: '2026',
    });

    await expect(
      service.createAcademicYear(schoolId, userId, {
        name: '2027',
        startDate: '2026-12-31',
        endDate: '2027-12-31',
        isActive: false,
      }),
    ).rejects.toMatchObject({
      status: 422,
      response: {
        code: 'YEAR_DATE_OVERLAP',
        meta: { academicYearId: 'year-1' },
      },
    });

    expect(transactionAcademicYear.create).not.toHaveBeenCalled();
    expect(auditCreate).not.toHaveBeenCalled();
  });

  it('rejects invalid date ranges before writing', async () => {
    prismaMock.academicYear.findFirst.mockResolvedValue({
      id: 'year-1',
      schoolId,
      startDate: new Date('2027-01-01'),
      endDate: new Date('2027-12-31'),
    });

    await expect(
      service.updateAcademicYear(schoolId, userId, 'year-1', { endDate: '2026-12-31' }),
    ).rejects.toThrow(BadRequestException);

    expect(transaction).not.toHaveBeenCalled();
  });

  it('deactivates only other active years in the same school when activating an existing year', async () => {
    const existing = {
      id: 'year-2',
      schoolId,
      startDate: new Date('2027-01-01'),
      endDate: new Date('2027-12-31'),
    };
    const activated = { ...existing, isActive: true };
    prismaMock.academicYear.findFirst.mockResolvedValue(existing);
    transactionAcademicYear.findFirst
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(activated);
    transactionAcademicYear.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 1 });
    transactionAcademicYear.findFirst.mockResolvedValue(activated);
    auditCreate.mockResolvedValue({});

    const result = await service.updateAcademicYear(schoolId, userId, existing.id, {
      isActive: true,
    });

    expect(transactionAcademicYear.updateMany).toHaveBeenNthCalledWith(1, {
      where: { schoolId, isActive: true, deletedAt: null, id: { not: existing.id } },
      data: { isActive: false },
    });
    expect(transactionAcademicYear.updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: existing.id, schoolId, deletedAt: null },
      data: { isActive: true },
    });
    expect(transactionAcademicYear.findFirst).toHaveBeenNthCalledWith(3, {
      where: { id: existing.id, schoolId, deletedAt: null },
    });
    expect(transactionQueryRaw).toHaveBeenCalledOnce();
    expect(result).toBe(activated);
  });

  it('rejects an academic-year date update that overlaps another year', async () => {
    const existing = {
      id: 'year-2',
      schoolId,
      startDate: new Date('2027-01-01'),
      endDate: new Date('2027-12-31'),
    };
    prismaMock.academicYear.findFirst.mockResolvedValue(existing);
    transactionAcademicYear.findFirst
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce({ id: 'year-1', name: '2026' });

    await expect(
      service.updateAcademicYear(schoolId, userId, existing.id, {
        startDate: '2026-12-31',
      }),
    ).rejects.toMatchObject({
      status: 422,
      response: {
        code: 'YEAR_DATE_OVERLAP',
        meta: { academicYearId: 'year-1' },
      },
    });

    expect(transactionAcademicYear.updateMany).not.toHaveBeenCalled();
    expect(auditCreate).not.toHaveBeenCalled();
    expect(transactionQueryRaw).toHaveBeenCalledOnce();
  });

  it('does not update a class that belongs to another school', async () => {
    prismaMock.class.findFirst.mockResolvedValue(null);

    await expect(
      service.updateClass(schoolId, 'other-school-class', { name: 'Renamed' }),
    ).rejects.toThrow(NotFoundException);

    expect(prismaMock.class.findFirst).toHaveBeenCalledWith({
      where: { id: 'other-school-class', schoolId, deletedAt: null },
    });
    expect(prismaMock.class.update).not.toHaveBeenCalled();
  });

  it('does not create a section for a class that belongs to another school', async () => {
    prismaMock.class.findFirst.mockResolvedValue(null);

    await expect(
      service.createSection(schoolId, userId, {
        classId: 'other-school-class',
        name: 'A',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(prismaMock.class.findFirst).toHaveBeenCalledWith({
      where: { id: 'other-school-class', schoolId, deletedAt: null },
    });
    expect(prismaMock.section.create).not.toHaveBeenCalled();
    expect(auditCreate).not.toHaveBeenCalled();
  });

  it('does not update a section that belongs to another school', async () => {
    prismaMock.section.findFirst.mockResolvedValue(null);

    await expect(
      service.updateSection(schoolId, 'other-school-section', { name: 'B' }),
    ).rejects.toThrow(NotFoundException);

    expect(prismaMock.section.findFirst).toHaveBeenCalledWith({
      where: { id: 'other-school-section', schoolId, deletedAt: null },
    });
    expect(prismaMock.section.update).not.toHaveBeenCalled();
  });

  it('does not update a subject that belongs to another school', async () => {
    prismaMock.subject.findFirst.mockResolvedValue(null);

    await expect(
      service.updateSubject(schoolId, 'other-school-subject', { name: 'Renamed' }),
    ).rejects.toThrow(NotFoundException);

    expect(prismaMock.subject.findFirst).toHaveBeenCalledWith({
      where: { id: 'other-school-subject', schoolId, deletedAt: null },
    });
    expect(prismaMock.subject.update).not.toHaveBeenCalled();
  });
});
