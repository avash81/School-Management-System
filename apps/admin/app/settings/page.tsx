'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api-client';

type SchoolSettings = {
  timeZone: string;
  language: string;
  dateFormat: string;
  currency: string | null;
};

type SettingsResponse = { data: SchoolSettings };

export default function SettingsPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setSettings(null);
    setLoadError(null);

    apiFetch<SettingsResponse>('/schools/me/settings')
      .then((response) => {
        if (active) setSettings(response.data);
      })
      .catch((reason: unknown) => {
        if (active) {
          setLoadError(
            reason instanceof Error ? reason.message : 'Unable to load school settings.',
          );
        }
      });

    return () => {
      active = false;
    };
  }, [retry]);

  async function updateSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setSuccess(null);

    const form = new FormData(event.currentTarget);
    const currency = String(form.get('currency') ?? '').trim();
    const payload = {
      timeZone: String(form.get('timeZone') ?? '').trim(),
      language: String(form.get('language') ?? 'en'),
      dateFormat: String(form.get('dateFormat') ?? '').trim(),
      currency: currency || null,
    };

    try {
      const response = await apiFetch<SettingsResponse>('/schools/me/settings', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setSettings(response.data);
      setSuccess('School settings saved.');
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Unable to save school settings.');
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
          <a className="admin-nav-item active" href="/settings" aria-current="page">
            School settings
          </a>
        </nav>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-caption">School configuration</p>
            <h1>School settings</h1>
          </div>
          <a className="admin-health" href="/setup">
            Setup checklist
          </a>
        </header>

        <section className="admin-card academic-form-card" aria-labelledby="settings-title">
          <h2 id="settings-title">Regional preferences</h2>
          <p className="admin-muted">
            These settings apply to new presentation and entry workflows. Previously published
            results are not changed.
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

          {!settings && !loadError ? (
            <p className="admin-muted" role="status">
              Loading school settings...
            </p>
          ) : null}

          {settings ? (
            <form
              className="academic-form"
              key={`${settings.timeZone}:${settings.language}:${settings.dateFormat}:${settings.currency ?? ''}`}
              onSubmit={updateSettings}
            >
              <label>
                Time zone
                <input
                  name="timeZone"
                  type="text"
                  defaultValue={settings.timeZone}
                  required
                  maxLength={100}
                />
              </label>
              <label>
                Language
                <select name="language" defaultValue={settings.language} required>
                  <option value="en">English</option>
                  <option value="ne">Nepali</option>
                </select>
              </label>
              <label>
                Date format
                <input
                  name="dateFormat"
                  type="text"
                  defaultValue={settings.dateFormat}
                  required
                  maxLength={40}
                />
              </label>
              <label>
                Currency code
                <input
                  name="currency"
                  type="text"
                  defaultValue={settings.currency ?? ''}
                  maxLength={3}
                  pattern="[A-Za-z]{3}"
                  title="Enter a supported three-letter currency code."
                />
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
                {pending ? 'Saving...' : 'Save settings'}
              </button>
            </form>
          ) : null}
        </section>
      </section>
    </main>
  );
}
