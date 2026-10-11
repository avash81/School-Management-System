'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { apiFetch } from '../../../lib/api-client';

type CreatedStudent = {
  id: string;
  academicId: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
};

export default function NewStudentPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      academicId: String(form.get('academicId') ?? '').trim(),
      admissionNo: String(form.get('admissionNo') ?? '').trim(),
      firstName: String(form.get('firstName') ?? '').trim(),
      middleName: String(form.get('middleName') ?? '').trim() || null,
      lastName: String(form.get('lastName') ?? '').trim(),
      preferredName: String(form.get('preferredName') ?? '').trim() || null,
      dateOfBirth: String(form.get('dateOfBirth') ?? '').trim() || null,
      gender: String(form.get('gender') ?? '').trim() || null,
      phone: String(form.get('phone') ?? '').trim() || null,
      email: String(form.get('email') ?? '').trim() || null,
      currentAddress: String(form.get('currentAddress') ?? '').trim() || null,
      permanentAddress: String(form.get('permanentAddress') ?? '').trim() || null,
      admissionDate: String(form.get('admissionDate') ?? '').trim() || null,
      status: String(form.get('status') ?? 'active'),
    };

    try {
      const result = await apiFetch<CreatedStudent>('/students', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      router.push(`/students/${result.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create student record.');
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
          <a className="admin-nav-item active" href="/students" aria-current="page">
            Students
          </a>
          <a className="admin-nav-item" href="/teachers">
            Teachers
          </a>
          <a className="admin-nav-item" href="/academics">
            Academics
          </a>
        </nav>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-caption">Admission workflow</p>
            <h1>Add a student</h1>
          </div>
          <a className="admin-health" href="/students">
            Back to students
          </a>
        </header>

        <section className="admin-card academic-form-card" aria-labelledby="new-student-title">
          <h2 id="new-student-title">Student profile</h2>
          <p className="admin-muted">
            Add the core student record and identity details. Academic placement can be added once
            the student exists.
          </p>

          <form className="academic-form" onSubmit={createStudent}>
            <label>
              Academic ID
              <input name="academicId" type="text" required maxLength={50} />
            </label>
            <label>
              Admission number
              <input name="admissionNo" type="text" required maxLength={50} />
            </label>
            <label>
              First name
              <input name="firstName" type="text" required maxLength={120} />
            </label>
            <label>
              Middle name
              <input name="middleName" type="text" maxLength={120} />
            </label>
            <label>
              Last name
              <input name="lastName" type="text" required maxLength={120} />
            </label>
            <label>
              Preferred name
              <input name="preferredName" type="text" maxLength={120} />
            </label>
            <label>
              Date of birth
              <input name="dateOfBirth" type="date" />
            </label>
            <label>
              Gender
              <select name="gender" defaultValue="">
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Phone
              <input name="phone" type="tel" maxLength={30} />
            </label>
            <label>
              Email
              <input name="email" type="email" maxLength={160} />
            </label>
            <label>
              Admission date
              <input name="admissionDate" type="date" />
            </label>
            <label>
              Status
              <select name="status" defaultValue="active">
                <option value="active">Active</option>
                <option value="applied">Applied</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label>
              Current address
              <textarea name="currentAddress" rows={3} />
            </label>
            <label>
              Permanent address
              <textarea name="permanentAddress" rows={3} />
            </label>

            {error ? (
              <p className="login-error" role="alert">
                {error}
              </p>
            ) : null}

            <button className="login-button academic-submit" type="submit" disabled={pending}>
              {pending ? 'Creating student...' : 'Create student'}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
