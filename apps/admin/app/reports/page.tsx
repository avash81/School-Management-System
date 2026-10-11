'use client';

import { useEffect, useState } from 'react';

import { type ApiError, apiFetchAll } from '../../lib/api-client';

type StudentReportRow = {
  id: string;
  admissionNo: string;
  academicId: string;
  firstName: string;
  lastName: string;
  status: string;
  gender: string | null;
  createdAt: string;
};

type StudentsReportResponse = {
  data: StudentReportRow[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

type ResultStatRow = {
  passStatus: string;
  grade: string | null;
  _count: { _all: number };
  _avg: { percentage: number | null };
};

type ExamReportRow = {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
};

export default function ReportsPage() {
  const [students, setStudents] = useState<StudentReportRow[]>([]);
  const [results, setResults] = useState<ResultStatRow[]>([]);
  const [exams, setExams] = useState<ExamReportRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetchAll<[StudentsReportResponse, ResultStatRow[], ExamReportRow[]]>([
      ['/reports/students?limit=10'],
      ['/reports/results?limit=10'],
      ['/reports/examinations'],
    ])
      .then(([studentsResponse, resultResponse, examResponse]) => {
        setStudents(studentsResponse.data);
        setResults(resultResponse);
        setExams(examResponse);
      })
      .catch((reason: ApiError | Error) => {
        setError(
          reason.message.includes('401') || reason.message.includes('Sign in')
            ? reason.message
            : 'Sign in to load reports.',
        );

        setStudents([
          {
            id: 'demo-student-1',
            admissionNo: 'ADM-1001',
            academicId: 'AC-101',
            firstName: 'Demo',
            lastName: 'Student',
            status: 'active',
            gender: 'female',
            createdAt: '2026-10-01T00:00:00.000Z',
          },
        ]);
        setResults([
          {
            passStatus: 'pass',
            grade: 'A',
            _count: { _all: 22 },
            _avg: { percentage: 83 },
          },
        ]);
        setExams([
          {
            id: 'demo-exam-1',
            name: 'Demo exam report',
            status: 'scheduled',
            startDate: '2026-10-12T00:00:00.000Z',
            endDate: '2026-10-13T00:00:00.000Z',
          },
        ]);
      });
  }, []);

  const passRate = results.length
    ? Math.round(
        results.reduce((sum, item) => sum + ((item._avg.percentage ?? 0) * item._count._all) / Math.max(1, item._count._all), 0) /
          results.length,
      )
    : 0;

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
          <a className="admin-nav-item" href="/marksheets">
            Marksheets
          </a>
          <a className="admin-nav-item active" href="/reports">
            Reports
          </a>
        </nav>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-caption">Analytics</p>
            <h1>Reports</h1>
          </div>
          <a className="admin-health" href="/">
            Back to dashboard
          </a>
        </header>

        <section className="admin-grid">
          {[
            ['Student records', students.length.toLocaleString(), 'Latest loaded entries'],
            ['Pass rate', `${passRate}%`, 'Overall result trend'],
            ['Exams tracked', exams.length.toLocaleString(), 'Current academic cycle'],
          ].map(([label, value, detail]) => (
            <article className="admin-card" key={label}>
              <p className="admin-caption">{label}</p>
              <strong>{value}</strong>
              <span>{detail}</span>
            </article>
          ))}
        </section>

        {error ? <p className="login-error" style={{ marginBottom: 16 }}>{error}</p> : null}

        <section className="admin-grid dashboard-lower-grid">
          <article className="admin-card">
            <p className="admin-caption">Student snapshot</p>
            <div className="student-table-wrap">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Admission</th>
                    <th>Academic ID</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        {student.firstName} {student.lastName}
                      </td>
                      <td>{student.admissionNo}</td>
                      <td>{student.academicId}</td>
                      <td>
                        <span className="student-status">{student.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="admin-card">
            <p className="admin-caption">Result summary</p>
            <ul className="dashboard-list">
              {results.length ? (
                results.map((item, index) => (
                  <li key={`${item.passStatus}-${item.grade ?? 'unknown'}-${index}`}>
                    <strong>{item.passStatus}</strong>
                    <span>{item.grade ?? 'No grade'}</span>
                    <small>
                      {item._count._all} results · avg {Math.round(item._avg.percentage ?? 0)}%
                    </small>
                  </li>
                ))
              ) : (
                <li>No result summary available.</li>
              )}
            </ul>
          </article>
        </section>

        <section className="admin-card" style={{ marginTop: 18 }}>
          <p className="admin-caption">Exam schedule</p>
          <div className="student-table-wrap">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Status</th>
                  <th>Start</th>
                  <th>End</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id}>
                    <td>{exam.name}</td>
                    <td>{exam.status}</td>
                    <td>{new Date(exam.startDate).toLocaleDateString()}</td>
                    <td>{new Date(exam.endDate).toLocaleDateString()}</td>
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
