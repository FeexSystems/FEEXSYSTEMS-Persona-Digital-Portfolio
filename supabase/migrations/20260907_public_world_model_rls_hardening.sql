-- Public World Model hardening.
-- The public browser needs entity/relationship projections only.
-- Documents and embeddings remain server-side retrieval material and are not
-- directly readable by anonymous clients. Service-role Edge Functions bypass RLS.

drop policy if exists "public read world model documents" on public.world_model_documents;
drop policy if exists "public read world model embeddings" on public.world_model_embeddings;

create policy "authenticated read world model documents"
  on public.world_model_documents
  for select
  to authenticated
  using (true);

create policy "authenticated read world model embeddings"
  on public.world_model_embeddings
  for select
  to authenticated
  using (true);
