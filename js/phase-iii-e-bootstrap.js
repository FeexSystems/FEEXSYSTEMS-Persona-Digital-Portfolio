import { PERSONA_REGISTRY } from './persona-registry.js';
import { buildWorldModel } from './world-model.js';
import { ModelBackedIntelligence } from './model-backed-intelligence.js';
import { VoiceNavigator } from './voice-navigator.js';

const style = document.createElement('style');
style.textContent = `.model-telemetry{position:fixed;right:18px;bottom:18px;z-index:90;display:flex;align-items:center;gap:8px;padding:9px 11px;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:rgba(3,7,14,.82);backdrop-filter:blur(14px);font:700 8px Inter,system-ui;letter-spacing:.12em;color:#edf3ff;box-shadow:0 12px 35px rgba(0,0,0,.35)}.model-telemetry small{font:500 7px Inter;color:#8490a3;letter-spacing:.08em}.model-dot{width:6px;height:6px;border-radius:50%;background:#73f6b1;box-shadow:0 0 10px #73f6b1}.voice-nav-btn{border:1px solid rgba(255,255,255,.12);background:transparent;color:#edf3ff;border-radius:12px;padding:5px 7px;font:700 7px Inter;letter-spacing:.1em;cursor:pointer}.voice-nav-btn:hover{border-color:rgba(138,180,255,.5);background:rgba(138,180,255,.06)}`;
document.head.appendChild(style);

const model = buildWorldModel(PERSONA_REGISTRY);
const intelligence = new ModelBackedIntelligence({ model, llmEndpoint: globalThis.FEEX_AI_ENDPOINT || '' });
const input = document.querySelector('#navInput');
const output = document.querySelector('#navOutput');

const telemetry = document.createElement('div');
telemetry.className = 'model-telemetry';
telemetry.innerHTML = '<span class="model-dot"></span><b>WORLD MODEL</b><small>INITIALIZING</small>';
document.body.appendChild(telemetry);

const updateTelemetry = state => {
  const label = telemetry.querySelector('small');
  if (!label) return;
  label.textContent = `${state.status} · ${state.repositories} REPOS · ${state.documents} DOCS · ${state.technologies} TECH · ${state.artifacts} ARTIFACTS${state.errors ? ` · ${state.errors} ERRORS` : ''}`;
};

const voiceButton = document.createElement('button');
voiceButton.className = 'voice-nav-btn';
voiceButton.type = 'button';
voiceButton.textContent = 'MIC';
voiceButton.setAttribute('aria-label', 'Start voice navigation');
telemetry.appendChild(voiceButton);

const voice = new VoiceNavigator({
  input,
  navigator: intelligence,
  onState: state => { voiceButton.textContent = state === 'LISTENING' ? 'LISTENING' : 'MIC'; },
  onResult: result => {
    if (!output) return;
    output.innerHTML = `<b>VOICE NAVIGATOR</b><p>${result.text || 'No grounded result.'}</p>`;
    output.hidden = false;
  },
});
voiceButton.addEventListener('click', () => voice.start() || (voiceButton.textContent = 'UNSUPPORTED'));

if (input && output) {
  input.addEventListener('keydown', async e => {
    if (e.key !== 'Enter') return;
    const query = input.value.trim();
    if (!query) return;
    try {
      const result = await intelligence.ask(query);
      const paragraph = output.querySelector('p');
      if (paragraph) paragraph.textContent = result.text;
      else output.innerHTML = `<b>MODEL-BACKED NAVIGATOR</b><p>${result.text}</p>`;
      output.hidden = false;
    } catch {}
  }, { passive: true });
}

setTimeout(() => intelligence.startTelemetry(600000, updateTelemetry), 1800);
updateTelemetry(intelligence.telemetry);

globalThis.FEEX_WORLD_MODEL = model;
globalThis.FEEX_NAVIGATOR_INTELLIGENCE = intelligence;
