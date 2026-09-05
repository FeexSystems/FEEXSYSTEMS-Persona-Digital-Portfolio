// Phase III-E orchestration layer.
// The LLM is an interpreter over canonical World Model facts, never the source of truth.

import { REPOSITORY_SEEDS, hydrateRepositoryNode, saveWorldModel, graphPath } from './world-model.js';
import { ingestRepositories } from './github-ingestion.js';

const MEMORY_KEY = 'feex-navigator-memory-v1';

export class NavigatorMemory {
  constructor(limit = 12) { this.limit = limit; this.items = this.load(); }
  load() { try { return JSON.parse(localStorage.getItem(MEMORY_KEY)) || []; } catch { return []; } }
  add(role, content, context = {}) {
    this.items.push({ role, content, context, at: new Date().toISOString() });
    this.items = this.items.slice(-this.limit);
    try { localStorage.setItem(MEMORY_KEY, JSON.stringify(this.items)); } catch {}
    return this.items;
  }
  clear() { this.items = []; try { localStorage.removeItem(MEMORY_KEY); } catch {} }
  context() { return this.items.map(x => `${x.role}: ${x.content}`).join('\n'); }
}

export function hybridRetrieve(model, query, limit = 10) {
  const q = String(query || '').toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  const score = node => {
    const text = `${node.label || ''} ${node.description || ''} ${node.type || ''} ${node.domain || ''} ${JSON.stringify(node.metadata || {})}`.toLowerCase();
    let s = text.includes(q) ? 10 : 0;
    terms.forEach(t => { if (text.includes(t)) s += 2; });
    const degree = model.edges.filter(e => e.source === node.id || e.target === node.id).length;
    return s + Math.min(degree, 4) * .25;
  };
  return model.nodes.map(node => ({ node, score: score(node) })).filter(x => x.score > 0).sort((a,b) => b.score - a.score).slice(0, limit);
}

export function explainPath(model, ids = []) {
  if (!ids.length) return [];
  return ids.slice(0, -1).map((source, i) => {
    const target = ids[i + 1];
    const edge = model.edges.find(e => (e.source === source && e.target === target) || (e.target === source && e.source === target));
    const a = model.nodes.find(n => n.id === source), b = model.nodes.find(n => n.id === target);
    return { source, target, type: edge?.type || 'CONNECTED', from: a?.label || source, to: b?.label || target, explanation: `${a?.label || source} ${edge?.type || 'CONNECTS'} ${b?.label || target}` };
  });
}

export class ModelBackedIntelligence {
  constructor({ model, llmEndpoint = globalThis.FEEX_AI_ENDPOINT || '' } = {}) {
    this.model = model;
    this.memory = new NavigatorMemory();
    this.llmEndpoint = llmEndpoint;
    this.telemetry = { status: 'IDLE', repositories: 0, documents: 0, artifacts: 0, technologies: 0, lastSync: null, errors: 0 };
  }

  async ingest(onUpdate = () => {}) {
    this.telemetry.status = 'SYNCING'; this.telemetry.repositories = 0; this.telemetry.documents = 0; this.telemetry.artifacts = 0; this.telemetry.technologies = 0; this.telemetry.errors = 0; onUpdate(this.telemetry);
    const results = await ingestRepositories(REPOSITORY_SEEDS, result => {
      if (result.error) this.telemetry.errors += 1;
      else {
        this.telemetry.repositories += 1;
        this.telemetry.documents += result.documents.length;
        this.telemetry.artifacts += result.artifacts.length;
        this.telemetry.technologies += result.technologies.length;
        const node = this.model.nodes.find(n => n.id === result.repository.id);
        if (node) Object.assign(node, hydrateRepositoryNode(node, result.repository), { description: result.repository.description, languages:result.repository.languages });
        const repoId = result.repository.id;
        result.technologies.forEach(t => {
          const id = `tech:${t.label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
          const existing = this.model.nodes.find(n => n.id === id);
          if (existing) Object.assign(existing, { versions:t.versions, evidence:t.evidence });
          else this.model.nodes.push({ id, label: t.label, type:'TECHNOLOGY', versions:t.versions, evidence:t.evidence });
          if (!this.model.edges.some(e => e.source === repoId && e.target === id)) this.model.edges.push({ source: repoId, target: id, type:'USES' });
        });
        result.artifacts.forEach(a => {
          const id = `artifact:${result.repository.repo.toLowerCase()}:${a.path.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
          if (!this.model.nodes.some(n => n.id === id)) this.model.nodes.push({ id, label: a.label, type:'ARTIFACT', repository: repoId, path:a.path, kind:a.kind });
          if (!this.model.edges.some(e => e.source === repoId && e.target === id)) this.model.edges.push({ source: repoId, target: id, type:'PUBLISHED' });
        });
      }
      onUpdate({ ...this.telemetry });
    });
    this.telemetry.status = 'ONLINE'; this.telemetry.lastSync = new Date().toISOString();
    saveWorldModel(this.model);
    onUpdate({ ...this.telemetry });
    return results;
  }

  startTelemetry(intervalMs = 300000, onUpdate = () => {}) {
    this.ingest(onUpdate).catch(() => {});
    return setInterval(() => this.ingest(onUpdate).catch(() => {}), intervalMs);
  }

  toolContext(query) {
    const hits = hybridRetrieve(this.model, query, 12);
    const ids = hits.map(x => x.node.id);
    let path = [];
    if (ids.length >= 2) path = graphPath(this.model, ids[0], ids[1]);
    return { query, hits, path, explanation: explainPath(this.model, path), telemetry: this.telemetry };
  }

  async ask(query) {
    const context = this.toolContext(query);
    this.memory.add('user', query, { hits: context.hits.map(x => x.node.id) });
    if (!this.llmEndpoint) {
      const text = context.hits.length ? `Grounded World Model context: ${context.hits.slice(0,5).map(x => x.node.label).join(', ')}.` : 'No grounded World Model entities matched this request.';
      this.memory.add('assistant', text, context);
      return { text, context, source: 'world-model' };
    }
    const response = await fetch(this.llmEndpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ query, worldModel: { schema:this.model.schema, nodes:this.model.nodes, edges:this.model.edges }, retrieved:context.hits, path:context.explanation, memory:this.memory.items }) });
    if (!response.ok) throw new Error(`LLM gateway ${response.status}`);
    const result = await response.json();
    const text = result.text || result.output_text || 'No grounded response returned.';
    this.memory.add('assistant', text, context);
    return { ...result, text, context };
  }
}
