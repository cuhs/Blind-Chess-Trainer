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
    'rnbqkbnr/pppp1ppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1',
    '{"motif":"story_check","anchor":"Ke8"}'::jsonb,
    'Is the Black King in check? Type Yes or No.',
    'e.g. Yes',
    'White plays Nf3, Black plays Nc6, White plays Bc4, Black plays Nf6...',
    'e8',
    'yes-no',
    'no',
    '["Nf3","Nc6","Bc4","Nf6"]'::jsonb,
    '["e8","c4","f6","f3"]'::jsonb,
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
