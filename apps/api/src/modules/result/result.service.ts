import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@schoolos/database';
import { prisma } from '@schoolos/database';

@Injectable()
export class ResultService {
  async list(schoolId: string, query: Record<string, unknown>) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
    const where: Prisma.ResultWhereInput = {
      schoolId,
      deletedAt: null,
      ...(query.examId ? { examId: String(query.examId) } : {}),
      ...(query.studentId ? { studentId: String(query.studentId) } : {}),
      ...(query.status ? { status: String(query.status) as never } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.result.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.result.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(schoolId: string, id: string) {
    const result = await prisma.result.findFirst({ where: { id, schoolId, deletedAt: null } });
    if (!result) throw new NotFoundException('Result not found.');
    return result;
  }

  async history(schoolId: string, resultId: string) {
    const result = await this.findOne(schoolId, resultId);
    const [snapshots, approvals] = await Promise.all([
      prisma.resultSnapshot.findMany({
        where: { schoolId, resultId: result.id },
        orderBy: { version: 'desc' },
      }),
      prisma.resultApproval.findMany({
        where: { schoolId, examId: result.examId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { result, snapshots, approvals };
  }

  async approve(schoolId: string, userId: string, resultId: string, remarks?: string) {
    const result = await this.findOne(schoolId, resultId);

    if (result.status !== 'verified' && result.status !== 'calculated') {
      throw new BadRequestException('Only calculated or verified results can be approved.');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const approved = await tx.result.update({
        where: { id: result.id },
        data: {
          status: 'approved',
          approvedAt: new Date(),
        },
      });

      await tx.resultApproval.create({
        data: {
          schoolId,
          examId: result.examId,
          userId,
          role: 'authorized_approver',
          status: 'approved',
          remarks: remarks?.trim() ?? null,
        },
      });

      return approved;
    });

    await this.audit(schoolId, userId, 'RESULT_APPROVED', 'Result approved', result.id, result.status, updated.status);
    return updated;
  }

  async publish(schoolId: string, userId: string, resultId: string, remarks?: string) {
    const result = await this.findOne(schoolId, resultId);

    if (result.status !== 'approved') {
      throw new BadRequestException('Only approved results can be published.');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const published = await tx.result.update({
        where: { id: result.id },
        data: {
          status: 'published',
          publishedAt: new Date(),
        },
      });

      await tx.resultApproval.create({
        data: {
          schoolId,
          examId: result.examId,
          userId,
          role: 'authorized_publisher',
          status: 'published',
          remarks: remarks?.trim() ?? null,
        },
      });

      return published;
    });

    await this.audit(schoolId, userId, 'RESULT_PUBLISHED', 'Result published', result.id, result.status, updated.status);
    return updated;
  }

  async reopen(schoolId: string, userId: string, resultId: string, reason?: string) {
    const result = await this.findOne(schoolId, resultId);

    if (result.status !== 'published') {
      throw new BadRequestException('Only published results can be reopened.');
    }

    if (!reason?.trim()) {
      throw new BadRequestException('A reason is required to reopen a published result.');
    }

    const reopened = await prisma.$transaction(async (tx) => {
      const updated = await tx.result.update({
        where: { id: result.id },
        data: {
          status: 'reopened',
          approvedAt: null,
          publishedAt: null,
        },
      });

      await tx.resultApproval.create({
        data: {
          schoolId,
          examId: result.examId,
          userId,
          role: 'authorized_reviewer',
          status: 'reopened',
          remarks: reason.trim(),
        },
      });

      return updated;
    });

    await this.audit(schoolId, userId, 'RESULT_REOPENED', 'Result reopened for correction', result.id, result.status, reopened.status);
    return reopened;
  }

  async studentResults(schoolId: string, studentId: string) {
    return prisma.result.findMany({
      where: { schoolId, studentId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  private audit(schoolId: string, userId: string, action: string, message: string, entityId?: string, oldValue?: string, newValue?: string) {
    return prisma.auditLog.create({
      data: {
        schoolId,
        userId,
        module: 'RESULTS',
        action,
        message,
        entityId,
        oldValue,
        newValue,
      },
    });
  }
}
