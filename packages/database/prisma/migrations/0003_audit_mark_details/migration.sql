ALTER TABLE "audit_logs" ADD COLUMN "entity_id" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "old_value" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "new_value" TEXT;
