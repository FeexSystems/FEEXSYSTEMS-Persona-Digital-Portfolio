// Phase III-B: Digital Twin runtime — local-first, privacy-preserving persona layer.
export class DigitalTwin {
  constructor(registry) {
    this.registry = registry;
    this.state = this.load();
    this.listeners = new Set();
  }
  load() {
    try { return JSON.parse(localStorage.getItem('feex-persona-twin')) || { presence:'ONLINE', focus:'EXPLORATION', visits:0, lastWorld:null, history:[] }; }
    catch { return { presence:'ONLINE', focus:'EXPLORATION', visits:0, lastWorld:null, history:[] }; }
  }
  persist() { localStorage.setItem('feex-persona-twin', JSON.stringify(this.state)); this.listeners.forEach(fn => fn(this.state)); }
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  enter(world) {
    this.state.lastWorld = world.id;
    this.state.focus = world.domain;
    this.state.visits += 1;
    this.state.history = [{ id:world.id, at:new Date().toISOString() }, ...this.state.history].slice(0,12);
    this.persist();
  }
  setPresence(presence) { this.state.presence = presence; this.persist(); }
  snapshot() { return structuredClone(this.state); }
}

export function createTwinCommand(twin) {
  return (query='') => {
    const q = query.trim().toLowerCase();
    if (q.includes('status') || q.includes('who')) return { type:'status', payload:twin.snapshot() };
    if (q.includes('recent') || q.includes('history')) return { type:'history', payload:twin.snapshot().history };
    return { type:'search', payload:null };
  };
}
