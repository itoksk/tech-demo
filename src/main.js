import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { createIcons, Box, PanelTop, LayoutGrid, RotateCcw } from 'lucide';
import { cylinderState, order, phases } from './physics.js';
import './style.css';
import './lab.css';
import {enrichEngine} from './engine-detail.js';
import {mountNavigation, addCameraControls} from './navigation.js';
mountNavigation('engine');
createIcons({icons:{Box,PanelTop,LayoutGrid,RotateCcw}});
const $=id=>document.getElementById(id);
let angle=35,selected=0,running=!matchMedia('(prefers-reduced-motion: reduce)').matches;
const host=$('scene'), scene=new THREE.Scene();
scene.background=new THREE.Color(0x141c19);scene.fog=new THREE.Fog(0x141c19,22,48);
const camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(11,8,13);
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true});}catch(e){$('error').hidden=false;throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;host.append(renderer.domElement);
renderer.domElement.setAttribute('aria-label','直列6気筒エンジンの3Dモデル。気筒選択と視点ボタンでも操作できます。');
const labelRenderer=new CSS2DRenderer();labelRenderer.domElement.style.cssText='position:absolute;inset:0;pointer-events:none';host.append(labelRenderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.35,0);controls.enableDamping=true;controls.minDistance=7;controls.maxDistance=27;controls.maxPolarAngle=Math.PI*.88;
scene.add(new THREE.HemisphereLight(0xd9f3e7,0x58644a,3));
for(const [x,y,z,intensity] of [[-4,9,5,4],[6,5,-5,5],[0,2,9,2]]){const light=new THREE.DirectionalLight(0xffffff,intensity);light.position.set(x,y,z);scene.add(light);}
const engine=new THREE.Group();scene.add(engine);
const metal=new THREE.MeshStandardMaterial({color:0xa2aca9,metalness:.8,roughness:.3});
const dark=new THREE.MeshStandardMaterial({color:0x36433e,metalness:.75,roughness:.36});
const rodMat=new THREE.MeshStandardMaterial({color:0xc7b697,metalness:.75,roughness:.32});
const ringMat=new THREE.MeshStandardMaterial({color:0x34443d,metalness:.9,roughness:.25});
const shellMat=new THREE.MeshStandardMaterial({color:0x809b8b,metalness:.25,roughness:.32,transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide});
function mesh(geo,mat,parent=engine){const m=new THREE.Mesh(geo,mat);parent.add(m);return m;}
function cyl(radius,length,material,parent=engine){return mesh(new THREE.CylinderGeometry(radius,radius,length,40),material,parent);}
function beam(a,b,r,material,parent=engine){const m=cyl(r,1,material,parent);link(m,a,b);return m;}
function link(m,a,b){m.position.copy(a).add(b).multiplyScalar(.5);m.scale.y=a.distanceTo(b);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());}
for(let j=0;j<7;j++){const journal=cyl(.18,.9,metal);journal.rotation.x=Math.PI/2;journal.position.z=(j-3)*1.52;}
const crank=new THREE.Group();engine.add(crank);
const units=[];
for(let i=0;i<6;i++){
 const z=(i-2.5)*1.52,group=new THREE.Group();engine.add(group);group.position.z=z;
 const sleeve=mesh(new THREE.CylinderGeometry(.67,.67,1.65,48,1,true),shellMat,group);sleeve.position.y=2.32;
 const edge=new THREE.LineSegments(new THREE.EdgesGeometry(sleeve.geometry),new THREE.LineBasicMaterial({color:0x667d6b,transparent:true,opacity:.3}));sleeve.add(edge);
 const piston=new THREE.Group();group.add(piston);
 cyl(.57,.44,metal,piston);
 for(const y of [.13,.06,-.02]){const ring=mesh(new THREE.TorusGeometry(.573,.019,8,48),ringMat,piston);ring.rotation.x=Math.PI/2;ring.position.y=y;}
 const wrist=cyl(.12,1.12,dark,piston);wrist.rotation.z=Math.PI/2;
 const rod=cyl(.105,1,rodMat,group);
 const big=cyl(.24,.26,rodMat,group);big.rotation.x=Math.PI/2;
 const head=new THREE.Group();head.position.y=3.28;group.add(head);
 const cap=mesh(new THREE.BoxGeometry(1.35,.17,1.38),dark,head);
 for(const x of [-.49,.49])for(const zz of [-.49,.49]){const bolt=cyl(.052,.08,metal,head);bolt.position.set(x,.12,zz);}
 const valves=[];
 for(const x of [-.29,.29])for(const zz of [-.23,.23]){const v=new THREE.Group();head.add(v);v.position.set(x,0,zz);const disk=cyl(.16,.055,metal,v);disk.position.y=-.15;const stem=cyl(.04,.48,metal,v);stem.position.y=.08;valves.push(v);}
 const spark=cyl(.075,.38,rodMat,head);spark.position.y=.2;
 const gasMat=new THREE.MeshBasicMaterial({color:phases[0].color,transparent:true,opacity:.32,depthWrite:false});
 const gas=cyl(.53,1,gasMat,group);
 const button=document.createElement('button');button.className='number-label';button.textContent=String(i+1).padStart(2,'0');button.setAttribute('aria-label',`シリンダー${i+1}を選択`);button.onclick=()=>select(i);
 const label=new CSS2DObject(button);label.position.set(0,4,0);group.add(label);
 piston.traverse(o=>{if(o.isMesh)o.userData.cylinder=i});sleeve.userData.cylinder=i;cap.userData.cylinder=i;
 const offset=-order.indexOf(i+1)*120*Math.PI/180;
 const x=.62*Math.sin(offset),y=.62*Math.cos(offset);
 for(const dz of [-.31,.31]){
  const web=beam(new THREE.Vector3(0,0,z+dz),new THREE.Vector3(x,y,z+dz),.24,dark,crank);
  const weight=cyl(.38,.18,dark,crank);weight.rotation.x=Math.PI/2;weight.position.set(-x*.5,-y*.5,z+dz);
 }
 const pin=cyl(.16,.62,metal,crank);pin.rotation.x=Math.PI/2;pin.position.set(x,y,z);
 units.push({group,sleeve,piston,rod,big,head,valves,gas,label,button});
}
const wheel=cyl(1.1,.22,dark,crank);wheel.rotation.x=Math.PI/2;wheel.position.z=5.05;
const wheelRing=mesh(new THREE.TorusGeometry(.94,.06,12,64),metal,crank);wheelRing.position.z=5.18;
for(let i=0;i<8;i++){const bolt=cyl(.065,.05,metal,crank);bolt.rotation.x=Math.PI/2;bolt.position.set(.72*Math.cos(i*Math.PI/4),.72*Math.sin(i*Math.PI/4),5.19);}
const base=mesh(new THREE.BoxGeometry(2.25,.18,10.3),dark);base.position.y=-1.1;
for(let i=0;i<7;i++){const support=mesh(new THREE.BoxGeometry(1.8,.24,.16),dark);support.position.set(0,-.48,(i-3)*1.52);}
const grid=new THREE.GridHelper(50,50,0x435446,0x26372c);grid.position.y=-1.6;scene.add(grid);
const detailed=enrichEngine(engine,renderer,scene);
const modeRow=document.createElement('div');modeRow.className='mode-row';modeRow.innerHTML='<button data-engine-mode="exterior">外観</button><button data-engine-mode="cutaway" aria-pressed="true">カットモデル</button><button data-engine-mode="mechanism">機構のみ</button>';document.querySelector('.viewport').append(modeRow);
modeRow.querySelectorAll('button').forEach(b=>b.onclick=()=>{detailed.setMode(b.dataset.engineMode);modeRow.querySelectorAll('button').forEach(v=>v.setAttribute('aria-pressed',String(v===b)));});
addCameraControls(camera,controls);
const componentInfo={block:['シリンダーブロック','6つのシリンダーとクランク軸受を支える鋳造部品です。カットモデルでは手前半分を切り取り、ピストンとコンロッドの動きを見せています。'],head:['シリンダーヘッド・カバー','燃焼室上部とバルブ機構を収め、黒いカバーが潤滑油の飛散を防ぎます。分解スライダーでヘッド周辺を持ち上げられます。'],accessories:['吸排気配管・補機','銀色の吸気マニホールドが各気筒へ混合気を分配し、銅色の排気管が燃焼ガスを集めます。前端にはベルト、オルタネーター、フィルターを模式配置しています。'],oil:['オイルパン','エンジン下部で潤滑油をためる容器。外側のリブは剛性を高める形状として表現しています。オイル循環そのものは省略しています。'],cam:['カムシャフト','クランクシャフトの半分の速さで回転する軸です。カム山の回転と各バルブの開閉は説明用の簡略表現です。']};
const partsPanel=document.createElement('details');partsPanel.className='engine-parts';partsPanel.innerHTML='<summary>エンジンの部品を探究</summary><div class="part-selector">'+Object.entries(componentInfo).map(([k,v])=>'<button data-component="'+k+'">'+v[0].split('・')[0]+'</button>').join('')+'</div><h2 id="component-name">シリンダーブロック</h2><p class="description" id="component-description">'+componentInfo.block[1]+'</p>';document.querySelector('aside').append(partsPanel);
function selectComponent(key){partsPanel.open=true;$('component-name').textContent=componentInfo[key][0];$('component-description').textContent=componentInfo[key][1];partsPanel.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.component===key)));partsPanel.scrollIntoView({block:'nearest'});}
partsPanel.querySelectorAll('button').forEach(b=>b.onclick=()=>selectComponent(b.dataset.component));

const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down;
renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const rect=host.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(engine.children,true);for(const hit of hits){let obj=hit.object;if(obj.userData.cylinder!==undefined){select(obj.userData.cylinder);break;}while(obj&&obj.userData.enginePart===undefined)obj=obj.parent;if(obj){selectComponent(obj.userData.enginePart);break;}}});
for(let i=0;i<6;i++){const b=document.createElement('button');b.textContent=i+1;b.setAttribute('aria-label',`シリンダー${i+1}を選択`);b.onclick=()=>select(i);$('cylinder-buttons').append(b);}
function select(i){selected=i;$('selected-number').textContent=String(i+1).padStart(2,'0');[...$('cylinder-buttons').children].forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));units.forEach((u,j)=>{u.button.classList.toggle('selected',i===j);u.button.setAttribute('aria-pressed',String(i===j));});update();}
function setRunning(value){running=value;$('play').textContent=running?'一時停止':'再生する';$('run-status').textContent=running?'SIMULATION RUNNING':'SIMULATION PAUSED';}
$('play').onclick=()=>setRunning(!running);
$('rpm').oninput=()=>{$('rpm-value').textContent=Number($('rpm').value).toLocaleString('en-US')};
$('angle').oninput=()=>{setRunning(false);angle=Number($('angle').value);update()};
$('explode').oninput=()=>{$('explode-value').textContent=$('explode').value+'%';update()};
$('transparent').onchange=()=>{shellMat.opacity=$('transparent').checked?.12:.95;shellMat.depthWrite=!$('transparent').checked;};
$('labels').onchange=()=>units.forEach(u=>u.label.visible=$('labels').checked);
$('speed').onchange=()=>{document.querySelector('.play-row + .hint').textContent=$('speed').value==='1'?'実時間表示では動きが速く、細部を観察しにくくなります。':'動きを観察しやすい低速表示です。'};
for(const b of document.querySelectorAll('[data-phase]'))b.onclick=()=>{setRunning(false);angle=(Number(b.dataset.phase)+order.indexOf(selected+1)*120)%720;update()};
function view(kind){controls.target.set(0,1.35,0);camera.position.set(...({iso:[11,8,13],front:[14,4,0],top:[0,18,.01]}[kind]));controls.update();}
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>view(b.dataset.view);
$('reset-view').onclick=()=>view('iso');
function update(){
 const explode=Number($('explode').value)/100;
 crank.rotation.z=-angle*Math.PI/180;
 detailed.update(angle,explode);
 for(let i=0;i<6;i++){
  const u=units[i],s=cylinderState(angle,i);u.group.position.z=(i-2.5)*1.52;
  u.piston.position.y=s.y;u.head.position.y=3.28+explode*1.9;u.sleeve.position.y=2.32+explode*.6;
  const a=new THREE.Vector3(s.pin.x,s.pin.y,0),b=new THREE.Vector3(0,s.y,0);link(u.rod,a,b);u.big.position.copy(a);
  u.valves[0].position.y=s.intake?-.16*Math.sin((s.local-360)/180*Math.PI):0;
  u.valves[1].position.y=u.valves[0].position.y;
  u.valves[2].position.y=u.valves[3].position.y=s.exhaust?-.16*Math.sin((s.local-180)/180*Math.PI):0;
  const height=Math.max(.03,3.15-(s.y+.22));u.gas.scale.y=height;u.gas.position.y=s.y+.22+height/2;u.gas.material.color.setHex(phases[s.phase].color);u.gas.visible=$('colors').checked;u.label.position.y=4.65+explode*2.7;
 }
 const s=cylinderState(angle,selected),phase=phases[s.phase];$('phase-badge').textContent=phase.name;$('phase-badge').style.background='#'+phase.color.toString(16);$('phase-description').textContent=phase.description;$('displacement').textContent=s.displacement.toFixed(1)+' mm';$('valves').textContent=(s.intake?'開':'閉')+' / '+(s.exhaust?'開':'閉');$('angle-value').textContent=Math.round(angle);$('angle').value=angle;
 for(const b of document.querySelectorAll('[data-phase]')){b.classList.toggle('active',Number(b.dataset.phase)/180===s.phase);b.setAttribute('aria-pressed',String(Number(b.dataset.phase)/180===s.phase));}
}
new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();camera.aspect=width/height;camera.zoom=Math.min(1,camera.aspect/1.15);camera.updateProjectionMatrix();renderer.setSize(width,height);labelRenderer.setSize(width,height);}).observe(host);
setRunning(running);select(0);
let last=performance.now();renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.05);last=now;if(running&&!document.hidden){angle=(angle+dt*Number($('rpm').value)*6*Number($('speed').value))%720;}update();controls.update();renderer.render(scene,camera);labelRenderer.render(scene,camera);});
