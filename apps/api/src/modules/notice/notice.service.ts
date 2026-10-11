import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@schoolos/database';
import { prisma } from '@schoolos/database';

type NoticeInput = Record<string, unknown>;

@Injectable()
export class NoticeService {
  list(schoolId: string, query: NoticeInput) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
    const where: Prisma.NoticeWhereInput = {
      schoolId,
      deletedAt: null,
      ...(query.status ? { status: String(query.status) as never } : {}),
      ...(query.search ? { title: { contains: String(query.search).trim(), mode: 'insensitive' } } : {}),
    };
    return Promise.all([
      prisma.notice.findMany({ where, orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }], skip: (page - 1) * limit, take: limit }),
      prisma.notice.count({ where }),
    ]).then(([data, total]) => ({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }));
  }

  async create(schoolId: string, userId: string, payload: NoticeInput) {
    if (!String(payload.title ?? '').trim() || !String(payload.content ?? '').trim()) throw new BadRequestException('Title and content are required.');
    const notice = await prisma.notice.create({ data: { schoolId, title: String(payload.title), content: String(payload.content), noticeNumber: payload.noticeNumber ? String(payload.noticeNumber) : null, priority: (payload.priority as never) ?? 'normal', status: (payload.status as never) ?? 'draft', effectiveAt: payload.effectiveAt ? new Date(String(payload.effectiveAt)) : null, expiresAt: payload.expiresAt ? new Date(String(payload.expiresAt)) : null, audience: payload.audience as Prisma.InputJsonValue | undefined, attachmentKey: payload.attachmentKey ? String(payload.attachmentKey) : null, createdById: userId } });
    await this.history(schoolId, notice.id, userId, 'CREATED');
    return notice;
  }

  async get(schoolId: string, id: string) {
    const notice = await prisma.notice.findFirst({ where: { schoolId, id, deletedAt: null } });
    if (!notice) throw new NotFoundException('Notice not found.');
    return notice;
  }

  async update(schoolId: string, userId: string, id: string, payload: NoticeInput) {
    const current = await this.get(schoolId, id);
    if (current.status === 'published' || current.status === 'archived') throw new BadRequestException('Published and archived notices cannot be edited.');
    const notice = await prisma.notice.update({ where: { id }, data: { ...(payload.title !== undefined ? { title: String(payload.title) } : {}), ...(payload.content !== undefined ? { content: String(payload.content) } : {}), ...(payload.priority !== undefined ? { priority: payload.priority as never } : {}), ...(payload.effectiveAt !== undefined ? { effectiveAt: payload.effectiveAt ? new Date(String(payload.effectiveAt)) : null } : {}), ...(payload.expiresAt !== undefined ? { expiresAt: payload.expiresAt ? new Date(String(payload.expiresAt)) : null } : {}), ...(payload.audience !== undefined ? { audience: payload.audience as Prisma.InputJsonValue } : {}) } });
    await this.history(schoolId, notice.id, userId, 'UPDATED');
    return notice;
  }

  async publish(schoolId: string, userId: string, id: string) {
    await this.get(schoolId, id);
    const notice = await prisma.notice.update({ where: { id }, data: { status: 'published', publishedAt: new Date(), publishedById: userId } });
    await this.history(schoolId, id, userId, 'PUBLISHED');
    return notice;
  }

  async archive(schoolId: string, userId: string, id: string) {
    await this.get(schoolId, id);
    const notice = await prisma.notice.update({ where: { id }, data: { status: 'archived' } });
    await this.history(schoolId, id, userId, 'ARCHIVED');
    return notice;
  }

  private history(schoolId: string, noticeId: string, userId: string, action: string) {
    return prisma.noticeHistory.create({ data: { schoolId, noticeId, performedBy: userId, action } });
  }
}