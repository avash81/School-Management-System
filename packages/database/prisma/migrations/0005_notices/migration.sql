CREATE TYPE "NoticeStatus" AS ENUM ('draft', 'scheduled', 'published', 'expired', 'archived');
CREATE TYPE "NoticePriority" AS ENUM ('low', 'normal', 'high', 'urgent');

CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "notice_number" TEXT,
    "status" "NoticeStatus" NOT NULL DEFAULT 'draft',
    "priority" "NoticePriority" NOT NULL DEFAULT 'normal',
    "published_at" TIMESTAMP(3),
    "effective_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "audience" JSONB,
    "attachment_key" TEXT,
    "created_by_id" TEXT NOT NULL,
    "published_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notice_history" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "notice_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notice_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notices_school_id_status_idx" ON "notices"("school_id", "status");
CREATE INDEX "notices_school_id_published_at_idx" ON "notices"("school_id", "published_at");
CREATE INDEX "notice_history_school_id_notice_id_idx" ON "notice_history"("school_id", "notice_id");
