import { buildKnowledgeGraph, searchPersona, PERSONA_REGISTRY } from './persona-registry.js';

export class AINavigator {
  constructor({ graph=buildKnowledgeGraph() }={}) { this.graph=graph; }
  answer(input='') {
    const q=input.trim().toLowerCase();
    if(!q) return { title:'AI NAVIGATOR', text:'Ask about a world, capability, project relationship, or technology.', worlds:[] };
    const worlds=searchPersona(q);
    if(/where|which|show|find|projects?|worlds?/.test(q)&&worlds.length) return {title:'MATCHED WORLDS',text:`Found ${worlds.length} connected world${worlds.length===1?'':'s'} in the Persona Graph.`,worlds};
    if(/how many|count|number/.test(q)) return {title:'GRAPH STATISTICS',text:`${PERSONA_REGISTRY.worlds.length} worlds · ${PERSONA_REGISTRY.capabilities.length} capability domains · ${this.graph.edges.length} relationships.`,worlds:[]};
    return {title:'NO DIRECT MATCH',text:'The Navigator could not resolve that query in the current local Knowledge Graph.',worlds:[]};
  }
}

export function mountNavigator({input, output, onWorld}) {
  const nav=new AINavigator();
  const run=()=>{const result=nav.answer(input.value);output.innerHTML=`<b>${result.title}</b><p>${result.text}</p>`+(result.worlds.length?`<div class="nav-worlds">${result.worlds.map(w=>`<button data-world="${w.id}">${w.name}<small>${w.domain}</small></button>`).join('')}</div>`:'');output.hidden=false;output.querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>onWorld(b.dataset.world));};
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run()}}); return {run,nav};
}
