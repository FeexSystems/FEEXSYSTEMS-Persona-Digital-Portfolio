import { PERSONA_REGISTRY, buildKnowledgeGraph, searchPersona } from './persona-registry.js';
import { buildWorldModel, graphPath, saveWorldModel } from './world-model.js';

export class AINavigator {
  constructor({ graph=buildKnowledgeGraph(), model=buildWorldModel(PERSONA_REGISTRY), intelligence=null }={}) { this.graph=graph; this.model=model; this.worlds=PERSONA_REGISTRY.worlds; this.intelligence=intelligence; saveWorldModel(model); }
  nodes(type){ return this.model.nodes.filter(n=>!type||n.type===type); }
  neighbors(id){ return this.model.edges.filter(e=>e.source===id||e.target===id).map(e=>e.source===id?e.target:e.source); }
  find(query='') { const q=query.trim().toLowerCase(); if(!q)return []; const terms=q.split(/\s+/).filter(Boolean); return this.nodes().filter(n=>`${n.label||''} ${n.domain||''} ${n.description||''} ${n.type||''} ${JSON.stringify(n.metadata||{})}`.toLowerCase().includes(q)||terms.some(t=>`${n.label||''} ${n.domain||''} ${n.description||''}`.toLowerCase().includes(t))); }
  answer(input='') {
    const q=input.trim().toLowerCase();
    if(!q)return {title:'AI NAVIGATOR',text:'Ask about a world, repository, artifact, technology, timeline, relationship, or capability.',nodes:[],worlds:[],relations:[],path:[]};
    if(/how many|count|number/.test(q))return {title:'WORLD MODEL STATISTICS',text:`${this.nodes('WORLD').length} worlds · ${this.nodes('REPOSITORY').length} repositories · ${this.nodes('ARTIFACT').length} artifacts · ${this.nodes('TECHNOLOGY').length} technologies · ${this.model.edges.length} graph edges.`,nodes:[],worlds:[],relations:[],path:[]};
    const found=this.find(q),worldIds=new Set(found.filter(n=>n.type==='WORLD').map(n=>n.id.replace('world:',''))),worlds=this.worlds.filter(w=>worldIds.has(w.id));
    if(/related|connected|relationship|linked|connect|between|path|route/.test(q)&&worlds.length>=2){const path=graphPath(this.model,`world:${worlds[0].id}`,`world:${worlds[1].id}`);return {title:'GRAPH PATH',text:`Resolved a ${Math.max(0,path.length-1)}-edge path between ${worlds[0].name} and ${worlds[1].name}.`,nodes:found,worlds,relations:this.neighbors(`world:${worlds[0].id}`),path};}
    if(found.length){const relatedIds=new Set(found.flatMap(n=>this.neighbors(n.id))),related=this.nodes().filter(n=>relatedIds.has(n.id)).slice(0,12);return {title:'WORLD MODEL MATCH',text:`Resolved ${found.length} semantic match${found.length===1?'':'es'} across the Intelligent World Model.`,nodes:[...found,...related],worlds:worlds.length?worlds:this.worlds.filter(w=>found.some(n=>n.id===`world:${w.id}`)),relations:[],path:[]};}
    const legacy=searchPersona(q);if(legacy.length)return {title:'PERSONA MATCH',text:`Found ${legacy.length} Persona world${legacy.length===1?'':'s'}.`,nodes:legacy,worlds:legacy,relations:[],path:[]};
    return {title:'NO DIRECT MATCH',text:'The Navigator could not resolve that query in the current World Model.',nodes:[],worlds:[],relations:[],path:[]};
  }
  async modelAnswer(input='') { return this.intelligence ? this.intelligence.ask(input) : { text:this.answer(input).text, context:null }; }
}

export function mountNavigator({input,output,onWorld,onRelations=()=>{},onPath=()=>{},navigator=null,intelligence=null}){const nav=navigator||new AINavigator({intelligence});const run=async()=>{const result=nav.answer(input.value);output.innerHTML=`<b>${result.title}</b><p>${result.text}</p>`+(result.worlds.length?`<div class="nav-worlds">${result.worlds.map(w=>`<button data-world="${w.id}">${w.name}<small>${w.domain}</small></button>`).join('')}</div>`:'')+(result.nodes?.length?`<div class="nav-entities">${result.nodes.slice(0,8).map(n=>`<span>${n.type} · ${n.label}</span>`).join('')}</div>`:'');output.hidden=false;onRelations(result.relations||[]);onPath(result.path||[]);output.querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>onWorld(b.dataset.world));if(intelligence){output.classList.add('is-thinking');try{const modelResult=await nav.modelAnswer(input.value);output.querySelector('p').textContent=modelResult.text||result.text;output.classList.remove('is-thinking');onPath(modelResult.context?.path||result.path||[]);}catch(error){output.querySelector('p').textContent=`${result.text} · MODEL GATEWAY UNAVAILABLE`;output.classList.remove('is-thinking');}}};input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run()}});return {run,nav};}
