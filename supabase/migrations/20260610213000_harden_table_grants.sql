-- Defense in depth: Supabase default privileges grant ALL on new public tables
-- to anon/authenticated. RLS already denies row DML without policies, but
-- TRUNCATE is not subject to RLS and anon needs no table access at all
-- (the app always runs as `authenticated` via anonymous sign-in).
revoke all on public.profiles, public.heatmap_ledger, public.puzzle_bank
  from anon, authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.heatmap_ledger to authenticated;
grant select on public.puzzle_bank to authenticated;
