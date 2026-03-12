-- TrinityHouse schema on shared Viggil DB (viggil-db.postgres.database.azure.com).
-- Run once: npm run db:migrate (or psql -f this file with connection to viggil-db).
-- All tables live in schema trinityhouse so Viggil's public schema is untouched.

CREATE SCHEMA IF NOT EXISTS trinityhouse;

-- People (members, staff, volunteers)
CREATE TABLE IF NOT EXISTS trinityhouse.people (
  id            TEXT PRIMARY KEY,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'member',
  join_date     DATE NOT NULL,
  family_id     TEXT,
  giving_total  NUMERIC(12,2) DEFAULT 0,
  last_attendance DATE,
  status        TEXT NOT NULL DEFAULT 'active',
  avatar_color  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_people_status ON trinityhouse.people(status);
CREATE INDEX IF NOT EXISTS idx_people_email ON trinityhouse.people(email);

-- Milestones (e.g. Baptism, Staff Onboard)
CREATE TABLE IF NOT EXISTS trinityhouse.person_milestones (
  id         SERIAL PRIMARY KEY,
  person_id  TEXT NOT NULL REFERENCES trinityhouse.people(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  date       DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care notes (pastoral)
CREATE TABLE IF NOT EXISTS trinityhouse.person_care_notes (
  id         SERIAL PRIMARY KEY,
  person_id  TEXT NOT NULL REFERENCES trinityhouse.people(id) ON DELETE CASCADE,
  note       TEXT NOT NULL,
  note_date  DATE NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups (small groups, ministry teams, volunteer teams)
CREATE TABLE IF NOT EXISTS trinityhouse.groups (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL,
  leader_id       TEXT REFERENCES trinityhouse.people(id) ON DELETE SET NULL,
  meeting_day     TEXT,
  meeting_time    TEXT,
  location        TEXT,
  description     TEXT,
  avg_attendance  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trinityhouse.group_members (
  group_id   TEXT NOT NULL REFERENCES trinityhouse.groups(id) ON DELETE CASCADE,
  person_id  TEXT NOT NULL REFERENCES trinityhouse.people(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, person_id)
);

-- Serving teams (array per person stored as JSONB on people or separate table; we use a simple junction)
CREATE TABLE IF NOT EXISTS trinityhouse.person_serving_teams (
  person_id TEXT NOT NULL REFERENCES trinityhouse.people(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  PRIMARY KEY (person_id, team_name)
);

-- Events
CREATE TABLE IF NOT EXISTS trinityhouse.events (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL,
  date        DATE NOT NULL,
  time        TEXT NOT NULL,
  end_time    TEXT,
  location    TEXT,
  capacity    INTEGER DEFAULT 0,
  registered  INTEGER DEFAULT 0,
  checked_in  INTEGER DEFAULT 0,
  description TEXT,
  teams       TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Gifts (giving)
CREATE TABLE IF NOT EXISTS trinityhouse.gifts (
  id        TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES trinityhouse.people(id) ON DELETE SET NULL,
  amount    NUMERIC(12,2) NOT NULL,
  date      DATE NOT NULL,
  fund      TEXT NOT NULL,
  method    TEXT NOT NULL,
  recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gifts_person_date ON trinityhouse.gifts(person_id, date);

-- Message records (communication)
CREATE TABLE IF NOT EXISTS trinityhouse.message_records (
  id         TEXT PRIMARY KEY,
  subject    TEXT NOT NULL,
  body       TEXT,
  channel    TEXT NOT NULL,
  audience   TEXT,
  sent_date  DATE,
  status     TEXT NOT NULL DEFAULT 'draft',
  recipients INTEGER DEFAULT 0,
  opened     INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sermons
CREATE TABLE IF NOT EXISTS trinityhouse.sermons (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  speaker     TEXT NOT NULL,
  series      TEXT NOT NULL,
  date        DATE NOT NULL,
  duration    TEXT,
  views       INTEGER DEFAULT 0,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Prayer requests
CREATE TABLE IF NOT EXISTS trinityhouse.prayer_requests (
  id          TEXT PRIMARY KEY,
  person_id   TEXT NOT NULL REFERENCES trinityhouse.people(id) ON DELETE CASCADE,
  request     TEXT NOT NULL,
  request_date DATE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active',
  prayer_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
