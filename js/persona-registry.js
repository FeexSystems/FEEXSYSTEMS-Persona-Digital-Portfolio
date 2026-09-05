export const PERSONA_REGISTRY = {
  identity: { name:'FEEXSYSTEMS', role:'BUILDER / ARCHITECT / EXPLORER', status:'ONLINE', mode:'EXPLORATION' },
  worlds: [
    { id:'3wm', name:'3WM SONIK LABS', domain:'AUDIO', description:'AI-native audio and DSP systems.', repo:'https://github.com/FeexSystems/3WM-SONIK-LABS', capabilities:['AI','DSP','CREATIVE'] },
    { id:'holokai', name:'HOLOKAI', domain:'CULTURE', description:'Civilization intelligence and world-model exploration.', repo:'https://github.com/FeexSystems/HoloKai-Systems-Labs', capabilities:['AI','WORLD MODEL','3D'] },
    { id:'yurrheeler', name:'YURRHEELER AI', domain:'HEALTH', description:'Multi-agent healthcare intelligence.', repo:'https://github.com/FeexSystems/yurrhealer-med-advisor', capabilities:['AGENTS','RAG','REACT'] },
    { id:'kappaxchangefin', name:'KAPPAXCHANGEFIN', domain:'FINTECH', description:'Financial technology ecosystem for digital payments, exchange infrastructure and intelligent financial services.', capabilities:['FINTECH','PAYMENTS','AI','ISO 20022','SWIFT'] },
    { id:'vyra', name:'VYRA LABS', domain:'INTERFACE', description:'Conversational interface experiments and intelligent media systems.', repo:'https://github.com/FeexSystems/VYRA-LABS', capabilities:['AI','UX','CONVERSATION'] },
    { id:'rental', name:'RENTAL PARADISE', domain:'REAL ESTATE', description:'Property discovery and rental experience.', repo:'https://github.com/FeexSystems/Rental-Paradise', capabilities:['REACT','WEB','UX'] },
  ],
  capabilities: ['AI / ML','FULL-STACK','INFRASTRUCTURE','DATA','CREATIVE TECHNOLOGY','SECURITY','FINTECH','3D / SPATIAL COMPUTING'],
  relations: [
    ['3wm','AI'],['3wm','CREATIVE TECHNOLOGY'],['holokai','AI'],['holokai','WORLD MODEL'],['yurrheeler','AI / ML'],['yurrheeler','DATA'],['kappaxchangefin','FINTECH'],['kappaxchangefin','AI / ML'],['kappaxchangefin','DATA'],['kappaxchangefin','SECURITY'],['vyra','AI / ML'],['rental','FULL-STACK']
  ],
};

export function searchPersona(query='') {
  const q=query.trim().toLowerCase();
  if(!q)return PERSONA_REGISTRY.worlds;
  const matches=PERSONA_REGISTRY.worlds.filter(w=>`${w.name} ${w.domain} ${w.description} ${w.capabilities.join(' ')}`.toLowerCase().includes(q));
  const related=PERSONA_REGISTRY.worlds.filter(w=>PERSONA_REGISTRY.relations.some(([id,cap])=>id===w.id&&cap.toLowerCase().includes(q)));
  return [...new Map([...matches,...related].map(w=>[w.id,w])).values()];
}

export function buildKnowledgeGraph(){
  const nodes=PERSONA_REGISTRY.worlds.map(w=>({id:w.id,label:w.name,type:'WORLD',domain:w.domain})).concat(PERSONA_REGISTRY.capabilities.map(c=>({id:`cap:${c}`,label:c,type:'CAPABILITY'})));
  const edges=[]; PERSONA_REGISTRY.worlds.forEach(w=>w.capabilities.forEach(c=>edges.push({source:w.id,target:`cap:${c}`}))); return {nodes,edges};
}
