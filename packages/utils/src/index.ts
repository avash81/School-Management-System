export function toTitleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export interface DashboardExamSummary {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly startDate: Date | string;
  readonly endDate: Date | string;
}

export interface DashboardMarkGroupRow {
  readonly examId: string;
  readonly status: string;
  readonly _count: { readonly status: number };
}

export interface DashboardExamProgress extends DashboardExamSummary {
  readonly progress: {
    readonly marksEntry: number;
    readonly verification: number;
    readonly approval: number;
  };
}

export const SUBMITTED_STATUSES = ['pending', 'verified', 'approved', 'published'] as const;
export const VERIFIED_STATUSES = ['verified', 'approved', 'published'] as const;
export const APPROVED_STATUSES = ['approved', 'published'] as const;

export function percentageOf(value: number, total: number): number {
  return total ? Math.round((value / total) * 100) : 0;
}

export function aggregateExamMarkProgress(
  exams: ReadonlyArray<DashboardExamSummary>,
  groups: ReadonlyArray<DashboardMarkGroupRow>,
): ReadonlyArray<DashboardExamProgress> {
  const totalByExam = new Map<string, number>();
  const submittedByExam = new Map<string, number>();
  const verifiedByExam = new Map<string, number>();
  const approvedByExam = new Map<string, number>();

  for (const g of groups) {
    const count = g._count.status ?? 0;
    totalByExam.set(g.examId, (totalByExam.get(g.examId) ?? 0) + count);
    if (SUBMITTED_STATUSES.includes(g.status as typeof SUBMITTED_STATUSES[number])) {
      submittedByExam.set(g.examId, (submittedByExam.get(g.examId) ?? 0) + count);
    }
    if (VERIFIED_STATUSES.includes(g.status as typeof VERIFIED_STATUSES[number])) {
      verifiedByExam.set(g.examId, (verifiedByExam.get(g.examId) ?? 0) + count);
    }
    if (APPROVED_STATUSES.includes(g.status as typeof APPROVED_STATUSES[number])) {
      approvedByExam.set(g.examId, (approvedByExam.get(g.examId) ?? 0) + count);
    }
  }

  return exams.map((exam) => {
    const total = totalByExam.get(exam.id) ?? 0;
    const submitted = submittedByExam.get(exam.id) ?? 0;
    const verified = verifiedByExam.get(exam.id) ?? 0;
    const approved = approvedByExam.get(exam.id) ?? 0;
    return {
      ...exam,
      progress: {
        marksEntry: percentageOf(submitted, total),
        verification: percentageOf(verified, total),
        approval: percentageOf(approved, total),
      },
    };
  });
}
