-- Phase III-E: canonical World Model persistence + pgvector retrieval.
create extension if not exists vector;

create table if not exists world_model_entities (
  id text primary key,
  entity_type text not null,
  label text not null,
  payload jsonb not null default '{}'::jsonb,
  source text,
  source_ref text,
  updated_at timestamptz not null default now()
);

create table if not exists world_model_edges (
  id bigserial primary key,
  source_id text not null references world_model_entities(id) on delete cascade,
  target_id text not null references world_model_entities(id) on delete cascade,
  edge_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  unique(source_id, target_id, edge_type)
);

create table if not exists world_model_documents (
  id bigserial primary key,
  entity_id text references world_model_entities(id) on delete cascade,
  repository_id text,
  path text,
  sha text,
  content text,
  metadata jsonb not null default '{}'::jsonb,
  content_hash text,
  updated_at timestamptz not null default now(),
  unique(repository_id, path, sha)
);

create table if not exists world_model_embeddings (
  id bigserial primary key,
  entity_id text references world_model_entities(id) on delete cascade,
  document_id bigint references world_model_documents(id) on delete cascade,
  chunk_index integer not null default 0,
  content text not null,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists world_model_entities_type_idx on world_model_entities(entity_type);
create index if not exists world_model_edges_source_idx on world_model_edges(source_id);
create index if not exists world_model_edges_target_idx on world_model_edges(target_id);
create index if not exists world_model_documents_repo_idx on world_model_documents(repository_id);
create index if not exists world_model_embeddings_entity_idx on world_model_embeddings(entity_id);
create index if not exists world_model_embeddings_vector_idx on world_model_embeddings using hnsw (embedding vector_cosine_ops);

create or replace function match_world_model_embeddings(query_embedding vector(1536), match_count int default 8)
returns table(id bigint, entity_id text, document_id bigint, content text, similarity float)
language sql stable
as $$
  select e.id, e.entity_id, e.document_id, e.content, 1 - (e.embedding <=> query_embedding) as similarity
  from world_model_embeddings e
  where e.embedding is not null
  order by e.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

alter table world_model_entities enable row level security;
alter table world_model_edges enable row level security;
alter table world_model_documents enable row level security;
alter table world_model_embeddings enable row level security;

create policy "public read world model entities" on world_model_entities for select using (true);
create policy "public read world model edges" on world_model_edges for select using (true);
create policy "public read world model documents" on world_model_documents for select using (true);
create policy "public read world model embeddings" on world_model_embeddings for select using (true);
