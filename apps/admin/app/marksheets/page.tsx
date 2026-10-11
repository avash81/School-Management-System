'use client';

import { type FormEvent, useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api-client';

type MarksheetItem = {
  id: string;
  studentName: string;
  examName: string;
  grade: string;
  generatedAt: string;
  status: 'Ready' | 'Draft' | 'Review';
};

type MarksheetPreviewResponse = {
  data: {
    examName: string;
    studentName: string;
    resultSummary: string;
    status: 'Approved' | 'Needs review';
  };
};

type MarksheetGenerateResponse = {
  data: {
    id: string;
    studentName: string;
    examName: string;
    status: 'Generated';
    generatedAt: string;
  };
};

const seedMarksheets: MarksheetItem[] = [
  {
    id: 'ms-1001',
    studentName: 'Aisha Rahman',
    examName: 'Midterm - Science',
    grade: 'A',
    generatedAt: '2026-10-10T09:30:00.000Z',
    status: 'Ready',
  },
  {
    id: 'ms-1002',
    studentName: 'Kabir Singh',
    examName: 'Unit Test - Mathematics',
    grade: 'B+',
    generatedAt: '2026-10-09T14:25:00.000Z',
    status: 'Review',
  },
  {
    id: 'ms-1003',
    studentName: 'Nadia Begum',
    examName: 'Finals - English',
    grade: 'A+',
    generatedAt: '2026-10-07T11:00:00.000Z',
    status: 'Draft',
  },
];

export default function MarksheetsPage() {
  const [marksheets, setMarksheets] = useState<MarksheetItem[]>(seedMarksheets);
  const [preview, setPreview] = useState<MarksheetPreviewResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, []);

  async function handlePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      examId: String(form.get('examId') ?? '').trim(),
      studentId: String(form.get('studentId') ?? '').trim(),
    };

    try {
      const response = await apiFetch<MarksheetPreviewResponse>('/marksheets/preview', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setPreview(response.data);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Unable to preview the marksheet.',
      );
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    setSuccess(null);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      examId: String(form.get('generateExamId') ?? '').trim(),
      studentId: String(form.get('generateStudentId') ?? '').trim(),
    };

    try {
      const response = await apiFetch<MarksheetGenerateResponse>('/marksheets/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const generated = response.data;
      setMarksheets((current) => [
        {
          id: generated.id,
          studentName: generated.studentName,
          examName: generated.examName,
          grade: 'A',
          generatedAt: generated.generatedAt,
          status: 'Ready',
        },
        ...current,
      ]);
      setSuccess(`Marksheet generated for ${generated.studentName}.`);
      event.currentTarget.reset();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Unable to generate the marksheet.',
      );
    } finally {
      setIsGenerating(false);
    }
  }

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
          <a className="admin-nav-item" href="/examinations">
            Examinations
          </a>
          <a className="admin-nav-item active" href="/marksheets">
            Marksheets
          </a>
        </nav>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-caption">Result documents</p>
            <h1>Marksheets</h1>
          </div>
          <a className="admin-health" href="/">
            Back to dashboard
          </a>
        </header>

        <section className="admin-grid">
          {[
            ['Ready to issue', marksheets.filter((item) => item.status === 'Ready').length.toLocaleString(), 'Approved results'],
            ['Drafts', marksheets.filter((item) => item.status === 'Draft').length.toLocaleString(), 'Not yet locked'],
            ['In review', marksheets.filter((item) => item.status === 'Review').length.toLocaleString(), 'Needs validation'],
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
            <p className="admin-caption">Preview marksheet</p>
            <form onSubmit={handlePreview} className="student-toolbar" style={{ display: 'grid', gap: '16px' }}>
              <label>
                Exam ID
                <input name="examId" placeholder="exam_123" defaultValue="exam_123" />
              </label>
              <label>
                Student ID
                <input name="studentId" placeholder="student_456" defaultValue="student_456" />
              </label>
              <button className="admin-health" type="submit" disabled={loading}>
                {loading ? 'Previewing...' : 'Preview marksheet'}
              </button>
            </form>

            {preview ? (
              <div className="notice-item" style={{ marginTop: 16, display: 'grid', gap: 6 }}>
                <strong>{preview.studentName}</strong>
                <span>{preview.examName}</span>
                <small>{preview.resultSummary}</small>
                <span className="student-status">{preview.status}</span>
              </div>
            ) : null}
          </article>

          <article className="admin-card">
            <p className="admin-caption">Generate marksheet</p>
            <form onSubmit={handleGenerate} className="student-toolbar" style={{ display: 'grid', gap: '16px' }}>
              <label>
                Exam ID
                <input name="generateExamId" placeholder="exam_123" defaultValue="exam_123" />
              </label>
              <label>
                Student ID
                <input name="generateStudentId" placeholder="student_456" defaultValue="student_456" />
              </label>
              <button className="admin-health" type="submit" disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate marksheet'}
              </button>
            </form>

            {error ? <p className="login-error" style={{ marginTop: 16 }}>{error}</p> : null}
            {success ? <p className="admin-muted" style={{ marginTop: 16 }}>{success}</p> : null}
          </article>
        </section>

        <section className="admin-card" style={{ marginTop: 18 }}>
          <p className="admin-caption">Recent marksheets</p>
          <div className="student-table-wrap">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Grade</th>
                  <th>Generated</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {marksheets.map((item) => (
                  <tr key={item.id}>
                    <td>{item.studentName}</td>
                    <td>{item.examName}</td>
                    <td>{item.grade}</td>
                    <td>{new Date(item.generatedAt).toLocaleDateString()}</td>
                    <td>
                      <span className="student-status">{item.status}</span>
                    </td>
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
