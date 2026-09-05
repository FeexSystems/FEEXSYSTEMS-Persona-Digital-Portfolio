import { fetchRepository, crawlRepository, detectTechnologies, discoverArtifacts } from './github-ingestion.js';

export class IncrementalRepositoryIngestion {
  constructor() { this.cache = new Map(); }

  async sync(seed) {
    const [owner, repo] = seed.url.replace('https://github.com/', '').split('/');
    const { metadata, languages } = await fetchRepository(owner, repo);
    const previous = this.cache.get(seed.url) || { files: new Map() };
    const documents = await crawlRepository(owner, repo, metadata.default_branch);
    const changed = documents.filter(doc => previous.files.get(doc.path) !== doc.sha);
    const removed = [...previous.files.keys()].filter(path => !documents.some(doc => doc.path === path));
    this.cache.set(seed.url, { commit: metadata.pushed_at, files: new Map(documents.map(doc => [doc.path, doc.sha])) });
    return {
      source: 'github-incremental', repository: { owner, repo, url: seed.url, branch: metadata.default_branch, pushedAt: metadata.pushed_at },
      changed, removed, unchanged: documents.length - changed.length,
      technologies: detectTechnologies(changed, languages), artifacts: discoverArtifacts(changed),
      complete: previous.files.size === 0, syncedAt: new Date().toISOString(),
    };
  }
}
