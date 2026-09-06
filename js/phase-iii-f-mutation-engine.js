export const MUTATION_VERSION = '1.1.0';

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
    const nodes = this.model.nodes || (this.model.nodes = []);
    const edges = this.model.edges || (this.model.edges = []);
    if (mutation.type === 'UPSERT_ENTITY') {
      const index = nodes.findIndex(e => e.id === mutation.entity.id);
      if (index >= 0) nodes[index] = { ...nodes[index], ...mutation.entity };
      else nodes.push(mutation.entity);
    }
    if (mutation.type === 'UPSERT_EDGE') {
      const edge = mutation.edge;
      const index = edges.findIndex(e => e.id === edge.id || (e.source === edge.source && e.target === edge.target && e.type === edge.type));
      if (index >= 0) edges[index] = { ...edges[index], ...edge };
      else edges.push(edge);
    }
    if (mutation.type === 'REMOVE_EDGE') this.model.edges = edges.filter(e => e.id !== mutation.edgeId);
    if (mutation.type === 'REMOVE_ENTITY') {
      this.model.nodes = nodes.filter(e => e.id !== mutation.entityId);
      this.model.edges = edges.filter(e => e.source !== mutation.entityId && e.target !== mutation.entityId);
    }
    const committed = { ...mutation, status: 'COMMITTED', committedAt: new Date().toISOString() };
    this.audit.push(committed);
    return committed;
  }
}
