-- Add created_at column to assignments table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignments' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE assignments ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
        UPDATE assignments SET created_at = NOW() WHERE created_at IS NULL;
        ALTER TABLE assignments ALTER COLUMN created_at SET NOT NULL;
    END IF;
END $$;

-- Add submitted_at column to grades table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'grades' AND column_name = 'submitted_at'
    ) THEN
        ALTER TABLE grades ADD COLUMN submitted_at TIMESTAMP DEFAULT NOW();
        UPDATE grades SET submitted_at = NOW() WHERE submitted_at IS NULL;
        ALTER TABLE grades ALTER COLUMN submitted_at SET NOT NULL;
    END IF;
END $$; 