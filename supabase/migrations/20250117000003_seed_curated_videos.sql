-- Migration: Seed Curated YouTube Videos
-- Date: 2025-01-17
-- Purpose: Link YouTube tutorial videos to techniques
--
-- NOTE: Video IDs sourced from popular knitting channels:
-- - VeryPink Knits (Staci Perry) - https://www.youtube.com/@VeryPinkKnits
-- - Sheep and Stitch - https://www.youtube.com/@SheepandStitch
-- - RJ Knits - https://www.youtube.com/@RJKnits
-- - Wool and the Gang - https://www.youtube.com/@WoolandtheGang
--
-- Thumbnail URL format: https://i.ytimg.com/vi/{VIDEO_ID}/hqdefault.jpg
-- or maxresdefault.jpg for higher quality

-- ============================================================================
-- Insert curated videos for essential techniques
-- ============================================================================

-- Knit Stitch - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'Egp4NRhlMDg',
  'https://www.youtube.com/watch?v=Egp4NRhlMDg',
  'https://i.ytimg.com/vi/Egp4NRhlMDg/hqdefault.jpg',
  'How to Knit: Knit Stitch (Continental & English)',
  'VeryPink Knits',
  312, -- ~5:12
  0,
  9
FROM techniques t
WHERE t.slug = 'knit-stitch'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  creator_name = EXCLUDED.creator_name,
  duration = EXCLUDED.duration,
  evaluated_at = NOW();

-- Purl Stitch - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'gN5BY01VD-g',
  'https://www.youtube.com/watch?v=gN5BY01VD-g',
  'https://i.ytimg.com/vi/gN5BY01VD-g/hqdefault.jpg',
  'How to Knit: The Purl Stitch',
  'VeryPink Knits',
  285, -- ~4:45
  0,
  9
FROM techniques t
WHERE t.slug = 'purl-stitch'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- Long Tail Cast On - Sheep and Stitch
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'sYz5X4euDAY',
  'https://www.youtube.com/watch?v=sYz5X4euDAY',
  'https://i.ytimg.com/vi/sYz5X4euDAY/hqdefault.jpg',
  'How to Cast On Knitting for Total Beginners',
  'Sheep and Stitch',
  480, -- ~8:00
  0,
  9
FROM techniques t
WHERE t.slug = 'long-tail-cast-on'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- Knitted Cast On - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'psUTJ4M8fxo',
  'https://www.youtube.com/watch?v=psUTJ4M8fxo',
  'https://i.ytimg.com/vi/psUTJ4M8fxo/hqdefault.jpg',
  'Knitted Cast On',
  'VeryPink Knits',
  180, -- ~3:00
  0,
  8
FROM techniques t
WHERE t.slug = 'knitted-cast-on'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- Cable Cast On - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'pxJ6l7kE-5g',
  'https://www.youtube.com/watch?v=pxJ6l7kE-5g',
  'https://i.ytimg.com/vi/pxJ6l7kE-5g/hqdefault.jpg',
  'Cable Cast On',
  'VeryPink Knits',
  195, -- ~3:15
  0,
  8
FROM techniques t
WHERE t.slug = 'cable-cast-on'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- Basic Bind Off - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'sSLt5szY0j4',
  'https://www.youtube.com/watch?v=sSLt5szY0j4',
  'https://i.ytimg.com/vi/sSLt5szY0j4/hqdefault.jpg',
  'How to Bind Off (Cast Off) Knitting',
  'VeryPink Knits',
  240, -- ~4:00
  0,
  9
FROM techniques t
WHERE t.slug = 'basic-bind-off'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- K2tog - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'JGNqyI_t3zY',
  'https://www.youtube.com/watch?v=JGNqyI_t3zY',
  'https://i.ytimg.com/vi/JGNqyI_t3zY/hqdefault.jpg',
  'Knit Two Together (K2tog) Decrease',
  'VeryPink Knits',
  120, -- ~2:00
  0,
  9
FROM techniques t
WHERE t.slug = 'k2tog'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- SSK - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'Yl-Ry0HDYZY',
  'https://www.youtube.com/watch?v=Yl-Ry0HDYZY',
  'https://i.ytimg.com/vi/Yl-Ry0HDYZY/hqdefault.jpg',
  'SSK (Slip, Slip, Knit) Decrease',
  'VeryPink Knits',
  150, -- ~2:30
  0,
  9
FROM techniques t
WHERE t.slug = 'ssk'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- KFB - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  '9bFqkzRPHE0',
  'https://www.youtube.com/watch?v=9bFqkzRPHE0',
  'https://i.ytimg.com/vi/9bFqkzRPHE0/hqdefault.jpg',
  'Knit Front and Back (KFB) Increase',
  'VeryPink Knits',
  135, -- ~2:15
  0,
  8
FROM techniques t
WHERE t.slug = 'kfb'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- M1L - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'Acx1JQDCqkg',
  'https://www.youtube.com/watch?v=Acx1JQDCqkg',
  'https://i.ytimg.com/vi/Acx1JQDCqkg/hqdefault.jpg',
  'Make 1 Left (M1L) Increase',
  'VeryPink Knits',
  165, -- ~2:45
  0,
  8
FROM techniques t
WHERE t.slug = 'm1l'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- M1R - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'gBI2LFzaHB0',
  'https://www.youtube.com/watch?v=gBI2LFzaHB0',
  'https://i.ytimg.com/vi/gBI2LFzaHB0/hqdefault.jpg',
  'Make 1 Right (M1R) Increase',
  'VeryPink Knits',
  165, -- ~2:45
  0,
  8
FROM techniques t
WHERE t.slug = 'm1r'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- Yarn Over - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'C4tQVkvNWnA',
  'https://www.youtube.com/watch?v=C4tQVkvNWnA',
  'https://i.ytimg.com/vi/C4tQVkvNWnA/hqdefault.jpg',
  'Yarn Over (YO)',
  'VeryPink Knits',
  150, -- ~2:30
  0,
  8
FROM techniques t
WHERE t.slug = 'yarn-over'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- Garter Stitch - Sheep and Stitch
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'j41B1RnFLCA',
  'https://www.youtube.com/watch?v=j41B1RnFLCA',
  'https://i.ytimg.com/vi/j41B1RnFLCA/hqdefault.jpg',
  'How to Knit the Garter Stitch for Beginners',
  'Sheep and Stitch',
  360, -- ~6:00
  0,
  8
FROM techniques t
WHERE t.slug = 'garter-stitch'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- Stockinette Stitch - Sheep and Stitch
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'PpbV16U3rPQ',
  'https://www.youtube.com/watch?v=PpbV16U3rPQ',
  'https://i.ytimg.com/vi/PpbV16U3rPQ/hqdefault.jpg',
  'How to Knit Stockinette Stitch',
  'Sheep and Stitch',
  420, -- ~7:00
  0,
  8
FROM techniques t
WHERE t.slug = 'stockinette-stitch'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- 1x1 Ribbing - Wool and the Gang
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'GrO4GypYpM4',
  'https://www.youtube.com/watch?v=GrO4GypYpM4',
  'https://i.ytimg.com/vi/GrO4GypYpM4/hqdefault.jpg',
  'How to Knit 1x1 Rib Stitch',
  'Wool and the Gang',
  180, -- ~3:00
  0,
  8
FROM techniques t
WHERE t.slug = '1x1-ribbing'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- 2x2 Ribbing - Wool and the Gang
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'K6bHs6jhf6Y',
  'https://www.youtube.com/watch?v=K6bHs6jhf6Y',
  'https://i.ytimg.com/vi/K6bHs6jhf6Y/hqdefault.jpg',
  'How to Knit 2x2 Rib Stitch',
  'Wool and the Gang',
  195, -- ~3:15
  0,
  8
FROM techniques t
WHERE t.slug = '2x2-ribbing'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- Seed Stitch - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'xBNmRwWE9C4',
  'https://www.youtube.com/watch?v=xBNmRwWE9C4',
  'https://i.ytimg.com/vi/xBNmRwWE9C4/hqdefault.jpg',
  'Seed Stitch Pattern',
  'VeryPink Knits',
  210, -- ~3:30
  0,
  8
FROM techniques t
WHERE t.slug = 'seed-stitch'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- Dropped Stitch Fix - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'Bc0IgEKH7pg',
  'https://www.youtube.com/watch?v=Bc0IgEKH7pg',
  'https://i.ytimg.com/vi/Bc0IgEKH7pg/hqdefault.jpg',
  'Fixing a Dropped Stitch',
  'VeryPink Knits',
  300, -- ~5:00
  0,
  9
FROM techniques t
WHERE t.slug = 'dropped-stitch'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- Frogging - Sheep and Stitch
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'dYVgKBrHj7o',
  'https://www.youtube.com/watch?v=dYVgKBrHj7o',
  'https://i.ytimg.com/vi/dYVgKBrHj7o/hqdefault.jpg',
  'How to Frog Your Knitting',
  'Sheep and Stitch',
  360, -- ~6:00
  0,
  8
FROM techniques t
WHERE t.slug = 'frogging'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- Tinking - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'pxTMrqAfINc',
  'https://www.youtube.com/watch?v=pxTMrqAfINc',
  'https://i.ytimg.com/vi/pxTMrqAfINc/hqdefault.jpg',
  'How to Tink (Un-Knit)',
  'VeryPink Knits',
  240, -- ~4:00
  0,
  8
FROM techniques t
WHERE t.slug = 'tinking'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- Weaving in Ends - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'S3yTk6xFLvo',
  'https://www.youtube.com/watch?v=S3yTk6xFLvo',
  'https://i.ytimg.com/vi/S3yTk6xFLvo/hqdefault.jpg',
  'How to Weave In Ends',
  'VeryPink Knits',
  270, -- ~4:30
  0,
  9
FROM techniques t
WHERE t.slug = 'weaving-ends'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- Mattress Stitch - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'oLqKHPWBwpo',
  'https://www.youtube.com/watch?v=oLqKHPWBwpo',
  'https://i.ytimg.com/vi/oLqKHPWBwpo/hqdefault.jpg',
  'Mattress Stitch Seaming',
  'VeryPink Knits',
  360, -- ~6:00
  0,
  8
FROM techniques t
WHERE t.slug = 'mattress-stitch'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- Blocking - Sheep and Stitch
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'mB9FD7FLrNA',
  'https://www.youtube.com/watch?v=mB9FD7FLrNA',
  'https://i.ytimg.com/vi/mB9FD7FLrNA/hqdefault.jpg',
  'How to Block Knitting',
  'Sheep and Stitch',
  480, -- ~8:00
  0,
  8
FROM techniques t
WHERE t.slug = 'blocking'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- Stretchy Bind Off - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  '4E-aFuE2mSI',
  'https://www.youtube.com/watch?v=4E-aFuE2mSI',
  'https://i.ytimg.com/vi/4E-aFuE2mSI/hqdefault.jpg',
  'Stretchy Bind Off',
  'VeryPink Knits',
  210, -- ~3:30
  0,
  8
FROM techniques t
WHERE t.slug = 'stretchy-bind-off'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();

-- P2tog - VeryPink Knits
INSERT INTO curated_videos (
  technique_id, platform, video_id, url, thumbnail_url,
  title, creator_name, duration, recommended_start, ai_score
)
SELECT
  t.id,
  'youtube',
  'WyLr1oYVXxU',
  'https://www.youtube.com/watch?v=WyLr1oYVXxU',
  'https://i.ytimg.com/vi/WyLr1oYVXxU/hqdefault.jpg',
  'Purl Two Together (P2tog)',
  'VeryPink Knits',
  120, -- ~2:00
  0,
  8
FROM techniques t
WHERE t.slug = 'p2tog'
ON CONFLICT (technique_id) DO UPDATE SET
  video_id = EXCLUDED.video_id,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  title = EXCLUDED.title,
  evaluated_at = NOW();
