CREATE TYPE "ResultStatus" AS ENUM ('draft', 'calculated', 'verified', 'approved', 'published', 'reopened');

ALTER TABLE "results"
  ADD COLUMN "status" "ResultStatus" NOT NULL DEFAULT 'calculated',
  ADD COLUMN "failed_subjects" JSONB,
  ADD COLUMN "approved_at" TIMESTAMP(3);

CREATE TABLE "result_snapshots" (
  "id" TEXT NOT NULL,
  "school_id" TEXT NOT NULL,
  "result_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "created_by_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "result_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "result_snapshots_result_id_version_key" ON "result_snapshots"("result_id", "version");
CREATE INDEX "result_snapshots_school_id_idx" ON "result_snapshots"("school_id");
CREATE INDEX "result_snapshots_result_id_idx" ON "result_snapshots"("result_id");
