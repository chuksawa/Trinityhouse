-- Giving: external URL and text-to-give on church profile; allow guest gifts (person_id nullable).

ALTER TABLE trinityhouse.church_profile
  ADD COLUMN IF NOT EXISTS giving_external_url TEXT,
  ADD COLUMN IF NOT EXISTS text_to_give_phone TEXT;

ALTER TABLE trinityhouse.gifts
  ALTER COLUMN person_id DROP NOT NULL;
