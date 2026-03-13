-- Let dashboard control which events appear on the public site (no login required).
ALTER TABLE trinityhouse.events
  ADD COLUMN IF NOT EXISTS show_public BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN trinityhouse.events.show_public IS 'When true, event is listed on the public Events / Weekends page.';
