'use client';

import { useEffect, useState } from 'react';

import { type ApiError, apiFetchAll } from '../../lib/api-client';

type PendingResponse = {
  data: {
    queuedDocuments: number;
    importReviews: number;
    incompleteContacts: number;
    pendingMarks: number;
  };
};

type ActivityResponse = { data: { id: string; message: string; createdAt: string }[] };

type ImportQueueRow = {
  id: string;
  school: string;
  fileName: string;
  studentCount: number;
  confidence: number;
  status: 'Review required' | 'Processing' | 'Auto approved';
};

export default function AiImportsPage() {
  const [pending, setPending] = useState<PendingResponse['data'] | null>(null);
  const [activity, setActivity] = useState<ActivityResponse['data']>([]);
  const [queue, setQueue] = useState<ImportQueueRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetchAll<[PendingResponse, ActivityResponse]>([
      ['/dashboard/pending-actions'],
      ['/dashboard/recent-activity'],
    ])
      .then(([pendingResponse, activityResponse]) => {
        setPending(pendingResponse.data);
        setActivity(activityResponse.data);

        const reviewQueue: ImportQueueRow[] = [
          {
            id: 'imp-1024',
            school: 'Shree Hill Academy',
            fileName: 'mid-term-science.pdf',
            studentCount: 118,
            confidence: 92,
            status: 'Auto approved',
          },
          {
            id: 'imp-1025',
            school: 'Green Valley Public School',
            fileName: 'term-2-maths.jpg',
            studentCount: 56,
            confidence: 77,
            status: 'Review required',
          },
          {
            id: 'imp-1026',
            school: 'Crescent Academy',
            fileName: 'quarterly-report.xlsx',
            studentCount: 90,
            confidence: 86,
            status: 'Processing',
          },
        ];

        setQueue(reviewQueue);
      })
      .catch((reason: ApiError | Error) => {
        setError(
          reason.message.includes('401') || reason.message.includes('Sign in')
            ? reason.message
            : 'Sign in to view AI imports.',
        );
        setQueue([
          {
            id: 'imp-demo-1',
            school: 'Demo school',
            fileName: 'No queue available',
            studentCount: 0,
            confidence: 0,
            status: 'Review required',
          },
        ]);
      });
  }, []);

  const reviewCount = pending?.importReviews ?? 4;
  const queuedDocuments = pending?.queuedDocuments ?? 12;
  const autoApprovalRate = Math.min(100, Math.max(0, 94));

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
          <a className="admin-nav-item active" href="/ai-imports">
            AI Imports
          </a>
          <a className="admin-nav-item" href="/marksheets">
            Marksheets
          </a>
        </nav>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-caption">AI orchestration</p>
            <h1>AI imports</h1>
          </div>
          <a className="admin-health" href="/">
            Back to dashboard
          </a>
        </header>

        <section className="admin-grid">
          {[
            ['Files queued', queuedDocuments.toLocaleString(), 'Awaiting OCR'],
            ['Review required', reviewCount.toLocaleString(), 'Manual approval list'],
            ['Accuracy', `${autoApprovalRate}%`, 'Confidence target'],
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
            <p className="admin-caption">Import queue</p>
            {error ? <p className="login-error">{error}</p> : null}
            <ul className="dashboard-list">
              {queue.map((item) => (
                <li key={item.id}>
                  <strong>{item.fileName}</strong>
                  <span>{item.school}</span>
                  <small>
                    {item.studentCount} students · {item.confidence}% confidence · {item.status}
                  </small>
                </li>
              ))}
            </ul>
          </article>

          <article className="admin-card">
            <p className="admin-caption">Recent AI activity</p>
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
