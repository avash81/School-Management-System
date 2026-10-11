import { z } from 'zod';

const stringBooleanSchema = z
  .preprocess((value) => {
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }

    return value;
  }, z.boolean())
  .default(false);

export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url().or(z.string().min(1)),
  REDIS_URL: z.string().min(1),
  MINIO_ENDPOINT: z.string().min(1),
  MINIO_PORT: z.coerce.number().int().positive().default(9000),
  MINIO_USE_SSL: stringBooleanSchema,
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),
  MINIO_BUCKET: z.string().min(1),
  JWT_SECRET: z.string().min(32),
});

export const userRoleSchema = z.enum(['student', 'parent', 'teacher', 'staff', 'admin']);

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(256),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(320),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(256),
  password: z.string().min(8).max(256),
});

export const updateSchoolProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    shortName: z.string().trim().max(100).nullable().optional(),
    registrationNo: z.string().trim().max(100).nullable().optional(),
    schoolType: z.string().trim().max(100).nullable().optional(),
    establishedYear: z.number().int().min(1).max(9999).nullable().optional(),
    phone: z.string().trim().max(40).nullable().optional(),
    email: z.string().trim().email().max(320).nullable().optional(),
    website: z.string().trim().max(2048).nullable().optional(),
    address: z.string().trim().max(1000).nullable().optional(),
    logoUrl: z.string().trim().max(2048).nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided.');

function isIanaTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch (error) {
    if (error instanceof RangeError) return false;
    throw error;
  }
}

export const updateSchoolSettingsSchema = z
  .object({
    timeZone: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .refine(isIanaTimeZone, 'Use a valid IANA time zone.')
      .optional(),
    language: z.enum(['en', 'ne']).optional(),
    dateFormat: z.string().trim().min(1).max(40).optional(),
    currency: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{3}$/)
      .transform((value) => value.toUpperCase())
      .refine(
        (value) => Intl.supportedValuesOf('currency').includes(value),
        'Use a supported ISO 4217 currency code.',
      )
      .nullable()
      .optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided.');

const academicDateSchema = z.union([z.string().date(), z.string().datetime({ offset: true })]);
const academicNameSchema = z.string().trim().min(1).max(120);
const optionalAcademicNameSchema = z.string().trim().max(120).nullable().optional();

export const createAcademicYearSchema = z
  .object({
    name: academicNameSchema,
    startDate: academicDateSchema,
    endDate: academicDateSchema,
    isActive: z.boolean().default(false),
  })
  .strict()
  .refine((value) => new Date(value.startDate) < new Date(value.endDate), {
    message: 'End date must be after start date.',
    path: ['endDate'],
  });

export const updateAcademicYearSchema = z
  .object({
    name: academicNameSchema.optional(),
    startDate: academicDateSchema.optional(),
    endDate: academicDateSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided.');

const classFields = {
  name: academicNameSchema,
  shortName: optionalAcademicNameSchema,
  orderIndex: z.number().int().min(0),
  minimumAge: z.number().int().min(0).max(30).nullable().optional(),
  maximumAge: z.number().int().min(0).max(30).nullable().optional(),
};

export const createClassSchema = z
  .object({ ...classFields, orderIndex: classFields.orderIndex.default(0) })
  .strict()
  .refine(
    (value) =>
      value.minimumAge == null || value.maximumAge == null || value.minimumAge <= value.maximumAge,
    {
      message: 'Minimum age must not exceed maximum age.',
      path: ['maximumAge'],
    },
  );

export const updateClassSchema = z
  .object(classFields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided.')
  .refine(
    (value) =>
      value.minimumAge == null || value.maximumAge == null || value.minimumAge <= value.maximumAge,
    {
      message: 'Minimum age must not exceed maximum age.',
      path: ['maximumAge'],
    },
  );

export const createSectionSchema = z
  .object({
    classId: z.string().trim().min(1).max(100),
    name: academicNameSchema,
    capacity: z.number().int().positive().max(100_000).nullable().optional(),
  })
  .strict();

export const updateSectionSchema = z
  .object({
    name: academicNameSchema.optional(),
    capacity: z.number().int().positive().max(100_000).nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided.');

const subjectFields = {
  name: academicNameSchema,
  code: z.string().trim().min(1).max(40),
  shortName: optionalAcademicNameSchema,
  category: z.string().trim().min(1).max(50),
  maximumMarks: z.number().int().positive().max(100_000).nullable().optional(),
  credit: z.number().int().positive().max(1000).nullable().optional(),
};

export const createSubjectSchema = z
  .object({
    ...subjectFields,
    category: subjectFields.category.default('OTHER'),
  })
  .strict();

export const updateSubjectSchema = z
  .object(subjectFields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided.');

export const createSubjectOfferingSchema = z
  .object({
    academicYearId: z.string().trim().min(1).max(100),
    classId: z.string().trim().min(1).max(100),
    sectionId: z.string().trim().min(1).max(100),
    subjectId: z.string().trim().min(1).max(100),
    teacherId: z.string().trim().min(1).max(100),
    blueprintId: z.string().trim().min(1).max(120).optional(),
    isElective: z.boolean().default(false),
  })
  .strict();

export const createTeacherSchema = z
  .object({
    employeeId: z.string().trim().min(1).max(100),
    firstName: academicNameSchema,
    middleName: optionalAcademicNameSchema,
    lastName: academicNameSchema,
    email: z.string().trim().email().max(320).nullable().optional(),
    phone: z.string().trim().min(1).max(40).nullable().optional(),
    designation: optionalAcademicNameSchema,
    joiningDate: academicDateSchema.optional(),
  })
  .strict();

export const createTeacherAssignmentSchema = z
  .object({
    teacherId: z.string().trim().min(1).max(100),
    academicYearId: z.string().trim().min(1).max(100),
    classId: z.string().trim().min(1).max(100),
    sectionId: z.string().trim().min(1).max(100),
    subjectId: z.string().trim().min(1).max(100),
  })
  .strict();

export type Environment = z.infer<typeof environmentSchema>;
export type UpdateSchoolProfileInput = z.infer<typeof updateSchoolProfileSchema>;
export type UpdateSchoolSettingsInput = z.infer<typeof updateSchoolSettingsSchema>;
export type AcademicYearCreateInput = z.infer<typeof createAcademicYearSchema>;
export type AcademicYearUpdateInput = z.infer<typeof updateAcademicYearSchema>;
export type ClassCreateInput = z.infer<typeof createClassSchema>;
export type ClassUpdateInput = z.infer<typeof updateClassSchema>;
export type SectionCreateInput = z.infer<typeof createSectionSchema>;
export type SectionUpdateInput = z.infer<typeof updateSectionSchema>;
export type SubjectCreateInput = z.infer<typeof createSubjectSchema>;
export type SubjectUpdateInput = z.infer<typeof updateSubjectSchema>;
export type SubjectOfferingCreateInput = z.infer<typeof createSubjectOfferingSchema>;
export type TeacherCreateInput = z.infer<typeof createTeacherSchema>;
export type TeacherAssignmentCreateInput = z.infer<typeof createTeacherAssignmentSchema>;
