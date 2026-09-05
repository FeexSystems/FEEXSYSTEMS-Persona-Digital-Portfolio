import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GH = "https://api.github.com";
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const worlds = [
  ["3wm","3WM SONIK LABS","AUDIO"],["holokai","HOLOKAI","CULTURE"],["yurrheeler","YURRHEELER AI","HEALTH"],
  ["kappaxchangefin","KAPPAXCHANGEFIN","FINTECH"],["vyra","VYRA LABS","INTERFACE"],["rental","RENTAL PARADISE","REAL ESTATE"],
];
const seeds = [
  { world:"3wm", owner:"FeexSystems", repo:"3WM-SONIK-LABS", url:"https://github.com/FeexSystems/3WM-SONIK-LABS" },
  { world:"holokai", owner:"FeexSystems", repo:"HoloKai-Systems-Labs", url:"https://github.com/FeexSystems/HoloKai-Systems-Labs" },
  { world:"yurrheeler", owner:"FeexSystems", repo:"yurrhealer-med-advisor", url:"https://github.com/FeexSystems/yurrhealer-med-advisor" },
  { world:"vyra", owner:"FeexSystems", repo:"VYRA-LABS", url:"https://github.com/FeexSystems/VYRA-LABS" },
  { world:"rental", owner:"FeexSystems", repo:"Rental-Paradise", url:"https://github.com/FeexSystems/Rental-Paradise" },
];
const ext = /\.(md|mdx|js|jsx|ts|tsx|json|css|scss|html|yml|yaml|toml|py|go|rs|java|kt|sql|sh|xml)$/i;
const ignore = /(^|\/)(node_modules|dist|build|\.git|coverage|vendor|\.next)(\/|$)/i;

async function gh(path:string) { const r=await fetch(`${GH}${path}`,{headers:{Accept:"application/vnd.github+json"}}); if(!r.ok) throw new Error(`GitHub ${r.status}`); return r.json(); }
function version(v:string) { return v?.match(/[v=]?([0-9]+\.[0-9]+(?:\.[0-9]+)?)/)?.[1] || null; }

Deno.serve(async req => {
  if(req.method!=="POST") return new Response("Method Not Allowed",{status:405});
  for(const [id,label,domain] of worlds) await db.from("world_model_entities").upsert({id:`world:${id}`,entity_type:"WORLD",label,payload:{domain},source:"persona-registry",updated_at:new Date().toISOString()});
  let total=0;
  for(const seed of seeds){
    const meta=await gh(`/repos/${seed.owner}/${seed.repo}`);
    const languages=await gh(`/repos/${seed.owner}/${seed.repo}/languages`).catch(()=>({}));
    const repoId=`repo:${seed.repo.toLowerCase()}`;
    await db.from("world_model_entities").upsert({id:repoId,entity_type:"REPOSITORY",label:seed.repo,payload:{...meta,languages},source:"github",source_ref:seed.url,updated_at:new Date().toISOString()});
    const tree=await gh(`/repos/${seed.owner}/${seed.repo}/git/trees/${encodeURIComponent(meta.default_branch)}?recursive=1`).catch(()=>({tree:[]}));
    const files=(tree.tree||[]).filter((x:any)=>x.type==="blob"&&!ignore.test(x.path)&&ext.test(x.path)).sort((a:any,b:any)=>a.path.length-b.path.length).slice(0,40);
    for(const file of files){
      const raw=`https://raw.githubusercontent.com/${seed.owner}/${seed.repo}/${encodeURIComponent(meta.default_branch)}/${file.path.split('/').map(encodeURIComponent).join('/')}`;
      const text=await fetch(raw).then(r=>r.ok?r.text():"").catch(()=>"");
      if(!text) continue;
      await db.from("world_model_documents").upsert({repository_id:repoId,path:file.path,sha:file.sha,content:text.slice(0,180000),content_hash:`${repoId}:${file.path}:${file.sha}`,updated_at:new Date().toISOString()},{onConflict:"repository_id,path,sha"});
      total++;
      if(/(^|\/)package\.json$/i.test(file.path)){
        try{
          const pkg=JSON.parse(text);
          for(const [name,val] of Object.entries({...pkg.dependencies,...pkg.devDependencies})){const label=name==='three'?'Three.js':name==='@supabase/supabase-js'?'Supabase':name;const id=`tech:${label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;await db.from("world_model_entities").upsert({id,entity_type:"TECHNOLOGY",label,payload:{version:version(String(val)),repository:repoId},source:"github",source_ref:raw,updated_at:new Date().toISOString()});await db.from("world_model_edges").upsert({source_id:repoId,target_id:id,edge_type:"USES"},{onConflict:"source_id,target_id,edge_type"});}
        }catch{}
      }
    }
    await db.from("world_model_edges").upsert({source_id:`world:${seed.world}`,target_id:repoId,edge_type:"IMPLEMENTS"},{onConflict:"source_id,target_id,edge_type"});
  }
  return Response.json({ok:true,repositories:seeds.length,documents:total,updatedAt:new Date().toISOString()});
});
