import { PERSONA_REGISTRY } from './persona-registry.js';
import { DigitalTwin } from './digital-twin.js';

const twin = new DigitalTwin(PERSONA_REGISTRY);
const worlds = PERSONA_REGISTRY.worlds;
const $ = s => document.querySelector(s);

// Central navigation bridge: every UI entry point can delegate here.
export function navigate(target) {
  if (target === 'command') return window.FEEX_COMMAND_CENTER?.open?.();
  if (target === 'world') return window.FEEX_WORLD_ROUTER?.open?.();
  if (target?.startsWith?.('world/')) return openRoute(target.slice(6));
  if (target?.startsWith?.('#')) return document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const world = worlds.find(w => w.id === target);
  if (world) return openRoute(world.id);
}

const style = document.createElement('style');
style.textContent = `.world-route{position:fixed;inset:0;z-index:150;display:none;background:rgba(2,4,10,.84);backdrop-filter:blur(18px);overflow:auto}.world-route.open{display:block}.world-route-panel{width:min(920px,calc(100% - 28px));margin:7vh auto;border:1px solid rgba(138,180,255,.28);background:linear-gradient(145deg,rgba(10,17,30,.98),rgba(3,7,14,.99));box-shadow:0 35px 120px rgba(0,0,0,.7);padding:32px}.world-route-head{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:22px}.world-route-code,.world-route-domain,.world-route-meta span{font-size:8px;letter-spacing:.18em;color:#718098}.world-route h2{margin:8px 0;font:600 clamp(38px,6vw,72px)/.95 'Space Grotesk';letter-spacing:-.06em}.world-route-domain{color:#8ab4ff}.world-route-close{width:36px;height:36px;border:1px solid rgba(255,255,255,.14);background:transparent;color:#fff;border-radius:50%;cursor:pointer}.world-route-body{display:grid;grid-template-columns:1.4fr .8fr;gap:40px;padding-top:30px}.world-route-body p{color:#8793a6;line-height:1.8;font-size:14px}.world-route-meta{border-left:1px solid rgba(255,255,255,.1);padding-left:24px}.world-route-meta b{display:block;font:500 15px 'Space Grotesk';margin:8px 0 22px}.world-route-tags{display:flex;flex-wrap:wrap;gap:7px}.world-route-tags span{border:1px solid rgba(255,255,255,.12);padding:7px 9px;color:#aab7ca;font-size:8px;letter-spacing:.08em}.world-route-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:30px}.world-route-actions a,.world-route-actions button{display:inline-flex;align-items:center;justify-content:center;padding:13px 17px;border:1px solid rgba(255,255,255,.15);background:transparent;color:#edf3ff;text-decoration:none;font-size:9px;font-weight:700;letter-spacing:.14em;cursor:pointer}.world-route-actions .primary{background:#eef4ff;color:#05070c;border-color:#eef4ff}@media(max-width:720px){.world-route-panel{margin:3vh auto;padding:22px}.world-route-body{grid-template-columns:1fr}.world-route-meta{border-left:0;border-top:1px solid rgba(255,255,255,.1);padding:20px 0 0}}`;
document.head.appendChild(style);

const route = document.createElement('div');
route.className = 'world-route';
route.setAttribute('aria-hidden','true');
route.innerHTML = `<div class="world-route-panel" role="dialog" aria-modal="true"><div class="world-route-head"><div><div class="world-route-code" id="wrCode"></div><h2 id="wrTitle"></h2><div class="world-route-domain" id="wrDomain"></div></div><button class="world-route-close" id="wrClose" aria-label="Close world">×</button></div><div class="world-route-body"><div><p id="wrDescription"></p><div class="world-route-tags" id="wrTags"></div><div class="world-route-actions" id="wrActions"></div></div><div class="world-route-meta"><span>WORLD STATUS</span><b>CONNECTED / EXPLORABLE</b><span>PERSONA TWIN</span><b id="wrVisits">0 VISITS</b><span>REPOSITORY</span><b id="wrRepo">CANONICAL WORLD</b></div></div></div>`;
document.body.appendChild(route);

function closeRoute(clear = true) {
  route.classList.remove('open');
  route.setAttribute('aria-hidden','true');
  if (clear && location.hash.startsWith('#world/')) history.pushState({},'',location.pathname+location.search);
}

function openRoute(id, push = true) {
  const world = worlds.find(w => w.id === id);
  if (!world) return;
  twin.enter(world);
  if (push) history.pushState({world:id},'',`#world/${id}`);
  $('#wrCode').textContent = `WORLD-${String(worlds.indexOf(world)+1).padStart(2,'0')} / ${world.domain}`;
  $('#wrTitle').textContent = world.name;
  $('#wrDomain').textContent = world.domain;
  $('#wrDescription').textContent = world.description;
  $('#wrTags').innerHTML = world.capabilities.map(c => `<span>${c}</span>`).join('');
  $('#wrVisits').textContent = `${twin.snapshot().visits} VISITS`;
  $('#wrRepo').textContent = world.repo ? 'REPOSITORY CONNECTED' : 'REPOSITORY CONNECTION PENDING';
  $('#wrActions').innerHTML = `<button class="primary" id="wrFocus">FOCUS WORLD</button>${world.repo ? `<a class="primary" href="${world.repo}" target="_blank" rel="noopener noreferrer">OPEN REPOSITORY ↗</a>` : ''}<button id="wrBack">BACK TO WORLDS</button>`;
  route.classList.add('open');
  route.setAttribute('aria-hidden','false');
  $('#wrFocus').onclick = () => { closeRoute(false); document.querySelector(`[data-system="${id}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}); };
  $('#wrBack').onclick = () => closeRoute();
}

window.FEEX_WORLD_ROUTER = { open: () => { closeRoute(false); document.querySelector('#world')?.scrollIntoView({behavior:'smooth',block:'start'}); }, openWorld: openRoute, close: closeRoute, navigate };

$('#wrClose').onclick = () => closeRoute();
route.addEventListener('click', e => { if (e.target === route) closeRoute(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && route.classList.contains('open')) closeRoute(); });

document.addEventListener('click', e => {
  const button = e.target.closest('.system-open');
  if (!button) return;
  const id = button.closest('.system-card')?.dataset.system;
  if (!id) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  openRoute(id);
}, true);

document.addEventListener('click', e => {
  if (e.target.closest('.system-open,a,button')) return;
  const card = e.target.closest('.system-card');
  if (card?.dataset.system) openRoute(card.dataset.system);
});

function syncRoute() {
  const match = location.hash.match(/^#world\/([^/]+)$/);
  if (match) openRoute(match[1], false); else closeRoute(false);
}
window.addEventListener('popstate', syncRoute);
window.addEventListener('hashchange', syncRoute);
const initial = location.hash.match(/^#world\/([^/]+)$/);
if (initial) openRoute(initial[1], false);

// Upgrade the legacy command-center DOM into a guaranteed interactive controller.
const cc = $('#commandCenter');
const commandInput = $('#commandInput');
const commandResults = $('#commandResults');
const commandClose = $('#commandClose');

const commands = [
  ['Go to World Model','home / planetary core',() => navigate('#world')],
  ['Explore System Worlds','projects / worlds',() => navigate('#systems')],
  ['Open Capability Constellation','technology / skills',() => navigate('#capabilities')],
  ['Open Persona Core','identity / philosophy',() => navigate('#persona')],
  ['View System Signal','activity / state',() => navigate('#activity')],
  ['Open Contact Channel','engage / collaborate',() => navigate('#contact')],
  ['Ask AI Navigator','world model / semantic query',() => { document.querySelector('.ai-navigator-hud')?.scrollIntoView({behavior:'smooth',block:'center'}); $('#navInput')?.focus(); }],
  ...worlds.map(w => [`Enter ${w.name}`,`${w.domain} world`,() => openRoute(w.id)])
];

function renderCommands(query = '') {
  if (!commandResults) return;
  const q = query.trim().toLowerCase();
  const filtered = commands.filter(([label,hint]) => !q || `${label} ${hint}`.toLowerCase().includes(q));
  commandResults.innerHTML = filtered.length ? filtered.map(([label,hint],i) => `<button class="command-item" data-command-index="${i}"><b>${label}</b><small>${hint}</small></button>`).join('') : '<div class="command-empty">NO SIGNAL — TRY A WORLD, CAPABILITY, OR TECHNOLOGY</div>';
  commandResults.querySelectorAll('.command-item').forEach((button,i) => button.onclick = () => { filtered[i][2](); closeCommand(); });
}

function openCommand() {
  if (!cc) return;
  cc.classList.add('open');
  cc.setAttribute('aria-hidden','false');
  renderCommands(commandInput?.value || '');
  requestAnimationFrame(() => commandInput?.focus());
}
function closeCommand() {
  cc?.classList.remove('open');
  cc?.setAttribute('aria-hidden','true');
}

window.FEEX_COMMAND_CENTER = { open: openCommand, close: closeCommand, render: renderCommands };

$('#commandToggle')?.addEventListener('click', e => { e.preventDefault(); openCommand(); });
commandClose?.addEventListener('click', e => { e.preventDefault(); closeCommand(); });
$('.command-backdrop')?.addEventListener('click', closeCommand);
commandInput?.addEventListener('input', e => renderCommands(e.target.value));
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cc?.classList.contains('open') ? closeCommand() : openCommand(); }
  if (e.key === 'Escape' && cc?.classList.contains('open')) closeCommand();
});

// Hero and planetary entry points delegate to the same navigation layer.
document.addEventListener('click', e => {
  const button = e.target.closest('[data-command="command"]');
  if (!button) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  openCommand();
}, true);
