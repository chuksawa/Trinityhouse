-- Staff-to-staff direct messages.
CREATE TABLE IF NOT EXISTS trinityhouse.staff_messages (
  id           TEXT PRIMARY KEY,
  sender_id    INTEGER NOT NULL REFERENCES trinityhouse.app_users(id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES trinityhouse.app_users(id) ON DELETE CASCADE,
  body         TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  read_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_staff_messages_recipient ON trinityhouse.staff_messages(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_messages_sender ON trinityhouse.staff_messages(sender_id, created_at DESC);

COMMENT ON TABLE trinityhouse.staff_messages IS 'Direct messages between staff (app users).';
