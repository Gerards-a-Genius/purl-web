-- Migration: Seed Quiz Questions
-- Date: 2025-01-17
-- Purpose: Add comprehension quiz questions for essential techniques

-- ============================================================================
-- KNIT STITCH QUIZ (3 questions)
-- ============================================================================

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'Where should the working yarn be held when making a knit stitch?',
  ARRAY['In front of your work', 'At the back of your work', 'Over your left shoulder', 'It doesn''t matter'],
  1,
  'When knitting, the working yarn should always be held at the BACK of your work. This ensures the yarn wraps correctly around the needle and creates proper knit stitches.'
FROM techniques t WHERE t.slug = 'knit-stitch';

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'How do you insert the needle for a knit stitch?',
  ARRAY['Right to left, back to front', 'Left to right, front to back', 'Left to right, back to front', 'Right to left, front to back'],
  1,
  'For a knit stitch, insert the right needle from LEFT to RIGHT and from FRONT to BACK through the stitch. This is sometimes called going into the stitch "knitwise."'
FROM techniques t WHERE t.slug = 'knit-stitch';

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'In which direction do you wrap the yarn around the needle when knitting?',
  ARRAY['Clockwise (toward you)', 'Counter-clockwise (away from you)', 'It varies by project', 'Alternating directions'],
  1,
  'Always wrap the yarn COUNTER-CLOCKWISE (away from you) around the needle. Wrapping in the wrong direction creates twisted stitches.'
FROM techniques t WHERE t.slug = 'knit-stitch';

-- ============================================================================
-- PURL STITCH QUIZ (3 questions)
-- ============================================================================

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'Where should the working yarn be held when making a purl stitch?',
  ARRAY['At the back of your work', 'In front of your work', 'Over the right needle', 'Under the left needle'],
  1,
  'When purling, the working yarn must be held at the FRONT of your work. This is the opposite of knitting and is essential for the purl stitch to form correctly.'
FROM techniques t WHERE t.slug = 'purl-stitch';

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'How do you insert the needle for a purl stitch?',
  ARRAY['Left to right, front to back', 'Right to left, back to front', 'Left to right, back to front', 'Right to left, front to back'],
  1,
  'For a purl stitch, insert the right needle from RIGHT to LEFT and from BACK to FRONT through the stitch. This is the opposite direction from knitting.'
FROM techniques t WHERE t.slug = 'purl-stitch';

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'What does the purl side of stockinette fabric look like?',
  ARRAY['Smooth V-shapes', 'Bumpy horizontal ridges', 'Twisted cables', 'Holes like lace'],
  1,
  'The purl side (wrong side) of stockinette fabric shows bumpy horizontal ridges. These are the "purl bumps" that form when you purl or when you look at the back of knit stitches.'
FROM techniques t WHERE t.slug = 'purl-stitch';

-- ============================================================================
-- LONG TAIL CAST ON QUIZ (2 questions)
-- ============================================================================

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'How much tail should you leave for a long tail cast on?',
  ARRAY['About 1 inch total', 'About 1 inch per stitch plus extra', 'Exactly 6 inches', 'The length of your forearm'],
  1,
  'A good rule of thumb is about 1 inch of tail per stitch you need to cast on, plus 6 extra inches for weaving in. Running out of tail is a common frustration!'
FROM techniques t WHERE t.slug = 'long-tail-cast-on';

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'What type of edge does the long tail cast on create?',
  ARRAY['Very tight and rigid', 'Stretchy and elastic', 'Loose and floppy', 'Decorative lace-like'],
  1,
  'The long tail cast on creates a stretchy, elastic edge that works well for most projects. This is one reason it''s the most popular cast-on method.'
FROM techniques t WHERE t.slug = 'long-tail-cast-on';

-- ============================================================================
-- K2TOG QUIZ (2 questions)
-- ============================================================================

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'Which direction does the K2tog decrease lean?',
  ARRAY['Left', 'Right', 'Straight down', 'It alternates'],
  1,
  'K2tog creates a RIGHT-leaning decrease. The right stitch ends up on top of the left stitch, causing it to slant to the right.'
FROM techniques t WHERE t.slug = 'k2tog';

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'What is the mirror-image decrease of K2tog?',
  ARRAY['P2tog', 'SSK', 'KFB', 'YO'],
  1,
  'SSK (slip, slip, knit) is the mirror image of K2tog. SSK leans LEFT while K2tog leans RIGHT. They are often used together for symmetrical shaping.'
FROM techniques t WHERE t.slug = 'k2tog';

-- ============================================================================
-- SSK QUIZ (2 questions)
-- ============================================================================

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'How should you slip the stitches in an SSK?',
  ARRAY['Both purlwise', 'Both knitwise', 'First knitwise, second purlwise', 'First purlwise, second knitwise'],
  1,
  'Both stitches should be slipped KNITWISE. This reorients them so that when you knit them together, they lean to the left properly.'
FROM techniques t WHERE t.slug = 'ssk';

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'Which direction does the SSK decrease lean?',
  ARRAY['Right', 'Left', 'Vertical', 'Depends on yarn weight'],
  1,
  'SSK creates a LEFT-leaning decrease. This makes it the perfect partner for K2tog when you need symmetrical decreases on either side of a center point.'
FROM techniques t WHERE t.slug = 'ssk';

-- ============================================================================
-- BASIC BIND OFF QUIZ (2 questions)
-- ============================================================================

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'What is a common problem with the basic bind off?',
  ARRAY['It''s too stretchy', 'It can be too tight', 'It leaves holes', 'It won''t stay secure'],
  1,
  'The basic bind off can often be too tight, especially for necklines and cuffs that need to stretch. Using a larger needle or the stretchy bind off can help.'
FROM techniques t WHERE t.slug = 'basic-bind-off';

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'How do you secure the last stitch when binding off?',
  ARRAY['Leave it on the needle', 'Cut the yarn and pull through the stitch', 'Tie a knot', 'Sew it to the edge'],
  1,
  'After binding off all stitches except the last one, cut the yarn leaving a 6-inch tail, then pull the tail completely through the last stitch to secure it.'
FROM techniques t WHERE t.slug = 'basic-bind-off';

-- ============================================================================
-- GARTER STITCH QUIZ (2 questions)
-- ============================================================================

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'How do you create garter stitch when knitting flat?',
  ARRAY['Alternate knit and purl rows', 'Knit every row', 'Purl every row', 'Knit 2, purl 2'],
  1,
  'Garter stitch is created by knitting EVERY row when working flat. You never purl! (You could also purl every row for the same result.)'
FROM techniques t WHERE t.slug = 'garter-stitch';

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'How many rows of knitting create one "ridge" in garter stitch?',
  ARRAY['1 row', '2 rows', '3 rows', '4 rows'],
  1,
  'Every 2 rows of knitting creates one visible ridge in garter stitch. So if you count ridges, multiply by 2 to get the number of rows.'
FROM techniques t WHERE t.slug = 'garter-stitch';

-- ============================================================================
-- STOCKINETTE QUIZ (2 questions)
-- ============================================================================

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'What is a characteristic problem with stockinette stitch?',
  ARRAY['It''s too thick', 'The edges curl', 'It uses too much yarn', 'It''s difficult to seam'],
  1,
  'Stockinette naturally curls at the edges - the sides curl to the back and the top/bottom curl to the front. This is because of the uneven tension between knit and purl stitches.'
FROM techniques t WHERE t.slug = 'stockinette-stitch';

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'How do you create stockinette in the round?',
  ARRAY['Alternate knit and purl rounds', 'Knit every round', 'Purl every round', 'Knit 1, purl 1 every round'],
  1,
  'When knitting in the round, you only need to KNIT every round to create stockinette. This is because you''re always on the right side of the fabric!'
FROM techniques t WHERE t.slug = 'stockinette-stitch';

-- ============================================================================
-- KFB QUIZ (2 questions)
-- ============================================================================

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'What is the visible characteristic of a KFB increase?',
  ARRAY['A small hole', 'A horizontal bar', 'An invisible seam', 'A twisted stitch'],
  1,
  'KFB leaves a small horizontal bar at the base of the increase. Some knitters use this decoratively; others prefer invisible increases like M1L/M1R.'
FROM techniques t WHERE t.slug = 'kfb';

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'In KFB, which loop do you knit into second?',
  ARRAY['The front loop again', 'The back loop', 'A yarn over', 'The stitch below'],
  1,
  'After knitting through the front loop normally, you swing around and knit through the BACK loop of the same stitch before sliding it off the needle.'
FROM techniques t WHERE t.slug = 'kfb';

-- ============================================================================
-- YARN OVER QUIZ (2 questions)
-- ============================================================================

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'What does a yarn over create in your knitting?',
  ARRAY['A decrease', 'A decorative hole', 'Extra thickness', 'A twisted stitch'],
  1,
  'A yarn over creates a decorative hole (eyelet) in your knitting. This is intentional and is the basis for lace knitting patterns.'
FROM techniques t WHERE t.slug = 'yarn-over';

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'In lace knitting, yarn overs are usually paired with what?',
  ARRAY['Another yarn over', 'A decrease', 'A cable', 'A slip stitch'],
  1,
  'In lace, yarn overs (which add a stitch) are usually paired with a decrease (which removes a stitch) to maintain the stitch count while creating the lace pattern.'
FROM techniques t WHERE t.slug = 'yarn-over';

-- ============================================================================
-- DROPPED STITCH QUIZ (2 questions)
-- ============================================================================

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'What tool is most helpful for fixing dropped stitches?',
  ARRAY['A tapestry needle', 'A crochet hook', 'Scissors', 'A cable needle'],
  1,
  'A crochet hook is the perfect tool for picking up dropped stitches. Use it to grab the stitch and pull it through each ladder rung above.'
FROM techniques t WHERE t.slug = 'dropped-stitch';

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'What are the horizontal bars above a dropped stitch called?',
  ARRAY['Rungs', 'Ladders', 'Rails', 'Bars'],
  1,
  'The horizontal strands of yarn above a dropped stitch are called "ladders" because they look like rungs of a ladder. You climb back up these ladders when fixing the stitch.'
FROM techniques t WHERE t.slug = 'dropped-stitch';

-- ============================================================================
-- BLOCKING QUIZ (2 questions)
-- ============================================================================

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'What should you NEVER do when blocking?',
  ARRAY['Use lukewarm water', 'Pin your work flat', 'Wring out your knitting', 'Let it dry completely'],
  2,
  'Never wring or twist your knitting! This can damage the fibers and distort your stitches. Instead, gently squeeze out water and roll in a towel.'
FROM techniques t WHERE t.slug = 'blocking';

INSERT INTO quiz_questions (technique_id, question, options, correct_index, explanation)
SELECT
  t.id,
  'Why is blocking important for lace knitting?',
  ARRAY['It adds warmth', 'It opens up the lace pattern', 'It makes it smaller', 'It removes yarn overs'],
  1,
  'Blocking is essential for lace because it opens up and stretches the lace pattern, revealing the full beauty of the design. Unblocked lace often looks crumpled.'
FROM techniques t WHERE t.slug = 'blocking';
