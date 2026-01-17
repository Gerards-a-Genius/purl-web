-- Migration: Seed Tutorial Steps
-- Date: 2025-01-17
-- Purpose: Add interactive tutorial steps for core techniques

-- ============================================================================
-- KNIT STITCH TUTORIAL (5 steps)
-- ============================================================================

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 1, 'Hold Your Needles',
  'Hold the needle with stitches in your left hand and the empty needle in your right hand. The working yarn should be hanging at the back of your work.',
  'Find a grip that feels comfortable. There''s no single "right" way to hold needles - some people grip tightly, others loosely.'
FROM techniques t WHERE t.slug = 'knit-stitch';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 2, 'Insert the Needle',
  'Insert the right needle through the first stitch on the left needle. Go from left to right and from the front of the stitch to the back.',
  'The needle tip should poke out behind the left needle. The two needles will form an X shape with the right needle behind.'
FROM techniques t WHERE t.slug = 'knit-stitch';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 3, 'Wrap the Yarn',
  'Take the working yarn and wrap it counter-clockwise around the right needle. The yarn goes from back to front, around the needle, and back behind.',
  'Keep a bit of tension on the yarn but don''t pull it tight. The wrap should sit snugly but not squeeze the needle.'
FROM techniques t WHERE t.slug = 'knit-stitch';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 4, 'Pull Through',
  'Use the right needle to catch the wrapped yarn and pull it through the stitch. You''re bringing the new loop from the back through to the front.',
  'This takes practice! Keep the right needle tip close to the left needle as you pull through to avoid dropping the yarn.'
FROM techniques t WHERE t.slug = 'knit-stitch';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 5, 'Slide Off',
  'Gently slide the original stitch off the left needle. The new stitch you just made is now on your right needle.',
  'Don''t slide off until you''re sure the new stitch is secure on the right needle. If you drop it, use a crochet hook to pick it up!'
FROM techniques t WHERE t.slug = 'knit-stitch';

-- ============================================================================
-- PURL STITCH TUTORIAL (5 steps)
-- ============================================================================

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 1, 'Position the Yarn',
  'Before starting, bring the working yarn to the front of your work, between the two needles. This is essential for purling!',
  'If you forget this step, you''ll accidentally knit instead of purl. Make it a habit to check yarn position first.'
FROM techniques t WHERE t.slug = 'purl-stitch';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 2, 'Insert the Needle',
  'Insert the right needle through the first stitch on the left needle. Go from right to left and from the back to the front of the stitch.',
  'This is the opposite direction from knitting. The needle tip will point toward you when it comes through.'
FROM techniques t WHERE t.slug = 'purl-stitch';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 3, 'Wrap the Yarn',
  'Wrap the yarn counter-clockwise around the right needle, just like in knitting. The yarn goes over the top and around.',
  'The wrapping motion is the same as knitting - only the needle insertion and yarn position are different.'
FROM techniques t WHERE t.slug = 'purl-stitch';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 4, 'Pull Through',
  'Push the right needle backward through the stitch, bringing the wrapped yarn with it. You''re creating a new loop on the right needle.',
  'The motion feels like scooping backward. It can feel awkward at first but becomes natural with practice.'
FROM techniques t WHERE t.slug = 'purl-stitch';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 5, 'Complete the Stitch',
  'Slide the old stitch off the left needle. One purl stitch complete! The bump will show on the side facing you.',
  'As you work across a row, you''ll see a row of purl bumps forming on your side of the work.'
FROM techniques t WHERE t.slug = 'purl-stitch';

-- ============================================================================
-- LONG TAIL CAST ON TUTORIAL (7 steps)
-- ============================================================================

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 1, 'Measure Your Tail',
  'Estimate about 1 inch of tail for each stitch you need, plus 6 extra inches. Make a slip knot at this point and place it on your needle.',
  'When in doubt, leave MORE tail than you think you need. Running out mid-cast-on is frustrating!'
FROM techniques t WHERE t.slug = 'long-tail-cast-on';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 2, 'Position Your Hands',
  'Hold the needle in your right hand. Drape the tail over your left thumb and the working yarn over your left index finger. Hold both strands in your palm.',
  'This is called the "slingshot" position. Your thumb and finger should form a V shape with yarn draped over each.'
FROM techniques t WHERE t.slug = 'long-tail-cast-on';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 3, 'Enter the Thumb Loop',
  'Insert the needle up through the loop on your thumb, going from the bottom toward the top.',
  'The needle goes UNDER the yarn on the front of your thumb and UP through the loop.'
FROM techniques t WHERE t.slug = 'long-tail-cast-on';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 4, 'Grab the Finger Yarn',
  'Swing the needle over to catch the yarn on your index finger. Hook it and bring it toward you.',
  'You''re essentially "picking up" the yarn from your finger with the needle tip.'
FROM techniques t WHERE t.slug = 'long-tail-cast-on';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 5, 'Pull Through',
  'Bring the yarn you just grabbed back through the thumb loop. Pull it all the way through.',
  'This creates your new stitch on the needle.'
FROM techniques t WHERE t.slug = 'long-tail-cast-on';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 6, 'Drop and Tighten',
  'Drop the loop from your thumb and gently pull both strands to tighten the new stitch on your needle.',
  'Don''t pull too tight - you want some give for when you knit into these stitches later.'
FROM techniques t WHERE t.slug = 'long-tail-cast-on';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 7, 'Reset and Repeat',
  'Reposition your thumb and finger into the slingshot position and repeat from step 3 until you have all your stitches.',
  'The motion becomes rhythmic with practice. Try saying "under, over, through, drop" as you go!'
FROM techniques t WHERE t.slug = 'long-tail-cast-on';

-- ============================================================================
-- BASIC BIND OFF TUTORIAL (6 steps)
-- ============================================================================

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 1, 'Knit Two Stitches',
  'Start by knitting the first two stitches of your row as you normally would. You now have 2 stitches on your right needle.',
  'These first two stitches are just regular knit stitches - nothing special yet!'
FROM techniques t WHERE t.slug = 'basic-bind-off';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 2, 'Lift the First Stitch',
  'Insert your left needle into the first stitch you knitted (the one furthest from the tip of the right needle).',
  'You''re going to pass this stitch OVER the second stitch.'
FROM techniques t WHERE t.slug = 'basic-bind-off';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 3, 'Pass It Over',
  'Lift the first stitch up and over the second stitch, then off the needle entirely. One stitch bound off!',
  'Only one stitch should remain on your right needle after this step.'
FROM techniques t WHERE t.slug = 'basic-bind-off';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 4, 'Knit the Next Stitch',
  'Knit one more stitch from the left needle. You again have 2 stitches on your right needle.',
  'This is the rhythm: knit one, pass the old stitch over, knit one, pass over...'
FROM techniques t WHERE t.slug = 'basic-bind-off';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 5, 'Continue the Pattern',
  'Repeat steps 2-4: lift the first stitch over the second stitch and off the needle, then knit the next stitch.',
  'Keep your tension relaxed. A too-tight bind off is one of the most common beginner issues.'
FROM techniques t WHERE t.slug = 'basic-bind-off';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 6, 'Fasten Off',
  'When only one stitch remains, cut the yarn leaving a 6-inch tail. Pull the tail through the last stitch to secure it.',
  'Give it a gentle tug to make sure it''s snug. This tail will be woven in later.'
FROM techniques t WHERE t.slug = 'basic-bind-off';

-- ============================================================================
-- K2TOG TUTORIAL (4 steps)
-- ============================================================================

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 1, 'Position Your Needle',
  'Work to where you need the decrease. Look at the next two stitches on your left needle - these will become one.',
  'K2tog is just like a regular knit stitch, but through two stitches at once.'
FROM techniques t WHERE t.slug = 'k2tog';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 2, 'Insert Through Both',
  'Insert your right needle through BOTH of the next two stitches at once, as if you were going to knit them together.',
  'Go from left to right, front to back - the same as a regular knit stitch, just through two loops instead of one.'
FROM techniques t WHERE t.slug = 'k2tog';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 3, 'Wrap and Pull Through',
  'Wrap the yarn counter-clockwise around your needle and pull through both stitches, creating one new stitch.',
  'This is exactly the same wrapping motion as a regular knit stitch.'
FROM techniques t WHERE t.slug = 'k2tog';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 4, 'Complete the Decrease',
  'Slide both old stitches off the left needle. You''ve decreased from 2 stitches to 1! The decrease leans to the right.',
  'The right stitch ends up on top, which is why the decrease slants to the right.'
FROM techniques t WHERE t.slug = 'k2tog';

-- ============================================================================
-- SSK TUTORIAL (5 steps)
-- ============================================================================

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 1, 'Slip the First Stitch',
  'Insert your right needle into the next stitch as if to knit (knitwise), but instead of knitting, just slip it from left to right needle.',
  'Slipping knitwise reorients the stitch - this is important for the final result!'
FROM techniques t WHERE t.slug = 'ssk';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 2, 'Slip the Second Stitch',
  'Slip the next stitch knitwise as well. You now have two slipped stitches on your right needle.',
  'Both stitches must be slipped knitwise. This sets them up to lean left when knitted together.'
FROM techniques t WHERE t.slug = 'ssk';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 3, 'Insert Left Needle',
  'Insert your left needle through the front of both slipped stitches, going from left to right.',
  'The left needle goes through both stitches at once, entering from the left side.'
FROM techniques t WHERE t.slug = 'ssk';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 4, 'Knit Them Together',
  'With the left needle holding both stitches, wrap your yarn and knit them together as one stitch.',
  'This is essentially knitting through the back loop of both stitches at once.'
FROM techniques t WHERE t.slug = 'ssk';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 5, 'See the Left Lean',
  'Drop the stitches from the left needle. You''ve created a left-leaning decrease that mirrors K2tog!',
  'Use SSK and K2tog together for symmetrical shaping, like on either side of a neckline.'
FROM techniques t WHERE t.slug = 'ssk';

-- ============================================================================
-- WEAVING IN ENDS TUTORIAL (5 steps)
-- ============================================================================

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 1, 'Thread the Needle',
  'Thread your yarn tail onto a tapestry needle (also called a yarn needle or darning needle). These have a blunt tip and large eye.',
  'If your yarn is fuzzy, wet the end slightly and twist it to a point for easier threading.'
FROM techniques t WHERE t.slug = 'weaving-ends';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 2, 'Work on the Wrong Side',
  'Turn your work to the wrong side (the bumpy purl side of stockinette). All weaving should be done here so it''s invisible.',
  'If your fabric is reversible like garter stitch, pick the less visible side or follow the yarn path.'
FROM techniques t WHERE t.slug = 'weaving-ends';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 3, 'Weave in One Direction',
  'Weave the needle through 4-5 stitches horizontally, going under the bumps of the purl stitches.',
  'Don''t pull too tight or the fabric will pucker. Keep the same tension as your knitting.'
FROM techniques t WHERE t.slug = 'weaving-ends';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 4, 'Change Direction',
  'Turn and weave back in the opposite direction through 3-4 more stitches. This locks the end in place.',
  'Changing direction prevents the end from working loose during washing or wearing.'
FROM techniques t WHERE t.slug = 'weaving-ends';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 5, 'Trim the Excess',
  'Stretch the fabric gently to set the stitches, then trim the tail close to the surface with sharp scissors.',
  'Leave just a tiny bit - if you cut too close, the end might pop through to the right side.'
FROM techniques t WHERE t.slug = 'weaving-ends';

-- ============================================================================
-- GARTER STITCH TUTORIAL (4 steps)
-- ============================================================================

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 1, 'Cast On',
  'Cast on the desired number of stitches using any cast-on method. Long tail cast on works great for garter stitch.',
  'Garter stitch looks the same with any number of stitches, so pick whatever your pattern calls for.'
FROM techniques t WHERE t.slug = 'garter-stitch';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 2, 'Knit Every Stitch',
  'Knit across every stitch in the row. That''s it - no purling required!',
  'Garter stitch is perfect for beginners because you only need to know one stitch.'
FROM techniques t WHERE t.slug = 'garter-stitch';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 3, 'Turn and Repeat',
  'At the end of the row, turn your work around and knit every stitch across again.',
  'You''ll notice ridges forming - each ridge represents 2 rows of knitting.'
FROM techniques t WHERE t.slug = 'garter-stitch';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 4, 'Continue Forever',
  'Keep knitting every row until your piece is the desired length. Bind off when done.',
  'Count ridges (not rows) for easier measuring. Each ridge = 2 rows.'
FROM techniques t WHERE t.slug = 'garter-stitch';

-- ============================================================================
-- STOCKINETTE TUTORIAL (4 steps)
-- ============================================================================

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 1, 'Row 1: Knit',
  'With the right side (smooth side) facing you, knit every stitch across the row.',
  'This is your "right side" row - you''ll see the smooth V-shaped stitches forming.'
FROM techniques t WHERE t.slug = 'stockinette-stitch';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 2, 'Turn Your Work',
  'At the end of the row, turn your work so the other side faces you. The purl bumps are now visible.',
  'The bumpy side is called the "wrong side" - it faces the inside of most garments.'
FROM techniques t WHERE t.slug = 'stockinette-stitch';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 3, 'Row 2: Purl',
  'With the wrong side facing you, purl every stitch across the row.',
  'Purling on the wrong side creates knit stitches on the right side. It''s all connected!'
FROM techniques t WHERE t.slug = 'stockinette-stitch';

INSERT INTO technique_steps (technique_id, step_number, title, instruction, detailed_tip)
SELECT t.id, 4, 'Alternate Rows',
  'Continue alternating: knit on the right side, purl on the wrong side. This creates classic stockinette fabric.',
  'Remember: stockinette curls at the edges. Plan to add a border of ribbing or garter stitch if you need flat edges.'
FROM techniques t WHERE t.slug = 'stockinette-stitch';
