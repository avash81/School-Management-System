'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '../../../lib/api-client';

type Teacher = {
  id: string;
  employeeId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string | null;
  phone: string | null;
  designation: string | null;
  joiningDate: string | null;
  status: string;
};

type Assignment = {
  id: string;
  teacherId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  academicYear?: { id: string; name: string } | null;
  class?: { id: string; name: string } | null;
  section?: { id: string; name: string } | null;
  subject?: { id: string; name: string; code: string } | null;
};

type Workload = {
  teacherId: string;
  totalAssignments: number;
};

function teacherName(teacher: Teacher) {
  return [teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(' ');
}

export default function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [workload, setWorkload] = useState<Workload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    params
      .then(({ id }) =>
        Promise.all([
          apiFetch<Teacher>(`/teachers/${id}`),
          apiFetch<Assignment[]>(`/teachers/${id}/assignments`),
          apiFetch<Workload>(`/teachers/${id}/workload`),
        ]),
      )
      .then(([teacherData, assignmentData, workloadData]) => {
        if (!active) return;
        setTeacher(teacherData);
        setAssignments(assignmentData);
        setWorkload(workloadData);
      })
      .catch((reason: Error) => {
        if (!active) return;
        setError(reason.message.includes('401') ? 'Sign in to view this teacher.' : reason.message);
      });

    return () => {
      active = false;
    };
  }, [params]);

  if (error) {
    return (
      <main className="login-shell">
        <p className="login-error">{error}</p>
      </main>
    );
  }

  if (!teacher) {
    return (
      <main className="login-shell">
        <p className="admin-muted">Loading teacher profile...</p>
      </main>
    );
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
          <a className="admin-nav-item" href="/students">
            Students
          </a>
          <a className="admin-nav-item active" href="/teachers" aria-current="page">
            Teachers
          </a>
          <a className="admin-nav-item" href="/academics">
            Academics
          </a>
          <a className="admin-nav-item" href="/setup">
            Setup checklist
          </a>
        </nav>
      </aside>

      <section className="admin-content">
        <a className="admin-caption" href="/teachers">
          Back to teachers
        </a>

        <header className="profile-header">
          <div>
            <p className="admin-caption">Teacher profile</p>
            <h1>{teacherName(teacher)}</h1>
            <p className="admin-muted">
              {teacher.employeeId} · {teacher.designation ?? 'No designation'}
            </p>
          </div>
          <span className="student-status">{teacher.status}</span>
        </header>

        <section className="admin-grid">
          <article className="admin-card">
            <p className="admin-caption">Workload</p>
            <strong>{workload?.totalAssignments ?? 0}</strong>
            <span>assigned classes</span>
          </article>
          <article className="admin-card">
            <p className="admin-caption">Joining date</p>
            <strong>{teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : 'Not set'}</strong>
            <span>Staff record</span>
          </article>
          <article className="admin-card">
            <p className="admin-caption">Contact</p>
            <strong>{teacher.email ?? 'No email'}</strong>
            <span>{teacher.phone ?? 'No phone'}</span>
          </article>
        </section>

        <section className="profile-grid">
          <article className="admin-card">
            <p className="admin-caption">Overview</p>
            <dl className="profile-details">
              <dt>Employee ID</dt>
              <dd>{teacher.employeeId}</dd>
              <dt>Email</dt>
              <dd>{teacher.email ?? 'Not provided'}</dd>
              <dt>Phone</dt>
              <dd>{teacher.phone ?? 'Not provided'}</dd>
              <dt>Designation</dt>
              <dd>{teacher.designation ?? 'Not provided'}</dd>
              <dt>Joining date</dt>
              <dd>{teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : 'Not provided'}</dd>
            </dl>
          </article>

          <article className="admin-card">
            <p className="admin-caption">Assignments</p>
            {assignments.length ? (
              <div className="dashboard-list">
                {assignments.map((assignment) => (
                  <div className="profile-item" key={assignment.id}>
                    <strong>{assignment.academicYear?.name ?? 'Academic year unavailable'}</strong>
                    <span>
                      {assignment.class?.name ?? 'Class unavailable'} ·{' '}
                      {assignment.section?.name ?? 'Section unavailable'}
                    </span>
                    <small>
                      {assignment.subject?.name ?? 'Subject unavailable'} ({assignment.subject?.code ?? '—'})
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-muted">No subject assignments yet.</p>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}
