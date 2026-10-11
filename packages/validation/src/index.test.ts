import { describe, expect, it } from 'vitest';

import {
  createAcademicYearSchema,
  createClassSchema,
  createSubjectOfferingSchema,
  createSubjectSchema,
  createTeacherAssignmentSchema,
  createTeacherSchema,
  environmentSchema,
  updateAcademicYearSchema,
  updateSchoolProfileSchema,
  updateSchoolSettingsSchema,
} from './index.js';

describe('updateSchoolSettingsSchema', () => {
  it('validates school settings including IANA time zones and ISO currency codes', () => {
    expect(
      updateSchoolSettingsSchema.parse({
        timeZone: ' Asia/Kathmandu ',
        language: 'ne',
        dateFormat: 'YYYY-MM-DD',
        currency: 'npr',
      }),
    ).toEqual({
      timeZone: 'Asia/Kathmandu',
      language: 'ne',
      dateFormat: 'YYYY-MM-DD',
      currency: 'NPR',
    });
    expect(() => updateSchoolSettingsSchema.parse({})).toThrow();
    expect(() => updateSchoolSettingsSchema.parse({ schoolId: 'other-school' })).toThrow();
    expect(() => updateSchoolSettingsSchema.parse({ timeZone: 'Mars/Olympus' })).toThrow();
    expect(() => updateSchoolSettingsSchema.parse({ language: 'fr' })).toThrow();
    expect(() => updateSchoolSettingsSchema.parse({ currency: 'US' })).toThrow();
    expect(() => updateSchoolSettingsSchema.parse({ currency: 'ZZZ' })).toThrow();
    expect(updateSchoolSettingsSchema.parse({ currency: null })).toEqual({ currency: null });
  });
});

describe('updateSchoolProfileSchema', () => {
  it('validates strict partial school profile updates', () => {
    expect(
      updateSchoolProfileSchema.parse({
        name: ' Example School ',
        email: ' contact@example.test ',
        establishedYear: 1995,
        address: null,
      }),
    ).toEqual({
      name: 'Example School',
      email: 'contact@example.test',
      establishedYear: 1995,
      address: null,
    });
    expect(() => updateSchoolProfileSchema.parse({})).toThrow();
    expect(() => updateSchoolProfileSchema.parse({ schoolId: 'another-school' })).toThrow();
    expect(() => updateSchoolProfileSchema.parse({ email: 'invalid' })).toThrow();
    expect(() => updateSchoolProfileSchema.parse({ establishedYear: '1995' })).toThrow();
  });
});

describe('environmentSchema', () => {
  it('parses MINIO_USE_SSL string booleans correctly', () => {
    expect(
      environmentSchema.parse({
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://localhost:5432/schoolos',
        REDIS_URL: 'redis://localhost:6379',
        MINIO_ENDPOINT: 'localhost',
        MINIO_PORT: '9000',
        MINIO_USE_SSL: 'false',
        MINIO_ACCESS_KEY: 'schoolos',
        MINIO_SECRET_KEY: 'schoolossecret',
        MINIO_BUCKET: 'schoolos',
        JWT_SECRET: 'schoolos-local-development-secret-key-2026',
      }).MINIO_USE_SSL,
    ).toBe(false);

    expect(
      environmentSchema.parse({
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://localhost:5432/schoolos',
        REDIS_URL: 'redis://localhost:6379',
        MINIO_ENDPOINT: 'localhost',
        MINIO_PORT: '9000',
        MINIO_USE_SSL: 'true',
        MINIO_ACCESS_KEY: 'schoolos',
        MINIO_SECRET_KEY: 'schoolossecret',
        MINIO_BUCKET: 'schoolos',
        JWT_SECRET: 'schoolos-local-development-secret-key-2026',
      }).MINIO_USE_SSL,
    ).toBe(true);
  });

  describe('academic setup schemas', () => {
    it('accepts a valid academic year and defaults it to inactive', () => {
      expect(
        createAcademicYearSchema.parse({
          name: '  2026-2027  ',
          startDate: '2026-04-14',
          endDate: '2027-04-13',
        }),
      ).toEqual({
        name: '2026-2027',
        startDate: '2026-04-14',
        endDate: '2027-04-13',
        isActive: false,
      });
    });

    it('rejects invalid or reversed academic year dates', () => {
      expect(() =>
        createAcademicYearSchema.parse({
          name: '2026-2027',
          startDate: '2026-02-30',
          endDate: '2027-04-13',
        }),
      ).toThrow();
      expect(() =>
        createAcademicYearSchema.parse({
          name: '2026-2027',
          startDate: '2027-04-13',
          endDate: '2026-04-14',
        }),
      ).toThrow();
    });

    it('rejects empty updates and unrecognized fields', () => {
      expect(() => updateAcademicYearSchema.parse({})).toThrow();
      expect(() =>
        createAcademicYearSchema.parse({
          name: '2026-2027',
          startDate: '2026-04-14',
          endDate: '2027-04-13',
          schoolId: 'another-school',
        }),
      ).toThrow();
    });

    it('rejects invalid class age ranges and non-numeric order indexes', () => {
      expect(() =>
        createClassSchema.parse({ name: 'Grade 1', minimumAge: 10, maximumAge: 6 }),
      ).toThrow();
      expect(() => createClassSchema.parse({ name: 'Grade 1', orderIndex: '1' })).toThrow();
    });

    it('accepts valid subject catalog entries and rejects invalid fields', () => {
      expect(
        createSubjectSchema.parse({
          name: ' Mathematics ',
          code: ' MATH ',
          maximumMarks: 100,
        }),
      ).toMatchObject({
        name: 'Mathematics',
        code: 'MATH',
        category: 'OTHER',
        maximumMarks: 100,
      });
      expect(() =>
        createSubjectSchema.parse({ name: 'Science', code: 'SCI', credit: 0 }),
      ).toThrow();
      expect(() =>
        createSubjectSchema.parse({ name: 'Science', code: 'SCI', schoolId: 'another-school' }),
      ).toThrow();
    });

    it('accepts valid teacher records and rejects malformed or unknown fields', () => {
      expect(
        createTeacherSchema.parse({
          employeeId: ' T-100 ',
          firstName: ' Ada ',
          lastName: ' Lovelace ',
          email: 'ada@example.com',
          joiningDate: '2026-04-14',
        }),
      ).toMatchObject({
        employeeId: 'T-100',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      });
      expect(() =>
        createTeacherSchema.parse({
          employeeId: 'T-100',
          firstName: 'Ada',
          lastName: 'Lovelace',
          email: 'not-an-email',
        }),
      ).toThrow();
      expect(() =>
        createTeacherSchema.parse({
          employeeId: 'T-100',
          firstName: 'Ada',
          lastName: 'Lovelace',
          schoolId: 'another-school',
        }),
      ).toThrow();
    });

    it('accepts complete teacher assignment references and rejects incomplete payloads', () => {
      expect(
        createTeacherAssignmentSchema.parse({
          teacherId: ' teacher-id ',
          academicYearId: 'year-id',
          classId: 'class-id',
          sectionId: 'section-id',
          subjectId: 'subject-id',
        }),
      ).toEqual({
        teacherId: 'teacher-id',
        academicYearId: 'year-id',
        classId: 'class-id',
        sectionId: 'section-id',
        subjectId: 'subject-id',
      });
      expect(() =>
        createTeacherAssignmentSchema.parse({
          teacherId: 'teacher-id',
          academicYearId: 'year-id',
          classId: 'class-id',
          sectionId: 'section-id',
        }),
      ).toThrow();
      expect(() =>
        createTeacherAssignmentSchema.parse({
          teacherId: 'teacher-id',
          academicYearId: 'year-id',
          classId: 'class-id',
          sectionId: 'section-id',
          subjectId: 'subject-id',
          schoolId: 'another-school',
        }),
      ).toThrow();
    });

    it('rejects non-boolean subject offering flags and missing references', () => {
      expect(() =>
        createSubjectOfferingSchema.parse({
          academicYearId: 'year-id',
          classId: 'class-id',
          sectionId: 'section-id',
          subjectId: 'subject-id',
          teacherId: 'teacher-id',
          isElective: 'false',
        }),
      ).toThrow();
      expect(() => createSubjectOfferingSchema.parse({ classId: 'class-id' })).toThrow();
    });
  });

  it('applies the default when MINIO_USE_SSL is omitted', () => {
    const parsed = environmentSchema.parse({
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://localhost:5432/schoolos',
      REDIS_URL: 'redis://localhost:6379',
      MINIO_ENDPOINT: 'localhost',
      MINIO_PORT: '9000',
      MINIO_ACCESS_KEY: 'schoolos',
      MINIO_SECRET_KEY: 'schoolossecret',
      MINIO_BUCKET: 'schoolos',
      JWT_SECRET: 'schoolos-local-development-secret-key-2026',
    });

    expect(parsed.MINIO_USE_SSL).toBe(false);
  });
});
