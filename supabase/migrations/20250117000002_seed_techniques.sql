-- Migration: Seed Core Knitting Techniques
-- Date: 2025-01-17
-- Purpose: Populate the techniques table with 25 essential knitting techniques

-- ============================================================================
-- CAST-ON TECHNIQUES (3)
-- ============================================================================

INSERT INTO techniques (
  name, slug, category, subcategory, difficulty,
  description, purpose, instructions, tips, common_mistakes,
  prerequisites, related_techniques, aliases, abbreviations, tags, frequency
) VALUES
-- Long Tail Cast On
(
  'Long Tail Cast On',
  'long-tail-cast-on',
  'cast-on',
  NULL,
  2,
  'The most versatile and commonly used cast-on method. Creates a neat, elastic edge that works well for most projects. It uses both the tail and working yarn simultaneously.',
  'Use this cast-on for garments, accessories, and most projects where you need a stretchy, professional-looking edge.',
  '[
    {"order": 1, "instruction": "Make a slip knot, leaving a tail about 1 inch per stitch you need to cast on, plus extra."},
    {"order": 2, "instruction": "Place the slip knot on your needle and hold the needle in your right hand."},
    {"order": 3, "instruction": "Drape the tail over your left thumb and the working yarn over your left index finger, holding both yarns in your palm."},
    {"order": 4, "instruction": "Insert the needle up through the loop on your thumb from bottom to top."},
    {"order": 5, "instruction": "Bring the needle over and around the yarn on your index finger, catching it."},
    {"order": 6, "instruction": "Pull this loop back through the thumb loop."},
    {"order": 7, "instruction": "Drop the loop from your thumb and gently tighten the new stitch on the needle."}
  ]'::jsonb,
  ARRAY['Estimate 1 inch of tail per stitch plus 6 extra inches', 'Keep tension consistent for even stitches', 'Practice the hand position - it becomes natural quickly'],
  '[
    {"description": "Running out of tail before finishing", "howToAvoid": "Always estimate generously - about 1 inch per stitch plus extra", "howToFix": "Start over with a longer tail"},
    {"description": "Stitches too tight or too loose", "howToAvoid": "Maintain even tension as you form each stitch", "howToFix": "Practice on scrap yarn until you get consistent tension"}
  ]'::jsonb,
  '{}',
  ARRAY['knitted-cast-on', 'cable-cast-on'],
  ARRAY['long-tail', 'slingshot cast on', 'continental cast on'],
  ARRAY['CO', 'LTCO'],
  ARRAY['essential', 'beginner-friendly', 'cast-on'],
  'very-common'
),

-- Knitted Cast On
(
  'Knitted Cast On',
  'knitted-cast-on',
  'cast-on',
  NULL,
  1,
  'A simple cast-on method that uses the knit stitch motion. Great for beginners as it reinforces the knit stitch while learning. Creates a slightly looser edge.',
  'Perfect for beginners learning to cast on, or when you need to add stitches at the beginning or end of a row mid-project.',
  '[
    {"order": 1, "instruction": "Make a slip knot and place it on your left needle."},
    {"order": 2, "instruction": "Insert your right needle into the slip knot as if to knit (left to right, front to back)."},
    {"order": 3, "instruction": "Wrap the yarn around the right needle counter-clockwise."},
    {"order": 4, "instruction": "Pull the yarn through to create a new loop."},
    {"order": 5, "instruction": "Transfer this new loop to the left needle by inserting the left needle into it from right to left."},
    {"order": 6, "instruction": "Repeat from step 2 until you have the desired number of stitches."}
  ]'::jsonb,
  ARRAY['Great way to practice the knit motion', 'Can be used to add stitches anywhere in your project', 'Creates a looser edge than long-tail'],
  '[
    {"description": "Stitches are twisted on the needle", "howToAvoid": "Make sure to insert left needle into new stitch from right to left", "howToFix": "Untwist the stitch before knitting it"}
  ]'::jsonb,
  '{}',
  ARRAY['long-tail-cast-on', 'cable-cast-on'],
  ARRAY['knit cast on', 'knitting on'],
  ARRAY['CO'],
  ARRAY['beginner-friendly', 'cast-on'],
  'common'
),

-- Cable Cast On
(
  'Cable Cast On',
  'cable-cast-on',
  'cast-on',
  NULL,
  2,
  'A sturdy cast-on that creates a rope-like edge. Similar to knitted cast-on but inserts the needle between stitches for a firmer result. Excellent for projects needing a stable edge.',
  'Use for buttonhole bands, bag openings, or anywhere you need a firm, non-stretchy edge. Also useful for adding stitches mid-project.',
  '[
    {"order": 1, "instruction": "Start with a slip knot and one knitted cast-on stitch (2 stitches total)."},
    {"order": 2, "instruction": "Insert your right needle between the last two stitches on the left needle."},
    {"order": 3, "instruction": "Wrap the yarn around the right needle counter-clockwise."},
    {"order": 4, "instruction": "Pull the yarn through to create a new loop."},
    {"order": 5, "instruction": "Transfer this loop to the left needle."},
    {"order": 6, "instruction": "Repeat, always inserting between the last two stitches."}
  ]'::jsonb,
  ARRAY['Insert between stitches, not into them', 'Creates a firmer edge than knitted cast-on', 'Great for buttonholes'],
  '[
    {"description": "Edge is too tight", "howToAvoid": "Keep your tension relaxed when pulling through", "howToFix": "Use a larger needle for casting on, then switch to project needle"}
  ]'::jsonb,
  ARRAY['knitted-cast-on'],
  ARRAY['long-tail-cast-on'],
  ARRAY['cable cast-on'],
  ARRAY['CO'],
  ARRAY['cast-on'],
  'common'
),

-- ============================================================================
-- BASIC STITCHES (4)
-- ============================================================================

-- Knit Stitch
(
  'Knit Stitch',
  'knit-stitch',
  'basic',
  NULL,
  1,
  'The fundamental stitch in knitting. Creates a smooth V-shaped pattern on the right side. Combined with purl, it forms the basis for almost all knitting patterns.',
  'The knit stitch is used in every knitting project. It creates stockinette fabric when knitting every row in the round, or garter stitch when knitting every row flat.',
  '[
    {"order": 1, "instruction": "Hold the needle with stitches in your left hand and the empty needle in your right hand."},
    {"order": 2, "instruction": "Insert the right needle through the first stitch from left to right, going from front to back of the stitch."},
    {"order": 3, "instruction": "With your right hand, wrap the yarn counter-clockwise around the right needle."},
    {"order": 4, "instruction": "Use the right needle to pull the wrapped yarn through the stitch, creating a new loop on the right needle."},
    {"order": 5, "instruction": "Slide the original stitch off the left needle. You now have one new stitch on the right needle."}
  ]'::jsonb,
  ARRAY['Keep the yarn at the back of your work', 'Insert needle from left to right', 'Wrap yarn counter-clockwise', 'Maintain even tension'],
  '[
    {"description": "Dropping stitches", "howToAvoid": "Make sure to complete the stitch before sliding off the left needle", "howToFix": "Use a crochet hook to pick up dropped stitches"},
    {"description": "Twisted stitches", "howToAvoid": "Insert needle through the front of the stitch, not the back", "howToFix": "Knit through the back loop to untwist"}
  ]'::jsonb,
  '{}',
  ARRAY['purl-stitch', 'garter-stitch', 'stockinette-stitch'],
  ARRAY['knit', 'k'],
  ARRAY['K', 'k'],
  ARRAY['essential', 'beginner-friendly', 'fundamental'],
  'very-common'
),

-- Purl Stitch
(
  'Purl Stitch',
  'purl-stitch',
  'basic',
  NULL,
  1,
  'The reverse of the knit stitch, creating a bumpy texture. When combined with knit stitches, it creates ribbing, seed stitch, and stockinette patterns.',
  'Purl stitches are essential for creating texture and patterns. Purling every row creates garter stitch; alternating knit and purl rows creates stockinette.',
  '[
    {"order": 1, "instruction": "Hold the needle with stitches in your left hand and the empty needle in your right hand."},
    {"order": 2, "instruction": "Bring the working yarn to the front of your work."},
    {"order": 3, "instruction": "Insert the right needle through the first stitch from right to left, going from back to front."},
    {"order": 4, "instruction": "Wrap the yarn counter-clockwise around the right needle."},
    {"order": 5, "instruction": "Use the right needle to pull the wrapped yarn through the stitch, creating a new loop."},
    {"order": 6, "instruction": "Slide the original stitch off the left needle."}
  ]'::jsonb,
  ARRAY['Keep the yarn at the front of your work', 'Insert needle from right to left', 'The motion is like scooping backwards'],
  '[
    {"description": "Forgetting to bring yarn to front", "howToAvoid": "Always check yarn position before purling", "howToFix": "If you knit instead, tink back and redo"},
    {"description": "Creating yarn overs accidentally", "howToAvoid": "Bring yarn to front under the needle, not over", "howToFix": "Drop the extra yarn over on the next row"}
  ]'::jsonb,
  ARRAY['knit-stitch'],
  ARRAY['knit-stitch', 'stockinette-stitch'],
  ARRAY['purl', 'p'],
  ARRAY['P', 'p'],
  ARRAY['essential', 'beginner-friendly', 'fundamental'],
  'very-common'
),

-- Garter Stitch
(
  'Garter Stitch',
  'garter-stitch',
  'basic',
  NULL,
  1,
  'The simplest stitch pattern, created by knitting every row. Produces a squishy, reversible fabric with horizontal ridges on both sides.',
  'Perfect for beginners, scarves, blankets, and anywhere you want a reversible fabric that lies flat and has good stretch.',
  '[
    {"order": 1, "instruction": "Cast on the desired number of stitches."},
    {"order": 2, "instruction": "Knit every stitch across the row."},
    {"order": 3, "instruction": "Turn your work."},
    {"order": 4, "instruction": "Knit every stitch across the row again."},
    {"order": 5, "instruction": "Repeat steps 3-4 until your piece is the desired length."}
  ]'::jsonb,
  ARRAY['Lies flat without curling', 'Same on both sides', 'Every 2 rows creates one ridge', 'Stretchy in all directions'],
  '[
    {"description": "Edges are uneven", "howToAvoid": "Keep consistent tension on first and last stitches", "howToFix": "Slip the first stitch of each row for neater edges"}
  ]'::jsonb,
  ARRAY['knit-stitch'],
  ARRAY['stockinette-stitch', 'seed-stitch'],
  ARRAY['garter', 'all knit'],
  ARRAY['g st'],
  ARRAY['essential', 'beginner-friendly', 'pattern'],
  'very-common'
),

-- Stockinette Stitch
(
  'Stockinette Stitch',
  'stockinette-stitch',
  'basic',
  NULL,
  1,
  'The most common stitch pattern, showing smooth V''s on the right side and bumps on the wrong side. Created by alternating knit and purl rows.',
  'Used for most garments, hats, and projects where you want a smooth, classic knit fabric appearance.',
  '[
    {"order": 1, "instruction": "Cast on the desired number of stitches."},
    {"order": 2, "instruction": "Row 1 (Right Side): Knit every stitch across."},
    {"order": 3, "instruction": "Turn your work."},
    {"order": 4, "instruction": "Row 2 (Wrong Side): Purl every stitch across."},
    {"order": 5, "instruction": "Repeat rows 1 and 2 until desired length."}
  ]'::jsonb,
  ARRAY['The smooth V side is the right side', 'Naturally curls at edges', 'In the round, knit every round', 'Abbreviation is St st'],
  '[
    {"description": "Fabric curls at edges", "howToAvoid": "Add a border of garter stitch or ribbing", "howToFix": "Block aggressively or add a non-curling border"}
  ]'::jsonb,
  ARRAY['knit-stitch', 'purl-stitch'],
  ARRAY['garter-stitch', '1x1-ribbing'],
  ARRAY['stocking stitch', 'jersey stitch'],
  ARRAY['St st', 'SS'],
  ARRAY['essential', 'beginner-friendly', 'pattern'],
  'very-common'
),

-- ============================================================================
-- INCREASE TECHNIQUES (4)
-- ============================================================================

-- Knit Front Back (KFB)
(
  'Knit Front Back',
  'kfb',
  'increase',
  NULL,
  2,
  'An easy increase that creates two stitches from one by knitting into both the front and back of the same stitch. Leaves a small bar visible at the increase.',
  'Use when you need to add stitches for shaping. The visible bar can be decorative or hidden in seams. Great for beginners learning increases.',
  '[
    {"order": 1, "instruction": "Knit into the front of the stitch as normal, but don''t slide it off the left needle yet."},
    {"order": 2, "instruction": "Keeping the original stitch on the left needle, swing your right needle around to the back."},
    {"order": 3, "instruction": "Insert the right needle through the back loop of the same stitch."},
    {"order": 4, "instruction": "Wrap the yarn and pull through to create a second stitch."},
    {"order": 5, "instruction": "Now slide the original stitch off the left needle. You have created 2 stitches from 1."}
  ]'::jsonb,
  ARRAY['Don''t drop the stitch after the first knit', 'The second stitch goes through the back loop', 'Creates a small visible bar'],
  '[
    {"description": "Dropping the stitch after first knit", "howToAvoid": "Keep a finger on the stitch until you complete both parts", "howToFix": "Pick up the dropped stitch and try again"}
  ]'::jsonb,
  ARRAY['knit-stitch'],
  ARRAY['m1l', 'm1r', 'yarn-over'],
  ARRAY['knit front and back', 'bar increase'],
  ARRAY['KFB', 'kfb', 'K1fb'],
  ARRAY['increase', 'shaping'],
  'very-common'
),

-- Make One Left (M1L)
(
  'Make One Left',
  'm1l',
  'increase',
  NULL,
  2,
  'An invisible increase that leans to the left. Creates a new stitch by lifting the bar between stitches and knitting into it through the back loop.',
  'Used for invisible shaping in garments. Pair with M1R for symmetrical increases in sleeves, yokes, and other shaped pieces.',
  '[
    {"order": 1, "instruction": "Identify the horizontal bar of yarn running between the stitch on your right needle and the stitch on your left needle."},
    {"order": 2, "instruction": "Insert your left needle under this bar from front to back."},
    {"order": 3, "instruction": "The bar is now on your left needle with the front leg behind the needle."},
    {"order": 4, "instruction": "Knit into the back loop of this lifted bar (this twists it to close the hole)."},
    {"order": 5, "instruction": "You have created one new stitch that leans to the left."}
  ]'::jsonb,
  ARRAY['Lift from front to back', 'Knit through back loop to avoid a hole', 'The resulting stitch leans left'],
  '[
    {"description": "Creating a hole", "howToAvoid": "Make sure to knit through the back loop to twist the stitch", "howToFix": "Undo and redo, ensuring you knit through back loop"}
  ]'::jsonb,
  ARRAY['knit-stitch'],
  ARRAY['m1r', 'kfb', 'yarn-over'],
  ARRAY['make 1 left', 'left-leaning increase'],
  ARRAY['M1L', 'm1l'],
  ARRAY['increase', 'shaping', 'invisible'],
  'common'
),

-- Make One Right (M1R)
(
  'Make One Right',
  'm1r',
  'increase',
  NULL,
  2,
  'An invisible increase that leans to the right. Creates a new stitch by lifting the bar between stitches and knitting into it through the front loop.',
  'Used for invisible shaping. Pair with M1L for symmetrical increases. Place M1R on the left side of center and M1L on the right for balanced shaping.',
  '[
    {"order": 1, "instruction": "Identify the horizontal bar of yarn running between the stitch on your right needle and the stitch on your left needle."},
    {"order": 2, "instruction": "Insert your left needle under this bar from back to front."},
    {"order": 3, "instruction": "The bar is now on your left needle with the front leg in front of the needle."},
    {"order": 4, "instruction": "Knit into the front loop of this lifted bar (this twists it to close the hole)."},
    {"order": 5, "instruction": "You have created one new stitch that leans to the right."}
  ]'::jsonb,
  ARRAY['Lift from back to front', 'Knit through front loop', 'The resulting stitch leans right'],
  '[
    {"description": "Creating a hole", "howToAvoid": "Make sure to lift from back to front and knit through front loop", "howToFix": "The direction of lift and knit matters for closing the hole"}
  ]'::jsonb,
  ARRAY['knit-stitch'],
  ARRAY['m1l', 'kfb', 'yarn-over'],
  ARRAY['make 1 right', 'right-leaning increase'],
  ARRAY['M1R', 'm1r'],
  ARRAY['increase', 'shaping', 'invisible'],
  'common'
),

-- Yarn Over (YO)
(
  'Yarn Over',
  'yarn-over',
  'increase',
  NULL,
  2,
  'An increase that creates a decorative hole (eyelet). Simply wrap the yarn around the needle between stitches. Essential for lace knitting.',
  'Creates intentional holes for lace patterns, eyelets for threading ribbons, and decorative increases. Often paired with a decrease to maintain stitch count.',
  '[
    {"order": 1, "instruction": "Work to the point where the yarn over should be."},
    {"order": 2, "instruction": "Bring the yarn to the front if it isn''t already there."},
    {"order": 3, "instruction": "Wrap the yarn over the right needle from front to back."},
    {"order": 4, "instruction": "Continue with the next stitch (knit or purl as pattern indicates)."},
    {"order": 5, "instruction": "On the next row, work the yarn over as a regular stitch."}
  ]'::jsonb,
  ARRAY['Creates a deliberate hole', 'Yarn goes over needle from front to back', 'In lace, often paired with a decrease'],
  '[
    {"description": "Yarn over disappears", "howToAvoid": "Make sure to wrap completely over the needle", "howToFix": "Check that you''re wrapping in the right direction"}
  ]'::jsonb,
  ARRAY['knit-stitch', 'purl-stitch'],
  ARRAY['k2tog', 'ssk'],
  ARRAY['yarn forward', 'over', 'wool over'],
  ARRAY['YO', 'yo', 'yfwd', 'yon'],
  ARRAY['increase', 'lace', 'decorative'],
  'very-common'
),

-- ============================================================================
-- DECREASE TECHNIQUES (3)
-- ============================================================================

-- Knit 2 Together (K2tog)
(
  'Knit 2 Together',
  'k2tog',
  'decrease',
  NULL,
  2,
  'The most common decrease, leaning to the right. Simply knit two stitches together as if they were one. Quick and easy to execute.',
  'Use for right-leaning decreases in shaping. Place on the left side of center for symmetrical decreases, pairing with SSK on the right side.',
  '[
    {"order": 1, "instruction": "Insert your right needle through the next two stitches on the left needle (as if to knit both together)."},
    {"order": 2, "instruction": "The needle goes through both stitches from left to right, front to back."},
    {"order": 3, "instruction": "Wrap the yarn around the right needle counter-clockwise."},
    {"order": 4, "instruction": "Pull the yarn through both stitches."},
    {"order": 5, "instruction": "Slide both original stitches off the left needle. You now have one stitch where there were two."}
  ]'::jsonb,
  ARRAY['Just like a regular knit, but through 2 stitches', 'Creates a right-leaning decrease', 'Very quick and easy'],
  '[
    {"description": "Difficulty inserting needle through 2 stitches", "howToAvoid": "Make sure your stitches aren''t too tight", "howToFix": "Use the tip of the needle to ease through"}
  ]'::jsonb,
  ARRAY['knit-stitch'],
  ARRAY['ssk', 'p2tog'],
  ARRAY['knit two together', 'right-leaning decrease'],
  ARRAY['K2tog', 'k2tog'],
  ARRAY['essential', 'decrease', 'shaping'],
  'very-common'
),

-- Slip Slip Knit (SSK)
(
  'Slip Slip Knit',
  'ssk',
  'decrease',
  NULL,
  2,
  'A left-leaning decrease that mirrors K2tog. Two stitches are slipped individually, then knitted together through the back loops.',
  'Use for left-leaning decreases. Place on the right side of center for symmetrical decreases, pairing with K2tog on the left side.',
  '[
    {"order": 1, "instruction": "Slip the first stitch knitwise from the left needle to the right needle."},
    {"order": 2, "instruction": "Slip the second stitch knitwise from the left needle to the right needle."},
    {"order": 3, "instruction": "Insert the left needle into the front of both slipped stitches (from left to right)."},
    {"order": 4, "instruction": "Wrap the yarn around the right needle and knit these two stitches together."},
    {"order": 5, "instruction": "You now have one stitch where there were two, and it leans to the left."}
  ]'::jsonb,
  ARRAY['Slip knitwise, not purlwise', 'The slipping reorients the stitches', 'Creates a left-leaning decrease'],
  '[
    {"description": "Decrease leans wrong way", "howToAvoid": "Make sure to slip knitwise (not purlwise)", "howToFix": "The direction of slipping matters for the lean"}
  ]'::jsonb,
  ARRAY['knit-stitch'],
  ARRAY['k2tog', 'p2tog'],
  ARRAY['slip slip knit', 'left-leaning decrease', 'skp'],
  ARRAY['SSK', 'ssk'],
  ARRAY['decrease', 'shaping'],
  'very-common'
),

-- Purl 2 Together (P2tog)
(
  'Purl 2 Together',
  'p2tog',
  'decrease',
  NULL,
  2,
  'The purl version of K2tog. Decreases one stitch by purling two stitches together. Used on wrong-side rows.',
  'Use when decreasing on a purl row. Creates a right-leaning decrease on the knit side of stockinette fabric.',
  '[
    {"order": 1, "instruction": "Bring your yarn to the front of the work."},
    {"order": 2, "instruction": "Insert your right needle through the next two stitches purlwise (from right to left, back to front)."},
    {"order": 3, "instruction": "Wrap the yarn around the right needle counter-clockwise."},
    {"order": 4, "instruction": "Pull the yarn through both stitches."},
    {"order": 5, "instruction": "Slide both stitches off the left needle."}
  ]'::jsonb,
  ARRAY['Same motion as regular purl, through 2 stitches', 'Creates right-leaning decrease on RS', 'Use on wrong-side rows'],
  '[
    {"description": "Hard to insert needle through 2 stitches", "howToAvoid": "Keep purl stitches slightly loose", "howToFix": "Ease the needle tip through carefully"}
  ]'::jsonb,
  ARRAY['purl-stitch'],
  ARRAY['k2tog', 'ssk'],
  ARRAY['purl two together'],
  ARRAY['P2tog', 'p2tog'],
  ARRAY['decrease', 'shaping'],
  'common'
),

-- ============================================================================
-- BIND-OFF TECHNIQUES (2)
-- ============================================================================

-- Basic Bind Off
(
  'Basic Bind Off',
  'basic-bind-off',
  'bind-off',
  NULL,
  1,
  'The standard method for finishing your knitting. Creates a neat chain along the edge. Also called casting off.',
  'Use to finish any knitting project. Works for all situations but can be slightly tight. For stretchy edges, see Stretchy Bind Off.',
  '[
    {"order": 1, "instruction": "Knit the first two stitches as normal."},
    {"order": 2, "instruction": "Insert your left needle into the first stitch you knitted (the one furthest from the tip)."},
    {"order": 3, "instruction": "Lift this stitch up and over the second stitch and off the needle."},
    {"order": 4, "instruction": "One stitch remains on the right needle. Knit the next stitch."},
    {"order": 5, "instruction": "Repeat steps 2-4 until one stitch remains."},
    {"order": 6, "instruction": "Cut the yarn, leaving a 6-inch tail. Pull the tail through the last stitch to secure."}
  ]'::jsonb,
  ARRAY['Don''t bind off too tightly', 'Use a larger needle if your bind off is tight', 'Leave enough tail for weaving in'],
  '[
    {"description": "Bind off edge is too tight", "howToAvoid": "Keep tension relaxed or use a larger needle", "howToFix": "Unfortunately you''ll need to undo and redo with looser tension"}
  ]'::jsonb,
  ARRAY['knit-stitch'],
  ARRAY['stretchy-bind-off'],
  ARRAY['cast off', 'casting off', 'binding off'],
  ARRAY['BO', 'bo'],
  ARRAY['essential', 'beginner-friendly', 'finishing'],
  'very-common'
),

-- Stretchy Bind Off
(
  'Stretchy Bind Off',
  'stretchy-bind-off',
  'bind-off',
  NULL,
  2,
  'A modified bind off that creates an elastic edge. Essential for necklines, sock cuffs, and any edge that needs to stretch.',
  'Use for sock cuffs, hat brims, necklines, and any edge where the basic bind off would be too tight.',
  '[
    {"order": 1, "instruction": "Knit the first stitch."},
    {"order": 2, "instruction": "Knit the second stitch."},
    {"order": 3, "instruction": "Insert the left needle into both stitches on the right needle from left to right."},
    {"order": 4, "instruction": "Knit these two stitches together through the back loops."},
    {"order": 5, "instruction": "One stitch remains on right needle. Knit the next stitch."},
    {"order": 6, "instruction": "Repeat steps 3-5 until one stitch remains, then fasten off."}
  ]'::jsonb,
  ARRAY['Also known as Elizabeth Zimmermann''s sewn bind off', 'Much stretchier than standard bind off', 'Great for toe-up socks'],
  '[
    {"description": "Edge still too tight", "howToAvoid": "Really relax your tension on the k2tog tbl", "howToFix": "Try using a needle 2 sizes larger for the bind off"}
  ]'::jsonb,
  ARRAY['knit-stitch', 'basic-bind-off'],
  ARRAY['basic-bind-off'],
  ARRAY['elastic bind off', 'EZ bind off'],
  ARRAY['SBO'],
  ARRAY['bind-off', 'finishing'],
  'common'
),

-- ============================================================================
-- STITCH PATTERNS (3)
-- ============================================================================

-- 1x1 Ribbing
(
  '1x1 Ribbing',
  '1x1-ribbing',
  'patterns',
  NULL,
  2,
  'A stretchy pattern of alternating knit and purl stitches. Creates vertical columns and is commonly used for cuffs, hems, and neckbands.',
  'Perfect for edges that need to stretch and recover, like sock cuffs, sweater hems, and hat brims. Also used for full garments like ribbed sweaters.',
  '[
    {"order": 1, "instruction": "Cast on an even number of stitches."},
    {"order": 2, "instruction": "Row 1: *Knit 1, Purl 1* repeat to end."},
    {"order": 3, "instruction": "Row 2: *Knit 1, Purl 1* repeat to end (knit the knits, purl the purls)."},
    {"order": 4, "instruction": "Repeat Row 2 for pattern."}
  ]'::jsonb,
  ARRAY['Knit the knits and purl the purls as they face you', 'Very stretchy horizontally', 'Remember to move yarn between knits and purls'],
  '[
    {"description": "Losing track of pattern", "howToAvoid": "Look at your stitches - knits look like Vs, purls look like bumps", "howToFix": "Read your knitting to see what comes next"}
  ]'::jsonb,
  ARRAY['knit-stitch', 'purl-stitch'],
  ARRAY['2x2-ribbing', 'seed-stitch'],
  ARRAY['1 by 1 rib', 'single rib'],
  ARRAY['1x1 rib', 'K1P1'],
  ARRAY['pattern', 'ribbing', 'stretchy'],
  'very-common'
),

-- 2x2 Ribbing
(
  '2x2 Ribbing',
  '2x2-ribbing',
  'patterns',
  NULL,
  2,
  'Alternating columns of 2 knit stitches and 2 purl stitches. Slightly less stretchy than 1x1 rib but shows the pattern more prominently.',
  'Use for bolder ribbing on sweater cuffs, hems, and accessories. The wider columns create a more visible texture.',
  '[
    {"order": 1, "instruction": "Cast on a multiple of 4 stitches."},
    {"order": 2, "instruction": "Row 1: *Knit 2, Purl 2* repeat to end."},
    {"order": 3, "instruction": "Row 2: *Knit 2, Purl 2* repeat to end (knit the knits, purl the purls)."},
    {"order": 4, "instruction": "Repeat Row 2 for pattern."}
  ]'::jsonb,
  ARRAY['Cast on multiple of 4 for pattern to work out', 'Knit the knits, purl the purls', 'Slightly less stretch than 1x1'],
  '[
    {"description": "Pattern not lining up", "howToAvoid": "Make sure to cast on a multiple of 4", "howToFix": "Count your stitches and adjust if needed"}
  ]'::jsonb,
  ARRAY['knit-stitch', 'purl-stitch'],
  ARRAY['1x1-ribbing', 'seed-stitch'],
  ARRAY['2 by 2 rib', 'double rib'],
  ARRAY['2x2 rib', 'K2P2'],
  ARRAY['pattern', 'ribbing'],
  'very-common'
),

-- Seed Stitch
(
  'Seed Stitch',
  'seed-stitch',
  'patterns',
  NULL,
  2,
  'A textured pattern where you knit the purls and purl the knits. Creates a bumpy, reversible fabric that lies flat.',
  'Great for borders, washcloths, and anywhere you want reversible texture. Doesn''t curl like stockinette.',
  '[
    {"order": 1, "instruction": "Cast on an odd number of stitches."},
    {"order": 2, "instruction": "Row 1: *Knit 1, Purl 1* repeat to last stitch, Knit 1."},
    {"order": 3, "instruction": "Row 2: *Knit 1, Purl 1* repeat to last stitch, Knit 1."},
    {"order": 4, "instruction": "Repeat Row 2 for pattern."}
  ]'::jsonb,
  ARRAY['Opposite of ribbing - knit the purls, purl the knits', 'Lies flat without curling', 'Reversible - same on both sides'],
  '[
    {"description": "Accidentally making ribbing", "howToAvoid": "Knit the bumps and purl the Vs", "howToFix": "Look at your work - you want the opposite of ribbing"}
  ]'::jsonb,
  ARRAY['knit-stitch', 'purl-stitch'],
  ARRAY['1x1-ribbing', 'garter-stitch'],
  ARRAY['moss stitch', 'British moss stitch'],
  ARRAY['seed st'],
  ARRAY['pattern', 'texture', 'reversible'],
  'common'
),

-- ============================================================================
-- SOS / FIXING MISTAKES (3)
-- ============================================================================

-- Picking Up Dropped Stitch
(
  'Picking Up Dropped Stitch',
  'dropped-stitch',
  'sos',
  NULL,
  2,
  'How to rescue a stitch that has slipped off the needle and may have unraveled down several rows. Uses a crochet hook to ladder back up.',
  'Every knitter drops stitches! This essential skill saves you from having to rip out your work. Keep a crochet hook in your project bag.',
  '[
    {"order": 1, "instruction": "Stop! Don''t panic. Secure your work so no more stitches drop."},
    {"order": 2, "instruction": "Find the dropped stitch. It may have laddered down several rows, creating horizontal bars above it."},
    {"order": 3, "instruction": "Insert a crochet hook through the dropped stitch from front to back."},
    {"order": 4, "instruction": "Catch the first ladder bar above the stitch with the hook."},
    {"order": 5, "instruction": "Pull the bar through the stitch, creating a new stitch on the hook."},
    {"order": 6, "instruction": "Repeat for each ladder, working up to the current row."},
    {"order": 7, "instruction": "Place the rescued stitch back on your needle, making sure it''s not twisted."}
  ]'::jsonb,
  ARRAY['A crochet hook is your best friend', 'Work one ladder at a time', 'Check the stitch isn''t twisted when you put it back'],
  '[
    {"description": "Stitch is twisted on needle", "howToAvoid": "Pay attention to stitch orientation when placing back on needle", "howToFix": "Knit through back loop to untwist, or remove and replace correctly"}
  ]'::jsonb,
  ARRAY['knit-stitch'],
  ARRAY['tinking', 'frogging'],
  ARRAY['fixing dropped stitch', 'laddering up', 'catching dropped stitch'],
  ARRAY[],
  ARRAY['essential', 'sos', 'fixing'],
  'common'
),

-- Frogging
(
  'Frogging',
  'frogging',
  'sos',
  NULL,
  1,
  'Ripping out multiple rows of knitting at once. Named for the sound "rip it, rip it" (like a frog). Used when you need to undo significant work.',
  'When you''ve made a mistake several rows back or want to start over, frogging is faster than tinking. Just be careful putting stitches back on the needle.',
  '[
    {"order": 1, "instruction": "Remove your needle from the stitches."},
    {"order": 2, "instruction": "Gently pull the working yarn to unravel rows. Go slowly near your target row."},
    {"order": 3, "instruction": "Stop one row before where you need to be."},
    {"order": 4, "instruction": "Using a smaller needle, carefully pick up each live stitch."},
    {"order": 5, "instruction": "Don''t worry if stitches are twisted - you can fix that as you knit."},
    {"order": 6, "instruction": "Switch back to your regular needle and continue knitting."}
  ]'::jsonb,
  ARRAY['Use a smaller needle to pick up stitches', 'Go slowly near your target row', 'Use a lifeline next time to make this easier'],
  '[
    {"description": "Stitches are twisted when picked up", "howToAvoid": "Take time to orient each stitch correctly", "howToFix": "Knit through back loop to untwist as you go"}
  ]'::jsonb,
  ARRAY['knit-stitch'],
  ARRAY['tinking', 'dropped-stitch'],
  ARRAY['ripping out', 'ripping back', 'frogging'],
  ARRAY[],
  ARRAY['sos', 'fixing', 'beginner-friendly'],
  'common'
),

-- Tinking
(
  'Tinking',
  'tinking',
  'sos',
  NULL,
  2,
  'Un-knitting one stitch at a time ("tink" is "knit" spelled backwards). Used for undoing small mistakes without ripping out entire rows.',
  'Perfect for fixing mistakes in the current row or just a few rows back. More controlled than frogging but slower for large areas.',
  '[
    {"order": 1, "instruction": "With yarn in back for a knit stitch, insert left needle into the stitch below the one on right needle."},
    {"order": 2, "instruction": "The left needle goes from front to back into the stitch one row below."},
    {"order": 3, "instruction": "Slide the stitch off the right needle while keeping the lower stitch on left needle."},
    {"order": 4, "instruction": "Gently pull the yarn to undo the stitch."},
    {"order": 5, "instruction": "Repeat for each stitch you need to undo."}
  ]'::jsonb,
  ARRAY['Go slowly to avoid dropping stitches', 'For purl stitches, yarn in front', 'More controlled than frogging'],
  '[
    {"description": "Dropping stitches while tinking", "howToAvoid": "Make sure left needle is fully inserted before removing from right", "howToFix": "Use a crochet hook to pick up dropped stitches"}
  ]'::jsonb,
  ARRAY['knit-stitch'],
  ARRAY['frogging', 'dropped-stitch'],
  ARRAY['un-knitting', 'unknitting', 'reverse knitting'],
  ARRAY[],
  ARRAY['sos', 'fixing'],
  'common'
),

-- ============================================================================
-- FINISHING TECHNIQUES (3)
-- ============================================================================

-- Weaving in Ends
(
  'Weaving in Ends',
  'weaving-ends',
  'finishing',
  NULL,
  1,
  'Securing yarn tails by weaving them through the fabric so they don''t unravel. Essential finishing skill for any knitting project.',
  'Every time you join new yarn or finish a piece, you''ll have ends to weave in. Good technique makes them invisible and secure.',
  '[
    {"order": 1, "instruction": "Thread the yarn tail onto a tapestry needle."},
    {"order": 2, "instruction": "On the wrong side of your work, weave the needle through 4-5 stitches in one direction."},
    {"order": 3, "instruction": "Change direction and weave through 4-5 more stitches."},
    {"order": 4, "instruction": "For extra security, change direction once more and weave through a few stitches."},
    {"order": 5, "instruction": "Gently stretch the fabric, then trim the excess yarn close to the fabric."}
  ]'::jsonb,
  ARRAY['Always weave on the wrong side', 'Change direction for security', 'Don''t pull too tight or it will pucker', 'Weave through similar colors if possible'],
  '[
    {"description": "Ends poking through to right side", "howToAvoid": "Weave through the bumps of purl stitches on wrong side", "howToFix": "Re-weave more carefully on wrong side only"}
  ]'::jsonb,
  ARRAY['knit-stitch'],
  ARRAY['mattress-stitch', 'blocking'],
  ARRAY['weave in ends', 'securing ends', 'finishing ends'],
  ARRAY[],
  ARRAY['essential', 'beginner-friendly', 'finishing'],
  'very-common'
),

-- Mattress Stitch
(
  'Mattress Stitch',
  'mattress-stitch',
  'finishing',
  NULL,
  3,
  'An invisible seaming technique that joins two pieces of stockinette with an almost invisible seam on the right side.',
  'Use to seam sweater sides, sleeve seams, and anywhere you want an invisible join. Works best on stockinette stitch.',
  '[
    {"order": 1, "instruction": "Lay both pieces flat with right sides facing up, edges to be seamed side by side."},
    {"order": 2, "instruction": "Thread a tapestry needle with matching yarn."},
    {"order": 3, "instruction": "Insert needle under the bar between the first and second stitches on the right piece."},
    {"order": 4, "instruction": "Cross to the left piece and insert under the corresponding bar."},
    {"order": 5, "instruction": "Continue alternating sides, working up the seam."},
    {"order": 6, "instruction": "Every few stitches, gently pull the yarn to close the seam."},
    {"order": 7, "instruction": "The stitches should lock together and become invisible."}
  ]'::jsonb,
  ARRAY['Work with right sides facing up', 'Pull gently every few stitches', 'Pick up one bar at a time for neat results', 'Keep consistent tension'],
  '[
    {"description": "Seam is visible or puckered", "howToAvoid": "Pick up the same number of rows on each side", "howToFix": "Work more carefully, matching row for row"}
  ]'::jsonb,
  ARRAY['knit-stitch', 'weaving-ends'],
  ARRAY['weaving-ends', 'blocking'],
  ARRAY['invisible seam', 'ladder stitch seam'],
  ARRAY[],
  ARRAY['finishing', 'seaming'],
  'common'
),

-- Blocking
(
  'Blocking',
  'blocking',
  'finishing',
  NULL,
  2,
  'Wetting and shaping your finished knitting to even out stitches and achieve the correct dimensions. Makes a huge difference in the final appearance.',
  'Block all finished pieces before seaming. It evens out your stitches, opens up lace, and helps pieces match gauge.',
  '[
    {"order": 1, "instruction": "Fill a basin with lukewarm water and a drop of wool wash if desired."},
    {"order": 2, "instruction": "Submerge your knitting and let it soak for 15-20 minutes."},
    {"order": 3, "instruction": "Gently squeeze out water (don''t wring!). Roll in a towel to remove more moisture."},
    {"order": 4, "instruction": "Lay flat on blocking mats or a clean towel."},
    {"order": 5, "instruction": "Gently stretch and pin to the desired dimensions."},
    {"order": 6, "instruction": "For lace, pin out each point to open up the pattern."},
    {"order": 7, "instruction": "Let dry completely before unpinning."}
  ]'::jsonb,
  ARRAY['Use lukewarm water for wool', 'Never wring your knitting', 'Check fiber content - some fibers can''t be wet blocked', 'Pin to measurements, not just ''until it looks right'''],
  '[
    {"description": "Item dried misshapen", "howToAvoid": "Pin carefully to correct measurements", "howToFix": "Re-wet and re-block more carefully"}
  ]'::jsonb,
  ARRAY['weaving-ends'],
  ARRAY['weaving-ends', 'mattress-stitch'],
  ARRAY['wet blocking', 'steam blocking', 'finishing'],
  ARRAY[],
  ARRAY['finishing', 'essential'],
  'common'
)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  description = EXCLUDED.description,
  purpose = EXCLUDED.purpose,
  instructions = EXCLUDED.instructions,
  tips = EXCLUDED.tips,
  common_mistakes = EXCLUDED.common_mistakes,
  prerequisites = EXCLUDED.prerequisites,
  related_techniques = EXCLUDED.related_techniques,
  aliases = EXCLUDED.aliases,
  abbreviations = EXCLUDED.abbreviations,
  tags = EXCLUDED.tags,
  frequency = EXCLUDED.frequency,
  updated_at = NOW();
