import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const MODEL = Deno.env.get("OPENAI_EMBEDDING_MODEL") || "text-embedding-3-small";
const CHUNK = 7000;

function chunks(text:string) { const out=[]; for(let i=0;i<text.length;i+=CHUNK) out.push(text.slice(i,i+CHUNK)); return out; }

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", {status:405});
  if (!OPENAI_API_KEY) return Response.json({ error:"OPENAI_API_KEY is not configured" }, {status:503});
  const body = await req.json();
  const documents = Array.isArray(body.documents) ? body.documents : [];
  if (!documents.length) return Response.json({ inserted:0 });
  let inserted = 0;
  for (const doc of documents.slice(0, 100)) {
    const source = String(doc.content || doc.text || '');
    const { data: document, error: documentError } = await db.from("world_model_documents").upsert({ entity_id:doc.entity_id || null, repository_id:doc.repository_id || null, path:doc.path || null, sha:doc.sha || null, content:source, content_hash:`${doc.repository_id || ''}:${doc.path || ''}:${doc.sha || ''}`, updated_at:new Date().toISOString() }, { onConflict:"repository_id,path,sha" }).select('id').single();
    if (documentError || !document) continue;
    const parts = chunks(source);
    for (let i=0;i<parts.length;i++) {
      const content = parts[i];
      const emb = await fetch("https://api.openai.com/v1/embeddings", { method:"POST", headers:{"Authorization":`Bearer ${OPENAI_API_KEY}`,"Content-Type":"application/json"}, body:JSON.stringify({model:MODEL,input:content,dimensions:1536}) });
      if (!emb.ok) continue;
      const embedding = (await emb.json()).data?.[0]?.embedding;
      if (!embedding) continue;
      const { error } = await db.from("world_model_embeddings").upsert({ entity_id:doc.entity_id || null, document_id:document.id, chunk_index:i, content, embedding, metadata:{repository_id:doc.repository_id,path:doc.path,sha:doc.sha}, created_at:new Date().toISOString() }, { onConflict:"entity_id,document_id,chunk_index" });
      if (!error) inserted++;
    }
  }
  return Response.json({ inserted, model:MODEL });
});
