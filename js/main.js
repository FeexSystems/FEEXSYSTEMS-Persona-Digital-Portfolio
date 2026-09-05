import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';

const boot=document.querySelector('#boot');
window.addEventListener('load',()=>setTimeout(()=>boot.classList.add('hidden'),1500));

const mount=document.querySelector('#planet');
if(mount){
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(35,1,.1,100); camera.position.z=3.2;
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(mount.clientWidth,mount.clientHeight); renderer.outputColorSpace=THREE.SRGBColorSpace; mount.innerHTML=''; mount.appendChild(renderer.domElement);
  const group=new THREE.Group(); scene.add(group);
  const geometry=new THREE.SphereGeometry(1.32,96,96);
  const material=new THREE.MeshStandardMaterial({color:0x4d73b5,roughness:.72,metalness:.08,emissive:0x0a1226,emissiveIntensity:.55});
  const globe=new THREE.Mesh(geometry,material); group.add(globe);
  const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.39,64,64),new THREE.MeshBasicMaterial({color:0x86b5ff,transparent:true,opacity:.12,side:THREE.BackSide,blending:THREE.AdditiveBlending})); group.add(atmosphere);
  const starsGeo=new THREE.BufferGeometry(); const count=900; const pts=new Float32Array(count*3);
  for(let i=0;i<count;i++){const r=2.0+Math.random()*1.6, a=Math.random()*Math.PI*2, b=Math.acos(2*Math.random()-1); pts[i*3]=r*Math.sin(b)*Math.cos(a);pts[i*3+1]=r*Math.cos(b);pts[i*3+2]=r*Math.sin(b)*Math.sin(a)}
  starsGeo.setAttribute('position',new THREE.BufferAttribute(pts,3)); const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xb9d1ff,size:.012,transparent:true,opacity:.8})); scene.add(stars);
  const key=new THREE.DirectionalLight(0xffffff,2.2); key.position.set(4,3,5); scene.add(key); scene.add(new THREE.AmbientLight(0x536b9e,.6));
  let px=0,py=0,targetX=0,targetY=0;
  mount.addEventListener('pointermove',e=>{const r=mount.getBoundingClientRect();targetY=((e.clientX-r.left)/r.width-.5)*.6;targetX=((e.clientY-r.top)/r.height-.5)*.35});
  function resize(){const w=mount.clientWidth,h=mount.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()} window.addEventListener('resize',resize);
  function tick(t){requestAnimationFrame(tick);px+=(targetX-px)*.04;py+=(targetY-py)*.04;group.rotation.y+=.0018+py*.002;group.rotation.x=px;stars.rotation.y=t*.00001;renderer.render(scene,camera)} tick(0);
}

document.querySelectorAll('.planet-hotspot').forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.target)?.scrollIntoView({behavior:'smooth'})));
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.content-section,.system-card,.cap-node').forEach(el=>{el.classList.add('reveal');observer.observe(el)});

document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=document.querySelector(a.getAttribute('href'));if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth'})}}));

let audioCtx=null,osc=null;
document.querySelector('#soundToggle')?.addEventListener('click',()=>{if(!audioCtx){audioCtx=new AudioContext();osc=audioCtx.createOscillator();const gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=48;gain.gain.value=.018;osc.connect(gain).connect(audioCtx.destination);osc.start();document.querySelector('#soundToggle').textContent='◌'}else if(audioCtx.state==='running'){audioCtx.suspend();document.querySelector('#soundToggle').textContent='◉'}else{audioCtx.resume();document.querySelector('#soundToggle').textContent='◌'}});
console.log('FEEX Portfolio OS initialized.');
