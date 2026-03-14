-- Add senior_staff and staff to app_role_edit_scope (who can edit which people roles on People & Care).
-- Default: senior_staff can edit staff and member; staff can edit member only.

INSERT INTO trinityhouse.app_role_edit_scope (app_role, editable_people_roles) VALUES
  ('senior_staff', ARRAY['staff', 'member']),
  ('staff',       ARRAY['member'])
ON CONFLICT (app_role) DO UPDATE SET editable_people_roles = EXCLUDED.editable_people_roles;
