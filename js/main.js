import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// ─────────────────────────────────────────────────────────────
// PERSONA OS STATE
// ─────────────────────────────────────────────────────────────
const state = {
  mode: 'EXPLORATION',
  selectedWorld: null,
  commandOpen: false,
};

const worlds = [
  { id:'3wm', name:'3WM SONIK LABS', type:'AUDIO', keywords:'music audio dsp creative ai', target:'#systems' },
  { id:'holokai', name:'HOLOKAI', type:'CULTURE', keywords:'culture civilization world model 3d ai', target:'#systems' },
  { id:'yurrheeler', name:'YURRHEELER AI', type:'HEALTH', keywords:'health agents rag ai', target:'#systems' },
  { id:'ojachat', name:'OJACHAT', type:'COMMERCE', keywords:'commerce shopping supabase llm vector', target:'#systems' },
  { id:'vyra', name:'VYRA LABS', type:'INTERFACE', keywords:'chat kotlin ux ai media', target:'#systems' },
  { id:'rental', name:'RENTAL PARADISE', type:'REAL ESTATE', keywords:'property rental react web ux', target:'#systems' },
];

function setMode(mode) {
  state.mode = mode;
  document.body.dataset.mode = mode.toLowerCase();
}

function openWorld(id) {
  const world = worlds.find((item) => item.id === id);
  if (!world) return;
  state.selectedWorld = id;
  setMode(`WORLD / ${world.type}`);
  $$('.system-card').forEach((card) => card.classList.toggle('selected', card.dataset.system === id));
  document.querySelector(world.target)?.scrollIntoView({ behavior:'smooth', block:'start' });
  setTimeout(() => document.querySelector(`[data-system="${id}"]`)?.scrollIntoView({ behavior:'smooth', block:'center' }), 350);
}

function scrollTo(target) {
  document.querySelector(target)?.scrollIntoView({ behavior:'smooth', block:'start' });
}

// ─────────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => $('#boot')?.classList.add('hidden'), 1500);
});

// ─────────────────────────────────────────────────────────────
// 3D PLANETARY WORLD MODEL
// ─────────────────────────────────────────────────────────────
const mount = $('#planet');
if (mount) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.z = 3.2;

  const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.innerHTML = '';
  mount.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1.32, 96, 96),
    new THREE.MeshStandardMaterial({ color:0x4d73b5, roughness:.72, metalness:.08, emissive:0x0a1226, emissiveIntensity:.55 })
  );
  group.add(globe);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.39, 64, 64),
    new THREE.MeshBasicMaterial({ color:0x86b5ff, transparent:true, opacity:.12, side:THREE.BackSide, blending:THREE.AdditiveBlending })
  );
  group.add(atmosphere);

  // A constellation shell around the persona core.
  const starGeometry = new THREE.BufferGeometry();
  const count = 1200;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2.0 + Math.random() * 1.8;
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    positions[i*3] = r * Math.sin(b) * Math.cos(a);
    positions[i*3+1] = r * Math.cos(b);
    positions[i*3+2] = r * Math.sin(b) * Math.sin(a);
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color:0xb9d1ff, size:.012, transparent:true, opacity:.8 }));
  scene.add(stars);

  // System nodes orbit the persona core.
  const nodes = new THREE.Group();
  const nodeGeometry = new THREE.SphereGeometry(.035, 12, 12);
  const nodeMaterial = new THREE.MeshBasicMaterial({ color:0xa8c8ff });
  for (let i = 0; i < 6; i++) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    const angle = (i / 6) * Math.PI * 2;
    node.position.set(Math.cos(angle) * 1.68, Math.sin(angle) * .72, Math.sin(angle) * .55);
    nodes.add(node);
  }
  group.add(nodes);

  scene.add(new THREE.DirectionalLight(0xffffff, 2.2));
  const ambient = new THREE.AmbientLight(0x536b9e, .6);
  scene.add(ambient);

  let px = 0, py = 0, targetX = 0, targetY = 0;
  mount.addEventListener('pointermove', (event) => {
    const rect = mount.getBoundingClientRect();
    targetY = ((event.clientX - rect.left) / rect.width - .5) * .6;
    targetX = ((event.clientY - rect.top) / rect.height - .5) * .35;
  });
  mount.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });

  function resize() {
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  function tick(time) {
    requestAnimationFrame(tick);
    px += (targetX - px) * .04;
    py += (targetY - py) * .04;
    group.rotation.y += .0018 + py * .002;
    group.rotation.x = px;
    nodes.rotation.y -= .003;
    stars.rotation.y = time * .00001;
    renderer.render(scene, camera);
  }
  tick(0);
}

// ─────────────────────────────────────────────────────────────
// COMMAND CENTER
// ─────────────────────────────────────────────────────────────
const commandCenter = $('#commandCenter');
const commandInput = $('#commandInput');
const commandResults = $('#commandResults');

function renderCommands(query = '') {
  const normalized = query.trim().toLowerCase();
  const commands = [
    { label:'Go to World Model', hint:'home / planetary core', action:() => scrollTo('#world') },
    { label:'Explore System Worlds', hint:'projects / worlds', action:() => scrollTo('#systems') },
    { label:'Open Capability Constellation', hint:'technology / skills', action:() => scrollTo('#capabilities') },
    { label:'Open Persona Core', hint:'identity / philosophy', action:() => scrollTo('#persona') },
    { label:'View System Signal', hint:'activity / state', action:() => scrollTo('#activity') },
    { label:'Open Contact Channel', hint:'engage / collaborate', action:() => scrollTo('#contact') },
    ...worlds.map((world) => ({ label:`Enter ${world.name}`, hint:`${world.type} world`, action:() => openWorld(world.id), keywords:world.keywords })),
  ];
  const filtered = commands.filter((command) => !normalized || `${command.label} ${command.hint} ${command.keywords || ''}`.toLowerCase().includes(normalized));
  commandResults.innerHTML = filtered.map((command, index) => `<button class="command-item" data-command-index="${index}"><b>${command.label}</b><small>${command.hint}</small></button>`).join('') || '<div class="command-empty">NO SIGNAL — TRY “SYSTEMS”, “PERSONA”, OR A WORLD NAME</div>';
  commandResults.querySelectorAll('.command-item').forEach((button, index) => button.addEventListener('click', () => { filtered[index].action(); closeCommand(); }));
  return filtered;
}

function openCommand() {
  state.commandOpen = true;
  commandCenter?.classList.add('open');
  commandCenter?.setAttribute('aria-hidden', 'false');
  renderCommands(commandInput?.value || '');
  setTimeout(() => commandInput?.focus(), 50);
}

function closeCommand() {
  state.commandOpen = false;
  commandCenter?.classList.remove('open');
  commandCenter?.setAttribute('aria-hidden', 'true');
}

$('#commandToggle')?.addEventListener('click', openCommand);
$('#commandClose')?.addEventListener('click', closeCommand);
$('.command-backdrop')?.addEventListener('click', closeCommand);
commandInput?.addEventListener('input', (event) => renderCommands(event.target.value));

let commandIndex = 0;
commandInput?.addEventListener('keydown', (event) => {
  const items = $$('.command-item');
  if (event.key === 'Escape') return closeCommand();
  if (event.key === 'ArrowDown') { event.preventDefault(); commandIndex = Math.min(commandIndex + 1, items.length - 1); items[commandIndex]?.focus(); }
  if (event.key === 'ArrowUp') { event.preventDefault(); commandIndex = Math.max(commandIndex - 1, 0); items[commandIndex]?.focus(); }
  if (event.key === 'Enter') { event.preventDefault(); items[commandIndex]?.click(); }
});

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); state.commandOpen ? closeCommand() : openCommand(); }
  if (event.key === 'Escape' && state.commandOpen) closeCommand();
});

// Universal OS command buttons.
$$('[data-command]').forEach((button) => button.addEventListener('click', () => {
  const command = button.dataset.command;
  if (command === 'command') return openCommand();
  if (command === 'systems') return scrollTo('#systems');
  const world = worlds.find((item) => item.id === command);
  if (world) openWorld(world.id);
}));

$$('.planet-hotspot').forEach((button) => button.addEventListener('click', () => scrollTo(`#${button.dataset.target}`)));

// ─────────────────────────────────────────────────────────────
// REVEAL + ACTIVE NAVIGATION
// ─────────────────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) entry.target.classList.add('visible');
}), { threshold:.12 });
$$('.content-section,.system-card,.cap-node,.signal-grid > div').forEach((element) => { element.classList.add('reveal'); observer.observe(element); });

const sectionObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) {
    $$('.topbar nav a').forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  }
}), { rootMargin:'-35% 0px -55% 0px' });
$$('main > section[id]').forEach((section) => sectionObserver.observe(section));

$$('a[href^="#"]').forEach((anchor) => anchor.addEventListener('click', (event) => {
  const target = document.querySelector(anchor.getAttribute('href'));
  if (target) { event.preventDefault(); target.scrollIntoView({ behavior:'smooth' }); }
}));

// ─────────────────────────────────────────────────────────────
// AMBIENT PERSONA SIGNAL
// ─────────────────────────────────────────────────────────────
let audioCtx = null;
let oscillator = null;
$('#soundToggle')?.addEventListener('click', () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 48;
    gain.gain.value = .012;
    oscillator.connect(gain).connect(audioCtx.destination);
    oscillator.start();
    $('#soundToggle').textContent = '◌';
  } else if (audioCtx.state === 'running') {
    audioCtx.suspend();
    $('#soundToggle').textContent = '◉';
  } else {
    audioCtx.resume();
    $('#soundToggle').textContent = '◌';
  }
});

setMode('EXPLORATION');
console.log('FEEX Persona OS v3.0 initialized.');
