'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api-client';

type SetupStatus = {
  schoolProfile: boolean;
  academicYear: boolean;
  classes: boolean;
  sections: boolean;
  subjects: boolean;
  teachers: boolean;
};

type SetupStatusResponse = { data: SetupStatus };

const steps: Array<{ key: keyof SetupStatus; label: string; href?: string }> = [
  { key: 'schoolProfile', label: 'School profile', href: '/school' },
  { key: 'academicYear', label: 'Academic years', href: '/academics' },
  { key: 'classes', label: 'Classes', href: '/academics' },
  { key: 'sections', label: 'Sections', href: '/academics' },
  { key: 'subjects', label: 'Subjects', href: '/academics' },
  { key: 'teachers', label: 'Teachers', href: '/teachers' },
];

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus(null);
    setError(null);

    apiFetch<SetupStatusResponse>('/setup/status')
      .then((response) => {
        if (active) setStatus(response.data);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : 'Unable to load school setup status.',
          );
        }
      });

    return () => {
      active = false;
    };
  }, [retry]);

  const completedSteps = status ? steps.filter(({ key }) => status[key]).length : 0;

  return (
    <main className="setup-shell">
      <section className="setup-card" aria-labelledby="setup-title">
        <p className="admin-caption">SchoolOS onboarding</p>
        <h1 id="setup-title">Set up your school</h1>
        <p className="setup-lede">
          Complete the essentials in any order. Historical academic years remain unchanged.
        </p>

        {error ? (
          <div className="setup-error" role="alert">
            <p>{error}</p>
            <button
              className="setup-retry"
              type="button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        ) : null}

        {!status && !error ? (
          <p className="admin-muted" role="status">
            Loading school setup status...
          </p>
        ) : null}

        {status ? (
          <>
            <p className="setup-progress" role="status">
              {completedSteps} of {steps.length} setup areas complete
            </p>
            <ul className="setup-list" aria-label="School setup progress">
              {steps.map(({ key, label, href }) => {
                const complete = status[key];
                return (
                  <li
                    className={`setup-step ${complete ? 'is-complete' : 'is-incomplete'}`}
                    key={key}
                  >
                    <span className="setup-state">{complete ? 'Complete' : 'Needs setup'}</span>
                    <div>
                      {href ? (
                        <a className="setup-action-link" href={href}>
                          {label}
                        </a>
                      ) : (
                        <strong>{label}</strong>
                      )}
                      {!complete && href ? <small>Open setup</small> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        <div className="admin-header">
          <a className="admin-health" href="/settings">
            Manage school settings
          </a>
          <a className="admin-health" href="/">
            Back to dashboard
          </a>
        </div>
      </section>
    </main>
  );
}
