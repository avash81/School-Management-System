import { Injectable } from '@nestjs/common';
import { prisma } from '@schoolos/database';
import { aggregateExamMarkProgress } from '@schoolos/utils';

@Injectable()
export class DashboardService {
  async getSummary(schoolId: string) {
    const [students, activeStudents, teachers, classes, sections, subjects, exams, publishedResults, academicYear, queuedDocuments] = await Promise.all([
      prisma.student.count({ where: { schoolId, deletedAt: null } }),
      prisma.student.count({ where: { schoolId, deletedAt: null, status: 'active' } }),
      prisma.teacher.count({ where: { schoolId, deletedAt: null, status: 'active' } }),
      prisma.class.count({ where: { schoolId, deletedAt: null } }),
      prisma.section.count({ where: { schoolId, deletedAt: null } }),
      prisma.subject.count({ where: { schoolId, deletedAt: null } }),
      prisma.exam.count({ where: { schoolId, deletedAt: null, startDate: { gte: new Date() }, status: { not: 'archived' } } }),
      prisma.result.count({ where: { schoolId, deletedAt: null, status: 'published' } }),
      prisma.academicYear.findFirst({
        where: { schoolId, deletedAt: null, isActive: true },
        select: { name: true },
      }),
      prisma.generatedDocument.count({
        where: { schoolId, deletedAt: null, status: 'queued' },
      }),
    ]);

    return {
      data: {
        students,
        activeStudents,
        teachers,
        classes,
        sections,
        subjects,
        upcomingExams: exams,
        publishedResults,
        academicYear: academicYear?.name ?? null,
        queuedDocuments,
      },
      meta: { generatedAt: new Date().toISOString() },
    };
  }

  async getExaminationProgress(schoolId: string) {
    const exams = await prisma.exam.findMany({
      where: { schoolId, deletedAt: null, status: { not: 'archived' } },
      select: { id: true, name: true, status: true, startDate: true, endDate: true },
      orderBy: { startDate: 'asc' },
      take: 20,
    });

    if (exams.length === 0) {
      return { data: [] };
    }

    const examIds = exams.map((e) => e.id);

    const groups = await prisma.markEntry.groupBy({
      by: ['examId', 'status'],
      where: {
        schoolId,
        examId: { in: examIds },
        deletedAt: null,
      },
      _count: { status: true },
    });

    return {
      data: aggregateExamMarkProgress(exams, groups),
    };
  }

  getPendingActions(schoolId: string) {
    return Promise.all([
      prisma.generatedDocument.count({ where: { schoolId, deletedAt: null, status: 'queued' } }),
      prisma.importSession.count({ where: { schoolId, type: 'students', status: 'review' } }),
      prisma.student.count({ where: { schoolId, deletedAt: null, status: { in: ['active', 'enrolled'] }, OR: [{ phone: null }, { email: null }] } }),
      prisma.markEntry.count({ where: { schoolId, deletedAt: null, status: 'pending' } }),
    ]).then(([queuedDocuments, importReviews, incompleteContacts, pendingMarks]) => ({ data: { queuedDocuments, importReviews, incompleteContacts, pendingMarks } }));
  }

  getRecentActivity(schoolId: string) {
    return prisma.auditLog.findMany({ where: { schoolId, deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 20, select: { id: true, module: true, action: true, message: true, entityId: true, createdAt: true, userId: true } }).then((data) => ({ data }));
  }
}