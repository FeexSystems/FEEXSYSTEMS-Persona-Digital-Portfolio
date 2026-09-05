import { buildKnowledgeGraph, searchPersona, PERSONA_REGISTRY } from './persona-registry.js';

export class AINavigator {
  constructor({ graph=buildKnowledgeGraph() }={}) { this.graph=graph; this.worlds=PERSONA_REGISTRY.worlds; }
  neighbors(id){
    const ids=new Set(); this.graph.edges.forEach(e=>{if(e.source===id)ids.add(e.target);if(e.target===id)ids.add(e.source)}); return [...ids];
  }
  answer(input='') {
    const q=input.trim().toLowerCase();
    if(!q)return {title:'AI NAVIGATOR',text:'Ask about a world, capability, relationship, or technology.',worlds:[],relations:[]};
    const worlds=searchPersona(q).filter(w=>this.worlds.some(x=>x.id===w.id));
    const relationship=/related|connected|relationship|linked|connect|between|with/.test(q);
    if(relationship&&worlds.length){
      const relations=worlds.flatMap(w=>this.neighbors(w.id).map(id=>({from:w.id,to:id}))).filter(r=>this.worlds.some(w=>w.id===r.to));
      return {title:'RELATIONSHIP MAP',text:`Resolved ${worlds.length} world${worlds.length===1?'':'s'} and ${relations.length} world relationships.`,worlds,relations};
    }
    if(/how many|count|number/.test(q))return {title:'GRAPH STATISTICS',text:`${this.worlds.length} worlds · ${PERSONA_REGISTRY.capabilities.length} capability domains · ${this.graph.edges.length} relationships.`,worlds:[],relations:[]};
    if(worlds.length)return {title:'MATCHED WORLDS',text:`Found ${worlds.length} connected world${worlds.length===1?'':'s'} in the Persona Graph.`,worlds,relations:[]};
    return {title:'NO DIRECT MATCH',text:'The Navigator could not resolve that query in the current Knowledge Graph.',worlds:[],relations:[]};
  }
}

export function mountNavigator({input, output, onWorld, onRelations=()=>{}}) {
  const nav=new AINavigator();
  const run=()=>{const result=nav.answer(input.value);output.innerHTML=`<b>${result.title}</b><p>${result.text}</p>`+(result.worlds.length?`<div class="nav-worlds">${result.worlds.map(w=>`<button data-world="${w.id}">${w.name}<small>${w.domain}</small></button>`).join('')}</div>`:'');output.hidden=false;onRelations(result.relations||[]);output.querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>onWorld(b.dataset.world));};
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run()}}); return {run,nav};
}
