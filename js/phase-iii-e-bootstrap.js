import { PERSONA_REGISTRY } from './persona-registry.js';
import { buildWorldModel } from './world-model.js';
import { ModelBackedIntelligence } from './model-backed-intelligence.js';
import { VoiceNavigator } from './voice-navigator.js';
import { RepositoryChangeDetector, createWebhookEvent } from './phase-iii-f-change-detection.js';
import { WorldModelMutationEngine } from './phase-iii-f-mutation-engine.js';
import { TemporalWorldModel } from './phase-iii-f-temporal-world-model.js';
import { AutonomousWorldModelAgent } from './phase-iii-f-agent.js';
import { createWorldModelAgentTools } from './phase-iii-f-agent-tools.js';
import { AgentToolRuntime } from './phase-iii-f-agent-runtime.js';
import { PredictiveNavigator } from './phase-iii-f-predictive-navigator.js';
import { ProactiveEventSystem } from './phase-iii-f-event-system.js';
import { DigitalTwin } from './digital-twin.js';
import { DigitalTwinIntelligence } from './phase-iii-f-digital-twin-intelligence.js';
import { FeexWorldRuntime } from './feex-world-runtime.js';

const style = document.createElement('style');
style.textContent = `.model-telemetry{position:fixed;right:18px;bottom:18px;z-index:90;display:flex;align-items:center;gap:8px;padding:9px 11px;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:rgba(3,7,14,.82);backdrop-filter:blur(14px);font:700 8px Inter,system-ui;letter-spacing:.12em;color:#edf3ff;box-shadow:0 12px 35px rgba(0,0,0,.35)}.model-telemetry small{font:500 7px Inter;color:#8490a3;letter-spacing:.08em}.model-dot{width:6px;height:6px;border-radius:50%;background:#73f6b1;box-shadow:0 0 10px #73f6b1}.voice-nav-btn{border:1px solid rgba(255,255,255,.12);background:transparent;color:#edf3ff;border-radius:12px;padding:5px 7px;font:700 7px Inter;letter-spacing:.1em;cursor:pointer}`;
document.head.appendChild(style);

const model = buildWorldModel(PERSONA_REGISTRY);
const intelligence = new ModelBackedIntelligence({ model, llmEndpoint: globalThis.FEEX_AI_ENDPOINT || '' });
const twin = new DigitalTwin(PERSONA_REGISTRY);
const twinIntelligence = new DigitalTwinIntelligence(twin);
const temporal = new TemporalWorldModel(model);
const mutations = new WorldModelMutationEngine(model);
const events = new ProactiveEventSystem();
const tools = createWorldModelAgentTools({ model, intelligence });
const runtime = new AgentToolRuntime({ search: async ({ query }) => tools.search(query), neighbors: async ({ id }) => tools.neighbors(id), path: async ({ from, to }) => tools.path(from, to), compare: async ({ left, right }) => tools.compare(left, right) });
const agent = new AutonomousWorldModelAgent({ model, mutationEngine: mutations, temporalModel: temporal, tools });
const predictive = new PredictiveNavigator({ model, temporalModel: temporal, digitalTwin: twinIntelligence });
const world = new FeexWorldRuntime({ model, twin: twinIntelligence, agent, navigator: predictive, events });

const telemetry = document.createElement('div');
telemetry.className = 'model-telemetry';
telemetry.innerHTML = '<span class="model-dot"></span><b>FEEX WORLD</b><small>III-F BOOTING</small>';
document.body.appendChild(telemetry);
const updateTelemetry = state => { const label = telemetry.querySelector('small'); if (label) label.textContent = `${state.status} · ${state.repositories} REPOS · ${state.documents} DOCS · ${state.technologies} TECH · ${state.artifacts} ARTIFACTS${state.errors ? ` · ${state.errors} ERRORS` : ''}`; };

const voiceButton = document.createElement('button');
voiceButton.className = 'voice-nav-btn'; voiceButton.type = 'button'; voiceButton.textContent = 'MIC';
telemetry.appendChild(voiceButton);
const input = document.querySelector('#navInput');
const output = document.querySelector('#navOutput');
const voice = new VoiceNavigator({ input, navigator: intelligence, onState: state => { voiceButton.textContent = state === 'LISTENING' ? 'LISTENING' : 'MIC'; }, onResult: result => { if (!output) return; output.innerHTML = `<b>VOICE NAVIGATOR</b><p>${result.text || 'No grounded result.'}</p>`; output.hidden = false; } });
voiceButton.addEventListener('click', () => voice.start() || (voiceButton.textContent = 'UNSUPPORTED'));

if (input && output) input.addEventListener('keydown', async e => { if (e.key !== 'Enter') return; const query = input.value.trim(); if (!query) return; try { const result = await intelligence.ask(query); const paragraph = output.querySelector('p'); if (paragraph) paragraph.textContent = result.text; else output.innerHTML = `<b>MODEL-BACKED NAVIGATOR</b><p>${result.text}</p>`; output.hidden = false; } catch {} }, { passive: true });

const repositorySeeds = (PERSONA_REGISTRY || []).filter(w => w.repo).map(w => w.repo);
const detector = new RepositoryChangeDetector({ interval: 300000, onChange: event => { predictive.observe(event); twinIntelligence.ingest({ type:'REPOSITORY_CHANGED', timestamp:new Date().toISOString(), payload:event }); events.emit('REPOSITORY_CHANGED', event, 'high'); agent.observe(createWebhookEvent({ delivery:event.current?.delivery, repository:{ full_name:event.repository }, before:event.previous?.commitSha, after:event.current?.commitSha, ref:event.current?.branch })); } });
const fetchSnapshot = async repository => { const [owner, repo] = repository.replace('https://github.com/','').split('/'); const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers:{ Accept:'application/vnd.github+json' } }); if (!response.ok) throw new Error(`GitHub ${response.status}`); const data = await response.json(); return { commitSha:data.pushed_at || data.updated_at, branch:data.default_branch, updatedAt:data.updated_at }; };
if (repositorySeeds.length) detector.start(repositorySeeds, fetchSnapshot);

agent.addEventListener('mutation:committed', e => { temporal.snapshot('mutation'); events.emit('WORLD_MODEL_MUTATION', e.detail, 'high'); });
predictive.addEventListener('prediction', e => { e.detail.forEach(signal => events.emit('PREDICTION', signal, 'normal')); });
events.addEventListener('event', e => twinIntelligence.ingest(e.detail));

setTimeout(() => intelligence.startTelemetry(600000, updateTelemetry), 1800);
updateTelemetry(intelligence.telemetry);
world.start();

globalThis.FEEX_WORLD_MODEL = model;
globalThis.FEEX_NAVIGATOR_INTELLIGENCE = intelligence;
globalThis.FEEX_WORLD_AGENT = agent;
globalThis.FEEX_AGENT_RUNTIME = runtime;
globalThis.FEEX_PREDICTIVE_NAVIGATOR = predictive;
globalThis.FEEX_WORLD_EVENTS = events;
globalThis.FEEX_DIGITAL_TWIN_INTELLIGENCE = twinIntelligence;
globalThis.FEEX_WORLD_RUNTIME = world;
