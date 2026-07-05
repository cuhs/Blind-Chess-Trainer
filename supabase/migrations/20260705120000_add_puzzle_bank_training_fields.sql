alter table public.puzzle_bank
  add column if not exists puzzle_kind text,
  add column if not exists training_node_id text;

create index if not exists puzzle_bank_training_node_idx
  on public.puzzle_bank (training_node_id)
  where training_node_id is not null;
