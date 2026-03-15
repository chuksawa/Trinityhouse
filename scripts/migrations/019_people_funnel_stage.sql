-- Newcomer funnel stage tracking on people
-- Stages: visitor, connected, joined, serving
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'trinityhouse' AND table_name = 'people' AND column_name = 'funnel_stage'
  ) THEN
    ALTER TABLE trinityhouse.people ADD COLUMN funnel_stage TEXT DEFAULT 'visitor';
  END IF;
END $$;
