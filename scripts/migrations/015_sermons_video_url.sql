-- Optional video URL for each sermon (YouTube, Vimeo, or any embeddable link).
ALTER TABLE trinityhouse.sermons
  ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN trinityhouse.sermons.video_url IS 'Optional. YouTube, Vimeo, or other embeddable video URL.';
