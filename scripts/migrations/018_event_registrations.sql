-- Event registrations (public sign-ups for events)
CREATE TABLE IF NOT EXISTS trinityhouse.event_registrations (
  id            SERIAL PRIMARY KEY,
  event_id      TEXT NOT NULL REFERENCES trinityhouse.events(id) ON DELETE CASCADE,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, email)
);

CREATE INDEX IF NOT EXISTS idx_event_reg_event ON trinityhouse.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_email ON trinityhouse.event_registrations(email);
