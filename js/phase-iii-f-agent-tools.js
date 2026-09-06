export function createWorldModelAgentTools({ model, intelligence = null } = {}) {
  const nodes = () => model.nodes || [];
  const edges = () => model.edges || [];
  return {
    search: query => intelligence?.toolContext?.(query)?.hits || nodes().filter(e => `${e.label || ''} ${e.description || ''} ${e.type || ''}`.toLowerCase().includes(query.toLowerCase())),
    neighbors: id => edges().filter(e => e.source === id || e.target === id),
    path: (from, to) => intelligence?.toolContext?.(`${from} ${to}`)?.path || [],
    compare: (left, right) => ({ left, right, changed: JSON.stringify(left) !== JSON.stringify(right) }),
    analyzeChange: async event => {
      if (!event?.repository) return [];
      const repoId = `repo:${event.repository.split('/').pop()?.toLowerCase()}`;
      const proposals = [{
        type: 'UPSERT_ENTITY',
        source: 'github-webhook/change-detector',
        autoCommit: true,
        entity: {
          id: repoId,
          type: 'REPOSITORY',
          label: event.repository,
          repository: event.repository,
          metadata: { lastCommitSha: event.after, lastChangeAt: event.receivedAt, changedFiles: event.files || [] },
        },
      }];
      for (const file of event.files || []) {
        const artifactId = `artifact:${repoId}:${String(file).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        proposals.push({
          type: 'UPSERT_ENTITY',
          source: 'github-webhook/change-detector',
          autoCommit: true,
          entity: { id: artifactId, label: file, type: 'ARTIFACT', repository: repoId, path: file, lastCommitSha: event.after },
        });
        proposals.push({
          type: 'UPSERT_EDGE',
          source: 'github-webhook/change-detector',
          autoCommit: true,
          edge: { id: `${repoId}:PUBLISHED:${artifactId}`, source: repoId, target: artifactId, type: 'PUBLISHED', metadata: { commitSha: event.after } },
        });
      }
      return proposals;
    },
  };
}
