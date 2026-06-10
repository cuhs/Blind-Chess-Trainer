-- Idempotent heatmap sync: clients tag each ledger event with a stable id so
-- retried flushes (network failures, concurrent hook instances) never double-count.
alter table public.heatmap_ledger
  add column if not exists client_event_id text
  check (client_event_id is null or char_length(client_event_id) between 1 and 64);

-- Nullable column keeps legacy rows valid; NULLs never conflict under a unique index.
create unique index if not exists heatmap_ledger_user_client_event_idx
  on public.heatmap_ledger (user_id, client_event_id);
