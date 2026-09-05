export class FeexWorldRuntime extends EventTarget {
  constructor({ model, twin, agent, navigator, events } = {}) {
    super(); this.model = model; this.twin = twin; this.agent = agent; this.navigator = navigator; this.events = events; this.status = 'BOOTING';
    this.bind();
  }
  bind() {
    this.agent?.addEventListener('mutation:committed', e => { this.status = 'WORLD_MUTATED'; this.events?.emit('WORLD_MUTATED', e.detail, 'high'); this.dispatchEvent(new CustomEvent('world:updated', { detail: e.detail })); });
    this.events?.addEventListener('event', e => this.dispatchEvent(new CustomEvent('signal', { detail: e.detail })));
  }
  start() { this.status = 'ONLINE'; this.events?.emit('WORLD_ONLINE', { entityCount: this.model?.entities?.length || 0 }, 'normal'); return this.snapshot(); }
  snapshot() { return { status: this.status, worldModelVersion: this.model?.version || null, entities: this.model?.entities?.length || 0, edges: this.model?.edges?.length || 0, twin: this.twin?.context?.() || null, pendingEvents: this.events?.pending?.().length || 0 }; }
}
