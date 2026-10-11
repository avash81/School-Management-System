import { describe, expect, it } from 'vitest';

import {
  aggregateExamMarkProgress,
  APPROVED_STATUSES,
  DashboardExamSummary,
  DashboardMarkGroupRow,
  percentageOf,
  SUBMITTED_STATUSES,
  toTitleCase,
  VERIFIED_STATUSES,
} from './index.js';

describe('toTitleCase', () => {
  it('normalizes whitespace and casing', () => {
    expect(toTitleCase('  sCHOOL    oS ')).toBe('School Os');
  });
});

describe('percentageOf', () => {
  it('rounds normally', () => {
    expect(percentageOf(72.75, 100)).toBe(73);
    expect(percentageOf(50, 100)).toBe(50);
  });
  it('handles 0 denominator without divide-by-zero (returns 0)', () => {
    expect(percentageOf(0, 0)).toBe(0);
    expect(percentageOf(99, 0)).toBe(0);
  });
  it('handles whole numbers exactly', () => {
    expect(percentageOf(1, 2)).toBe(50);
    expect(percentageOf(3, 4)).toBe(75);
  });
});

describe('aggregateExamMarkProgress (Dashboard N+1 P1-4 Map aggregation verification)', () => {
  const makeExam = (id: string, name = `Exam ${id}`): DashboardExamSummary => ({
    id,
    name,
    status: 'ongoing',
    startDate: '2026-09-01',
    endDate: '2026-09-15',
  });

  const row = (examId: string, status: string, count: number): DashboardMarkGroupRow => ({
    examId,
    status,
    _count: { status: count },
  });

  it('handles empty exams list with empty groups', () => {
    const result = aggregateExamMarkProgress([], []);
    expect(result).toEqual([]);
  });

  it('handles 20 exams with no marks entries (all percentages 0, no NaN)', () => {
    const exams = Array.from({ length: 20 }, (_, i) => makeExam(`ex-${i + 1}`, `Mid ${i + 1}`));
    const result = aggregateExamMarkProgress(exams, []);
    expect(result).toHaveLength(20);
    for (const r of result) {
      expect(r.progress.marksEntry).toBe(0);
      expect(r.progress.verification).toBe(0);
      expect(r.progress.approval).toBe(0);
      expect(Number.isNaN(r.progress.marksEntry)).toBe(false);
    }
  });

  it('matches TC-DASH-001: computes correct percentages for 4 distinct status buckets', () => {
    const exams = [makeExam('ex-1', 'Half-Yearly')];
    // Setup: total 400 marks. draft=100, pending=100, verified=100, approved=100
    const groups: DashboardMarkGroupRow[] = [
      row('ex-1', 'draft', 100),
      row('ex-1', 'pending', 100),
      row('ex-1', 'verified', 100),
      row('ex-1', 'approved', 100),
    ];
    const result = aggregateExamMarkProgress(exams, groups);
    expect(result).toHaveLength(1);
    const r = result[0]!;
    // SUBMITTED = pending+verified+approved (300) / 400 = 75%
    expect(r.progress.marksEntry).toBe(75);
    // VERIFIED = verified+approved (200) / 400 = 50%
    expect(r.progress.verification).toBe(50);
    // APPROVED = approved (100) / 400 = 25%
    expect(r.progress.approval).toBe(25);
  });

  it('parity with old N+1 per-exam count approach (deterministic cross-check TC-PERF-001-A logic)', () => {
    const exams = [makeExam('A'), makeExam('B'), makeExam('C')];
    const groups: DashboardMarkGroupRow[] = [
      // A: 100 total: 20 draft + 30 pending + 20 verified + 30 approved -> submission 80, verify 50, approval 30
      row('A', 'draft', 20), row('A', 'pending', 30), row('A', 'verified', 20), row('A', 'approved', 30),
      // B: 50 draft only -> 0 submission / verify / approval
      row('B', 'draft', 50),
      // C: all published, 25 published
      row('C', 'published', 25),
    ];
    const results = aggregateExamMarkProgress(exams, groups);
    // Old approach manual computation per-exam (mimics the pre-refactor 4 queries/exam):
    const oldApproach = exams.map((exam) => {
      const isIn = (arr: readonly string[]) =>
        groups.filter((g) => g.examId === exam.id && arr.includes(g.status))
          .reduce((acc, g) => acc + (g._count.status ?? 0), 0);
      const total = groups.filter((g) => g.examId === exam.id).reduce((a, g) => a + (g._count.status ?? 0), 0);
      const pct = (v: number) => (total ? Math.round((v / total) * 100) : 0);
      return {
        id: exam.id,
        progress: {
          marksEntry: pct(isIn(SUBMITTED_STATUSES)),
          verification: pct(isIn(VERIFIED_STATUSES)),
          approval: pct(isIn(APPROVED_STATUSES)),
        },
      };
    });
    // Parity: every id's progress field must match old approach exactly
    for (const expected of oldApproach) {
      const actual = results.find((r) => r.id === expected.id)!;
      expect(actual.progress).toEqual(expected.progress);
    }
    // Specific spot checks for A/B/C
    const A = results.find((r) => r.id === 'A')!;
    expect(A.progress.marksEntry).toBe(80); // 80/100
    expect(A.progress.verification).toBe(50); // 50/100
    expect(A.progress.approval).toBe(30); // 30/100
    const B = results.find((r) => r.id === 'B')!;
    expect(B.progress.marksEntry).toBe(0);
    expect(B.progress.verification).toBe(0);
    expect(B.progress.approval).toBe(0);
    const C = results.find((r) => r.id === 'C')!;
    expect(C.progress.marksEntry).toBe(100); // all 25 published are SUBMITTED
    expect(C.progress.verification).toBe(100); // published is VERIFIED
    expect(C.progress.approval).toBe(100); // published is APPROVED
  });

  it('handles exam ids present in exams but missing in groups -> 0 all buckets', () => {
    const exams = [makeExam('orphan')];
    const result = aggregateExamMarkProgress(exams, [row('other', 'approved', 999)]);
    expect(result).toHaveLength(1);
    const r = result[0]!;
    expect(r.progress).toEqual({ marksEntry: 0, verification: 0, approval: 0 });
  });

  it('group rows for unknown exam id (not in exam list) are ignored (no spurious extra rows)', () => {
    const exams = [makeExam('E1')];
    const groups = [row('E1', 'approved', 50), row('NOT_IN_EXAMS', 'approved', 9999)];
    const result = aggregateExamMarkProgress(exams, groups);
    expect(result).toHaveLength(1);
    const e1 = result[0]!;
    expect(e1.id).toBe('E1');
    expect(e1.progress.approval).toBe(100);
  });

  it('boundary rounding HALF_UP percentages (matches RES-POL-003 rounding rule)', () => {
    const exams = [makeExam('R1'), makeExam('R2')];
    const groups: DashboardMarkGroupRow[] = [
      // R1: 7275 total -> approved 7274.99 (rounds to 100? No, let's pick 7275/10000=72.75 -> 73)
      row('R1', 'approved', 7275),
      row('R1', 'draft', 2725), // total 10000
      // R2: 72749 approved / 100000 total = 72.749 -> 73
      row('R2', 'approved', 72749),
      row('R2', 'draft', 27251),
    ];
    const result = aggregateExamMarkProgress(exams, groups);
    expect(result).toHaveLength(2);
    const r1 = result[0]!;
    const r2 = result[1]!;
    expect(r1.progress.approval).toBe(73);
    expect(r2.progress.approval).toBe(73);
  });
});
