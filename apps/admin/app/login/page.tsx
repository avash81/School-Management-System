'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { apiFetch } from '../../lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      router.push('/');
    } catch {
      setError('Unable to sign in with those credentials.');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="login-shell">
      <form className="login-card" onSubmit={submit}>
        <p className="admin-brand">SchoolOS</p>
        <p className="admin-caption">Secure administration sign in</p>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
        {error ? <p role="alert" className="login-error">{error}</p> : null}
        <button className="login-button" disabled={pending} type="submit">{pending ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </main>
  );
}
