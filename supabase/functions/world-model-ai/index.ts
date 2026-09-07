import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_URL = "https://api.openai.com/v1/responses";
const EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
const MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-5.6-luna";
const EMBEDDING_MODEL = Deno.env.get("OPENAI_EMBEDDING_MODEL") || "text-embedding-3-small";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const MAX_QUERY_LENGTH = 1000;
const requestBuckets = new Map<string, { startedAt:number; count:number }>();
const allowedOrigins = new Set((Deno.env.get("ALLOWED_ORIGINS") || "https://feexsystems.codes,https://www.feexsystems.codes").split(",").map(x=>x.trim()).filter(Boolean));

function json(data:unknown,status=200,origin?:string){
  const headers = new Headers({"Content-Type":"application/json","Cache-Control":"no-store"});
  if (origin && allowedOrigins.has(origin)) { headers.set("Access-Control-Allow-Origin",origin); headers.set("Vary","Origin"); }
  return new Response(JSON.stringify(data),{status,headers});
}
function clientKey(req:Request){ return req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anonymous"; }
function rateLimited(key:string){
  const now=Date.now(); const current=requestBuckets.get(key);
  if(!current || now-current.startedAt>=WINDOW_MS){requestBuckets.set(key,{startedAt:now,count:1});return false;}
  current.count+=1; return current.count>MAX_REQUESTS_PER_WINDOW;
}

const tools = [
  { type:"function", name:"world_model_search", description:"Search canonical World Model entities and return grounded facts. Never invent facts that are not returned by this tool.", parameters:{ type:"object", properties:{ query:{type:"string"}, limit:{type:"integer", minimum:1, maximum:20} }, required:["query"] } },
  { type:"function", name:"world_model_vector_search", description:"Run semantic vector retrieval over repository documents stored in pgvector.", parameters:{ type:"object", properties:{ query:{type:"string"}, limit:{type:"integer", minimum:1, maximum:12} }, required:["query"] } },
  { type:"function", name:"world_model_neighbors", description:"Return canonical graph neighbors and typed relationships for an entity.", parameters:{ type:"object", properties:{ entity_id:{type:"string"} }, required:["entity_id"] } },
  { type:"function", name:"world_model_path", description:"Return an explainable shortest graph path between two canonical entities.", parameters:{ type:"object", properties:{ start_id:{type:"string"}, end_id:{type:"string"} }, required:["start_id","end_id"] } },
];

async function tool(name:string,args:Record<string,unknown>){
  if(name==="world_model_search"){const q=String(args.query||"").trim();const limit=Math.min(Number(args.limit||10),20);const [{data:labels},{data:types}]=await Promise.all([db.from("world_model_entities").select("id,entity_type,label,payload,source,source_ref,updated_at").ilike("label",`%${q}%`).limit(limit),db.from("world_model_entities").select("id,entity_type,label,payload,source,source_ref,updated_at").ilike("entity_type",`%${q}%`).limit(limit)]);const entities=[...new Map([...(labels||[]),...(types||[])].map((x:any)=>[x.id,x])).values()].slice(0,limit);return {entities};}
  if(name==="world_model_vector_search"){const query=String(args.query||"").trim();const limit=Math.min(Number(args.limit||8),12);const emb=await fetch(EMBEDDINGS_URL,{method:"POST",headers:{"Authorization":`Bearer ${OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:EMBEDDING_MODEL,input:query,dimensions:1536})});if(!emb.ok)return {error:`Embedding service ${emb.status}`};const vector=(await emb.json()).data?.[0]?.embedding;if(!vector)return {results:[]};const {data,error}=await db.rpc("match_world_model_embeddings",{query_embedding:vector,match_count:limit});return {results:data||[],error:error?.message||null};}
  if(name==="world_model_neighbors"){const id=String(args.entity_id||"");const {data:edges}=await db.from("world_model_edges").select("source_id,target_id,edge_type,metadata").or(`source_id.eq.${id},target_id.eq.${id}`);const ids=[...new Set((edges||[]).flatMap((e:any)=>[e.source_id,e.target_id]))];const {data:entities}=ids.length?await db.from("world_model_entities").select("id,entity_type,label,payload").in("id",ids):{data:[]};return {entity_id:id,edges:edges||[],entities:entities||[]};}
  if(name==="world_model_path"){const start=String(args.start_id||""),end=String(args.end_id||"");const {data:edges}=await db.from("world_model_edges").select("source_id,target_id,edge_type");const adjacency=new Map<string,any[]>();for(const e of edges||[]){if(!adjacency.has(e.source_id))adjacency.set(e.source_id,[]);if(!adjacency.has(e.target_id))adjacency.set(e.target_id,[]);adjacency.get(e.source_id)!.push(e);adjacency.get(e.target_id)!.push({...e,reverse:true});}const queue=[ [start] as string[] ],seen=new Set([start]);let path:string[]=[];while(queue.length){const p=queue.shift()!,cur=p[p.length-1];if(cur===end){path=p;break;}for(const e of adjacency.get(cur)||[]){const next=e.reverse?e.source_id:e.target_id;if(!seen.has(next)){seen.add(next);queue.push([...p,next]);}}}return {start,end,path,steps:path.map((id,i)=>({entity_id:id,next:path[i+1]||null,edge:(edges||[]).find((e:any)=>(e.source_id===id&&e.target_id===path[i+1])||(e.target_id===id&&e.source_id===path[i+1]))||null}))};}
  throw new Error(`Unknown tool ${name}`);
}

Deno.serve(async(req)=>{
  const origin=req.headers.get("origin")||"";
  if(req.method==="OPTIONS"){const response=json({},204,origin);response.headers.set("Access-Control-Allow-Methods","POST,OPTIONS");response.headers.set("Access-Control-Allow-Headers","authorization,apikey,content-type");return response;}
  if(req.method!=="POST")return json({error:"Method Not Allowed"},405,origin);
  if(origin && !allowedOrigins.has(origin))return json({error:"Origin not allowed"},403,origin);
  if(rateLimited(clientKey(req)))return json({error:"Rate limit exceeded",retryAfterSeconds:60},429,origin);
  if(!OPENAI_API_KEY)return json({error:"OPENAI_API_KEY is not configured"},503,origin);
  let body:any;try{body=await req.json();}catch{return json({error:"Invalid JSON"},400,origin);}
  const query=String(body.query||"").trim();
  if(!query)return json({error:"query is required"},400,origin);
  if(query.length>MAX_QUERY_LENGTH)return json({error:`query exceeds ${MAX_QUERY_LENGTH} characters`},413,origin);

  const system=`You are the FEEXSYSTEMS Navigator intelligence layer. The World Model is canonical. You interpret, summarize, connect and navigate facts retrieved through tools; you do not create or replace canonical portfolio facts. Use world_model_search for entities, world_model_vector_search for repository/source semantics, world_model_neighbors for relationships, and world_model_path for explainable routes. Do not claim a portfolio fact unless supported by tool output. Explain uncertainty when evidence is absent.`;
  let input:any[]=[{role:"user",content:query}],response:any;
  for(let round=0;round<3;round++){
    const res=await fetch(OPENAI_URL,{method:"POST",headers:{"Authorization":`Bearer ${OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,instructions:system,input,tools})});
    if(!res.ok)return json({error:`OpenAI ${res.status}`},502,origin);
    response=await res.json();const calls=(response.output||[]).filter((x:any)=>x.type==="function_call");if(!calls.length)break;input=[...input,...response.output];
    for(const call of calls){let args:any={};try{args=JSON.parse(call.arguments||"{}");}catch{}const result=await tool(call.name,args);input.push({type:"function_call_output",call_id:call.call_id,output:JSON.stringify(result)});}
  }
  const text=response.output_text||(response.output||[]).filter((x:any)=>x.type==="message").flatMap((x:any)=>x.content||[]).map((c:any)=>c.text||"").join(" ");
  return json({text,model:MODEL,embeddingModel:EMBEDDING_MODEL,grounded:true,output:response.output||[]},200,origin);
});
