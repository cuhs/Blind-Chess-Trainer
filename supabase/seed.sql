insert into public.puzzle_bank (
  slug,
  fen,
  motif_json,
  nlp_prompt,
  input_placeholder,
  subtitle,
  answer_square,
  answer_type,
  expected_answer,
  moves,
  squares_touched,
  source,
  is_active
)
values
  (
    'drill-pin-knight',
    '8/8/4k3/3n4/2B5/8/8/4K3 w - - 0 1',
    '{"motif":"pin","attacker":"Bc4","target":"Nd5","pinned_to":"Ke6"}'::jsonb,
    'What square is the pinned knight on?',
    'e.g. a8',
    null,
    'd5',
    'square',
    'd5',
    '[]'::jsonb,
    '["d5","c4","e6"]'::jsonb,
    'daily',
    true
  ),
  (
    'drill-story-check',
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    '{"motif":"story_check","anchor":"Ke8"}'::jsonb,
    'Is the Black King in check?',
    'e.g. Yes',
    null,
    'e8',
    'yes-no',
    'no',
    '["e4","e5","Nf3","Nc6","Bc4","Nf6"]'::jsonb,
    '["e8","e4","e5","f3","c6","c4","f6"]'::jsonb,
    'daily',
    true
  ),
  (
    'drill-pin-bishop',
    '8/8/4k3/3n4/2B5/8/8/4K3 w - - 0 1',
    '{"motif":"pin","attacker":"Bc4","target":"Nd5","pinned_to":"Ke6"}'::jsonb,
    'What square is the pinning bishop on?',
    'e.g. a8',
    null,
    'c4',
    'square',
    'c4',
    '[]'::jsonb,
    '["c4","d5","e6"]'::jsonb,
    'daily',
    true
  ),
  (
    'drill-fork-knight',
    'k7/8/8/8/3N4/8/2q1r3/K7 w - - 0 1',
    '{"motif":"fork","attacker":"Nd4","target":"Qc2","square":"d4"}'::jsonb,
    'What square is the knight fork on?',
    'e.g. a8',
    null,
    'd4',
    'square',
    'd4',
    '[]'::jsonb,
    '["d4","c2","e2"]'::jsonb,
    'daily',
    true
  ),
  (
    'drill-skewer-rook',
    '4k3/8/3r4/8/8/3K4/3B4/8 w - - 0 1',
    '{"motif":"skewer","attacker":"Rd6","target":"Kd3","square":"d2"}'::jsonb,
    'What square is the White King on?',
    'e.g. a8',
    null,
    'd3',
    'square',
    'd3',
    '[]'::jsonb,
    '["d6","d3","d2"]'::jsonb,
    'daily',
    true
  ),
  (
    'drill-discovered-bishop',
    '4k3/6q1/8/8/3P4/8/1B6/4K3 w - - 0 1',
    '{"motif":"discovered_attack","attacker":"Bb2","target":"Qg7","square":"d5"}'::jsonb,
    'What square does the White Bishop attack from?',
    'e.g. a8',
    null,
    'b2',
    'square',
    'b2',
    '["d5"]'::jsonb,
    '["b2","g7","d5"]'::jsonb,
    'daily',
    true
  ),
  (
    'drill-hanging-king',
    '4k3/8/8/8/8/8/4r3/4K3 w - - 0 1',
    '{"motif":"hanging_piece","attacker":"Re2","target":"Ke1","square":"e1"}'::jsonb,
    'The White King is in check — what square is it on?',
    'e.g. a8',
    null,
    'e1',
    'square',
    'e1',
    '[]'::jsonb,
    '["e1","e2"]'::jsonb,
    'daily',
    true
  )
on conflict (slug) do update
set
  fen = excluded.fen,
  motif_json = excluded.motif_json,
  nlp_prompt = excluded.nlp_prompt,
  input_placeholder = excluded.input_placeholder,
  subtitle = excluded.subtitle,
  answer_square = excluded.answer_square,
  answer_type = excluded.answer_type,
  expected_answer = excluded.expected_answer,
  moves = excluded.moves,
  squares_touched = excluded.squares_touched,
  source = excluded.source,
  is_active = excluded.is_active,
  updated_at = now();

-- TODO(content): Import the remaining 47 hand-curated Story of the Position
-- rows here once the curated FEN/prompt/answer set is provided.

-- Authoring audio (story) puzzles — rows with a non-empty moves[] array:
--
--   Pattern A — narration only (blank screen):
--     fen   = standard start position
--     moves = legal SAN sequence from the start (3–5 moves reads well)
--     The app skips the board and reads the moves aloud. Works because
--     every player knows the starting position.
--
--   Pattern B — memorize, then narrate:
--     fen   = any custom position (the BASE position, before moves)
--     moves = short legal SAN continuation (1–2 plies)
--     The app shows the base board for 5s, hides it, reads the moves,
--     then asks the question about the resulting position.
--
--   Rules:
--   - moves[] must be legal from fen (validated by chess-core fixtures).
--   - subtitle must NOT mention the moves — it shows during memorize.
--   - expected_answer refers to the position AFTER moves are applied.
--   - Peek shows the BASE position, never the post-move position.
--   - Mirror each row in packages/chess-core/src/motifs/fixtures/
--     puzzle-bank-fixtures.json and run `npm run validate:puzzles`.
