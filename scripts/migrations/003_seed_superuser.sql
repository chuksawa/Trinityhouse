-- One-time seed: superuser for dashboard login (chuksa@gmail.com).
-- Password is stored only as bcrypt hash; do not commit plain passwords.
INSERT INTO trinityhouse.app_users (email, password_hash, role)
VALUES (
  'chuksa@gmail.com',
  '$2a$12$PqrT/HTlqvS9P/3QPUByCejBneH8uHnNJk3CAwwm2La.UjEzwemMO',
  'superuser'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'superuser',
  updated_at = NOW();
