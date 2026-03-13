-- Control which sermons appear on the public Watch page (like events show_public).
ALTER TABLE trinityhouse.sermons
  ADD COLUMN IF NOT EXISTS show_public BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_sermons_show_public ON trinityhouse.sermons(show_public) WHERE show_public = true;
