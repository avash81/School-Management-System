import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { prisma } from '@schoolos/database';

@Injectable()
export class AiService {
  async listSessions(schoolId: string, type?: 'students' | 'marks') {
    const sessions = await prisma.importSession.findMany({
      where: { schoolId, ...(type ? { type } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return Promise.all(
      sessions.map(async (session) => ({
        ...session,
        summary: await this.summary(schoolId, session.id),
      })),
    );
  }

  async getSession(schoolId: string, sessionId: string) {
    const session = await prisma.importSession.findFirst({
      where: { id: sessionId, schoolId },
    });
    if (!session) throw new NotFoundException('AI review session not found.');

    const records = await prisma.importRecord.findMany({
      where: { schoolId, importSessionId: session.id },
      orderBy: { rowNumber: 'asc' },
    });

    return {
      ...session,
      summary: await this.summary(schoolId, session.id),
      records,
    };
  }

  async approveSession(schoolId: string, userId: string, sessionId: string, reason?: string) {
    const session = await prisma.importSession.findFirst({ where: { id: sessionId, schoolId } });
    if (!session) throw new NotFoundException('AI review session not found.');

    const approved = await prisma.importSession.update({
      where: { id: sessionId },
      data: {
        status: 'approved',
        approvedById: userId,
        approvedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        schoolId,
        userId,
        module: 'AI_IMPORT',
        action: 'IMPORT_SESSION_APPROVED',
        message: reason?.trim() ?? 'Session approved after review',
        entityId: sessionId,
      },
    });

    return approved;
  }

  async rejectSession(schoolId: string, userId: string, sessionId: string, reason: string) {
    const session = await prisma.importSession.findFirst({ where: { id: sessionId, schoolId } });
    if (!session) throw new NotFoundException('AI review session not found.');
    if (!reason?.trim()) throw new BadRequestException('A rejection reason is required.');

    const rejected = await prisma.importSession.update({
      where: { id: sessionId },
      data: {
        status: 'rejected',
        approvedById: userId,
        approvedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        schoolId,
        userId,
        module: 'AI_IMPORT',
        action: 'IMPORT_SESSION_REJECTED',
        message: reason.trim(),
        entityId: sessionId,
      },
    });

    return rejected;
  }

  async approveRecord(schoolId: string, userId: string, sessionId: string, recordId: string) {
    const record = await prisma.importRecord.findFirst({ where: { id: recordId, schoolId, importSessionId: sessionId } });
    if (!record) throw new NotFoundException('Import record not found.');

    const updated = await prisma.importRecord.update({
      where: { id: recordId },
      data: { approved: true, validationErrors: undefined },
    });

    await prisma.auditLog.create({
      data: {
        schoolId,
        userId,
        module: 'AI_IMPORT',
        action: 'IMPORT_RECORD_APPROVED',
        message: 'Record approved after review',
        entityId: recordId,
      },
    });

    return updated;
  }

  async rejectRecord(schoolId: string, userId: string, sessionId: string, recordId: string, reason: string) {
    const record = await prisma.importRecord.findFirst({ where: { id: recordId, schoolId, importSessionId: sessionId } });
    if (!record) throw new NotFoundException('Import record not found.');
    if (!reason?.trim()) throw new BadRequestException('A rejection reason is required.');

    const updated = await prisma.importRecord.update({
      where: { id: recordId },
      data: {
        approved: false,
        validationErrors: [
          ...(Array.isArray(record.validationErrors) ? (record.validationErrors as string[]) : []),
          `Manual rejection: ${reason.trim()}`,
        ] as Prisma.InputJsonValue,
      },
    });

    await prisma.auditLog.create({
      data: {
        schoolId,
        userId,
        module: 'AI_IMPORT',
        action: 'IMPORT_RECORD_REJECTED',
        message: reason.trim(),
        entityId: recordId,
      },
    });

    return updated;
  }

  private async summary(schoolId: string, sessionId: string) {
    const [total, approved, rejected] = await Promise.all([
      prisma.importRecord.count({ where: { schoolId, importSessionId: sessionId } }),
      prisma.importRecord.count({ where: { schoolId, importSessionId: sessionId, approved: true } }),
      prisma.importRecord.count({ where: { schoolId, importSessionId: sessionId, approved: false } }),
    ]);

    const pending = total - approved;

    return {
      total,
      approved,
      rejected,
      pending,
      reviewRequired: pending > 0,
    };
  }
}
