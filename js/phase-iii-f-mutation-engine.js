export const MUTATION_VERSION = '1.0.0';

const clone = value => JSON.parse(JSON.stringify(value));

export class WorldModelMutationEngine {
  constructor(model) { this.model = model; this.audit = []; }

  validate(mutation) {
    if (!mutation || !mutation.type) throw new Error('Mutation type is required');
    if (!['UPSERT_ENTITY','UPSERT_EDGE','REMOVE_EDGE','REMOVE_ENTITY'].includes(mutation.type)) throw new Error('Unsupported mutation');
    if (!mutation.source) throw new Error('Mutation provenance is required');
    return true;
  }

  propose(mutation) {
    this.validate(mutation);
    return { ...clone(mutation), id: mutation.id || crypto.randomUUID(), status: 'PROPOSED', proposedAt: new Date().toISOString(), version: MUTATION_VERSION };
  }

  commit(mutation) {
    this.validate(mutation);
    const entities = this.model.entities || (this.model.entities = []);
    const edges = this.model.edges || (this.model.edges = []);
    if (mutation.type === 'UPSERT_ENTITY') {
      const index = entities.findIndex(e => e.id === mutation.entity.id);
      if (index >= 0) entities[index] = { ...entities[index], ...mutation.entity };
      else entities.push(mutation.entity);
    }
    if (mutation.type === 'UPSERT_EDGE') {
      const index = edges.findIndex(e => e.id === mutation.edge.id);
      if (index >= 0) edges[index] = { ...edges[index], ...mutation.edge };
      else edges.push(mutation.edge);
    }
    if (mutation.type === 'REMOVE_EDGE') this.model.edges = edges.filter(e => e.id !== mutation.edgeId);
    if (mutation.type === 'REMOVE_ENTITY') {
      this.model.entities = entities.filter(e => e.id !== mutation.entityId);
      this.model.edges = edges.filter(e => e.source !== mutation.entityId && e.target !== mutation.entityId);
    }
    const committed = { ...mutation, status: 'COMMITTED', committedAt: new Date().toISOString() };
    this.audit.push(committed);
    return committed;
  }
}
