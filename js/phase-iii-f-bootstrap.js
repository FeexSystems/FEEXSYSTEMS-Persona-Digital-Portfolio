import { PERSONA_REGISTRY } from './persona-registry.js';
import { IncrementalRepositoryIngestion } from './phase-iii-f-incremental-ingestion.js';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const ingestion = new IncrementalRepositoryIngestion();

globalThis.FEEX_INCREMENTAL_INGESTION = ingestion;

async function sync() {
  await delay(1200);
  const seeds = (PERSONA_REGISTRY || []).filter(world => world.repo).map(world => ({ url: world.repo, id: world.id }));
  for (const seed of seeds) {
    try {
      const result = await ingestion.sync(seed);
      globalThis.FEEX_WORLD_AGENT?.observe({ type: 'INCREMENTAL_REPOSITORY_SYNC', repository: seed.url.replace('https://github.com/', ''), after: result.repository.pushedAt, files: result.changed.map(file => file.path), added: result.changed.map(file => file.path), removed: result.removed });
      globalThis.FEEX_WORLD_EVENTS?.emit('INCREMENTAL_SYNC', result, 'normal');
    } catch (error) {
      globalThis.FEEX_WORLD_EVENTS?.emit('INGESTION_ERROR', { repository: seed.url, error: error.message }, 'high');
    }
  }
}

sync();
setInterval(sync, 300000);
