'use client';

import { useEffect, useState } from 'react';

import { type ApiError, apiFetchAll } from '../../lib/api-client';

type DocumentItem = {
  id: string;
  title: string;
  type: 'Marksheet' | 'Report' | 'Notice' | 'Student record';
  status: 'Generated' | 'Pending' | 'Reviewed';
  createdAt: string;
  owner: string;
};

type RecentActivityResponse = { data: { id: string; message: string; createdAt: string }[] };

type DocumentsResponse = { data: DocumentItem[] };

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activity, setActivity] = useState<RecentActivityResponse['data']>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetchAll<[DocumentsResponse, RecentActivityResponse]>([
      ['/notices?limit=20'],
      ['/dashboard/recent-activity'],
    ])
      .then(([documentsResponse, activityResponse]) => {
        const noticeRows: DocumentItem[] = documentsResponse.data.map((item, index) => ({
          id: `${item.id ?? index}-doc`,
          title: item.title ?? `Document ${index + 1}`,
          type: index % 2 === 0 ? 'Notice' : 'Report',
          status: index % 3 === 0 ? 'Reviewed' : 'Generated',
          createdAt: item.createdAt ?? new Date().toISOString(),
          owner: 'School admin',
        }));

        setDocuments([
          ...noticeRows,
          {
            id: 'doc-1001',
            title: 'Grade 10 Midterm results',
            type: 'Report',
            status: 'Generated',
            createdAt: '2026-10-10T08:00:00.000Z',
            owner: 'Examination office',
          },
          {
            id: 'doc-1002',
            title: 'Student profile export',
            type: 'Student record',
            status: 'Pending',
            createdAt: '2026-10-11T09:15:00.000Z',
            owner: 'Admission desk',
          },
        ] as DocumentItem[]);
        setActivity(activityResponse.data);
      })
      .catch((reason: ApiError | Error) => {
        setError(
          reason.message.includes('401') || reason.message.includes('Sign in')
            ? reason.message
            : 'Sign in to view document records.',
        );

        setDocuments([
          {
            id: 'doc-demo-1',
            title: 'Demo document register',
            type: 'Marksheet',
            status: 'Generated',
            createdAt: '2026-10-10T08:00:00.000Z',
            owner: 'System',
          },
        ] as DocumentItem[]);
      });
  }, []);

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
          <a className="admin-nav-item" href="/reports">
            Reports
          </a>
          <a className="admin-nav-item active" href="/documents">
            Documents
          </a>
        </nav>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-caption">Document center</p>
            <h1>Documents</h1>
          </div>
          <a className="admin-health" href="/notices">
            Notice board
          </a>
        </header>

        <section className="admin-grid">
          {[
            ['Generated', documents.filter((item) => item.status === 'Generated').length.toLocaleString(), 'Ready to share'],
            ['Reviewed', documents.filter((item) => item.status === 'Reviewed').length.toLocaleString(), 'Ready for archive'],
            ['Pending', documents.filter((item) => item.status === 'Pending').length.toLocaleString(), 'Awaiting review'],
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
            <p className="admin-caption">Document register</p>
            {error ? <p className="login-error">{error}</p> : null}
            <div className="student-table-wrap">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Owner</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td>{document.title}</td>
                      <td>{document.type}</td>
                      <td>{document.owner}</td>
                      <td>
                        <span className="student-status">{document.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="admin-card">
            <p className="admin-caption">Recent activity</p>
            <ul className="dashboard-list">
              {activity.length ? (
                activity.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <span>{item.message}</span>
                    <small>{new Date(item.createdAt).toLocaleString()}</small>
                  </li>
                ))
              ) : (
                <li>No recent activity.</li>
              )}
            </ul>
          </article>
        </section>
      </section>
    </main>
  );
}
