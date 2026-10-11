DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "academic_years"
    WHERE "is_active" = true AND "deleted_at" IS NULL
    GROUP BY "school_id"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot enforce one active academic year per school: resolve schools with multiple active years before retrying migration 0007.';
  END IF;
END
$$;

CREATE UNIQUE INDEX "academic_years_one_active_per_school_idx"
ON "academic_years" ("school_id")
WHERE "is_active" = true AND "deleted_at" IS NULL;
