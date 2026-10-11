'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api-client';

type Notice = {
  id: string;
  title: string;
  content: string;
  status: string;
  priority: string;
  publishedAt: string | null;
  createdAt: string;
};

type NoticeResponse = { data: Notice[] };

type NoticeCreateResponse = { data: Notice };

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    apiFetch<NoticeResponse>('/notices?limit=50')
      .then((response) => setNotices(response.data))
      .catch((reason: Error) => setError(reason.message.includes('401') ? 'Sign in to view notices.' : reason.message));
  }, [reload]);

  async function createNotice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setCreateError(null);
    setSuccess(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get('title') ?? '').trim(),
      content: String(form.get('content') ?? '').trim(),
      priority: String(form.get('priority') ?? 'normal'),
      status: String(form.get('status') ?? 'draft'),
    };

    try {
      const response = await apiFetch<NoticeCreateResponse>('/notices', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setSuccess(`Notice "${response.data.title}" created.`);
      event.currentTarget.reset();
      setReload((value) => value + 1);
    } catch (reason) {
      setCreateError(reason instanceof Error ? reason.message : 'Unable to create notice.');
    } finally {
      setPending(false);
    }
  }

  async function publishNotice(noticeId: string) {
    try {
      await apiFetch<Notice>(`/notices/${noticeId}/publish`, { method: 'POST' });
      setSuccess('Notice published.');
      setReload((value) => value + 1);
    } catch (reason) {
      setCreateError(reason instanceof Error ? reason.message : 'Unable to publish notice.');
    }
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <p className="admin-brand">SchoolOS</p>
        <p className="admin-caption">Administration</p>
        <nav aria-label="Primary navigation">
          <a className="admin-nav-item" href="/">Dashboard</a>
          <a className="admin-nav-item" href="/students">Students</a>
          <a className="admin-nav-item active" href="/notices">Notices</a>
        </nav>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-caption">Communication</p>
            <h1>Notice board</h1>
          </div>
          <a className="admin-health" href="/">Dashboard</a>
        </header>

        <section className="admin-card" style={{ marginBottom: 18 }}>
          <p className="admin-caption">Create notice</p>
          <form className="academic-form" onSubmit={createNotice}>
            <label>
              Title
              <input name="title" required placeholder="School assembly reminder" />
            </label>
            <label>
              Priority
              <select name="priority" defaultValue="normal">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
            <label>
              Status
              <select name="status" defaultValue="draft">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label>
              Content
              <textarea name="content" required rows={5} placeholder="Message body" />
            </label>
            {createError ? <p className="login-error">{createError}</p> : null}
            {success ? <p className="academic-success">{success}</p> : null}
            <button className="admin-health academic-submit" type="submit" disabled={pending}>
              {pending ? 'Creating...' : 'Create notice'}
            </button>
          </form>
        </section>

        <section className="admin-card notice-list">
          {error ? <p className="login-error">{error}</p> : null}
          {!error && !notices.length ? <p className="admin-muted">No notices published yet.</p> : null}
          {notices.map((notice) => (
            <article className="notice-item" key={notice.id}>
              <div>
                <p className="admin-caption">{notice.priority} · {notice.status}</p>
                <h2>{notice.title}</h2>
                <p>{notice.content}</p>
              </div>
              <div style={{ display: 'grid', gap: 12, justifyItems: 'end' }}>
                <time>{new Date(notice.publishedAt ?? notice.createdAt).toLocaleDateString()}</time>
                {notice.status !== 'published' ? (
                  <button className="admin-health" type="button" onClick={() => void publishNotice(notice.id)}>
                    Publish
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}