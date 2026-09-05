// Phase III-E: live GitHub ingestion + repository crawling.
// Public repositories are read through GitHub's public REST API. No token is required for the seeded public repos.

const API = 'https://api.github.com';
const TEXT_EXT = /\.(md|mdx|txt|js|jsx|ts|tsx|json|css|scss|html|yml|yaml|toml|py|go|rs|java|kt|swift|sql|sh|xml)$/i;
const IGNORE = /(^|\/)(node_modules|dist|build|\.git|coverage|vendor|\.next)(\/|$)/i;
const MAX_FILES = 80;
const MAX_FILE_BYTES = 180_000;

async function get(path) {
  const res = await fetch(`${API}${path}`, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${path}`);
  return res.json();
}

export async function fetchRepository(owner, repo) {
  const metadata = await get(`/repos/${owner}/${repo}`);
  const [languages, contents] = await Promise.all([
    get(`/repos/${owner}/${repo}/languages`).catch(() => ({})),
    get(`/repos/${owner}/${repo}/contents/${metadata.default_branch}`).catch(() => []),
  ]);
  return { metadata, languages, contents };
}

async function crawlTree(owner, repo, branch, path = '', depth = 0, out = []) {
  if (out.length >= MAX_FILES || depth > 5) return out;
  const entries = await get(`/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`).catch(() => []);
  if (!Array.isArray(entries)) return out;
  for (const entry of entries) {
    if (out.length >= MAX_FILES || IGNORE.test(entry.path)) break;
    if (entry.type === 'file' && TEXT_EXT.test(entry.name) && (entry.size ?? 0) <= MAX_FILE_BYTES) {
      out.push({ path: entry.path, size: entry.size ?? 0, sha: entry.sha, download_url: entry.download_url });
    } else if (entry.type === 'dir') {
      await crawlTree(owner, repo, branch, entry.path, depth + 1, out);
    }
  }
  return out;
}

export async function crawlRepository(owner, repo, branch) {
  const files = await crawlTree(owner, repo, branch);
  const documents = [];
  for (const file of files) {
    try {
      const text = await fetch(file.download_url).then(r => r.ok ? r.text() : '');
      if (text) documents.push({ ...file, text: text.slice(0, MAX_FILE_BYTES) });
    } catch {}
  }
  return documents;
}

function versionFrom(value) {
  if (!value || typeof value !== 'string') return null;
  const m = value.match(/[v=]?([0-9]+\.[0-9]+(?:\.[0-9]+)?)/);
  return m?.[1] ?? null;
}

export function detectTechnologies(documents = [], languages = {}) {
  const found = new Map();
  const add = (label, version = null, evidence = '') => {
    const key = label.toLowerCase();
    const prior = found.get(key) || { label, versions: [], evidence: [] };
    if (version && !prior.versions.includes(version)) prior.versions.push(version);
    if (evidence && !prior.evidence.includes(evidence)) prior.evidence.push(evidence);
    found.set(key, prior);
  };
  Object.keys(languages).forEach(lang => add(lang, null, 'GitHub language statistics'));
  const joined = documents.map(d => `${d.path}\n${d.text}`).join('\n');
  const signatures = [
    ['React', /(?:from|require\(['"]react|"react"\s*:)/i], ['TypeScript', /typescript|\.tsx?\b/i],
    ['Three.js', /three(?:\.module)?|THREE\./i], ['Vite', /vite(?:\.config)?|"vite"\s*:/i],
    ['Tailwind CSS', /tailwindcss|@tailwind/i], ['Supabase', /@supabase|supabase/i],
    ['PostgreSQL', /postgres(?:ql)?|pgvector/i], ['PGVector', /pgvector/i], ['Node.js', /node(?:js)?|package\.json/i],
    ['Python', /python|requirements\.txt|pyproject\.toml/i], ['Docker', /dockerfile|docker-compose/i],
    ['WebGL', /webgl|three\.js/i], ['RAG', /retrieval[- ]augmented|\brag\b/i], ['Agents', /agentic|tool[- ]calling|\bagent\b/i],
    ['OpenAI', /openai|responses api|chat completions/i], ['ElevenLabs', /elevenlabs/i], ['Kotlin', /kotlin|\.kt\b/i],
  ];
  signatures.forEach(([label, re]) => { if (re.test(joined)) add(label, null, 'Repository source/README signature'); });
  for (const d of documents.filter(x => /(^|\/)package\.json$/i.test(x.path))) {
    try {
      const pkg = JSON.parse(d.text);
      for (const [name, value] of Object.entries({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) })) {
        const label = name === '@supabase/supabase-js' ? 'Supabase' : name === 'three' ? 'Three.js' : name;
        add(label, versionFrom(String(value)), d.path);
      }
    } catch {}
  }
  return [...found.values()];
}

export function discoverArtifacts(documents = []) {
  const artifacts = [];
  const seen = new Set();
  const push = (label, path, kind) => { const key = `${kind}:${label}:${path}`; if (!seen.has(key)) { seen.add(key); artifacts.push({ label, path, kind }); } };
  documents.forEach(d => {
    const base = d.path.split('/').pop();
    if (/^readme(?:\.md|\.mdx)?$/i.test(base)) {
      const headings = [...d.text.matchAll(/^#{1,3}\s+(.+)$/gm)].map(m => m[1].trim()).slice(0, 20);
      headings.forEach(h => push(h, d.path, 'README_SECTION'));
    }
    if (/^(package\.json|vite\.config\.|dockerfile|docker-compose|tsconfig\.json|\.env\.example)$/i.test(base)) push(base, d.path, 'CONFIGURATION');
    if (/(^|\/)(components|pages|app|src|lib|api|functions)(\/|$)/i.test(d.path) && TEXT_EXT.test(d.path)) push(base.replace(/\.[^.]+$/, ''), d.path, 'SOURCE_ARTIFACT');
  });
  return artifacts;
}

export async function ingestRepository(seed) {
  const [owner, repo] = seed.url.replace('https://github.com/', '').split('/');
  const { metadata, languages } = await fetchRepository(owner, repo);
  const documents = await crawlRepository(owner, repo, metadata.default_branch);
  const technologies = detectTechnologies(documents, languages);
  const artifacts = discoverArtifacts(documents);
  return {
    source: 'github', fetchedAt: new Date().toISOString(),
    repository: {
      id: `repo:${repo.toLowerCase()}`, owner, repo, url: seed.url,
      description: metadata.description, defaultBranch: metadata.default_branch,
      stars: metadata.stargazers_count, forks: metadata.forks_count,
      openIssues: metadata.open_issues_count, updatedAt: metadata.updated_at,
      pushedAt: metadata.pushed_at, size: metadata.size, archived: metadata.archived,
      license: metadata.license?.spdx_id ?? null, languages,
    },
    documents, technologies, artifacts,
  };
}

export async function ingestRepositories(seeds, onRepository = () => {}) {
  const results = [];
  for (const seed of seeds) {
    try { const result = await ingestRepository(seed); results.push(result); onRepository(result); } catch (error) { onRepository({ error: error.message, seed }); }
  }
  return results;
}
