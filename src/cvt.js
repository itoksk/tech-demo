import {T,createStage,material,add,cylinder} from './stage.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createIcons,Box,PanelTop,LayoutGrid,RotateCcw} from 'lucide';
import {mountNavigation} from './navigation.js';
import {cvtState,beltPoint,BELT_LENGTH,CENTER_DISTANCE} from './models.js';
import './style.css';import './lab.css';import './cvt.css';
mountNavigation('cvt');createIcons({icons:{Box,PanelTop,LayoutGrid,RotateCcw}});
const $=id=>document.getElementById(id),stage=createStage({position:[3,4,18],floor:-2.75});
const steel=material(0xbac3c6,.94,.22),dark=material(0x353e40,.76,.3),gold=material(0xbf9259,.7,.3),blue=material(0x6b9eb9,.7,.3),beltMat=material(0xb2bca8,.8,.37);
let displayMode='cutaway';const wheels=[];
for(let i=0;i<2;i++){
 const g=new T.Group();g.position.x=(i?1:-1)*CENTER_DISTANCE/2;stage.group.add(g);
 const front=add(new T.LatheGeometry([new T.Vector2(.3,-.205),new T.Vector2(2.3,.495),new T.Vector2(2.3,.675),new T.Vector2(.3,-.025)],80),steel,g);front.rotation.x=-Math.PI/2;
 const rear=front.clone();g.add(rear);rear.rotation.x=Math.PI/2;rear.material=steel.clone();rear.material.transparent=true;rear.material.depthWrite=false;
 const rotor=new T.Group();g.add(rotor);
 const shaft=cylinder(.24,3.5,steel,rotor);shaft.rotation.x=Math.PI/2;
 const hub=cylinder(.55,.45,i?blue:gold,rotor,[0,0,1.28]);hub.rotation.x=Math.PI/2;
 for(let j=0;j<8;j++){const bolt=cylinder(.06,.08,dark,rotor,[Math.cos(j*Math.PI/4)*.41,Math.sin(j*Math.PI/4)*.41,1.55]);bolt.rotation.x=Math.PI/2;}
 for(let j=0;j<12;j++){const bar=add(new T.BoxGeometry(.06,.38,.045),dark,rotor,[Math.cos(j*Math.PI/6)*.77,Math.sin(j*Math.PI/6)*.77,1.02]);bar.rotation.z=j*Math.PI/6-Math.PI/2;}
 const bearing=cylinder(.65,.35,dark,g,[0,0,-1.3]);bearing.rotation.x=Math.PI/2;
 const contact=add(new T.TorusGeometry(1,.035,8,96),i?blue:gold,g,[0,0,.3]);
 const marker=add(new T.BoxGeometry(.09,1,.07),i?blue:gold,rotor,[0,.7,1.6]);
 const actuator=cylinder(.8,.5,dark,g,[0,0,-1.05]);actuator.rotation.x=Math.PI/2;
 wheels.push({g,front,rear,rotor,contact,marker});stage.pick(front,i?'secondary':'primary');stage.pick(hub,i?'secondary':'primary');
}
const count=180,belt=new T.InstancedMesh(new T.BoxGeometry(.108,.105,.43),beltMat,count);stage.group.add(belt);stage.pick(belt,'belt');
const housingMat=material(0x8e9b97,.5,.45);housingMat.transparent=true;housingMat.opacity=.13;housingMat.depthWrite=false;
const housing=add(new RoundedBoxGeometry(12.4,5.1,2.9,4,.5),housingMat,stage.group,[0,0,-.4]);housing.visible=false;
const backing=add(new RoundedBoxGeometry(11.8,4.75,.18,3,.4),dark,stage.group,[0,0,-1.55]);
for(const x of [-5.4,-3.6,0,3.6,5.4])for(const y of [-2,2]){const bolt=cylinder(.075,.13,steel,stage.group,[x,y,-1.41]);bolt.rotation.x=Math.PI/2;}
const labels=[stage.label('① エンジンから / 入力',[-3.6,2.75,0],stage.group,()=>select('primary')),stage.label('③ 車輪へ / 出力',[3.6,2.75,0],stage.group,()=>select('secondary')),stage.label('② ベルトで伝達',[0,-2.45,.3],stage.group,()=>select('belt'))];
const descriptions={primary:['入力プーリー','エンジン側につながるプーリー。円すい面の間隔が狭くなると、ベルトは外側へ移動し接触半径が大きくなります。'],secondary:['出力プーリー','車輪側へ回転を伝えるプーリー。入力側と連動して間隔を変え、一定のベルト長を保ちます。大きな接触半径では回転数が下がり、トルクが増えます。'],belt:['金属ベルト','多数の金属エレメントと積層リングで力を伝える模式モデルです。2つのプーリー間でベルトの移動速度は共通。表示ではエレメントの間隔を広げています。']};
function select(key){$('part-name').textContent=descriptions[key][0];$('part-description').textContent=descriptions[key][1];document.querySelectorAll('[data-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.part===key)));labels.forEach((l,i)=>l.element.setAttribute('aria-pressed',String(['primary','secondary','belt'][i]===key)));}
stage.onPick(select);document.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>select(b.dataset.part));
const readout=document.createElement('div');readout.className='canvas-readout';document.querySelector('.viewport').append(readout);
let actualCommand=50;const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let running=!matchMedia('(prefers-reduced-motion: reduce)').matches,auto=false,sweep=0,travel=0,state=cvtState(50),a1=0,a2=0;
function setRunning(v){running=v;$('play').textContent=v?'一時停止':'再生する';$('run-status').textContent=v?'低速で観察中':'停止中';}
$('play').onclick=()=>setRunning(!running);
function setAuto(v){auto=v;$('sweep').textContent=v?'自動変速を停止':'自動で変速';$('sweep').setAttribute('aria-pressed',String(v));}
$('sweep').onclick=()=>{setAuto(!auto);if(auto){sweep=Math.asin((Number($('ratio').value)-50)/50);setRunning(true);}};
function updateUI(){
 const command=Number($('ratio').value),rpm=Number($('input-rpm').value);state=cvtState(actualCommand,rpm);
 readout.innerHTML='<span>変速比 <b>'+state.ratio.toFixed(2)+'</b></span><span>出力 <b>'+Math.round(state.outputRPM).toLocaleString()+'</b> rpm</span>';
 $('ratio-command').innerHTML=Math.round(actualCommand)+' <small>%'+(Math.abs(command-actualCommand)>.1?' → '+command+'%':'')+'</small>';$('input-reading').innerHTML=rpm.toLocaleString()+' <small>rpm</small>';$('ratio-value').textContent=state.ratio.toFixed(2);$('output-rpm').textContent=Math.round(state.outputRPM).toLocaleString()+' rpm';$('torque').textContent='×'+state.torqueRatio.toFixed(2);$('r1').textContent=(state.r1*30).toFixed(1)+' mm';$('r2').textContent=(state.r2*30).toFixed(1)+' mm';
 document.querySelectorAll('[data-ratio]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.ratio)===command)));
 [state.r1,state.r2].forEach((r,i)=>{wheels[i].front.position.z=0;wheels[i].rear.position.z=-.7*(r-1.5);wheels[i].contact.scale.set(r,r,1);wheels[i].contact.position.z=-.35*(r-1.5)+.25;});
 $('transmission-story').textContent=state.ratio>1.05?'減速：入力より出力がゆっくり回る。その分、出力トルクが増える。':state.ratio<.95?'増速：入力より出力が速く回る。その分、出力トルクは小さくなる。':'ほぼ等速：入力と出力の回転数・トルクがほぼ同じ。';
 $('flow-input').textContent=rpm.toLocaleString()+' rpm';$('flow-output').textContent=Math.round(state.outputRPM).toLocaleString()+' rpm';
 $('flow-torque').textContent='入力を1としたトルク：'+state.torqueRatio.toFixed(2);
 drawSection();
}
$('ratio').oninput=()=>{setAuto(false);updateUI()};$('input-rpm').oninput=updateUI;document.querySelectorAll('[data-ratio]').forEach(b=>b.onclick=()=>{setAuto(false);$('ratio').value=b.dataset.ratio;updateUI()});
function setMode(mode){displayMode=mode;housing.visible=mode==='housing';wheels.forEach(w=>{w.rear.visible=true;w.rear.material.opacity=mode==='cutaway'?.16:1;w.contact.visible=mode==='cutaway';});$('mode-caption').textContent=mode==='cutaway'?'手前の可動シーブを透視 / 外径・軸間距離は一定':'固定シーブは動かず、可動シーブだけが軸方向に移動';document.querySelectorAll('[data-mode]').forEach(v=>v.setAttribute('aria-pressed',String(v.dataset.mode===mode)));}
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
 function drawSection(){
 $('sheave-diagram').innerHTML=[state.r1,state.r2].map((r,i)=>{const x=i*190+95,y=117-r*28,top=-18,bottom=-3,center=top+(y+5-40)*15/82+12,move=2*center;return `<g><text x="${x}" y="20" text-anchor="middle">${i?'出力':'入力'} / ${r>1.5?'狭い溝・外周':'広い溝・内周'}</text><path d="M ${x+top-18} 40 L ${x+top} 40 L ${x+bottom} 122 L ${x+bottom-18} 122 Z M ${x-top+18+move} 40 L ${x-top+move} 40 L ${x-bottom+move} 122 L ${x-bottom+18+move} 122 Z" fill="${i?'#85b8d3':'#e5b67b'}"/><rect x="${x+center-12}" y="${y}" width="24" height="10" rx="2" fill="#5c783c"/><path d="M ${x-73} 130 H ${x+73}" stroke="#647067"/><text x="${x}" y="155" text-anchor="middle">接触半径 ${(r*30).toFixed(1)} mm</text></g>`}).join('');
 }
 setMode('cutaway');
const dummy=new T.Object3D();
 const tracer=add(new T.SphereGeometry(.13,12,8),material(0xebff99,.1,.3),stage.group);
 const arrows=[0,.5].map(()=>{const a=new T.ArrowHelper(new T.Vector3(1,0,0),new T.Vector3(),.8,0xd2eb96,.26,.16);stage.group.add(a);return a;});
function beltZ(x){const t=Math.max(0,Math.min(1,(x+CENTER_DISTANCE/2)/CENTER_DISTANCE));return -.35*((1-t)*state.r1+t*state.r2-1.5);}
function updateBelt(){for(let j=0;j<count;j++){const s=j/count+travel,p=beltPoint(s,state.r1,state.r2),q=beltPoint(s+.0001,state.r1,state.r2);dummy.position.set(p[0],p[1],beltZ(p[0]));dummy.rotation.z=Math.atan2(q[1]-p[1],q[0]-p[0]);dummy.updateMatrix();belt.setMatrixAt(j,dummy.matrix);}belt.instanceMatrix.needsUpdate=true;
 const p=beltPoint(travel,state.r1,state.r2);tracer.position.set(p[0],p[1],beltZ(p[0])+.32);
 arrows.forEach((a,i)=>{const p=beltPoint(i*.5+.12,state.r1,state.r2),q=beltPoint(i*.5+.125,state.r1,state.r2);a.position.set(p[0],p[1],beltZ(p[0])+.4);a.setDirection(new T.Vector3(q[0]-p[0],q[1]-p[1],0).normalize());});}
setRunning(running);updateUI();select('primary');
stage.animate(dt=>{const target=Number($('ratio').value);const delta=target-actualCommand;if(Math.abs(delta)>.001){actualCommand=reducedMotion?target:actualCommand+Math.sign(delta)*Math.min(Math.abs(delta),dt*32);updateUI();}if(running){if(auto){sweep+=dt*.22;$('ratio').value=Math.round(50+50*Math.sin(sweep));updateUI();}const w=Number($('input-rpm').value)/60*Math.PI*2/40;a1-=w*dt;a2-=w*dt/state.ratio;travel=(travel+w*state.r1*dt/BELT_LENGTH)%1;wheels[0].rotor.rotation.z=a1;wheels[1].rotor.rotation.z=a2;}updateBelt();});
