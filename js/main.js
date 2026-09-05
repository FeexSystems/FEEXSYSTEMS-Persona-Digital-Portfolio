import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';
import { PERSONA_REGISTRY, searchPersona } from './persona-registry.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const state = { mode:'EXPLORATION', selectedWorld:null, commandOpen:false };
const worlds = PERSONA_REGISTRY.worlds.map(w => ({ ...w, type:w.domain, keywords:`${w.domain} ${w.description}`.toLowerCase(), target:'#systems' }));

function setMode(mode){state.mode=mode;document.body.dataset.mode=mode.toLowerCase();}
function scrollTo(target){document.querySelector(target)?.scrollIntoView({behavior:'smooth',block:'start'});}
function openWorld(id){const world=worlds.find(w=>w.id===id);if(!world)return;state.selectedWorld=id;setMode(`WORLD / ${world.type}`);$$('.system-card').forEach(c=>c.classList.toggle('selected',c.dataset.system===id));scrollTo('#systems');setTimeout(()=>document.querySelector(`[data-system="${id}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),350);}

window.addEventListener('load',()=>setTimeout(()=>$('#boot')?.classList.add('hidden'),1500));

// WORLD MODEL — interactive Three.js planetary core
const mount=$('#planet');
if(mount){
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.z=3.2;
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(mount.clientWidth,mount.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;mount.innerHTML='';mount.appendChild(renderer.domElement);
 const group=new THREE.Group();scene.add(group);
 const globe=new THREE.Mesh(new THREE.SphereGeometry(1.32,96,96),new THREE.MeshStandardMaterial({color:0x4d73b5,roughness:.72,metalness:.08,emissive:0x0a1226,emissiveIntensity:.55}));group.add(globe);
 group.add(new THREE.Mesh(new THREE.SphereGeometry(1.39,64,64),new THREE.MeshBasicMaterial({color:0x86b5ff,transparent:true,opacity:.12,side:THREE.BackSide,blending:THREE.AdditiveBlending})));
 const starGeometry=new THREE.BufferGeometry(),positions=new Float32Array(3600);for(let i=0;i<1200;i++){const r=2+Math.random()*1.8,a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1);positions[i*3]=r*Math.sin(b)*Math.cos(a);positions[i*3+1]=r*Math.cos(b);positions[i*3+2]=r*Math.sin(b)*Math.sin(a)}starGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));scene.add(new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xb9d1ff,size:.012,transparent:true,opacity:.8})));
 const nodes=new THREE.Group();for(let i=0;i<6;i++){const n=new THREE.Mesh(new THREE.SphereGeometry(.035,12,12),new THREE.MeshBasicMaterial({color:0xa8c8ff})),a=i/6*Math.PI*2;n.position.set(Math.cos(a)*1.68,Math.sin(a)*.72,Math.sin(a)*.55);nodes.add(n)}group.add(nodes);
 scene.add(new THREE.DirectionalLight(0xffffff,2.2),new THREE.AmbientLight(0x536b9e,.6));let px=0,py=0,tx=0,ty=0;
 mount.addEventListener('pointermove',e=>{const r=mount.getBoundingClientRect();ty=((e.clientX-r.left)/r.width-.5)*.6;tx=((e.clientY-r.top)/r.height-.5)*.35});mount.addEventListener('pointerleave',()=>{tx=0;ty=0});
 function resize(){const w=mount.clientWidth,h=mount.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}window.addEventListener('resize',resize);
 function tick(time){requestAnimationFrame(tick);px+=(tx-px)*.04;py+=(ty-py)*.04;group.rotation.y+=.0018+py*.002;group.rotation.x=px;nodes.rotation.y-=.003;starGeometry.attributes.position.needsUpdate=true;renderer.render(scene,camera)}tick(0);
}

// COMMAND BUS — navigation, world search and keyboard control
const commandCenter=$('#commandCenter'),input=$('#commandInput'),results=$('#commandResults');
const baseCommands=[
 ['Go to World Model','home / planetary core',()=>scrollTo('#world')],['Explore System Worlds','projects / worlds',()=>scrollTo('#systems')],['Open Capability Constellation','technology / skills',()=>scrollTo('#capabilities')],['Open Persona Core','identity / philosophy',()=>scrollTo('#persona')],['View System Signal','activity / state',()=>scrollTo('#activity')],['Open Contact Channel','engage / collaborate',()=>scrollTo('#contact')]
];
function renderCommands(query=''){const q=query.trim().toLowerCase();const matches=baseCommands.map(([label,hint,action])=>({label,hint,action})).concat(searchPersona(q).map(w=>({label:`Enter ${w.name}`,hint:`${w.domain} world`,action:()=>openWorld(w.id)})));const filtered=matches.filter(c=>!q||`${c.label} ${c.hint}`.toLowerCase().includes(q));results.innerHTML=filtered.map((c,i)=>`<button class="command-item" data-index="${i}"><b>${c.label}</b><small>${c.hint}</small></button>`).join('')||'<div class="command-empty">NO SIGNAL — TRY A WORLD, SYSTEM, OR CAPABILITY</div>';results.querySelectorAll('.command-item').forEach((b,i)=>b.onclick=()=>{filtered[i].action();closeCommand()});return filtered;}
function openCommand(){state.commandOpen=true;commandCenter?.classList.add('open');commandCenter?.setAttribute('aria-hidden','false');renderCommands(input?.value||'');setTimeout(()=>input?.focus(),40)}
function closeCommand(){state.commandOpen=false;commandCenter?.classList.remove('open');commandCenter?.setAttribute('aria-hidden','true')}
$('#commandToggle')?.addEventListener('click',openCommand);$('#commandClose')?.addEventListener('click',closeCommand);$('.command-backdrop')?.addEventListener('click',closeCommand);input?.addEventListener('input',e=>renderCommands(e.target.value));
let commandIndex=0;input?.addEventListener('keydown',e=>{const items=$$('.command-item');if(e.key==='Escape')return closeCommand();if(e.key==='ArrowDown'){e.preventDefault();commandIndex=Math.min(commandIndex+1,items.length-1);items[commandIndex]?.focus()}if(e.key==='ArrowUp'){e.preventDefault();commandIndex=Math.max(commandIndex-1,0);items[commandIndex]?.focus()}if(e.key==='Enter'){e.preventDefault();items[commandIndex]?.click()}});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();state.commandOpen?closeCommand():openCommand()}if(e.key==='Escape'&&state.commandOpen)closeCommand()});
$$('[data-command]').forEach(b=>b.addEventListener('click',()=>{const c=b.dataset.command;if(c==='command')return openCommand();if(c==='systems')return scrollTo('#systems');const w=worlds.find(x=>x.id===c);if(w)openWorld(w.id)}));$$('.planet-hotspot').forEach(b=>b.addEventListener('click',()=>scrollTo(`#${b.dataset.target}`)));

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});$$('.content-section,.system-card,.cap-node,.signal-grid > div').forEach(e=>{e.classList.add('reveal');observer.observe(e)});
const sectionObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)$$('.topbar nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${e.target.id}`))}),{rootMargin:'-35% 0px -55% 0px'});$$('main > section[id]').forEach(s=>sectionObserver.observe(s));
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'})}}));

// Lightweight ambient signal; starts only after an explicit user gesture.
let audioCtx=null,oscillator=null;$('#soundToggle')?.addEventListener('click',()=>{if(!audioCtx){audioCtx=new AudioContext();oscillator=audioCtx.createOscillator();const gain=audioCtx.createGain();oscillator.type='sine';oscillator.frequency.value=48;gain.gain.value=.012;oscillator.connect(gain).connect(audioCtx.destination);oscillator.start();$('#soundToggle').textContent='◌'}else if(audioCtx.state==='running'){audioCtx.suspend();$('#soundToggle').textContent='◉'}else{audioCtx.resume();$('#soundToggle').textContent='◌'}});
setMode('EXPLORATION');console.log(`FEEX Persona OS v3.0 initialized — ${PERSONA_REGISTRY.worlds.length} worlds`);
