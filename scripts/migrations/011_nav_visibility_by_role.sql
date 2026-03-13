-- Admin-configurable dashboard nav visibility per app role.
-- Keys are app_users.role (e.g. 'user'); value is array of hrefs that role can see.
-- Admins/superusers always see all. If a role is missing, default for 'user' is used.

ALTER TABLE trinityhouse.church_profile
  ADD COLUMN IF NOT EXISTS nav_visibility_by_role JSONB NOT NULL DEFAULT '{"user":["/home","/dashboard","/dashboard/groups","/dashboard/communication"]}';

COMMENT ON COLUMN trinityhouse.church_profile.nav_visibility_by_role IS 'Per-role allowed nav hrefs. e.g. {"user":["/home","/dashboard","/dashboard/groups","/dashboard/communication"]}. Admin/superuser see all.';
