export class DigitalTwinIntelligence extends EventTarget {
  constructor(twin) { super(); this.twin = twin; this.state = { currentWorld: null, focus: null, activeContext: [], signals: [], lastReasonedAt: null }; }
  update(patch, reason = 'system') {
    this.state = { ...this.state, ...patch, lastReasonedAt: new Date().toISOString() };
    try { this.twin?.setState?.(this.state); } catch {}
    this.dispatchEvent(new CustomEvent('state', { detail: { ...this.state, reason } }));
    return this.state;
  }
  ingest(event) {
    const signal = { type: event.type, timestamp: event.timestamp || new Date().toISOString(), payload: event.payload || event };
    this.state.signals = [...this.state.signals.slice(-49), signal];
    return this.update({ activeContext: [signal, ...this.state.activeContext].slice(0, 12) }, 'event');
  }
  context() { return { ...this.state, activeContext: [...this.state.activeContext] }; }
}
