'use client';

import { useEffect, useState } from 'react';

import { type ApiError, apiFetchAll } from '../lib/api-client';

type DashboardSummary = {
  students: number;
  teachers: number;
  classes: number;
  academicYear: string | null;
  queuedDocuments: number;
};

type SummaryResponse = { data: DashboardSummary };
type PendingResponse = {
  data: {
    queuedDocuments: number;
    importReviews: number;
    incompleteContacts: number;
    pendingMarks: number;
  };
};
type ActivityResponse = { data: { id: string; message: string; createdAt: string }[] };

export default function AdminHomePage() {
  const navigation = [
    'Dashboard',
    'Setup',
    'School profile',
    'Students',
    'Teachers',
    'Academics',
    'Examinations',
    'Marksheets',
    'Reports',
    'Documents',
    'AI Imports',
    'Settings',
  ];
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [pending, setPending] = useState<PendingResponse['data'] | null>(null);
  const [activity, setActivity] = useState<ActivityResponse['data']>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetchAll<[SummaryResponse, PendingResponse, ActivityResponse]>([
      ['/dashboard/summary'],
      ['/dashboard/pending-actions'],
      ['/dashboard/recent-activity'],
    ])
      .then(([summaryResponse, pendingResponse, activityResponse]) => {
        setSummary(summaryResponse.data);
        setPending(pendingResponse.data);
        setActivity(activityResponse.data);
      })
      .catch((reason: ApiError | Error) => {
        setError(
          reason.message.includes('401') || reason.message.includes('Sign in')
            ? reason.message
            : 'Sign in to load live dashboard data.',
        );
      });
  }, []);

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <p className="admin-brand">SchoolOS</p>
        <p className="admin-caption">Administration</p>
        <nav aria-label="Primary navigation">
          {navigation.map((item, index) => (
            <a
              className={index === 0 ? 'admin-nav-item active' : 'admin-nav-item'}
              href={
                item === 'Dashboard'
                  ? '/'
                  : item === 'Setup'
                    ? '/setup'
                    : item === 'School profile'
                      ? '/school'
                      : item === 'Marksheets'
                        ? '/marksheets'
                        : item === 'Students'
                          ? '/students'
                          : item === 'Academics'
                            ? '/academics'
                            : item === 'Teachers'
                              ? '/teachers'
                              : item === 'Settings'
                                ? '/settings'
                                : item === 'Documents'
                                  ? '/documents'
                                  : item === 'Examinations'
                                    ? '/examinations'
                                    : item === 'Reports'
                                      ? '/reports'
                                      : item === 'AI Imports'
                                        ? '/ai-imports'
                                        : '#'
              }
              key={item}
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>
      <section className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-caption">Overview</p>
            <h1>Good morning, Administrator</h1>
          </div>
          <a className="admin-health" href="/notices">
            Notice board
          </a>
        </header>
        <section className="admin-grid">
          {[
            ['Students', summary ? summary.students.toLocaleString() : '—', 'Active records'],
            ['Teachers', summary ? summary.teachers.toLocaleString() : '—', 'Current staff'],
            ['Classes', summary ? summary.classes.toLocaleString() : '—', 'Configured classes'],
          ].map(([label, value, detail]) => (
            <article className="admin-card" key={label}>
              <p className="admin-caption">{label}</p>
              <strong>{value}</strong>
              <span>{detail}</span>
            </article>
          ))}
        </section>
        <section className="admin-card admin-next">
          <p className="admin-caption">School status</p>
          <h2>{summary?.academicYear ?? 'Academic year not configured'}</h2>
          <p>
            {error ??
              `${summary?.queuedDocuments ?? 0} documents currently waiting for generation.`}
          </p>
        </section>
        <section className="admin-grid dashboard-lower-grid">
          <article className="admin-card">
            <p className="admin-caption">Pending actions</p>
            <ul className="dashboard-list">
              <li>{pending?.pendingMarks ?? 0} marks pending review</li>
              <li>{pending?.importReviews ?? 0} imports need review</li>
              <li>{pending?.queuedDocuments ?? 0} documents queued</li>
              <li>{pending?.incompleteContacts ?? 0} students have incomplete contact data</li>
            </ul>
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
