const STORAGE_KEY = 'feex-phase-iii-f-repository-state';

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveState(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

export class RepositoryChangeDetector extends EventTarget {
  constructor({ ingestion = null, interval = 300000, onChange = null } = {}) {
    super();
    this.ingestion = ingestion;
    this.interval = interval;
    this.timer = null;
    this.state = loadState();
    this.onChange = onChange;
  }

  record(repository, snapshot) {
    const previous = this.state[repository] || {};
    const current = { ...snapshot, checkedAt: new Date().toISOString() };
    const changed = Boolean(previous.commitSha && current.commitSha && previous.commitSha !== current.commitSha);
    this.state[repository] = current;
    saveState(this.state);
    if (changed) {
      const detail = { repository, previous, current };
      this.dispatchEvent(new CustomEvent('change', { detail }));
      this.onChange?.(detail);
    }
    return { changed, previous, current };
  }

  async check(repository, fetcher) {
    const snapshot = await fetcher(repository);
    return this.record(repository, snapshot);
  }

  start(repositories, fetcher) {
    this.stop();
    const run = async () => {
      for (const repository of repositories) {
        try { await this.check(repository, fetcher); } catch (error) {
          this.dispatchEvent(new CustomEvent('error', { detail: { repository, error } }));
        }
      }
    };
    run();
    this.timer = setInterval(run, this.interval);
    return () => this.stop();
  }

  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; }
}

export const createWebhookEvent = payload => ({
  id: payload?.delivery || crypto.randomUUID(),
  type: payload?.action || 'push',
  repository: payload?.repository?.full_name || null,
  before: payload?.before || null,
  after: payload?.after || payload?.head_commit?.id || null,
  ref: payload?.ref || null,
  files: payload?.head_commit?.modified || [],
  added: payload?.head_commit?.added || [],
  removed: payload?.head_commit?.removed || [],
  receivedAt: new Date().toISOString(),
});
