'use client';

import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api-client';

type SchoolTeacher = {
  id: string;
  employeeId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string | null;
  designation: string | null;
  joiningDate: string | null;
  status: string;
};

type SchoolTeacherCreate = {
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  designation?: string;
  joiningDate?: string;
};

type AcademicYearOption = Pick<SchoolTeacher, 'id'> & {
  name: string;
};

type ClassOption = {
  id: string;
  name: string;
};

type SectionOption = {
  id: string;
  classId: string;
  name: string;
};

type SubjectOption = {
  id: string;
  name: string;
  code: string;
};

type TeacherAssignment = {
  id: string;
  teacherId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacher: SchoolTeacher | null;
  academicYear: AcademicYearOption | null;
  class: ClassOption | null;
  section: SectionOption | null;
  subject: SubjectOption | null;
};

type AssignmentFormOptions = {
  academicYears: AcademicYearOption[];
  classes: ClassOption[];
  sections: SectionOption[];
  subjects: SubjectOption[];
};

type TeacherAssignmentCreate = Pick<
  TeacherAssignment,
  'teacherId' | 'academicYearId' | 'classId' | 'sectionId' | 'subjectId'
>;

function teacherName(teacher: SchoolTeacher) {
  return [teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(' ');
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<SchoolTeacher[] | null>(null);
  const [assignments, setAssignments] = useState<TeacherAssignment[] | null>(null);
  const [assignmentOptions, setAssignmentOptions] = useState<AssignmentFormOptions | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [assignmentLoadError, setAssignmentLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [assignmentFormError, setAssignmentFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [assignmentPending, setAssignmentPending] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [reload, setReload] = useState(0);
  const [assignmentReload, setAssignmentReload] = useState(0);

  const loadTeachers = useCallback(async () => {
    setTeachers(null);
    setLoadError(null);
    try {
      setTeachers(await apiFetch<SchoolTeacher[]>('/teachers'));
    } catch (reason) {
      setLoadError(reason instanceof Error ? reason.message : 'Unable to load teachers.');
    }
  }, []);

  useEffect(() => {
    void loadTeachers();
  }, [loadTeachers, reload]);

  const loadAssignmentData = useCallback(async () => {
    setAssignments(null);
    setAssignmentOptions(null);
    setAssignmentLoadError(null);
    try {
      const [assignmentRows, academicYears, classes, sections, subjects] = await Promise.all([
        apiFetch<TeacherAssignment[]>('/teachers/assignments'),
        apiFetch<AcademicYearOption[]>('/academic-years'),
        apiFetch<ClassOption[]>('/classes'),
        apiFetch<SectionOption[]>('/sections'),
        apiFetch<SubjectOption[]>('/subjects'),
      ]);
      setAssignments(assignmentRows);
      setAssignmentOptions({ academicYears, classes, sections, subjects });
    } catch (reason) {
      setAssignmentLoadError(
        reason instanceof Error ? reason.message : 'Unable to load assignment data.',
      );
    }
  }, []);

  useEffect(() => {
    void loadAssignmentData();
  }, [loadAssignmentData, assignmentReload]);

  async function createTeacher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setSuccess(null);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const middleName = String(form.get('middleName') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();
    const designation = String(form.get('designation') ?? '').trim();
    const joiningDate = String(form.get('joiningDate') ?? '');
    const payload: SchoolTeacherCreate = {
      employeeId: String(form.get('employeeId') ?? '').trim(),
      firstName: String(form.get('firstName') ?? '').trim(),
      lastName: String(form.get('lastName') ?? '').trim(),
      ...(middleName ? { middleName } : {}),
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
      ...(designation ? { designation } : {}),
      ...(joiningDate ? { joiningDate } : {}),
    };

    try {
      await apiFetch<SchoolTeacher>('/teachers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      formElement.reset();
      setSuccess(`Teacher "${payload.firstName} ${payload.lastName}" created.`);
      setReload((value) => value + 1);
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Unable to create teacher.');
    } finally {
      setPending(false);
    }
  }

  async function createAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAssignmentPending(true);
    setAssignmentFormError(null);
    setAssignmentSuccess(null);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload: TeacherAssignmentCreate = {
      teacherId: String(form.get('teacherId') ?? ''),
      academicYearId: String(form.get('academicYearId') ?? ''),
      classId: String(form.get('classId') ?? ''),
      sectionId: String(form.get('sectionId') ?? ''),
      subjectId: String(form.get('subjectId') ?? ''),
    };

    try {
      await apiFetch<TeacherAssignment>('/teachers/assignments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      formElement.reset();
      setSelectedClassId('');
      setAssignmentSuccess('Teacher assignment created.');
      setAssignmentReload((value) => value + 1);
    } catch (reason) {
      setAssignmentFormError(
        reason instanceof Error ? reason.message : 'Unable to create teacher assignment.',
      );
    } finally {
      setAssignmentPending(false);
    }
  }

  const sectionsForClass =
    assignmentOptions?.sections.filter((section) => section.classId === selectedClassId) ?? [];

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
            Settings
          </a>
        </nav>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-caption">School staff</p>
            <h1>Teachers</h1>
          </div>
          <a className="admin-health" href="/academics">
            Academic setup
          </a>
        </header>

        <section className="admin-card academic-form-card" aria-labelledby="create-teacher-title">
          <h2 id="create-teacher-title">Add a teacher</h2>
          <p className="admin-muted">
            Create a school-scoped staff record, then use the assignment form below to grant class,
            section, and subject responsibility.
          </p>
          <form className="academic-form" onSubmit={createTeacher}>
            <label>
              Employee ID
              <input name="employeeId" maxLength={100} required />
            </label>
            <label>
              First name
              <input name="firstName" maxLength={120} required />
            </label>
            <label>
              Middle name (optional)
              <input name="middleName" maxLength={120} />
            </label>
            <label>
              Last name
              <input name="lastName" maxLength={120} required />
            </label>
            <label>
              Email (optional)
              <input name="email" type="email" maxLength={320} />
            </label>
            <label>
              Phone (optional)
              <input name="phone" type="tel" maxLength={40} />
            </label>
            <label>
              Designation (optional)
              <input name="designation" maxLength={120} />
            </label>
            <label>
              Joining date (optional)
              <input name="joiningDate" type="date" />
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
            <button className="login-button academic-submit" disabled={pending} type="submit">
              {pending ? 'Saving...' : 'Add teacher'}
            </button>
          </form>
        </section>

        <section
          className="admin-card academic-form-card"
          aria-labelledby="create-assignment-title"
        >
          <h2 id="create-assignment-title">Assign a teacher</h2>
          <p className="admin-muted">
            Assign a teacher to one academic year, class, section, and subject. The API verifies
            that each record belongs to this school and that the section belongs to the selected
            class.
          </p>
          {assignmentLoadError ? (
            <div className="setup-error" role="alert">
              <p>{assignmentLoadError}</p>
              <button
                className="setup-retry"
                type="button"
                onClick={() => setAssignmentReload((value) => value + 1)}
              >
                Retry loading assignment data
              </button>
            </div>
          ) : null}
          {!assignmentOptions && !assignmentLoadError ? (
            <p className="admin-muted" role="status">
              Loading teachers and academic setup...
            </p>
          ) : null}
          {assignmentOptions ? (
            teachers?.length ? (
              assignmentOptions.academicYears.length &&
              assignmentOptions.classes.length &&
              assignmentOptions.sections.length &&
              assignmentOptions.subjects.length ? (
                <form className="academic-form" onSubmit={createAssignment}>
                  <label>
                    Teacher
                    <select name="teacherId" defaultValue="" required>
                      <option value="" disabled>
                        Select a teacher
                      </option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacherName(teacher)} ({teacher.employeeId})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Academic year
                    <select name="academicYearId" defaultValue="" required>
                      <option value="" disabled>
                        Select an academic year
                      </option>
                      {assignmentOptions.academicYears.map((year) => (
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
                      <option value="" disabled>
                        Select a class
                      </option>
                      {assignmentOptions.classes.map((schoolClass) => (
                        <option key={schoolClass.id} value={schoolClass.id}>
                          {schoolClass.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Section
                    <select
                      name="sectionId"
                      key={selectedClassId}
                      defaultValue=""
                      required
                      disabled={!selectedClassId || sectionsForClass.length === 0}
                    >
                      <option value="" disabled>
                        {!selectedClassId
                          ? 'Select a class first'
                          : sectionsForClass.length
                            ? 'Select a section'
                            : 'No sections for this class'}
                      </option>
                      {sectionsForClass.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Subject
                    <select name="subjectId" defaultValue="" required>
                      <option value="" disabled>
                        Select a subject
                      </option>
                      {assignmentOptions.subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </option>
                      ))}
                    </select>
                  </label>
                  {assignmentFormError ? (
                    <p className="login-error" role="alert">
                      {assignmentFormError}
                    </p>
                  ) : null}
                  {assignmentSuccess ? (
                    <p className="academic-success" role="status">
                      {assignmentSuccess}
                    </p>
                  ) : null}
                  <button
                    className="login-button academic-submit"
                    disabled={assignmentPending || !teachers.length}
                    type="submit"
                  >
                    {assignmentPending ? 'Saving...' : 'Assign teacher'}
                  </button>
                </form>
              ) : (
                <p className="admin-muted">
                  Add at least one academic year, class, section, and subject before creating an
                  assignment.
                </p>
              )
            ) : (
              <p className="admin-muted">Add a teacher before creating an assignment.</p>
            )
          ) : null}
        </section>

        <section
          className="admin-card academic-years-card"
          aria-labelledby="teacher-assignment-list-title"
        >
          <h2 id="teacher-assignment-list-title">Teacher assignments</h2>
          {assignmentLoadError ? (
            <p className="admin-muted">
              Assignment records are unavailable until assignment data loads successfully.
            </p>
          ) : null}
          {assignments ? (
            assignments.length ? (
              <div className="student-table-wrap">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th scope="col">Teacher</th>
                      <th scope="col">Academic year</th>
                      <th scope="col">Class</th>
                      <th scope="col">Section</th>
                      <th scope="col">Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td>
                          {assignment.teacher ? teacherName(assignment.teacher) : 'Unavailable'}
                        </td>
                        <td>{assignment.academicYear?.name ?? 'Unavailable'}</td>
                        <td>{assignment.class?.name ?? 'Unavailable'}</td>
                        <td>{assignment.section?.name ?? 'Unavailable'}</td>
                        <td>{assignment.subject?.name ?? 'Unavailable'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-muted">No teacher assignments yet.</p>
            )
          ) : null}
        </section>

        <section className="admin-card academic-years-card" aria-labelledby="teacher-list-title">
          <h2 id="teacher-list-title">School teachers</h2>
          {loadError ? (
            <div className="setup-error" role="alert">
              <p>{loadError}</p>
              <button
                className="setup-retry"
                type="button"
                onClick={() => setReload((value) => value + 1)}
              >
                Try again
              </button>
            </div>
          ) : null}
          {!teachers && !loadError ? (
            <p className="admin-muted" role="status">
              Loading teachers...
            </p>
          ) : null}
          {teachers ? (
            teachers.length ? (
              <div className="student-table-wrap">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th scope="col">Employee ID</th>
                      <th scope="col">Teacher</th>
                      <th scope="col">Designation</th>
                      <th scope="col">Email</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher) => (
                      <tr key={teacher.id}>
                        <td>{teacher.employeeId}</td>
                        <td>
                          <a className="student-name" href={`/teachers/${teacher.id}`}>
                            {teacherName(teacher)}
                          </a>
                        </td>
                        <td>{teacher.designation ?? 'Not set'}</td>
                        <td>{teacher.email ?? 'Not set'}</td>
                        <td>
                          <span className="student-status">
                            {teacher.status.replaceAll('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-muted">No teachers yet. Add a teacher above to continue setup.</p>
            )
          ) : null}
        </section>
      </section>
    </main>
  );
}
