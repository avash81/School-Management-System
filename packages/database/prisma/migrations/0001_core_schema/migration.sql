-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending_invitation', 'active', 'suspended', 'locked', 'archived');

-- CreateEnum
CREATE TYPE "SchoolStatus" AS ENUM ('active', 'suspended', 'archived');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('applied', 'admitted', 'enrolled', 'active', 'transferred', 'graduated', 'dropped', 'expelled', 'archived');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('active', 'completed', 'transferred', 'dropped', 'expelled', 'withdrawn');

-- CreateEnum
CREATE TYPE "TeacherStatus" AS ENUM ('pending', 'active', 'on_leave', 'suspended', 'resigned', 'retired', 'archived');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('full_time', 'part_time', 'contract', 'guest_faculty');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('draft', 'scheduled', 'marks_entry', 'review', 'published', 'archived');

-- CreateEnum
CREATE TYPE "MarkStatus" AS ENUM ('draft', 'pending', 'verified', 'approved', 'published', 'rejected');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'medical_leave', 'withheld', 'exempted', 'cheating', 'incomplete');

-- CreateEnum
CREATE TYPE "MarkSource" AS ENUM ('manual', 'ai_import', 'bulk_import', 'system');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('report_card', 'marksheet', 'progress_report', 'admit_card', 'seating_list', 'attendance_sheet', 'marks_register', 'student_id_card', 'character_certificate', 'bonafide_certificate', 'transfer_certificate', 'graduation_certificate', 'achievement_certificate', 'notice', 'fee_letter', 'circular', 'parent_letter');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('draft', 'queued', 'generating', 'generated', 'stored', 'failed', 'archived');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'rejected');

-- CreateEnum
CREATE TYPE "OCRJobStatus" AS ENUM ('queued', 'processing', 'completed', 'failed', 'reviewed');

-- CreateEnum
CREATE TYPE "ImportSessionStatus" AS ENUM ('draft', 'validating', 'review', 'approved', 'imported', 'rejected', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'pending_invitation',
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "device" TEXT,
    "browser" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "registration_no" TEXT,
    "school_type" TEXT,
    "established_year" INTEGER,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address" TEXT,
    "logo_url" TEXT,
    "principal_sig_url" TEXT,
    "seal_url" TEXT,
    "status" "SchoolStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_settings" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "time_zone" TEXT NOT NULL DEFAULT 'UTC',
    "language" TEXT NOT NULL DEFAULT 'en',
    "date_format" TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
    "number_format" TEXT NOT NULL DEFAULT 'en-US',
    "academic_calendar" JSONB,
    "roll_number_format" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "school_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_systems" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "grading_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "education_level" TEXT,
    "minimum_age" INTEGER,
    "maximum_age" INTEGER,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "maximum_marks" INTEGER,
    "credit" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_groups" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "subject_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_assignments" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'subject_teacher',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "teacher_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_versions" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "curriculum_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_blueprints" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "curriculum_version_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject_id" TEXT,
    "total_marks" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assessment_blueprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_components" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "blueprint_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "max_marks" INTEGER NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assessment_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_offerings" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "blueprint_id" TEXT NOT NULL,
    "is_elective" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "subject_offerings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_rules" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "from_class_id" TEXT NOT NULL,
    "to_class_id" TEXT NOT NULL,
    "pass_min_percent" INTEGER,
    "repeat_class_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "promotion_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "academic_id" TEXT NOT NULL,
    "admission_no" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "preferred_name" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" "Gender",
    "phone" TEXT,
    "email" TEXT,
    "current_address" TEXT,
    "permanent_address" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'applied',
    "admission_date" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardians" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "occupation" TEXT,
    "address" TEXT,
    "emergency_contact" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "guardians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_guardians" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "guardian_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "student_guardians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "roll_number" TEXT,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'active',
    "promoted_from_id" TEXT,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "gender" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "nationality" TEXT,
    "marital_status" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "current_address" TEXT,
    "permanent_address" TEXT,
    "emergency_contact" TEXT,
    "joining_date" TIMESTAMP(3),
    "department_id" TEXT,
    "designation" TEXT,
    "employment_type" "EmploymentType" NOT NULL DEFAULT 'full_time',
    "status" "TeacherStatus" NOT NULL DEFAULT 'pending',
    "photo_url" TEXT,
    "signature_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_qualifications" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "subject" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "teacher_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_documents" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "teacher_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homeroom_assignments" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "homeroom_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "result_publish_date" TIMESTAMP(3),
    "status" "ExamStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_subjects" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "subject_offering_id" TEXT NOT NULL,
    "blueprint_id" TEXT NOT NULL,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "exam_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marks" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "exam_subject_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "assessment_component_id" TEXT NOT NULL,
    "mark_value" DECIMAL(8,2),
    "status" "MarkStatus" NOT NULL DEFAULT 'pending',
    "attendance_status" "AttendanceStatus" NOT NULL DEFAULT 'present',
    "source" "MarkSource" NOT NULL DEFAULT 'manual',
    "entered_by_id" TEXT,
    "verified_by_id" TEXT,
    "confidence_score" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "marks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "total_marks" DECIMAL(8,2) NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "grade" TEXT NOT NULL,
    "gpa" DECIMAL(4,2) NOT NULL,
    "pass_status" TEXT NOT NULL,
    "class_rank" INTEGER,
    "section_rank" INTEGER,
    "overall_rank" INTEGER,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_approvals" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "result_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_bands" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "min_percent" DECIMAL(5,2) NOT NULL,
    "max_percent" DECIMAL(5,2) NOT NULL,
    "grade" TEXT NOT NULL,
    "gpa" DECIMAL(4,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "grading_bands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_templates" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "canvas_json" JSONB,
    "html_template" TEXT,
    "css_template" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "report_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_documents" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "source_entity_type" TEXT NOT NULL,
    "source_entity_id" TEXT NOT NULL,
    "verification_code" TEXT NOT NULL,
    "file_url" TEXT,
    "file_key" TEXT,
    "file_size_bytes" INTEGER,
    "template_version" TEXT NOT NULL,
    "source_data_version" TEXT,
    "generated_by_user_id" TEXT,
    "generated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_history" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "generated_document_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performed_by_user_id" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "document_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "uploaded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploads" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "uploaded_by_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_key" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "status" "UploadStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocr_jobs" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "upload_id" TEXT NOT NULL,
    "status" "OCRJobStatus" NOT NULL DEFAULT 'queued',
    "provider" TEXT,
    "result" JSONB,
    "confidence" DOUBLE PRECISION,
    "error" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ocr_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_sessions" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "upload_id" TEXT NOT NULL,
    "started_by_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "ImportSessionStatus" NOT NULL DEFAULT 'draft',
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "import_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_records" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "import_session_id" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "extracted_data" JSONB NOT NULL,
    "validation_errors" JSONB,
    "confidence" DOUBLE PRECISION,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "import_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "school_id" TEXT,
    "user_id" TEXT,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_schoolId_idx" ON "users"("schoolId");

-- CreateIndex
CREATE INDEX "roles_schoolId_idx" ON "roles"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_schoolId_code_key" ON "roles"("schoolId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions"("role_id");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "school_settings_school_id_idx" ON "school_settings"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_settings_school_id_key" ON "school_settings"("school_id");

-- CreateIndex
CREATE INDEX "academic_years_school_id_idx" ON "academic_years"("school_id");

-- CreateIndex
CREATE INDEX "academic_years_school_id_is_active_idx" ON "academic_years"("school_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_school_id_name_key" ON "academic_years"("school_id", "name");

-- CreateIndex
CREATE INDEX "grading_systems_school_id_idx" ON "grading_systems"("school_id");

-- CreateIndex
CREATE INDEX "classes_school_id_idx" ON "classes"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "classes_school_id_name_key" ON "classes"("school_id", "name");

-- CreateIndex
CREATE INDEX "sections_school_id_idx" ON "sections"("school_id");

-- CreateIndex
CREATE INDEX "sections_class_id_idx" ON "sections"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "sections_class_id_name_key" ON "sections"("class_id", "name");

-- CreateIndex
CREATE INDEX "subjects_school_id_idx" ON "subjects"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_school_id_name_key" ON "subjects"("school_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_school_id_code_key" ON "subjects"("school_id", "code");

-- CreateIndex
CREATE INDEX "subject_groups_school_id_idx" ON "subject_groups"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_groups_school_id_name_key" ON "subject_groups"("school_id", "name");

-- CreateIndex
CREATE INDEX "teacher_assignments_school_id_idx" ON "teacher_assignments"("school_id");

-- CreateIndex
CREATE INDEX "teacher_assignments_teacher_id_idx" ON "teacher_assignments"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_assignments_academic_year_id_idx" ON "teacher_assignments"("academic_year_id");

-- CreateIndex
CREATE INDEX "teacher_assignments_class_id_idx" ON "teacher_assignments"("class_id");

-- CreateIndex
CREATE INDEX "teacher_assignments_section_id_idx" ON "teacher_assignments"("section_id");

-- CreateIndex
CREATE INDEX "teacher_assignments_subject_id_idx" ON "teacher_assignments"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_assignments_teacher_id_academic_year_id_class_id_se_key" ON "teacher_assignments"("teacher_id", "academic_year_id", "class_id", "section_id", "subject_id");

-- CreateIndex
CREATE INDEX "curriculum_versions_school_id_idx" ON "curriculum_versions"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_versions_school_id_name_version_key" ON "curriculum_versions"("school_id", "name", "version");

-- CreateIndex
CREATE INDEX "assessment_blueprints_school_id_idx" ON "assessment_blueprints"("school_id");

-- CreateIndex
CREATE INDEX "assessment_blueprints_subject_id_idx" ON "assessment_blueprints"("subject_id");

-- CreateIndex
CREATE INDEX "assessment_blueprints_curriculum_version_id_idx" ON "assessment_blueprints"("curriculum_version_id");

-- CreateIndex
CREATE INDEX "assessment_components_school_id_idx" ON "assessment_components"("school_id");

-- CreateIndex
CREATE INDEX "assessment_components_blueprint_id_idx" ON "assessment_components"("blueprint_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_components_blueprint_id_order_index_key" ON "assessment_components"("blueprint_id", "order_index");

-- CreateIndex
CREATE INDEX "subject_offerings_school_id_idx" ON "subject_offerings"("school_id");

-- CreateIndex
CREATE INDEX "subject_offerings_academic_year_id_idx" ON "subject_offerings"("academic_year_id");

-- CreateIndex
CREATE INDEX "subject_offerings_teacher_id_idx" ON "subject_offerings"("teacher_id");

-- CreateIndex
CREATE INDEX "subject_offerings_class_id_idx" ON "subject_offerings"("class_id");

-- CreateIndex
CREATE INDEX "subject_offerings_section_id_idx" ON "subject_offerings"("section_id");

-- CreateIndex
CREATE INDEX "subject_offerings_subject_id_idx" ON "subject_offerings"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_offerings_academic_year_id_class_id_section_id_subj_key" ON "subject_offerings"("academic_year_id", "class_id", "section_id", "subject_id");

-- CreateIndex
CREATE INDEX "promotion_rules_school_id_idx" ON "promotion_rules"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_rules_school_id_from_class_id_key" ON "promotion_rules"("school_id", "from_class_id");

-- CreateIndex
CREATE INDEX "students_school_id_idx" ON "students"("school_id");

-- CreateIndex
CREATE INDEX "students_school_id_status_idx" ON "students"("school_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "students_school_id_admission_no_key" ON "students"("school_id", "admission_no");

-- CreateIndex
CREATE UNIQUE INDEX "students_school_id_academic_id_key" ON "students"("school_id", "academic_id");

-- CreateIndex
CREATE INDEX "guardians_school_id_idx" ON "guardians"("school_id");

-- CreateIndex
CREATE INDEX "student_guardians_school_id_idx" ON "student_guardians"("school_id");

-- CreateIndex
CREATE INDEX "student_guardians_student_id_idx" ON "student_guardians"("student_id");

-- CreateIndex
CREATE INDEX "student_guardians_guardian_id_idx" ON "student_guardians"("guardian_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_guardians_student_id_guardian_id_key" ON "student_guardians"("student_id", "guardian_id");

-- CreateIndex
CREATE INDEX "enrollments_school_id_idx" ON "enrollments"("school_id");

-- CreateIndex
CREATE INDEX "enrollments_student_id_idx" ON "enrollments"("student_id");

-- CreateIndex
CREATE INDEX "enrollments_academic_year_id_idx" ON "enrollments"("academic_year_id");

-- CreateIndex
CREATE INDEX "enrollments_class_id_idx" ON "enrollments"("class_id");

-- CreateIndex
CREATE INDEX "enrollments_section_id_idx" ON "enrollments"("section_id");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_academic_year_id_class_id_section_id_roll_numbe_key" ON "enrollments"("academic_year_id", "class_id", "section_id", "roll_number");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_id_academic_year_id_key" ON "enrollments"("student_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "departments_school_id_idx" ON "departments"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_school_id_code_key" ON "departments"("school_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_school_id_name_key" ON "departments"("school_id", "name");

-- CreateIndex
CREATE INDEX "teachers_school_id_idx" ON "teachers"("school_id");

-- CreateIndex
CREATE INDEX "teachers_department_id_idx" ON "teachers"("department_id");

-- CreateIndex
CREATE INDEX "teachers_school_id_status_idx" ON "teachers"("school_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_school_id_employee_id_key" ON "teachers"("school_id", "employee_id");

-- CreateIndex
CREATE INDEX "teacher_qualifications_school_id_idx" ON "teacher_qualifications"("school_id");

-- CreateIndex
CREATE INDEX "teacher_qualifications_teacher_id_idx" ON "teacher_qualifications"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_documents_school_id_idx" ON "teacher_documents"("school_id");

-- CreateIndex
CREATE INDEX "teacher_documents_teacher_id_idx" ON "teacher_documents"("teacher_id");

-- CreateIndex
CREATE INDEX "homeroom_assignments_school_id_idx" ON "homeroom_assignments"("school_id");

-- CreateIndex
CREATE INDEX "homeroom_assignments_teacher_id_idx" ON "homeroom_assignments"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "homeroom_assignments_class_id_section_id_academic_year_id_key" ON "homeroom_assignments"("class_id", "section_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "exams_school_id_idx" ON "exams"("school_id");

-- CreateIndex
CREATE INDEX "exams_academic_year_id_idx" ON "exams"("academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "exams_school_id_academic_year_id_name_key" ON "exams"("school_id", "academic_year_id", "name");

-- CreateIndex
CREATE INDEX "exam_subjects_school_id_idx" ON "exam_subjects"("school_id");

-- CreateIndex
CREATE INDEX "exam_subjects_exam_id_idx" ON "exam_subjects"("exam_id");

-- CreateIndex
CREATE INDEX "exam_subjects_subject_offering_id_idx" ON "exam_subjects"("subject_offering_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_subjects_exam_id_subject_offering_id_key" ON "exam_subjects"("exam_id", "subject_offering_id");

-- CreateIndex
CREATE INDEX "marks_school_id_idx" ON "marks"("school_id");

-- CreateIndex
CREATE INDEX "marks_exam_id_idx" ON "marks"("exam_id");

-- CreateIndex
CREATE INDEX "marks_student_id_idx" ON "marks"("student_id");

-- CreateIndex
CREATE INDEX "marks_enrollment_id_idx" ON "marks"("enrollment_id");

-- CreateIndex
CREATE INDEX "marks_assessment_component_id_idx" ON "marks"("assessment_component_id");

-- CreateIndex
CREATE UNIQUE INDEX "marks_exam_subject_id_enrollment_id_assessment_component_id_key" ON "marks"("exam_subject_id", "enrollment_id", "assessment_component_id");

-- CreateIndex
CREATE INDEX "results_school_id_idx" ON "results"("school_id");

-- CreateIndex
CREATE INDEX "results_exam_id_idx" ON "results"("exam_id");

-- CreateIndex
CREATE INDEX "results_student_id_idx" ON "results"("student_id");

-- CreateIndex
CREATE INDEX "results_enrollment_id_idx" ON "results"("enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "results_exam_id_enrollment_id_key" ON "results"("exam_id", "enrollment_id");

-- CreateIndex
CREATE INDEX "result_approvals_school_id_idx" ON "result_approvals"("school_id");

-- CreateIndex
CREATE INDEX "result_approvals_exam_id_idx" ON "result_approvals"("exam_id");

-- CreateIndex
CREATE INDEX "result_approvals_user_id_idx" ON "result_approvals"("user_id");

-- CreateIndex
CREATE INDEX "grading_bands_school_id_idx" ON "grading_bands"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "grading_bands_school_id_grade_key" ON "grading_bands"("school_id", "grade");

-- CreateIndex
CREATE INDEX "report_templates_school_id_idx" ON "report_templates"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_templates_school_id_type_version_key" ON "report_templates"("school_id", "type", "version");

-- CreateIndex
CREATE UNIQUE INDEX "generated_documents_verification_code_key" ON "generated_documents"("verification_code");

-- CreateIndex
CREATE INDEX "generated_documents_school_id_idx" ON "generated_documents"("school_id");

-- CreateIndex
CREATE INDEX "generated_documents_template_id_idx" ON "generated_documents"("template_id");

-- CreateIndex
CREATE INDEX "generated_documents_source_entity_type_source_entity_id_idx" ON "generated_documents"("source_entity_type", "source_entity_id");

-- CreateIndex
CREATE INDEX "document_history_school_id_idx" ON "document_history"("school_id");

-- CreateIndex
CREATE INDEX "document_history_generated_document_id_idx" ON "document_history"("generated_document_id");

-- CreateIndex
CREATE INDEX "files_school_id_idx" ON "files"("school_id");

-- CreateIndex
CREATE INDEX "files_uploaded_by_id_idx" ON "files"("uploaded_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "files_school_id_storage_key_key" ON "files"("school_id", "storage_key");

-- CreateIndex
CREATE INDEX "uploads_school_id_idx" ON "uploads"("school_id");

-- CreateIndex
CREATE INDEX "uploads_uploaded_by_id_idx" ON "uploads"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "uploads_school_id_status_idx" ON "uploads"("school_id", "status");

-- CreateIndex
CREATE INDEX "ocr_jobs_school_id_idx" ON "ocr_jobs"("school_id");

-- CreateIndex
CREATE INDEX "ocr_jobs_upload_id_idx" ON "ocr_jobs"("upload_id");

-- CreateIndex
CREATE INDEX "ocr_jobs_school_id_status_idx" ON "ocr_jobs"("school_id", "status");

-- CreateIndex
CREATE INDEX "import_sessions_school_id_idx" ON "import_sessions"("school_id");

-- CreateIndex
CREATE INDEX "import_sessions_upload_id_idx" ON "import_sessions"("upload_id");

-- CreateIndex
CREATE INDEX "import_sessions_started_by_id_idx" ON "import_sessions"("started_by_id");

-- CreateIndex
CREATE INDEX "import_sessions_school_id_status_idx" ON "import_sessions"("school_id", "status");

-- CreateIndex
CREATE INDEX "import_records_school_id_idx" ON "import_records"("school_id");

-- CreateIndex
CREATE INDEX "import_records_import_session_id_idx" ON "import_records"("import_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "import_records_import_session_id_row_number_key" ON "import_records"("import_session_id", "row_number");

-- CreateIndex
CREATE INDEX "audit_logs_school_id_idx" ON "audit_logs"("school_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

