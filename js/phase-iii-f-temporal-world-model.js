export const TEMPORAL_SCHEMA_VERSION = '1.0.0';

export class TemporalWorldModel {
  constructor(model) {
    this.model = model;
    this.events = model.events || (model.events = []);
    this.snapshots = model.snapshots || (model.snapshots = []);
  }

  recordEvent(event) {
    const normalized = { id: event.id || crypto.randomUUID(), type: event.type, subjectId: event.subjectId || null, repository: event.repository || null, before: event.before || null, after: event.after || null, evidence: event.evidence || [], timestamp: event.timestamp || new Date().toISOString(), schemaVersion: TEMPORAL_SCHEMA_VERSION };
    this.events.push(normalized);
    return normalized;
  }

  snapshot(label = 'runtime') {
    const snapshot = { id: crypto.randomUUID(), label, timestamp: new Date().toISOString(), entityCount: (this.model.entities || []).length, edgeCount: (this.model.edges || []).length, eventCount: this.events.length };
    this.snapshots.push(snapshot);
    return snapshot;
  }

  history(subjectId) { return this.events.filter(e => e.subjectId === subjectId || e.repository === subjectId).sort((a,b) => a.timestamp.localeCompare(b.timestamp)); }

  diff(a, b) {
    const byId = list => new Map(list.map(x => [x.id, x]));
    const before = byId(a?.entities || []); const after = byId(b?.entities || []);
    return { created: [...after.keys()].filter(id => !before.has(id)), removed: [...before.keys()].filter(id => !after.has(id)), changed: [...after.keys()].filter(id => before.has(id) && JSON.stringify(before.get(id)) !== JSON.stringify(after.get(id))) };
  }
}
