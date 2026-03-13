-- Role hierarchy: people roles ordered by authority; app roles define who can edit whom.
-- Used for People & Care: list all members, staff can edit based on hierarchy (config in Admin).

-- People roles in order (rank 1 = highest authority, e.g. senior_pastor)
CREATE TABLE IF NOT EXISTS trinityhouse.people_role_hierarchy (
  role  TEXT PRIMARY KEY,
  rank  INT NOT NULL UNIQUE
);

INSERT INTO trinityhouse.people_role_hierarchy (role, rank) VALUES
  ('senior_pastor', 1),
  ('senior_staff',  2),
  ('staff',         3),
  ('member',        4)
ON CONFLICT (role) DO UPDATE SET rank = EXCLUDED.rank;

-- For each app role (superuser, admin, user), which people roles they may edit (array of role names)
CREATE TABLE IF NOT EXISTS trinityhouse.app_role_edit_scope (
  app_role             TEXT PRIMARY KEY,
  editable_people_roles TEXT[] NOT NULL DEFAULT '{}'
);

INSERT INTO trinityhouse.app_role_edit_scope (app_role, editable_people_roles) VALUES
  ('superuser', ARRAY['senior_pastor','senior_staff','staff','member']),
  ('admin',     ARRAY['senior_staff','staff','member']),
  ('user',      ARRAY[]::TEXT[])
ON CONFLICT (app_role) DO UPDATE SET editable_people_roles = EXCLUDED.editable_people_roles;
