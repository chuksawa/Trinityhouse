-- Registration type: member (auto-approve) vs staff (pending approval).
ALTER TABLE trinityhouse.app_users
  ADD COLUMN IF NOT EXISTS registration_type TEXT DEFAULT 'member';
UPDATE trinityhouse.app_users SET registration_type = 'member' WHERE registration_type IS NULL OR registration_type = '';
