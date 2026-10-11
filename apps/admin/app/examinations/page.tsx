'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { type ApiError, apiFetch, apiFetchAll } from '../../lib/api-client';

type DashboardSummary = {
  students: number;
  teachers: number;
  classes: number;
  academicYear: string | null;
  queuedDocuments: number;
};

type PendingResponse = {
  data: {
    queuedDocuments: number;
    importReviews: number;
    incompleteContacts: number;
    pendingMarks: number;
  };
};

type SummaryResponse = { data: DashboardSummary };

type ExamRecord = {
  id: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  resultPublishDate?: string | null;
  status: string;
  createdAt?: string;
};

type MarkEntryRecord = {
  id: string;
  examId: string;
  studentId: string;
  enrollmentId: string;
  assessmentComponentId: string;
  markValue: number | null;
  status: string;
  attendanceStatus: string;
  updatedAt: string;
};

type BlueprintRecord = {
  id: string;
  curriculumVersionId: string;
  name: string;
  subjectId: string | null;
  totalMarks: number;
  subject?: { id: string; name: string } | null;
};

type BlueprintComponentRecord = {
  id: string;
  blueprintId: string;
  name: string;
  maxMarks: number;
  orderIndex: number;
};

type GradingBandRecord = {
  id: string;
  grade: string;
  minPercent: number | string;
  maxPercent: number | string;
  gpa: number | string;
};

type CreateExamPayload = {
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  resultPublishDate?: string;
};

const demoExams: ExamRecord[] = [
  {
    id: 'exam-demo-1',
    academicYearId: 'year-demo',
    name: 'Midterm - Science',
    startDate: '2026-10-12T00:00:00.000Z',
    endDate: '2026-10-14T00:00:00.000Z',
    resultPublishDate: null,
    status: 'scheduled',
  },
  {
    id: 'exam-demo-2',
    academicYearId: 'year-demo',
    name: 'Unit Test - Mathematics',
    startDate: '2026-10-18T00:00:00.000Z',
    endDate: '2026-10-19T00:00:00.000Z',
    status: 'draft',
  },
];

const demoMarks: MarkEntryRecord[] = [
  {
    id: 'mark-demo-1',
    examId: 'exam-demo-1',
    studentId: 'student-demo-1',
    enrollmentId: 'enrollment-demo-1',
    assessmentComponentId: 'component-demo-1',
    markValue: 82,
    status: 'pending',
    attendanceStatus: 'present',
    updatedAt: '2026-10-11T10:00:00.000Z',
  },
  {
    id: 'mark-demo-2',
    examId: 'exam-demo-1',
    studentId: 'student-demo-2',
    enrollmentId: 'enrollment-demo-2',
    assessmentComponentId: 'component-demo-2',
    markValue: null,
    status: 'draft',
    attendanceStatus: 'absent',
    updatedAt: '2026-10-11T08:30:00.000Z',
  },
];

const demoBlueprints: BlueprintRecord[] = [
  {
    id: 'blueprint-demo-1',
    curriculumVersionId: 'curriculum-demo',
    name: 'Science Midterm Blueprint',
    subjectId: 'subject-science',
    totalMarks: 100,
    subject: { id: 'subject-science', name: 'Science' },
  },
];

const demoComponents: BlueprintComponentRecord[] = [
  { id: 'component-demo-1', blueprintId: 'blueprint-demo-1', name: 'Classwork', maxMarks: 20, orderIndex: 1 },
  { id: 'component-demo-2', blueprintId: 'blueprint-demo-1', name: 'Quiz', maxMarks: 20, orderIndex: 2 },
  { id: 'component-demo-3', blueprintId: 'blueprint-demo-1', name: 'Final exam', maxMarks: 60, orderIndex: 3 },
];

const demoBands: GradingBandRecord[] = [
  { id: 'grade-demo-a', grade: 'A', minPercent: 80, maxPercent: 100, gpa: 4 },
  { id: 'grade-demo-b', grade: 'B', minPercent: 65, maxPercent: 79, gpa: 3 },
  { id: 'grade-demo-c', grade: 'C', minPercent: 50, maxPercent: 64, gpa: 2 },
];

export default function ExaminationsPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [pending, setPending] = useState<PendingResponse['data'] | null>(null);
  const [exams, setExams] = useState<ExamRecord[]>(demoExams);
  const [marks, setMarks] = useState<MarkEntryRecord[]>(demoMarks);
  const [blueprints, setBlueprints] = useState<BlueprintRecord[]>(demoBlueprints);
  const [components, setComponents] = useState<BlueprintComponentRecord[]>(demoComponents);
  const [bands, setBands] = useState<GradingBandRecord[]>(demoBands);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>(demoBlueprints[0]?.id ?? '');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  const loadBlueprintComponents = async (blueprintId: string) => {
    if (!blueprintId) {
      setComponents([]);
      return;
    }

    try {
      const response = await apiFetch<BlueprintComponentRecord[]>(`/blueprints/${blueprintId}/components`);
      setComponents(response.length ? response : demoComponents);
    } catch {
      setComponents(demoComponents);
    }
  };

  const loadData = async () => {
    const fallbackExamId = demoExams[0]?.id ?? '';

    try {
      const [summaryResponse, pendingResponse, examResponse, blueprintResponse, gradingBandResponse] =
        await apiFetchAll<[
          SummaryResponse,
          PendingResponse,
          ExamRecord[],
          BlueprintRecord[],
          GradingBandRecord[]
        ]>([
          ['/dashboard/summary'],
          ['/dashboard/pending-actions'],
          ['/exams'],
          ['/blueprints'],
          ['/grading-bands'],
        ]);

      setSummary(summaryResponse.data);
      setPending(pendingResponse.data);
      setExams(examResponse.length ? examResponse : demoExams);
      setBlueprints(blueprintResponse.length ? blueprintResponse : demoBlueprints);
      setBands(gradingBandResponse.length ? gradingBandResponse : demoBands);
      setSelectedExamId((current) => current || (examResponse[0]?.id ?? fallbackExamId));
      setSelectedBlueprintId((current) => current || blueprintResponse[0]?.id || demoBlueprints[0]?.id || '');

      const marksResponse = await apiFetch<MarkEntryRecord[]>('/marks');
      setMarks(marksResponse.length ? marksResponse : demoMarks);
    } catch (reason) {
      const error = reason as ApiError | Error;
      const message =
        error instanceof Error && (error.message.includes('401') || error.message.includes('Sign in'))
          ? error.message
          : 'Sign in to view examination data.';
      setFormError(message);
      setExams(demoExams);
      setMarks(demoMarks);
      setBlueprints(demoBlueprints);
      setBands(demoBands);
      setSelectedExamId((current) => current || fallbackExamId);
      setSelectedBlueprintId((current) => current || demoBlueprints[0]?.id || '');
    }
  };

  useEffect(() => {
    void loadData();
  }, [reloadCount]);

  useEffect(() => {
    void loadBlueprintComponents(selectedBlueprintId);
  }, [selectedBlueprintId, reloadCount]);

  async function createExam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setSuccess(null);
    setActionError(null);

    const form = new FormData(event.currentTarget);
    const payload: CreateExamPayload = {
      academicYearId: String(form.get('academicYearId') ?? 'year-demo'),
      name: String(form.get('name') ?? '').trim(),
      startDate: String(form.get('startDate') ?? ''),
      endDate: String(form.get('endDate') ?? ''),
      resultPublishDate: String(form.get('resultPublishDate') ?? '').trim() || undefined,
    };

    try {
      const created = await apiFetch<ExamRecord>('/exams', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setExams((current) => [created, ...current]);
      setSelectedExamId(created.id);
      setSuccess(`Exam "${created.name}" created.`);
      event.currentTarget.reset();
      setReloadCount((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Unable to create the exam.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function createBlueprint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    setSuccess(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      curriculumVersionId: String(form.get('curriculumVersionId') ?? 'curriculum-demo'),
      name: String(form.get('blueprintName') ?? '').trim(),
      subjectId: String(form.get('subjectId') ?? '').trim() || undefined,
      totalMarks: Number(form.get('totalMarks') ?? 0),
    };

    try {
      const created = await apiFetch<BlueprintRecord>('/blueprints', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setBlueprints((current) => [created, ...current]);
      setSelectedBlueprintId(created.id);
      setSuccess(`Blueprint "${created.name}" created.`);
      event.currentTarget.reset();
      setReloadCount((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Unable to create assessment blueprint.');
    }
  }

  async function createBlueprintComponent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedBlueprintId) {
      setActionError('Select a blueprint first.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('componentName') ?? '').trim(),
      maxMarks: Number(form.get('maxMarks') ?? 0),
      orderIndex: Number(form.get('orderIndex') ?? 0),
    };

    try {
      const created = await apiFetch<BlueprintComponentRecord>(`/blueprints/${selectedBlueprintId}/components`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setComponents((current) => [created, ...current]);
      setSuccess(`Component "${created.name}" added to the blueprint.`);
      event.currentTarget.reset();
      setReloadCount((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Unable to add assessment component.');
    }
  }

  async function createGradeBand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    setSuccess(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      grade: String(form.get('grade') ?? '').trim(),
      minPercent: Number(form.get('minPercent') ?? 0),
      maxPercent: Number(form.get('maxPercent') ?? 0),
      gpa: Number(form.get('gpa') ?? 0),
    };

    try {
      const created = await apiFetch<GradingBandRecord>('/grading-bands', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setBands((current) => [created, ...current]);
      setSuccess(`Grade band "${created.grade}" saved.`);
      event.currentTarget.reset();
      setReloadCount((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Unable to save the grade band.');
    }
  }

  async function submitCalculation() {
    if (!selectedExamId) {
      setActionError('Select an exam before calculating results.');
      return;
    }

    setIsCalculating(true);
    setActionError(null);
    setSuccess(null);

    try {
      await apiFetch<{ updated: number; status: string }>('/results/calculate', {
        method: 'POST',
        body: JSON.stringify({ examId: selectedExamId }),
      });
      setSuccess('Results were calculated for the selected exam.');
      setReloadCount((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Unable to calculate results.');
    } finally {
      setIsCalculating(false);
    }
  }

  async function submitPublication() {
    if (!selectedExamId) {
      setActionError('Select an exam before publishing results.');
      return;
    }

    setIsPublishing(true);
    setActionError(null);
    setSuccess(null);

    try {
      await apiFetch<{ updated: number; status: string }>('/results/publish', {
        method: 'POST',
        body: JSON.stringify({ examId: selectedExamId }),
      });
      setSuccess('Results were published for the selected exam.');
      setReloadCount((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Unable to publish results.');
    } finally {
      setIsPublishing(false);
    }
  }

  const pendingMarkTotal = marks.filter((mark) => mark.status !== 'published' && mark.status !== 'approved').length;
  const activeExamCount = exams.length;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <p className="admin-brand">SchoolOS</p>
        <p className="admin-caption">Administration</p>
        <nav aria-label="Primary navigation">
          <a className="admin-nav-item" href="/">
            Dashboard
          </a>
          <a className="admin-nav-item" href="/students">
            Students
          </a>
          <a className="admin-nav-item" href="/teachers">
            Teachers
          </a>
          <a className="admin-nav-item" href="/academics">
            Academics
          </a>
          <a className="admin-nav-item active" href="/examinations">
            Examinations
          </a>
          <a className="admin-nav-item" href="/marksheets">
            Marksheets
          </a>
        </nav>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-caption">Assessment workflow</p>
            <h1>Examinations</h1>
          </div>
          <a className="admin-health" href="/ai-imports">
            Review AI imports
          </a>
        </header>

        <section className="admin-grid">
          {[
            ['Total exams', activeExamCount.toLocaleString(), 'Scheduled and active'],
            ['Pending marks', (pending?.pendingMarks ?? pendingMarkTotal).toLocaleString(), 'Awaiting entry'],
            ['Academic year', summary?.academicYear ?? 'Not set', 'Current cycle'],
          ].map(([label, value, detail]) => (
            <article className="admin-card" key={label}>
              <p className="admin-caption">{label}</p>
              <strong>{value}</strong>
              <span>{detail}</span>
            </article>
          ))}
        </section>

        <section className="admin-grid dashboard-lower-grid">
          <article className="admin-card">
            <p className="admin-caption">Upcoming and active exams</p>
            {formError ? <p className="login-error">{formError}</p> : null}
            <ul className="dashboard-list">
              {exams.map((exam) => (
                <li key={exam.id}>
                  <strong>{exam.name}</strong>
                  <span>{exam.status}</span>
                  <small>
                    {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                  </small>
                </li>
              ))}
            </ul>
          </article>

          <article className="admin-card">
            <p className="admin-caption">Exam actions</p>
            <div style={{ display: 'grid', gap: 12 }}>
              <label>
                Exam
                <select value={selectedExamId} onChange={(event) => setSelectedExamId(event.target.value)}>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                </select>
              </label>
              <button className="admin-health" type="button" onClick={() => void submitCalculation()} disabled={isCalculating}>
                {isCalculating ? 'Calculating...' : 'Calculate results'}
              </button>
              <button className="admin-health" type="button" onClick={() => void submitPublication()} disabled={isPublishing}>
                {isPublishing ? 'Publishing...' : 'Publish results'}
              </button>
            </div>
            {actionError ? <p className="login-error" style={{ marginTop: 12 }}>{actionError}</p> : null}
            {success ? <p className="admin-muted" style={{ marginTop: 12 }}>{success}</p> : null}
          </article>
        </section>

        <section className="admin-card" style={{ marginTop: 18 }}>
          <p className="admin-caption">Create exam</p>
          <form className="academic-form" onSubmit={createExam}>
            <label>
              Academic year ID
              <input name="academicYearId" defaultValue="year-demo" />
            </label>
            <label>
              Exam name
              <input name="name" required placeholder="Finals - English" />
            </label>
            <label>
              Start date
              <input name="startDate" type="date" required />
            </label>
            <label>
              End date
              <input name="endDate" type="date" required />
            </label>
            <label>
              Result publish date
              <input name="resultPublishDate" type="date" />
            </label>
            <button className="admin-health academic-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create exam'}
            </button>
          </form>
        </section>

        <section className="admin-card" style={{ marginTop: 18 }}>
          <p className="admin-caption">Assessment blueprints</p>
          <div style={{ display: 'grid', gap: 16 }}>
            <form className="academic-form" onSubmit={createBlueprint}>
              <label>
                Curriculum version ID
                <input name="curriculumVersionId" defaultValue="curriculum-demo" />
              </label>
              <label>
                Blueprint name
                <input name="blueprintName" placeholder="Science Midterm" required />
              </label>
              <label>
                Subject ID (optional)
                <input name="subjectId" placeholder="subject-science" />
              </label>
              <label>
                Total marks
                <input name="totalMarks" type="number" min={1} defaultValue={100} required />
              </label>
              <button className="admin-health academic-submit" type="submit">
                Create blueprint
              </button>
            </form>

            <div style={{ display: 'grid', gap: 12 }}>
              <label>
                Select blueprint
                <select
                  value={selectedBlueprintId}
                  onChange={(event) => setSelectedBlueprintId(event.target.value)}
                >
                  {blueprints.map((blueprint) => (
                    <option key={blueprint.id} value={blueprint.id}>
                      {blueprint.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="student-table-wrap">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Blueprint</th>
                      <th>Subject</th>
                      <th>Total marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blueprints.map((blueprint) => (
                      <tr key={blueprint.id}>
                        <td>{blueprint.name}</td>
                        <td>{blueprint.subject?.name ?? 'General'}</td>
                        <td>{blueprint.totalMarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <form className="academic-form" onSubmit={createBlueprintComponent}>
              <label>
                Component name
                <input name="componentName" placeholder="Quiz" required />
              </label>
              <label>
                Max marks
                <input name="maxMarks" type="number" min={1} defaultValue={20} required />
              </label>
              <label>
                Order index
                <input name="orderIndex" type="number" min={0} defaultValue={1} required />
              </label>
              <button className="admin-health academic-submit" type="submit">
                Add component
              </button>
            </form>

            <div className="student-table-wrap">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Max marks</th>
                    <th>Order</th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((component) => (
                    <tr key={component.id}>
                      <td>{component.name}</td>
                      <td>{component.maxMarks}</td>
                      <td>{component.orderIndex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="admin-card" style={{ marginTop: 18 }}>
          <p className="admin-caption">Grading bands</p>
          <form className="academic-form" onSubmit={createGradeBand}>
            <label>
              Grade
              <input name="grade" placeholder="A" required />
            </label>
            <label>
              Minimum %
              <input name="minPercent" type="number" min={0} max={100} defaultValue={80} required />
            </label>
            <label>
              Maximum %
              <input name="maxPercent" type="number" min={0} max={100} defaultValue={100} required />
            </label>
            <label>
              GPA
              <input name="gpa" type="number" min={0} max={4} step="0.1" defaultValue={4} required />
            </label>
            <button className="admin-health academic-submit" type="submit">
              Save grade band
            </button>
          </form>

          <div className="student-table-wrap" style={{ marginTop: 12 }}>
            <table className="student-table">
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Min %</th>
                  <th>Max %</th>
                  <th>GPA</th>
                </tr>
              </thead>
              <tbody>
                {bands.map((band) => (
                  <tr key={band.id}>
                    <td>{band.grade}</td>
                    <td>{band.minPercent}</td>
                    <td>{band.maxPercent}</td>
                    <td>{band.gpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-card" style={{ marginTop: 18 }}>
          <p className="admin-caption">Mark review queue</p>
          <div className="student-table-wrap">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Mark</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((mark) => (
                  <tr key={mark.id}>
                    <td>{mark.studentId}</td>
                    <td>{exams.find((exam) => exam.id === mark.examId)?.name ?? mark.examId}</td>
                    <td>{mark.markValue === null ? '—' : `${mark.markValue}`}</td>
                    <td>
                      <span className="student-status">{mark.status}</span>
                    </td>
                    <td>{new Date(mark.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
