-- Registration approval: new users are pending until a superuser approves.
ALTER TABLE trinityhouse.app_users
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
UPDATE trinityhouse.app_users SET status = 'active' WHERE status IS NULL OR status = '';
ALTER TABLE trinityhouse.app_users
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_app_users_status ON trinityhouse.app_users(status);
