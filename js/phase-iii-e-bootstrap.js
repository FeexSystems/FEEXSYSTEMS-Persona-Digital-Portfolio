import { PERSONA_REGISTRY } from './persona-registry.js';
import { buildWorldModel } from './world-model.js';
import { ModelBackedIntelligence } from './model-backed-intelligence.js';
import { VoiceNavigator } from './voice-navigator.js';

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
