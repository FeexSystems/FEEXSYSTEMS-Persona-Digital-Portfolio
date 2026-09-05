export function createWorldModelAgentTools({ model, intelligence = null } = {}) {
  const entities = () => model.entities || [];
  const edges = () => model.edges || [];
  return {
    search: query => intelligence?.search?.(query) || entities().filter(e => `${e.name || ''} ${e.description || ''}`.toLowerCase().includes(query.toLowerCase())),
    neighbors: id => edges().filter(e => e.source === id || e.target === id),
    path: (from, to) => intelligence?.path?.(from, to) || [],
    compare: (left, right) => ({ left, right, changed: JSON.stringify(left) !== JSON.stringify(right) }),
    analyzeChange: async event => {
      if (!event?.repository) return [];
      return [{ type: 'UPSERT_ENTITY', source: 'github-webhook/change-detector', autoCommit: false, entity: { id: `repo:${event.repository}`, type: 'REPOSITORY', name: event.repository, metadata: { lastCommitSha: event.after, lastChangeAt: event.receivedAt } } }];
    },
  };
}
