-- Church profile (single row, id = 1) and notification preferences per app user.

CREATE TABLE IF NOT EXISTS trinityhouse.church_profile (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL DEFAULT 'Trinity House',
  address      TEXT,
  phone        TEXT,
  email        TEXT,
  service_times JSONB DEFAULT '[]',  -- [{ "day": "Sunday", "times": "9:00 AM", "label": "Worship" }]
  website_url  TEXT,
  show_events_public BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO trinityhouse.church_profile (id, name, address, email)
VALUES (1, 'Trinity House', 'Zion Centre, Trinity Avenue, Water Corporation Road, Off Ligali Ayorinde Street, Victoria Island, Lagos', 'hello@trinityhouse.org')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, email = EXCLUDED.email, updated_at = NOW();

CREATE TABLE IF NOT EXISTS trinityhouse.notification_preferences (
  app_user_id   INT PRIMARY KEY REFERENCES trinityhouse.app_users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled   BOOLEAN NOT NULL DEFAULT false,
  push_enabled  BOOLEAN NOT NULL DEFAULT true,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
