'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { apiFetch } from '../../../lib/api-client';

type Student = {
  id: string;
  academicId: string;
  admissionNo: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  preferredName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  currentAddress: string | null;
  status: string;
};

type Enrollment = { id: string; academicYearId: string; classId: string; sectionId: string; rollNumber: string | null; status: string };
type GuardianRelation = { id: string; isPrimary: boolean; guardian?: { name: string; relationship: string; phone: string | null; email: string | null } };
type AcademicYearOption = { id: string; name: string };
type ClassOption = { id: string; name: string };
type SectionOption = { id: string; classId: string; name: string };

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [guardians, setGuardians] = useState<GuardianRelation[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [guardianError, setGuardianError] = useState<string | null>(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState<string | null>(null);
  const [guardianSuccess, setGuardianSuccess] = useState<string | null>(null);
  const [pendingEnrollment, setPendingEnrollment] = useState(false);
  const [pendingGuardian, setPendingGuardian] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;

    params.then(({ id }) => Promise.all([
      apiFetch<Student>(`/students/${id}`),
      apiFetch<Enrollment[]>(`/students/${id}/enrollments`),
      apiFetch<GuardianRelation[]>(`/students/${id}/guardians`),
      apiFetch<AcademicYearOption[]>('/academic-years'),
      apiFetch<ClassOption[]>('/classes'),
      apiFetch<SectionOption[]>('/sections'),
    ]))
      .then(([studentData, enrollmentData, guardianData, yearData, classData, sectionData]) => {
        if (!active) return;
        setStudent(studentData);
        setEnrollments(enrollmentData);
        setGuardians(guardianData);
        setAcademicYears(yearData);
        setClasses(classData);
        setSections(sectionData);
        if (classData[0]) setSelectedClassId(classData[0].id);
      })
      .catch((reason: Error) => {
        if (!active) return;
        setError(reason.message.includes('401') ? 'Sign in to view this student.' : reason.message);
      });

    return () => {
      active = false;
    };
  }, [params, reload]);

  async function createEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!student) return;
    setPendingEnrollment(true);
    setEnrollmentError(null);
    setEnrollmentSuccess(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      academicYearId: String(form.get('academicYearId') ?? '').trim(),
      classId: String(form.get('classId') ?? '').trim(),
      sectionId: String(form.get('sectionId') ?? '').trim(),
      rollNumber: String(form.get('rollNumber') ?? '').trim() || null,
    };

    try {
      await apiFetch(`/students/${student.id}/enrollments`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setEnrollmentSuccess('Enrollment saved.');
      setReload((value) => value + 1);
      event.currentTarget.reset();
      if (classes[0]) setSelectedClassId(classes[0].id);
    } catch (reason) {
      setEnrollmentError(
        reason instanceof Error ? reason.message : 'Unable to create student enrollment.',
      );
    } finally {
      setPendingEnrollment(false);
    }
  }

  async function addGuardian(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!student) return;
    setPendingGuardian(true);
    setGuardianError(null);
    setGuardianSuccess(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('guardianName') ?? '').trim(),
      relationship: String(form.get('relationship') ?? '').trim(),
      phone: String(form.get('guardianPhone') ?? '').trim() || null,
      email: String(form.get('guardianEmail') ?? '').trim() || null,
      occupation: String(form.get('occupation') ?? '').trim() || null,
      address: String(form.get('guardianAddress') ?? '').trim() || null,
      emergencyContact: String(form.get('emergencyContact') ?? '').trim() || null,
      isPrimary: form.get('isPrimary') === 'on',
    };

    try {
      await apiFetch(`/students/${student.id}/guardians`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setGuardianSuccess('Guardian added.');
      setReload((value) => value + 1);
      event.currentTarget.reset();
    } catch (reason) {
      setGuardianError(
        reason instanceof Error ? reason.message : 'Unable to add guardian information.',
      );
    } finally {
      setPendingGuardian(false);
    }
  }

  if (error) return <main className="login-shell"><p className="login-error">{error}</p></main>;
  if (!student) return <main className="login-shell"><p className="admin-muted">Loading student profile...</p></main>;

  const name = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ');
  const availableSections = sections.filter((section) => section.classId === selectedClassId);

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
        <a className="admin-caption" href="/students">Back to students</a>
        <header className="profile-header">
          <div><p className="admin-caption">Student profile</p><h1>{name}</h1><p className="admin-muted">{student.admissionNo} · {student.academicId}</p></div>
          <span className="student-status">{student.status}</span>
        </header>
        <section className="profile-grid">
          <article className="admin-card"><p className="admin-caption">Overview</p><dl className="profile-details"><dt>Date of birth</dt><dd>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not provided'}</dd><dt>Gender</dt><dd>{student.gender ?? 'Not provided'}</dd><dt>Phone</dt><dd>{student.phone ?? 'Not provided'}</dd><dt>Email</dt><dd>{student.email ?? 'Not provided'}</dd><dt>Address</dt><dd>{student.currentAddress ?? 'Not provided'}</dd></dl></article>
          <article className="admin-card"><p className="admin-caption">Guardians</p>{guardians.length ? guardians.map((relation) => <div className="profile-item" key={relation.id}><strong>{relation.guardian?.name}</strong><span>{relation.guardian?.relationship}{relation.isPrimary ? ' · Primary' : ''}</span><small>{relation.guardian?.phone ?? relation.guardian?.email ?? 'No contact provided'}</small></div>) : <p className="admin-muted">No guardians added.</p>}</article>
        </section>
        <section className="admin-card">
          <p className="admin-caption">Academic history</p>
          {enrollments.length ? (
            <div className="student-table-wrap">
              <table className="student-table">
                <thead>
                  <tr><th>Academic year</th><th>Class</th><th>Section</th><th>Roll</th><th>Status</th></tr>
                </thead>
                <tbody>{enrollments.map((enrollment) => <tr key={enrollment.id}><td>{enrollment.academicYearId}</td><td>{enrollment.classId}</td><td>{enrollment.sectionId}</td><td>{enrollment.rollNumber ?? '—'}</td><td>{enrollment.status}</td></tr>)}</tbody>
              </table>
            </div>
          ) : (
            <p className="admin-muted">No enrollments added.</p>
          )}
        </section>

        <section className="admin-card academic-form-card" aria-labelledby="enrollment-title">
          <h2 id="enrollment-title">Add enrollment</h2>
          <form className="academic-form" onSubmit={createEnrollment}>
            <label>
              Academic year
              <select name="academicYearId" defaultValue="" required>
                <option value="" disabled>Select academic year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Class
              <select
                name="classId"
                value={selectedClassId}
                onChange={(event) => setSelectedClassId(event.target.value)}
                required
              >
                <option value="" disabled>Select class</option>
                {classes.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {schoolClass.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Section
              <select name="sectionId" defaultValue="" required>
                <option value="" disabled>Select section</option>
                {availableSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Roll number
              <input name="rollNumber" type="text" maxLength={30} />
            </label>

            {enrollmentError ? <p className="login-error" role="alert">{enrollmentError}</p> : null}
            {enrollmentSuccess ? <p className="academic-success" role="status">{enrollmentSuccess}</p> : null}

            <button className="login-button academic-submit" type="submit" disabled={pendingEnrollment}>
              {pendingEnrollment ? 'Saving...' : 'Save enrollment'}
            </button>
          </form>
        </section>

        <section className="admin-card academic-form-card" aria-labelledby="guardian-title">
          <h2 id="guardian-title">Add guardian</h2>
          <form className="academic-form" onSubmit={addGuardian}>
            <label>
              Guardian name
              <input name="guardianName" type="text" required maxLength={160} />
            </label>
            <label>
              Relationship
              <input name="relationship" type="text" required maxLength={80} />
            </label>
            <label>
              Phone
              <input name="guardianPhone" type="tel" maxLength={30} />
            </label>
            <label>
              Email
              <input name="guardianEmail" type="email" maxLength={160} />
            </label>
            <label>
              Occupation
              <input name="occupation" type="text" maxLength={120} />
            </label>
            <label>
              Emergency contact
              <input name="emergencyContact" type="text" maxLength={80} />
            </label>
            <label>
              Address
              <textarea name="guardianAddress" rows={3} />
            </label>
            <label className="academic-active-option">
              <input name="isPrimary" type="checkbox" />
              Primary guardian
            </label>

            {guardianError ? <p className="login-error" role="alert">{guardianError}</p> : null}
            {guardianSuccess ? <p className="academic-success" role="status">{guardianSuccess}</p> : null}

            <button className="login-button academic-submit" type="submit" disabled={pendingGuardian}>
              {pendingGuardian ? 'Saving...' : 'Add guardian'}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
