import { Injectable } from '@nestjs/common';
import type { Prisma } from '@schoolos/database';
import { prisma } from '@schoolos/database';

@Injectable()
export class ReportsService {
  students(schoolId: string, query: Record<string, unknown>) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 50)));
    const where: Prisma.StudentWhereInput = { schoolId, deletedAt: null, ...(query.status ? { status: String(query.status) as never } : {}) };
    return Promise.all([
      prisma.student.findMany({ where, select: { id: true, admissionNo: true, academicId: true, firstName: true, lastName: true, status: true, gender: true, createdAt: true }, orderBy: { lastName: 'asc' }, skip: (page - 1) * limit, take: limit }),
      prisma.student.count({ where }),
    ]).then(([data, total]) => ({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }));
  }

  results(schoolId: string, query: Record<string, unknown>) {
    const where: Prisma.ResultWhereInput = { schoolId, deletedAt: null, ...(query.examId ? { examId: String(query.examId) } : {}) };
    return prisma.result.groupBy({ by: ['passStatus', 'grade'], where, _count: { _all: true }, _avg: { percentage: true } });
  }

  examinations(schoolId: string) {
    return prisma.exam.findMany({ where: { schoolId, deletedAt: null }, select: { id: true, name: true, status: true, startDate: true, endDate: true }, orderBy: { startDate: 'desc' }, take: 100 });
  }
}