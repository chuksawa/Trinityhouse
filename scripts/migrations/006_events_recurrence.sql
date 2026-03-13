-- Recurrence for events: type (none | daily | weekly | biweekly | monthly | yearly) and optional end date.
ALTER TABLE trinityhouse.events
  ADD COLUMN IF NOT EXISTS recurrence_type TEXT NOT NULL DEFAULT 'none';

ALTER TABLE trinityhouse.events
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE NULL;

COMMENT ON COLUMN trinityhouse.events.recurrence_type IS 'none | daily | weekly | biweekly | monthly | yearly';
COMMENT ON COLUMN trinityhouse.events.recurrence_end_date IS 'When the recurrence series ends; NULL = no end.';
