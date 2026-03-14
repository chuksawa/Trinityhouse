-- Generic content (articles, images, videos) in addition to sermons.
-- Sermons remain in sermons table; this table holds article, image, video types.

CREATE TABLE IF NOT EXISTS trinityhouse.content (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL CHECK (type IN ('article', 'image', 'video')),
  title       TEXT NOT NULL,
  description TEXT,
  author      TEXT,
  body        TEXT,
  video_url   TEXT,
  image_url   TEXT,
  duration    TEXT,
  show_public BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_type ON trinityhouse.content(type);
CREATE INDEX IF NOT EXISTS idx_content_show_public ON trinityhouse.content(show_public) WHERE show_public = true;
CREATE INDEX IF NOT EXISTS idx_content_created_at ON trinityhouse.content(created_at DESC);

COMMENT ON TABLE trinityhouse.content IS 'Content items: articles, images, videos (sermons stay in sermons table).';
