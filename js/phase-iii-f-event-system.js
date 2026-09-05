const KEY = 'feex-phase-iii-f-events';

export class ProactiveEventSystem extends EventTarget {
  constructor({ max = 100 } = {}) { super(); this.max = max; this.events = this.load(); }
  load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
  persist() { localStorage.setItem(KEY, JSON.stringify(this.events.slice(-this.max))); }
  emit(type, payload = {}, priority = 'normal') {
    const event = { id: crypto.randomUUID(), type, priority, payload, timestamp: new Date().toISOString(), acknowledged: false };
    this.events.push(event); this.persist(); this.dispatchEvent(new CustomEvent(type, { detail: event })); this.dispatchEvent(new CustomEvent('event', { detail: event })); return event;
  }
  pending() { return this.events.filter(e => !e.acknowledged); }
  acknowledge(id) { const event = this.events.find(e => e.id === id); if (event) { event.acknowledged = true; this.persist(); } return event || null; }
}
