import {T,createStage,material,add,tube} from './stage.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createIcons,Box,PanelTop,LayoutGrid,RotateCcw} from 'lucide';
import {mountNavigation} from './navigation.js';
import {bjtState} from './models.js';
import './style.css';import './lab.css';
mountNavigation('bjt');createIcons({icons:{Box,PanelTop,LayoutGrid,RotateCcw}});
const $=id=>document.getElementById(id),stage=createStage({position:[7,5,14],target:[0,.5,0],floor:-3.5});
const metal=material(0xc6cbcd,.9,.25),gold=material(0xd0ad70,.8,.25),plastic=material(0x20272b,.2,.45);plastic.transparent=true;plastic.opacity=.14;plastic.depthWrite=false;
const shape=new T.Shape();shape.moveTo(-2.5,-.3);shape.lineTo(2.5,-.3);shape.absarc(0,-.3,2.5,0,Math.PI,false);shape.closePath();
const casing=add(new T.ExtrudeGeometry(shape,{depth:3,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.09,bevelThickness:.09,curveSegments:40}),plastic,stage.group,[0,3,0]);casing.rotation.x=Math.PI/2;
const leads=new T.Group();stage.group.add(leads);
for(const x of [-1.55,0,1.55]){const lead=add(new RoundedBoxGeometry(.22,3.5,.22,2,.025),metal,leads,[x,-1.3,.8]);tube([[x,-.1,.8],[x,.4,.7],[x*.75,.75,1.3]],.065,gold,leads);}
const chip=new T.Group();stage.group.add(chip);chip.position.set(0,1.65,1.3);
const colors=[0x83b8d4,0xe4a56b,0x648fae],names=['emitter','base','collector'];
const regions=[];const configs=[[-1.075,1.3],[-.25,.35],[.825,1.8]];
configs.forEach(([x,w],i)=>{const mat=material(colors[i],.25,.4);mat.transparent=true;mat.opacity=.8;mat.depthWrite=false;const m=add(new T.BoxGeometry(w,1.5,1.1),mat,chip,[x,0,0]);const edges=new T.LineSegments(new T.EdgesGeometry(m.geometry),new T.LineBasicMaterial({color:colors[i]}));m.add(edges);stage.pick(m,names[i]);regions.push(m);
 for(let a=0;a<4;a++)for(let b=0;b<4;b++){const atom=add(new T.SphereGeometry(.026,8,6),material(colors[i],0,.5),chip,[x+(a/3-.5)*w*.8,(b/3-.5)*1.18,-.43]);}
});
const depletionMat=new T.MeshBasicMaterial({color:0xe5ead6,transparent:true,opacity:.22,depthWrite:false});
const depletion=add(new T.BoxGeometry(.16,1.55,1.15),depletionMat,chip,[-.05,0,0]);
const labels=names.map((key,i)=>stage.label(['E / N⁺','B / P','C / N'][i],[[-2.25,-.25,2.15][i],[.45,1.05,.45][i],.65],chip,()=>select(key)));
const pinLabels=['E','B','C'].map((text,i)=>stage.label(text,[[-1.55,0,1.55][i],-3.25,.8],leads));
const bonds=new T.Group();stage.group.add(bonds);
for(let i=0;i<3;i++){const x=configs[i][0];tube([[x,1.05,1.84],[x*.9,.9,2.0],[[-1.55,0,1.55][i],.2,.8]],.025,gold,bonds);}
const textCanvas=document.createElement('canvas');textCanvas.width=512;textCanvas.height=256;const ctx=textCanvas.getContext('2d');ctx.fillStyle='#20272b';ctx.fillRect(0,0,512,256);ctx.fillStyle='#e0e3e4';ctx.textAlign='center';ctx.font='bold 57px Arial';ctx.fillText('NPN',256,100);ctx.font='25px Arial';ctx.fillText('BIPOLAR  /  BJT',256,158);ctx.font='17px Arial';ctx.fillText('EDUCATIONAL MODEL',256,206);const texture=new T.CanvasTexture(textCanvas);texture.colorSpace=T.SRGBColorSpace;
const print=add(new T.PlaneGeometry(2.1,1.05),new T.MeshStandardMaterial({map:texture,roughness:.5}),stage.group,[0,1.7,2.41]);print.visible=false;
const particles=new T.Group();chip.add(particles);const dots=[];const electronMat=new T.MeshBasicMaterial({color:0xc0ecff});
for(let i=0;i<55;i++){const dot=add(new T.SphereGeometry(.041,8,8),electronMat,particles);dots.push(dot);}
const branchDots=[];for(let i=0;i<4;i++)branchDots.push(add(new T.SphereGeometry(.038,8,8),new T.MeshBasicMaterial({color:0xf2c994}),particles));
const arrow=new T.ArrowHelper(new T.Vector3(1,0,0),new T.Vector3(-1.7,-1.0,.7),3.4,0xbbe5f6,.2,.12);chip.add(arrow);
const flowLabel=stage.label('電子：E → C',[0,-1.35,.7],chip);
const info={emitter:['エミッタ / N⁺型','高濃度にドーピングされた領域。NPNの能動動作では、電子を薄いベースへ注入します。電子の多くはベースを通過し、コレクタへ到達します。'],base:['ベース / P型','2つのN型領域に挟まれた薄いP型領域。注入された電子の一部が再結合し、ベース電流に関係します。薄さ・ドーピングが電流増幅を左右します。'],collector:['コレクタ / N型','能動領域ではベース–コレクタ接合が逆バイアスされ、ベースを通過した電子を収集します。コレクタ電流の上限は、外部の電源と負荷抵抗にも制約されます。']};
function select(key){$('part-name').textContent=info[key][0];$('part-description').textContent=info[key][1];document.querySelectorAll('[data-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.part===key)));labels.forEach((l,i)=>{l.element.setAttribute('aria-pressed',String(names[i]===key));regions[i].material.emissive.setHex(names[i]===key?colors[i]:0);regions[i].material.emissiveIntensity=.14;});}
document.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>select(b.dataset.part));stage.onPick(select);
let mode='cutaway',running=!matchMedia('(prefers-reduced-motion: reduce)').matches,time=0,state=bjtState(20);
function setRunning(v){running=v;$('play').textContent=v?'粒子を停止':'粒子を再生';$('run-status').textContent=v?'キャリアの流れを観察中':'粒子表示は停止中';}
$('play').onclick=()=>setRunning(!running);
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;casing.visible=mode!=='junction';plastic.opacity=mode==='package'?1:.14;plastic.depthWrite=mode==='package';plastic.needsUpdate=true;print.visible=mode==='package';chip.visible=mode!=='package';leads.visible=mode!=='junction';bonds.visible=mode==='cutaway';chip.scale.setScalar(mode==='junction'?1.45:1);chip.position.y=mode==='junction'?.7:1.65;document.querySelectorAll('[data-mode]').forEach(v=>v.setAttribute('aria-pressed',String(v===b)));});
function update(){
 const ib=Number($('base-current').value),beta=Number($('beta').value),r=Number($('resistor').value);state=bjtState(ib,beta,r);
 $('base-value').innerHTML=ib+' <small>µA</small>';$('beta-value').textContent=beta;$('region').textContent=state.region;$('collector-value').textContent=(state.ic*1000).toFixed(2)+' mA';$('voltage-value').textContent=state.vce.toFixed(2)+' V';
 $('region-description').textContent={遮断:'IB = 0。漏れ電流を省略したこのモデルでは、IC = 0、VCE = 5 Vです。',能動:'IC ≈ β × IB。ベース電流に比例してコレクタ電流が増えます。',飽和:'負荷がコレクタ電流を制限します。IBを増やしてもICは増えず、IC = β × IBは成立しません。'}[state.region];
 $('circuit-r').textContent='RC = '+(r<1000?r+' Ω':r/1000+' kΩ');$('circuit-ic').textContent='IC = '+(state.ic*1000).toFixed(2)+' mA';$('circuit-vce').textContent='VCE = '+state.vce.toFixed(2)+' V';
 const ymax=state.limit*1.15,coords=[];for(let i=0;i<=150;i+=2){const s=bjtState(i,beta,r);coords.push((i?'L':'M')+(35+i*2)+','+(108-s.ic/ymax*88));}$('transfer-line').setAttribute('d',coords.join(' '));$('operating-point').setAttribute('cx',35+ib*2);$('operating-point').setAttribute('cy',108-state.ic/ymax*88);$('chart-max').textContent=(state.limit*1000).toFixed(1);
 document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.preset==='off'&&state.region==='遮断')||(b.dataset.preset==='active'&&state.region==='能動')||(b.dataset.preset==='saturated'&&state.region==='飽和'))));
 depletion.scale.x=state.region==='飽和'?.3:state.region==='遮断'?2.2:1.2;
 const electrons=$('electrons').checked;electronMat.color.setHex(electrons?0xc0ecff:0xe0edb9);flowLabel.element.textContent=electrons?'電子：E → C':'慣用電流：C → E';arrow.setDirection(new T.Vector3(electrons?1:-1,0,0));arrow.position.x=electrons?-1.7:1.7;arrow.setColor(electrons?0xbbe5f6:0xe0edb9);arrow.visible=state.ic>0;
}
for(const id of ['base-current','beta','resistor','electrons'])$(id).addEventListener('input',update);
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{const threshold=(5-.2)/Number($('resistor').value)/Number($('beta').value)*1e6;$('base-current').value=b.dataset.preset==='off'?0:b.dataset.preset==='active'?Math.max(1,Math.round(threshold*.4)):150;
 // Ensure the saturation preset is attainable even at the lowest resistance and gain.
 if(b.dataset.preset==='saturated'&&threshold>150){$('beta').value=100;}
 update();});
select('base');setRunning(running);update();
stage.animate(dt=>{if(running)time+=dt;const electrons=$('electrons').checked;const activeCount=state.ic>0?Math.max(3,Math.round(state.ic/state.limit*55)):0;
 dots.forEach((dot,i)=>{dot.visible=i<activeCount;if(!dot.visible)return;const f=(time*.45+i/Math.max(1,activeCount))%1;dot.position.set(-1.68+3.3*(electrons?f:1-f),((i%5)-2)*.24,.58+(i%3)*.07);});
 branchDots.forEach((dot,i)=>{dot.visible=state.ib>0&&mode!=='package';const f=(time*.5+i/4)%1;dot.position.set(-.25,-.15-(electrons?f:1-f)*.8,.63);});
});
