import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_URL = "https://api.openai.com/v1/responses";
const MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-5.6-luna";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const tools = [
  { type:"function", name:"world_model_search", description:"Search canonical World Model entities and return grounded facts. Never invent facts that are not returned by this tool.", parameters:{ type:"object", properties:{ query:{type:"string"}, limit:{type:"integer", minimum:1, maximum:20} }, required:["query"] } },
  { type:"function", name:"world_model_neighbors", description:"Return canonical graph neighbors and typed relationships for an entity.", parameters:{ type:"object", properties:{ entity_id:{type:"string"} }, required:["entity_id"] } },
  { type:"function", name:"world_model_path", description:"Return an explainable shortest graph path between two canonical entities.", parameters:{ type:"object", properties:{ start_id:{type:"string"}, end_id:{type:"string"} }, required:["start_id","end_id"] } },
];

async function tool(name: string, args: Record<string, unknown>) {
  if (name === "world_model_search") {
    const q = String(args.query || "").trim().toLowerCase();
    const limit = Math.min(Number(args.limit || 10), 20);
    const { data } = await db.from("world_model_entities").select("id,entity_type,label,payload,source,source_ref,updated_at").or(`label.ilike.%${q}%,entity_type.ilike.%${q}%`).limit(limit);
    return { entities: data || [] };
  }
  if (name === "world_model_neighbors") {
    const id = String(args.entity_id || "");
    const { data: edges } = await db.from("world_model_edges").select("source_id,target_id,edge_type,metadata").or(`source_id.eq.${id},target_id.eq.${id}`);
    const ids = [...new Set((edges || []).flatMap((e:any) => [e.source_id, e.target_id]))];
    const { data: entities } = ids.length ? await db.from("world_model_entities").select("id,entity_type,label,payload").in("id", ids) : { data: [] };
    return { entity_id:id, edges:edges || [], entities:entities || [] };
  }
  if (name === "world_model_path") {
    const start = String(args.start_id || ""), end = String(args.end_id || "");
    const { data: edges } = await db.from("world_model_edges").select("source_id,target_id,edge_type");
    const adjacency = new Map<string, any[]>();
    for (const e of edges || []) { if (!adjacency.has(e.source_id)) adjacency.set(e.source_id, []); if (!adjacency.has(e.target_id)) adjacency.set(e.target_id, []); adjacency.get(e.source_id).push(e); adjacency.get(e.target_id).push({...e, reverse:true}); }
    const queue = [[start]], seen = new Set([start]); let path:string[] = [];
    while (queue.length) { const p = queue.shift()!; const cur = p[p.length-1]; if (cur === end) { path=p; break; } for (const e of adjacency.get(cur) || []) { const next = e.reverse ? e.source_id : e.target_id; if (!seen.has(next)) { seen.add(next); queue.push([...p,next]); } } }
    return { start, end, path, steps:path.map((id,i) => ({ entity_id:id, next:path[i+1] || null, edge:(edges || []).find((e:any) => (e.source_id===id&&e.target_id===path[i+1]) || (e.target_id===id&&e.source_id===path[i+1])) || null })) };
  }
  throw new Error(`Unknown tool ${name}`);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status:405 });
  if (!OPENAI_API_KEY) return Response.json({ error:"OPENAI_API_KEY is not configured" }, { status:503 });
  const body = await req.json();
  const query = String(body.query || "").trim();
  if (!query) return Response.json({ error:"query is required" }, { status:400 });

  const system = `You are the FEEXSYSTEMS Navigator intelligence layer. The World Model is canonical. You interpret, summarize, connect and navigate facts retrieved through tools; you do not create or replace canonical portfolio facts. When facts are needed, call the World Model tools. Explain uncertainty when the graph has no supporting evidence. Return concise, useful answers and include relationship reasoning when relevant.`;
  let input:any[] = [{ role:"user", content:query }];
  const first = await fetch(OPENAI_URL, { method:"POST", headers:{"Authorization":`Bearer ${OPENAI_API_KEY}`,"Content-Type":"application/json"}, body:JSON.stringify({ model:MODEL, instructions:system, input, tools }) });
  if (!first.ok) return Response.json({ error:`OpenAI ${first.status}`, detail:await first.text() }, { status:502 });
  let response = await first.json();
  const calls = (response.output || []).filter((x:any) => x.type === "function_call");
  if (calls.length) {
    input = [...input, ...response.output];
    for (const call of calls) {
      let args:any = {}; try { args = JSON.parse(call.arguments || "{}"); } catch {}
      const result = await tool(call.name, args);
      input.push({ type:"function_call_output", call_id:call.call_id, output:JSON.stringify(result) });
    }
    const second = await fetch(OPENAI_URL, { method:"POST", headers:{"Authorization":`Bearer ${OPENAI_API_KEY}`,"Content-Type":"application/json"}, body:JSON.stringify({ model:MODEL, instructions:system, input, tools }) });
    if (!second.ok) return Response.json({ error:`OpenAI ${second.status}`, detail:await second.text() }, { status:502 });
    response = await second.json();
  }
  const text = response.output_text || (response.output || []).filter((x:any)=>x.type === "message").flatMap((x:any)=>x.content || []).map((c:any)=>c.text || "").join(" ");
  return Response.json({ text, model:MODEL, grounded:true, output:response.output || [] });
});
