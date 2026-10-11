'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api-client';

type SchoolProfile = {
  id: string;
  name: string;
  shortName: string | null;
  registrationNo: string | null;
  schoolType: string | null;
  establishedYear: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  status: string;
};

type SchoolResponse = { data: SchoolProfile };

export default function SchoolProfilePage() {
  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setSchool(null);
    setLoadError(null);

    apiFetch<SchoolResponse>('/schools/me')
      .then((response) => {
        if (active) setSchool(response.data);
      })
      .catch((reason: unknown) => {
        if (active) {
          setLoadError(
            reason instanceof Error ? reason.message : 'Unable to load school profile.',
          );
        }
      });

    return () => {
      active = false;
    };
  }, [retry]);

  async function updateSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setSuccess(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') ?? '').trim(),
      shortName: String(form.get('shortName') ?? '').trim() || null,
      registrationNo: String(form.get('registrationNo') ?? '').trim() || null,
      schoolType: String(form.get('schoolType') ?? '').trim() || null,
      establishedYear:
        String(form.get('establishedYear') ?? '').trim() === ''
          ? null
          : Number(form.get('establishedYear')),
      phone: String(form.get('phone') ?? '').trim() || null,
      email: String(form.get('email') ?? '').trim() || null,
      website: String(form.get('website') ?? '').trim() || null,
      address: String(form.get('address') ?? '').trim() || null,
    };

    try {
      const response = await apiFetch<SchoolResponse>('/schools/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setSchool(response.data);
      setSuccess('School profile updated.');
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Unable to save school profile.');
    } finally {
      setPending(false);
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
          <a className="admin-nav-item" href="/setup">
            Setup checklist
          </a>
          <a className="admin-nav-item active" href="/school" aria-current="page">
            School profile
          </a>
          <a className="admin-nav-item" href="/settings">
            School settings
          </a>
        </nav>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-caption">School identity</p>
            <h1>School profile</h1>
          </div>
          <a className="admin-health" href="/setup">
            Setup checklist
          </a>
        </header>

        <section className="admin-card academic-form-card" aria-labelledby="profile-title">
          <h2 id="profile-title">Institution details</h2>
          <p className="admin-muted">
            Keep the official profile accurate for reports, notices, and document generation.
          </p>

          {loadError ? (
            <div className="setup-error" role="alert">
              <p>{loadError}</p>
              <button
                className="setup-retry"
                type="button"
                onClick={() => setRetry((value) => value + 1)}
              >
                Try again
              </button>
            </div>
          ) : null}

          {!school && !loadError ? (
            <p className="admin-muted" role="status">
              Loading school profile...
            </p>
          ) : null}

          {school ? (
            <form className="academic-form" onSubmit={updateSchool}>
              <label>
                School name
                <input name="name" type="text" defaultValue={school.name} required />
              </label>
              <label>
                Short name
                <input name="shortName" type="text" defaultValue={school.shortName ?? ''} />
              </label>
              <label>
                Registration number
                <input
                  name="registrationNo"
                  type="text"
                  defaultValue={school.registrationNo ?? ''}
                />
              </label>
              <label>
                School type
                <input name="schoolType" type="text" defaultValue={school.schoolType ?? ''} />
              </label>
              <label>
                Established year
                <input
                  name="establishedYear"
                  type="number"
                  min={1800}
                  max={2100}
                  defaultValue={school.establishedYear ?? ''}
                />
              </label>
              <label>
                Phone
                <input name="phone" type="tel" defaultValue={school.phone ?? ''} />
              </label>
              <label>
                Email
                <input name="email" type="email" defaultValue={school.email ?? ''} />
              </label>
              <label>
                Website
                <input name="website" type="url" defaultValue={school.website ?? ''} />
              </label>
              <label>
                Address
                <textarea name="address" rows={4} defaultValue={school.address ?? ''} />
              </label>

              {formError ? (
                <p className="login-error" role="alert">
                  {formError}
                </p>
              ) : null}
              {success ? (
                <p className="academic-success" role="status">
                  {success}
                </p>
              ) : null}

              <button className="admin-health academic-submit" type="submit" disabled={pending}>
                {pending ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          ) : null}
        </section>
      </section>
    </main>
  );
}
