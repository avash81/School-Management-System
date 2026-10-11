'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api-client';

type Student = {
  id: string;
  academicId: string;
  admissionNo: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
  status: string;
};

type StudentResponse = {
  data: Student[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<StudentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = [`page=${page}`, 'limit=20'];
    if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    if (status) params.push(`status=${encodeURIComponent(status)}`);

    setError(null);
    apiFetch<StudentResponse>(`/students?${params.join('&')}`)
      .then(setResult)
      .catch((reason: Error) => setError(reason.message.includes('401') ? 'Sign in to view students.' : reason.message));
  }, [page, search, status]);

  const totalPages = result?.meta.totalPages ?? 1;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <p className="admin-brand">SchoolOS</p>
        <p className="admin-caption">Administration</p>
        <nav aria-label="Primary navigation">
          <a className="admin-nav-item" href="/">Dashboard</a>
          <a className="admin-nav-item active" href="/students">Students</a>
          <a className="admin-nav-item" href="/marksheets">Marksheets</a>
        </nav>
      </aside>
      <section className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-caption">Student management</p>
            <h1>Students</h1>
          </div>
          <a className="admin-health" href="/students/new">Add student</a>
        </header>

        <section className="admin-card student-toolbar" aria-label="Student filters">
          <label>
            Search
            <input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Name, admission, academic ID, or phone" />
          </label>
          <label>
            Status
            <select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="applied">Applied</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </section>

        <section className="admin-card student-table-card">
          {error ? <p className="login-error">{error}</p> : null}
          {!error && !result ? <p className="admin-muted">Loading students...</p> : null}
          {result ? (
            <>
              <div className="student-table-wrap">
                <table className="student-table">
                  <thead>
                    <tr><th>Name</th><th>Admission</th><th>Academic ID</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {result.data.map((student) => (
                      <tr key={student.id}>
                        <td><a className="student-name" href={`/students/${student.id}`}>{[student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ')}</a></td>
                        <td>{student.admissionNo}</td>
                        <td>{student.academicId}</td>
                        <td><span className="student-status">{student.status}</span></td>
                      </tr>
                    ))}
                    {!result.data.length ? <tr><td colSpan={4}>No students match these filters.</td></tr> : null}
                  </tbody>
                </table>
              </div>
              <footer className="student-pagination">
                <span>Showing {result.meta.total ? (result.meta.page - 1) * result.meta.limit + 1 : 0}–{Math.min(result.meta.page * result.meta.limit, result.meta.total)} of {result.meta.total}</span>
                <div>
                  <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
                  <span>Page {page} of {totalPages}</span>
                  <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
                </div>
              </footer>
            </>
          ) : null}
        </section>
      </section>
    </main>
  );
}
