export class PredictiveNavigator extends EventTarget {
  constructor({ model, temporalModel, digitalTwin = null } = {}) { super(); this.model = model; this.temporalModel = temporalModel; this.digitalTwin = digitalTwin; this.observations = []; }
  observe(event) { this.observations.push(event); return this.predict(); }
  predict() {
    const recent = this.observations.slice(-20);
    const byRepo = recent.reduce((m, e) => { if (e.repository) m[e.repository] = (m[e.repository] || 0) + 1; return m; }, {});
    const candidates = Object.entries(byRepo).filter(([, count]) => count >= 2).map(([repository, count]) => ({ type: 'REPEATED_CHANGE', repository, score: Math.min(1, count / 5), rationale: `${count} recent repository observations` }));
    if (candidates.length) this.dispatchEvent(new CustomEvent('prediction', { detail: candidates }));
    return candidates;
  }
  suggest(query) {
    const q = String(query || '').toLowerCase();
    const entities = this.model.entities || [];
    return entities.filter(e => `${e.name || ''} ${e.description || ''}`.toLowerCase().includes(q)).slice(0, 8);
  }
}
