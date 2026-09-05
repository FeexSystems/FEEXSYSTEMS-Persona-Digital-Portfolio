// Phase III-D: repository-aware Intelligent World Model.
// Local-first metadata layer; provider/API adapters can hydrate this model later.

const MODEL_KEY = 'feex-intelligent-world-model';

export const WORLD_MODEL_SCHEMA = {
  version: '3.0.0',
  entityTypes: ['PERSONA','WORLD','REPOSITORY','ARTIFACT','TECHNOLOGY','CAPABILITY','TIMELINE','EVENT'],
  edgeTypes: ['OWNS','IMPLEMENTS','USES','DEPENDS_ON','RELATED_TO','EVOLVED_FROM','PUBLISHED','OCCURRED_AT'],
};

export const REPOSITORY_SEEDS = [
  { world:'3wm', owner:'FeexSystems', repo:'3WM-SONIK-LABS', url:'https://github.com/FeexSystems/3WM-SONIK-LABS' },
  { world:'holokai', owner:'FeexSystems', repo:'HoloKai-Systems-Labs', url:'https://github.com/FeexSystems/HoloKai-Systems-Labs' },
  { world:'yurrheeler', owner:'FeexSystems', repo:'yurrhealer-med-advisor', url:'https://github.com/FeexSystems/yurrhealer-med-advisor' },
  { world:'vyra', owner:'FeexSystems', repo:'VYRA-LABS', url:'https://github.com/FeexSystems/VYRA-LABS' },
  { world:'rental', owner:'FeexSystems', repo:'Rental-Paradise', url:'https://github.com/FeexSystems/Rental-Paradise' },
];

export const ARTIFACT_SEEDS = [
  { id:'artifact:persona-os', label:'Persona Digital Operating Environment', type:'ARTIFACT', world:'persona', technologies:['Three.js','JavaScript','WebGL'] },
  { id:'artifact:planetary-graph', label:'Planetary Knowledge Graph', type:'ARTIFACT', world:'persona', technologies:['Three.js','Knowledge Graph'] },
  { id:'artifact:ai-navigator', label:'Graph-aware AI Navigator', type:'ARTIFACT', world:'persona', technologies:['Semantic Search','Knowledge Graph'] },
  { id:'artifact:iso20022', label:'ISO 20022 Financial Infrastructure', type:'ARTIFACT', world:'kappaxchangefin', technologies:['ISO 20022','SWIFT'] },
];

export const TECHNOLOGY_SEEDS = [
  'JavaScript','Three.js','WebGL','React','TypeScript','Tailwind CSS','Supabase','PostgreSQL','PGVector','AI / ML','RAG','Agents','DSP','3D','Knowledge Graph','Embeddings','ISO 20022','SWIFT','Payments','Security'
].map(label => ({ id:`tech:${label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, label, type:'TECHNOLOGY' }));

export const TIMELINE = [
  { id:'timeline:phase-i', label:'Phase I — Planetary Foundation', date:'2026', status:'COMPLETE' },
  { id:'timeline:phase-ii', label:'Phase II — Interactive Persona OS', date:'2026', status:'COMPLETE' },
  { id:'timeline:phase-iii-c', label:'Phase III-C — Knowledge Graph + AI Navigator', date:'2026', status:'COMPLETE' },
  { id:'timeline:phase-iii-d', label:'Phase III-D — Intelligent World Model', date:'2026', status:'ACTIVE' },
];

export function buildWorldModel(registry) {
  const nodes = [
    { id:'persona:feexsystems', label:registry.identity.name, type:'PERSONA' },
    ...registry.worlds.map(w => ({ id:`world:${w.id}`, label:w.name, type:'WORLD', domain:w.domain, description:w.description, repo:w.repo || null })),
    ...registry.capabilities.map(c => ({ id:`cap:${c}`, label:c, type:'CAPABILITY' })),
    ...REPOSITORY_SEEDS.map(r => ({ id:`repo:${r.repo.toLowerCase()}`, label:r.repo, type:'REPOSITORY', url:r.url, world:r.world })),
    ...ARTIFACT_SEEDS,
    ...TECHNOLOGY_SEEDS,
    ...TIMELINE,
  ];
  const edges = [];
  registry.worlds.forEach(w => {
    edges.push({ source:'persona:feexsystems', target:`world:${w.id}`, type:'OWNS' });
    w.capabilities.forEach(c => edges.push({ source:`world:${w.id}`, target:`cap:${c}`, type:'USES' }));
    const repo = REPOSITORY_SEEDS.find(r => r.world === w.id);
    if (repo) edges.push({ source:`world:${w.id}`, target:`repo:${repo.repo.toLowerCase()}`, type:'IMPLEMENTS' });
  });
  ARTIFACT_SEEDS.forEach(a => a.technologies.forEach(t => edges.push({ source:a.id, target:`tech:${t.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, type:'USES' })));
  edges.push({ source:'world:kappaxchangefin', target:'artifact:iso20022', type:'IMPLEMENTS' });
  edges.push({ source:'artifact:persona-os', target:'timeline:phase-iii-d', type:'EVOLVED_FROM' });
  edges.push({ source:'artifact:planetary-graph', target:'artifact:ai-navigator', type:'RELATED_TO' });
  return { schema:WORLD_MODEL_SCHEMA, nodes, edges, generatedAt:new Date().toISOString() };
}

export function hydrateRepositoryNode(node, metadata={}) {
  return { ...node, hydrated:true, metadata:{ stars:metadata.stargazers_count ?? null, forks:metadata.forks_count ?? null, openIssues:metadata.open_issues_count ?? null, defaultBranch:metadata.default_branch ?? null, updatedAt:metadata.updated_at ?? null } };
}

export function saveWorldModel(model) { try { localStorage.setItem(MODEL_KEY, JSON.stringify(model)); } catch {} return model; }
export function loadWorldModel() { try { return JSON.parse(localStorage.getItem(MODEL_KEY)) || null; } catch { return null; } }

export function graphPath(model, startId, endId) {
  if (!startId || !endId || startId === endId) return [startId];
  const queue=[[startId]], seen=new Set([startId]);
  while(queue.length){ const path=queue.shift(), current=path.at(-1); for(const e of model.edges.filter(x=>x.source===current||x.target===current)){ const next=e.source===current?e.target:e.source; if(seen.has(next)) continue; const nextPath=[...path,next]; if(next===endId)return nextPath; seen.add(next); queue.push(nextPath); } }
  return [];
}
