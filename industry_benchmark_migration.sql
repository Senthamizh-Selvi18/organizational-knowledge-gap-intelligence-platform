BEGIN;

ALTER TABLE industry_benchmark
    ADD COLUMN IF NOT EXISTS recommended_action VARCHAR(1000);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'industry_benchmark' AND column_name = 'benchmark_level'
    ) THEN
        UPDATE industry_benchmark
        SET recommended_action = COALESCE(
            recommended_action,
            'Reach the "' || benchmark_level || '" proficiency level for this skill.'
        )
        WHERE recommended_action IS NULL;
    END IF;
END $$;

UPDATE industry_benchmark
SET recommended_action = 'Recommended action not yet documented — please update this benchmark.'
WHERE recommended_action IS NULL;

ALTER TABLE industry_benchmark
    ALTER COLUMN recommended_action SET NOT NULL;

ALTER TABLE industry_benchmark
    DROP COLUMN IF EXISTS benchmark_level;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'industry_benchmark'
ORDER BY ordinal_position;

COMMIT;