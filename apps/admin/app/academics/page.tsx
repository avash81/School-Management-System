'use client';

import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api-client';

type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type AcademicYearCreate = {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type SchoolClass = {
  id: string;
  name: string;
  shortName: string | null;
  orderIndex: number;
  minimumAge: number | null;
  maximumAge: number | null;
};

type SchoolClassCreate = {
  name: string;
  shortName?: string;
  orderIndex: number;
  minimumAge?: number;
  maximumAge?: number;
};

type SchoolSection = {
  id: string;
  classId: string;
  name: string;
  capacity: number | null;
};

type SchoolSectionCreate = {
  classId: string;
  name: string;
  capacity?: number;
};

type SchoolSubject = {
  id: string;
  name: string;
  shortName: string | null;
  code: string;
  category: string;
  maximumMarks: number | null;
  credit: number | null;
};

type SchoolSubjectCreate = {
  name: string;
  code: string;
  category: string;
  shortName?: string;
  maximumMarks?: number;
  credit?: number;
};

function displayDate(value: string) {
  return value.slice(0, 10);
}

export default function AcademicsPage() {
  const [years, setYears] = useState<AcademicYear[] | null>(null);
  const [classes, setClasses] = useState<SchoolClass[] | null>(null);
  const [sections, setSections] = useState<SchoolSection[] | null>(null);
  const [subjects, setSubjects] = useState<SchoolSubject[] | null>(null);
  const [yearLoadError, setYearLoadError] = useState<string | null>(null);
  const [classLoadError, setClassLoadError] = useState<string | null>(null);
  const [sectionLoadError, setSectionLoadError] = useState<string | null>(null);
  const [subjectLoadError, setSubjectLoadError] = useState<string | null>(null);
  const [yearFormError, setYearFormError] = useState<string | null>(null);
  const [classFormError, setClassFormError] = useState<string | null>(null);
  const [sectionFormError, setSectionFormError] = useState<string | null>(null);
  const [subjectFormError, setSubjectFormError] = useState<string | null>(null);
  const [yearSuccess, setYearSuccess] = useState<string | null>(null);
  const [classSuccess, setClassSuccess] = useState<string | null>(null);
  const [sectionSuccess, setSectionSuccess] = useState<string | null>(null);
  const [subjectSuccess, setSubjectSuccess] = useState<string | null>(null);
  const [yearPending, setYearPending] = useState(false);
  const [classPending, setClassPending] = useState(false);
  const [sectionPending, setSectionPending] = useState(false);
  const [subjectPending, setSubjectPending] = useState(false);
  const [yearsReload, setYearsReload] = useState(0);
  const [classesReload, setClassesReload] = useState(0);
  const [sectionsReload, setSectionsReload] = useState(0);
  const [subjectsReload, setSubjectsReload] = useState(0);

  const loadYears = useCallback(async () => {
    setYears(null);
    setYearLoadError(null);
    try {
      setYears(await apiFetch<AcademicYear[]>('/academic-years'));
    } catch (reason) {
      setYearLoadError(reason instanceof Error ? reason.message : 'Unable to load academic years.');
    }
  }, []);

  useEffect(() => {
    void loadYears();
  }, [loadYears, yearsReload]);

  const loadClasses = useCallback(async () => {
    setClasses(null);
    setClassLoadError(null);
    try {
      setClasses(await apiFetch<SchoolClass[]>('/classes'));
    } catch (reason) {
      setClassLoadError(reason instanceof Error ? reason.message : 'Unable to load classes.');
    }
  }, []);

  useEffect(() => {
    void loadClasses();
  }, [loadClasses, classesReload]);

  const loadSections = useCallback(async () => {
    setSections(null);
    setSectionLoadError(null);
    try {
      setSections(await apiFetch<SchoolSection[]>('/sections'));
    } catch (reason) {
      setSectionLoadError(reason instanceof Error ? reason.message : 'Unable to load sections.');
    }
  }, []);

  useEffect(() => {
    void loadSections();
  }, [loadSections, sectionsReload]);

  const loadSubjects = useCallback(async () => {
    setSubjects(null);
    setSubjectLoadError(null);
    try {
      setSubjects(await apiFetch<SchoolSubject[]>('/subjects'));
    } catch (reason) {
      setSubjectLoadError(reason instanceof Error ? reason.message : 'Unable to load subjects.');
    }
  }, []);

  useEffect(() => {
    void loadSubjects();
  }, [loadSubjects, subjectsReload]);

  async function createAcademicYear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setYearPending(true);
    setYearFormError(null);
    setYearSuccess(null);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload: AcademicYearCreate = {
      name: String(form.get('name') ?? '').trim(),
      startDate: String(form.get('startDate') ?? ''),
      endDate: String(form.get('endDate') ?? ''),
      isActive: form.get('isActive') === 'on',
    };

    if (payload.startDate >= payload.endDate) {
      setYearFormError('The end date must be after the start date.');
      setYearPending(false);
      return;
    }

    try {
      await apiFetch<AcademicYear>('/academic-years', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      formElement.reset();
      setYearSuccess(
        payload.isActive
          ? 'Academic year created and set as active. The previously active year is now inactive.'
          : 'Academic year created.',
      );
      setYearsReload((value) => value + 1);
    } catch (reason) {
      setYearFormError(
        reason instanceof Error ? reason.message : 'Unable to create academic year.',
      );
    } finally {
      setYearPending(false);
    }
  }

  async function createClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClassPending(true);
    setClassFormError(null);
    setClassSuccess(null);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get('className') ?? '').trim();
    const shortName = String(form.get('shortName') ?? '').trim();
    const orderIndex = Number(form.get('orderIndex'));
    const minimumAgeValue = String(form.get('minimumAge') ?? '');
    const maximumAgeValue = String(form.get('maximumAge') ?? '');
    const minimumAge = minimumAgeValue === '' ? undefined : Number(minimumAgeValue);
    const maximumAge = maximumAgeValue === '' ? undefined : Number(maximumAgeValue);

    if (minimumAge !== undefined && maximumAge !== undefined && minimumAge > maximumAge) {
      setClassFormError('Minimum age must not exceed maximum age.');
      setClassPending(false);
      return;
    }

    const payload: SchoolClassCreate = {
      name,
      orderIndex,
      ...(shortName ? { shortName } : {}),
      ...(minimumAge !== undefined ? { minimumAge } : {}),
      ...(maximumAge !== undefined ? { maximumAge } : {}),
    };

    try {
      await apiFetch<SchoolClass>('/classes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      formElement.reset();
      setClassSuccess(`Class "${name}" created.`);
      setClassesReload((value) => value + 1);
    } catch (reason) {
      setClassFormError(reason instanceof Error ? reason.message : 'Unable to create class.');
    } finally {
      setClassPending(false);
    }
  }

  async function createSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSectionPending(true);
    setSectionFormError(null);
    setSectionSuccess(null);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const classId = String(form.get('sectionClassId') ?? '');
    const name = String(form.get('sectionName') ?? '').trim();
    const capacityValue = String(form.get('capacity') ?? '');
    const capacity = capacityValue === '' ? undefined : Number(capacityValue);
    const payload: SchoolSectionCreate = {
      classId,
      name,
      ...(capacity !== undefined ? { capacity } : {}),
    };

    try {
      await apiFetch<SchoolSection>('/sections', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      formElement.reset();
      setSectionSuccess(`Section "${name}" created.`);
      setSectionsReload((value) => value + 1);
    } catch (reason) {
      setSectionFormError(reason instanceof Error ? reason.message : 'Unable to create section.');
    } finally {
      setSectionPending(false);
    }
  }

  async function createSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubjectPending(true);
    setSubjectFormError(null);
    setSubjectSuccess(null);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get('subjectName') ?? '').trim();
    const code = String(form.get('subjectCode') ?? '').trim();
    const category = String(form.get('subjectCategory') ?? '').trim();
    const shortName = String(form.get('subjectShortName') ?? '').trim();
    const maximumMarksValue = String(form.get('maximumMarks') ?? '');
    const creditValue = String(form.get('credit') ?? '');
    const maximumMarks = maximumMarksValue === '' ? undefined : Number(maximumMarksValue);
    const credit = creditValue === '' ? undefined : Number(creditValue);
    const payload: SchoolSubjectCreate = {
      name,
      code,
      category,
      ...(shortName ? { shortName } : {}),
      ...(maximumMarks !== undefined ? { maximumMarks } : {}),
      ...(credit !== undefined ? { credit } : {}),
    };

    try {
      await apiFetch<SchoolSubject>('/subjects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      formElement.reset();
      setSubjectSuccess(`Subject "${name}" created.`);
      setSubjectsReload((value) => value + 1);
    } catch (reason) {
      setSubjectFormError(reason instanceof Error ? reason.message : 'Unable to create subject.');
    } finally {
      setSubjectPending(false);
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
          <a className="admin-nav-item active" href="/academics" aria-current="page">
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
            <p className="admin-caption">Academic structure</p>
            <h1>Academic setup</h1>
          </div>
          <a className="admin-health" href="/setup">
            School setup
          </a>
        </header>

        <section className="admin-card academic-form-card" aria-labelledby="create-year-title">
          <h2 id="create-year-title">Add an academic year</h2>
          <p className="admin-muted">
            Dates are entered as calendar dates. Creating an active year switches the school’s
            active year; previous academic records are retained.
          </p>
          <form className="academic-form" onSubmit={createAcademicYear}>
            <label>
              Name
              <input name="name" maxLength={120} required />
            </label>
            <label>
              Start date
              <input name="startDate" type="date" required />
            </label>
            <label>
              End date
              <input name="endDate" type="date" required />
            </label>
            <label className="academic-active-option">
              <input name="isActive" type="checkbox" />
              Set as active academic year
            </label>
            {yearFormError ? (
              <p className="login-error" role="alert">
                {yearFormError}
              </p>
            ) : null}
            {yearSuccess ? (
              <p className="academic-success" role="status">
                {yearSuccess}
              </p>
            ) : null}
            <button className="login-button academic-submit" disabled={yearPending} type="submit">
              {yearPending ? 'Saving...' : 'Add academic year'}
            </button>
          </form>
        </section>

        <section className="admin-card academic-form-card" aria-labelledby="create-class-title">
          <h2 id="create-class-title">Add a class</h2>
          <p className="admin-muted">
            Use the school’s configured class name and ordering. Age guidance is optional.
          </p>
          <form className="academic-form" onSubmit={createClass}>
            <label>
              Class name
              <input name="className" maxLength={120} required />
            </label>
            <label>
              Short name
              <input name="shortName" maxLength={120} />
            </label>
            <label>
              Display order
              <input name="orderIndex" type="number" min={0} step={1} defaultValue={0} required />
            </label>
            <label>
              Minimum age (optional)
              <input name="minimumAge" type="number" min={0} max={30} step={1} />
            </label>
            <label>
              Maximum age (optional)
              <input name="maximumAge" type="number" min={0} max={30} step={1} />
            </label>
            {classFormError ? (
              <p className="login-error" role="alert">
                {classFormError}
              </p>
            ) : null}
            {classSuccess ? (
              <p className="academic-success" role="status">
                {classSuccess}
              </p>
            ) : null}
            <button className="login-button academic-submit" disabled={classPending} type="submit">
              {classPending ? 'Saving...' : 'Add class'}
            </button>
          </form>
        </section>

        <section className="admin-card academic-years-card" aria-labelledby="classes-list-title">
          <h2 id="classes-list-title">School classes</h2>
          {classLoadError ? (
            <div className="setup-error" role="alert">
              <p>{classLoadError}</p>
              <button
                className="setup-retry"
                type="button"
                onClick={() => setClassesReload((value) => value + 1)}
              >
                Try again
              </button>
            </div>
          ) : null}
          {!classes && !classLoadError ? (
            <p className="admin-muted" role="status">
              Loading classes...
            </p>
          ) : null}
          {classes ? (
            classes.length ? (
              <div className="student-table-wrap">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th scope="col">Class</th>
                      <th scope="col">Short name</th>
                      <th scope="col">Display order</th>
                      <th scope="col">Age range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((schoolClass) => (
                      <tr key={schoolClass.id}>
                        <td>{schoolClass.name}</td>
                        <td>{schoolClass.shortName ?? '—'}</td>
                        <td>{schoolClass.orderIndex}</td>
                        <td>
                          {schoolClass.minimumAge !== null || schoolClass.maximumAge !== null
                            ? `${schoolClass.minimumAge ?? '—'}–${schoolClass.maximumAge ?? '—'}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-muted">No classes yet. Add a class above to continue setup.</p>
            )
          ) : null}
        </section>

        <section className="admin-card academic-form-card" aria-labelledby="create-section-title">
          <h2 id="create-section-title">Add a section</h2>
          <p className="admin-muted">
            Sections belong to one class. Capacity is optional; the school may leave it unset.
          </p>
          <form className="academic-form" onSubmit={createSection}>
            <label>
              Class
              <select
                name="sectionClassId"
                required
                disabled={!classes || classes.length === 0 || Boolean(classLoadError)}
                defaultValue=""
              >
                <option value="" disabled>
                  {classLoadError
                    ? 'Classes could not be loaded'
                    : !classes
                      ? 'Loading classes...'
                      : classes.length === 0
                        ? 'Create a class first'
                        : 'Select a class'}
                </option>
                {classes?.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {schoolClass.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Section name
              <input name="sectionName" maxLength={120} required />
            </label>
            <label>
              Capacity (optional)
              <input name="capacity" type="number" min={1} max={100000} step={1} />
            </label>
            {sectionFormError ? (
              <p className="login-error" role="alert">
                {sectionFormError}
              </p>
            ) : null}
            {sectionSuccess ? (
              <p className="academic-success" role="status">
                {sectionSuccess}
              </p>
            ) : null}
            <button
              className="login-button academic-submit"
              disabled={sectionPending || !classes?.length || Boolean(classLoadError)}
              type="submit"
            >
              {sectionPending ? 'Saving...' : 'Add section'}
            </button>
          </form>
          {classLoadError ? (
            <button
              className="setup-retry"
              type="button"
              onClick={() => setClassesReload((value) => value + 1)}
            >
              Retry loading classes
            </button>
          ) : null}
        </section>

        <section className="admin-card academic-years-card" aria-labelledby="sections-list-title">
          <h2 id="sections-list-title">School sections</h2>
          {sectionLoadError ? (
            <div className="setup-error" role="alert">
              <p>{sectionLoadError}</p>
              <button
                className="setup-retry"
                type="button"
                onClick={() => setSectionsReload((value) => value + 1)}
              >
                Try again
              </button>
            </div>
          ) : null}
          {!sections && !sectionLoadError ? (
            <p className="admin-muted" role="status">
              Loading sections...
            </p>
          ) : null}
          {sections ? (
            sections.length ? (
              <div className="student-table-wrap">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th scope="col">Section</th>
                      <th scope="col">Class</th>
                      <th scope="col">Capacity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((section) => {
                      const schoolClass = classes?.find((item) => item.id === section.classId);
                      return (
                        <tr key={section.id}>
                          <td>{section.name}</td>
                          <td>{schoolClass?.name ?? 'Class unavailable'}</td>
                          <td>{section.capacity ?? 'Not set'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-muted">
                No sections yet. Create a class, then add a section to continue setup.
              </p>
            )
          ) : null}
        </section>

        <section className="admin-card academic-form-card" aria-labelledby="create-subject-title">
          <h2 id="create-subject-title">Add a subject</h2>
          <p className="admin-muted">
            Create the school’s subject catalog. Grading rules and class/teacher assignments are
            configured separately.
          </p>
          <form className="academic-form" onSubmit={createSubject}>
            <label>
              Subject name
              <input name="subjectName" maxLength={120} required />
            </label>
            <label>
              Subject code
              <input name="subjectCode" maxLength={40} required />
            </label>
            <label>
              Category
              <input name="subjectCategory" maxLength={50} defaultValue="OTHER" required />
            </label>
            <label>
              Short name (optional)
              <input name="subjectShortName" maxLength={120} />
            </label>
            <label>
              Maximum marks (optional)
              <input name="maximumMarks" type="number" min={1} max={100000} step={1} />
            </label>
            <label>
              Credit (optional)
              <input name="credit" type="number" min={1} max={1000} step={1} />
            </label>
            {subjectFormError ? (
              <p className="login-error" role="alert">
                {subjectFormError}
              </p>
            ) : null}
            {subjectSuccess ? (
              <p className="academic-success" role="status">
                {subjectSuccess}
              </p>
            ) : null}
            <button
              className="login-button academic-submit"
              disabled={subjectPending}
              type="submit"
            >
              {subjectPending ? 'Saving...' : 'Add subject'}
            </button>
          </form>
        </section>

        <section className="admin-card academic-years-card" aria-labelledby="subjects-list-title">
          <h2 id="subjects-list-title">School subjects</h2>
          {subjectLoadError ? (
            <div className="setup-error" role="alert">
              <p>{subjectLoadError}</p>
              <button
                className="setup-retry"
                type="button"
                onClick={() => setSubjectsReload((value) => value + 1)}
              >
                Try again
              </button>
            </div>
          ) : null}
          {!subjects && !subjectLoadError ? (
            <p className="admin-muted" role="status">
              Loading subjects...
            </p>
          ) : null}
          {subjects ? (
            subjects.length ? (
              <div className="student-table-wrap">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th scope="col">Subject</th>
                      <th scope="col">Code</th>
                      <th scope="col">Category</th>
                      <th scope="col">Maximum marks</th>
                      <th scope="col">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject) => (
                      <tr key={subject.id}>
                        <td>{subject.name}</td>
                        <td>{subject.code}</td>
                        <td>{subject.category}</td>
                        <td>{subject.maximumMarks ?? 'Not set'}</td>
                        <td>{subject.credit ?? 'Not set'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-muted">
                No subjects yet. Add a subject above to build the catalog.
              </p>
            )
          ) : null}
        </section>

        <section className="admin-card academic-years-card" aria-labelledby="years-list-title">
          <h2 id="years-list-title">School academic years</h2>
          {yearLoadError ? (
            <div className="setup-error" role="alert">
              <p>{yearLoadError}</p>
              <button
                className="setup-retry"
                type="button"
                onClick={() => setYearsReload((value) => value + 1)}
              >
                Try again
              </button>
            </div>
          ) : null}
          {!years && !yearLoadError ? (
            <p className="admin-muted" role="status">
              Loading academic years...
            </p>
          ) : null}
          {years ? (
            years.length ? (
              <div className="student-table-wrap">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th scope="col">Academic year</th>
                      <th scope="col">Start date</th>
                      <th scope="col">End date</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {years.map((year) => (
                      <tr key={year.id}>
                        <td>{year.name}</td>
                        <td>{displayDate(year.startDate)}</td>
                        <td>{displayDate(year.endDate)}</td>
                        <td>
                          <span className="student-status">
                            {year.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-muted">
                No academic years yet. Add one above to begin school setup.
              </p>
            )
          ) : null}
        </section>
      </section>
    </main>
  );
}
