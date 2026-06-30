-- ============================================================
-- Ya Qalbi — Supabase Schema
-- Safe to run multiple times (idempotent)
-- ============================================================


-- ============================================================
-- 1. PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'My Love',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'My Love'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 2. MEDIA
-- ============================================================

DO $$ BEGIN
  CREATE TYPE media_type AS ENUM ('photo', 'video');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE media_category AS ENUM ('trips', 'dates', 'everyday', 'events');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add 'events' to the enum if it doesn't exist yet (safe to re-run)
DO $$ BEGIN
  ALTER TYPE media_category ADD VALUE IF NOT EXISTS 'events';
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_url     TEXT NOT NULL,
  file_type    media_type NOT NULL DEFAULT 'photo',
  category     media_category NOT NULL DEFAULT 'everyday',
  title        TEXT,
  caption      TEXT,
  taken_at     DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure uploaded_by is nullable (app uses custom auth, not Supabase Auth)
ALTER TABLE media ALTER COLUMN uploaded_by DROP NOT NULL;


-- ============================================================
-- 3. TIMELINE EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS timeline_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  event_date   DATE NOT NULL,
  cover_image  TEXT,
  cover_media  UUID REFERENCES media(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add cover_image column if upgrading from an older schema
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Ensure created_by is nullable (app uses custom auth, not Supabase Auth)
ALTER TABLE timeline_events ALTER COLUMN created_by DROP NOT NULL;


-- ============================================================
-- 4. MOODS
-- ============================================================

CREATE TABLE IF NOT EXISTS moods (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji       TEXT NOT NULL,
  label       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 5. PARTNER AUTH
-- ============================================================

CREATE TABLE IF NOT EXISTS partner_auth (
  id      SERIAL PRIMARY KEY,
  step    INT  NOT NULL,
  answer  TEXT NOT NULL
);


-- ============================================================
-- 6. SETTINGS (key/value store for home page content)
--    Used for: our_song, love_letter, and other partner edits
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE media           ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods           ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_auth    ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings        ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles: public read"    ON profiles;
DROP POLICY IF EXISTS "profiles: partner update" ON profiles;
CREATE POLICY "profiles: public read"    ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles: partner update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- media
DROP POLICY IF EXISTS "media: public read"        ON media;
DROP POLICY IF EXISTS "media: partner insert"     ON media;
DROP POLICY IF EXISTS "media: partner update own" ON media;
DROP POLICY IF EXISTS "media: partner delete own" ON media;
CREATE POLICY "media: public read"    ON media FOR SELECT USING (true);
-- Note: app uses custom partner auth (not Supabase Auth), so uid() is always null.
-- Access is controlled at the UI layer (partner session). Allow anon inserts/deletes.
CREATE POLICY "media: partner insert" ON media FOR INSERT WITH CHECK (true);
CREATE POLICY "media: partner update" ON media FOR UPDATE USING (true);
CREATE POLICY "media: partner delete" ON media FOR DELETE USING (true);

-- timeline_events
DROP POLICY IF EXISTS "timeline: public read"        ON timeline_events;
DROP POLICY IF EXISTS "timeline: partner insert"     ON timeline_events;
DROP POLICY IF EXISTS "timeline: partner update own" ON timeline_events;
DROP POLICY IF EXISTS "timeline: partner delete own" ON timeline_events;
CREATE POLICY "timeline: public read"   ON timeline_events FOR SELECT USING (true);
CREATE POLICY "timeline: partner insert" ON timeline_events FOR INSERT WITH CHECK (true);
CREATE POLICY "timeline: partner update" ON timeline_events FOR UPDATE USING (true);
CREATE POLICY "timeline: partner delete" ON timeline_events FOR DELETE USING (true);

-- moods
DROP POLICY IF EXISTS "moods: public read"        ON moods;
DROP POLICY IF EXISTS "moods: partner insert"     ON moods;
DROP POLICY IF EXISTS "moods: partner delete own" ON moods;
CREATE POLICY "moods: public read"    ON moods FOR SELECT USING (true);
CREATE POLICY "moods: partner insert" ON moods FOR INSERT WITH CHECK (true);
CREATE POLICY "moods: partner delete" ON moods FOR DELETE USING (true);

-- partner_auth: no client access (Edge Function uses service role)

-- settings
DROP POLICY IF EXISTS "settings: public read"    ON settings;
DROP POLICY IF EXISTS "settings: partner insert" ON settings;
DROP POLICY IF EXISTS "settings: partner update" ON settings;
DROP POLICY IF EXISTS "settings: partner delete" ON settings;
CREATE POLICY "settings: public read"    ON settings FOR SELECT USING (true);
CREATE POLICY "settings: partner insert" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "settings: partner update" ON settings FOR UPDATE USING (true);
CREATE POLICY "settings: partner delete" ON settings FOR DELETE USING (true);


-- ============================================================
-- 8. STORAGE BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "storage: public read"        ON storage.objects;
DROP POLICY IF EXISTS "storage: partner upload"     ON storage.objects;
DROP POLICY IF EXISTS "storage: partner delete own" ON storage.objects;
CREATE POLICY "storage: public read"    ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "storage: partner upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "storage: partner delete" ON storage.objects FOR DELETE USING (bucket_id = 'media');


-- ============================================================
-- 9. VIEWS
-- ============================================================

CREATE OR REPLACE VIEW latest_mood AS
  SELECT DISTINCT ON (user_id)
    moods.*,
    profiles.name AS user_name
  FROM moods
  JOIN profiles ON profiles.id = moods.user_id
  ORDER BY user_id, created_at DESC;

CREATE OR REPLACE VIEW media_with_uploader AS
  SELECT
    media.*,
    profiles.name        AS uploader_name,
    profiles.avatar_url  AS uploader_avatar
  FROM media
  JOIN profiles ON profiles.id = media.uploaded_by
  ORDER BY media.created_at DESC;


-- ============================================================
-- 10. SEED PARTNER AUTH ANSWERS (run once)
-- Only inserts if the table is empty — safe to re-run
-- ============================================================

INSERT INTO partner_auth (step, answer)
SELECT * FROM (VALUES
  (1, 'love'),
  (1, 'my love'),
  (2, 'june 26'),
  (2, 'jun 26'),
  (2, '06/26'),
  (2, '06-26'),
  (2, '6/26'),
  (2, '6-26'),
  (2, '26 june'),
  (2, '26 jun'),
  (2, '26/06'),
  (2, '26-06'),
  (2, 'june26'),
  (2, 'jun26')
) AS v(step, answer)
WHERE NOT EXISTS (SELECT 1 FROM partner_auth LIMIT 1);
