import {T,createStage,material,add,tube} from './stage.js';
import {createIcons,Box,PanelTop,LayoutGrid,RotateCcw} from 'lucide';
import {mountNavigation} from './navigation.js';
import {mosfetState} from './mosfet-model.js';
import './style.css';import './lab.css';import './mosfet.css';
mountNavigation('mosfet');createIcons({icons:{Box,PanelTop,LayoutGrid,RotateCcw}});
const $=id=>document.getElementById(id),stage=createStage({position:[8,6.5,13],target:[0,.7,0],floor:-1.4});
const bodyMat=material(0xb78762,.25,.5),nMat=material(0x73aaca,.25,.35),metal=material(0xbec8cb,.85,.25),gateMat=material(0xcbb078,.65,.3);
const oxideMat=new T.MeshPhysicalMaterial({color:0xd6e6e0,transparent:true,opacity:.42,roughness:.22,metalness:.05,depthWrite:false});
const chip=new T.Group();stage.group.add(chip);
const boxes=(w,h,d,m,parent,pos)=>add(new T.BoxGeometry(w,h,d),m,parent,pos);
const substrate=new T.Group();chip.add(substrate);boxes(6,.8,2.7,bodyMat,substrate,[0,-.35,0]);boxes(2.7,.7,2.7,bodyMat,substrate,[0,.4,0]);
const source=boxes(1.65,.7,2.7,nMat,chip,[-2.175,.4,0]),drain=boxes(1.65,.7,2.7,nMat,chip,[2.175,.4,0]);
const gateStack=new T.Group();chip.add(gateStack);
const oxide=boxes(2.85,.16,2.85,oxideMat,gateStack,[0,.85,0]);
const gate=boxes(2.75,.25,2.7,gateMat,gateStack,[0,1.065,0]);
const sourceContact=boxes(.82,.12,1.2,metal,chip,[-2.175,.81,0]),drainContact=boxes(.82,.12,1.2,metal,chip,[2.175,.81,0]);
for(const x of [-2.175,2.175])tube([[x,.87,0],[x,1.65,0],[x*1.3,2.0,0]],.055,metal,chip);
tube([[0,1.2,0],[0,2.0,0],[0,2.35,0]],.055,metal,gateStack);
const chargeMaterial=new T.MeshBasicMaterial({color:0xeed6b8});
for(let x=-2.7;x<=2.7;x+=.6)for(const z of [-.95,0,.95])add(new T.SphereGeometry(.028,8,6),chargeMaterial,chip,[x,-.35,z]);
const slices=[];const channelMat=new T.MeshBasicMaterial({color:0xbddd86,transparent:true,opacity:.75});
for(let i=0;i<50;i++){const m=boxes(2.7/50+.002,.1,2.76,channelMat,chip,[-1.35+(i+.5)*2.7/50,.71,0]);slices.push(m);}
const channelPick=boxes(2.7,.18,2.7,new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),chip,[0,.68,0]);
const electric=new T.Group();chip.add(electric);for(const x of [-.9,-.45,0,.45,.9])electric.add(new T.ArrowHelper(new T.Vector3(0,-1,0),new T.Vector3(x,1.01,1.43),.45,0xf2d095,.09,.045));
const fieldCaption=stage.label('電界 ↓',[.05,1.65,1.45],gateStack);
const definitions={gate:['ゲート / G','絶縁膜の上の電極。正のゲート電圧による電界がP型基板表面に電子を集め、反転層を形成します。ゲートから酸化膜を突き抜けて電子を注入するモデルではありません。'],oxide:['ゲート絶縁膜','ゲートと半導体を隔てる薄い絶縁層。ここでは酸化膜として表示しています。直流の理想モデルでは膜を通るゲート電流は0 Aですが、実機では充放電電流や漏れも考慮します。'],source:['ソース / S・N⁺型','チャネルへ電子を供給する高濃度N型領域。この教材ではソースを0 Vとし、基板も同じ電位へ接続しています。電子はSからD、慣用電流はDからSです。'],drain:['ドレイン / D・N⁺型','正のVDSでチャネルの電子を引き寄せる領域。VDSが大きくなると、ドレイン側でゲートとチャネルの電位差が小さくなり、反転層が薄くなります。'],body:['ボディ / P型基板','N⁺型のソースとドレインを形成したP型の半導体。ゲート直下の表面が反転するとN型のチャネルができます。本モデルはボディとソースを接地し、ボディ効果を省略しています。'],channel:['反転層 / チャネル','VGSがVthを超えるとゲート直下に形成される電子の通り道。飽和領域ではドレイン端でピンチオフしますが、電子は空乏領域の電界によりドレインへ運ばれ続けます。']};
const pickMap={gate,oxide,source,drain,body:substrate,channel:channelPick};Object.entries(pickMap).forEach(([key,obj])=>stage.pick(obj,key));
const labels=[stage.label('S / N⁺',[-2.9,1.2,1.2],chip,()=>select('source')),stage.label('G / ゲート',[0,2.65,0],gateStack,()=>select('gate')),stage.label('D / N⁺',[2.9,1.2,1.2],chip,()=>select('drain')),stage.label('P型基板',[0,-.95,1.5],chip,()=>select('body'))];
const flow=stage.label('電子：S → D',[0,-.2,1.6],chip);
const dots=[];const dotMat=new T.MeshBasicMaterial({color:0xe2ffd5});for(let i=0;i<60;i++)dots.push(add(new T.SphereGeometry(.037,8,8),dotMat,chip));
let state=mosfetState(3.5,3),running=!matchMedia('(prefers-reduced-motion: reduce)').matches,time=0,exploded=false;
function select(key){$('part-name').textContent=definitions[key][0];$('part-description').textContent=definitions[key][1];document.querySelectorAll('[data-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.part===key)));labels.forEach((l,i)=>l.element.setAttribute('aria-pressed',String(['source','gate','drain','body'][i]===key)));}
stage.onPick(select);document.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>select(b.dataset.part));
function setRunning(v){running=v;$('play').textContent=v?'粒子を停止':'粒子を再生';$('run-status').textContent=v?'粒子を観察中':'粒子表示は停止中';}
$('play').onclick=()=>setRunning(!running);
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{exploded=b.dataset.mode==='exploded';gateStack.position.y=exploded?1.1:0;document.querySelectorAll('[data-mode]').forEach(v=>v.setAttribute('aria-pressed',String(v===b)));update();});
function plot(){
 const px=v=>42+v/5*338,py=i=>153-i/.020*130;
 const transfer=[],output=[];
 for(let j=0;j<=100;j++){const x=j/20;transfer.push((j?'L':'M')+px(x)+','+py(mosfetState(x,state.vds,state.vth).id));output.push((j?'L':'M')+px(x)+','+py(mosfetState(state.vgs,x,state.vth).id));}
 $('transfer-line').setAttribute('d',transfer.join(' '));$('output-line').setAttribute('d',output.join(' '));
 for(const [prefix,x] of [['transfer',state.vgs],['output',state.vds]]){$(prefix+'-dot').setAttribute('cx',px(x));$(prefix+'-dot').setAttribute('cy',py(state.id));}
 $('threshold-line').setAttribute('d',`M${px(state.vth)} 20V153`);$('threshold-label').setAttribute('x',px(state.vth)+4);$('threshold-label').textContent='Vth '+state.vth.toFixed(1);
 $('boundary-line').setAttribute('d',state.channel?`M${px(state.overdrive)} 20V153`:'');
}
function update(){
 state=mosfetState(Number($('gate-voltage').value),Number($('drain-voltage').value),Number($('threshold').value));
 $('gate-value').textContent=state.vgs.toFixed(2)+' V';$('drain-value').textContent=state.vds.toFixed(2)+' V';$('threshold-value').textContent=state.vth.toFixed(2)+' V';$('drain-current').textContent=(state.id*1000).toFixed(2)+' mA';$('canvas-current').textContent=(state.id*1000).toFixed(2);$('region').textContent=$('canvas-region').textContent=state.region;
 $('region-description').textContent={遮断:'VGS ≤ Vth。反転チャネルは形成されず、漏れ電流を省略したモデルではID = 0です。',線形:'VDS < VGS − Vth。チャネルがS–D間につながります。小さなVDSでは抵抗のように振る舞います。',飽和:'VDS ≥ VGS − Vth。ドレイン端がピンチオフ。電流は流れ続け、理想モデルではVDSを増やしてもIDは一定です。'}[state.region];
 document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String({off:'遮断',linear:'線形',saturation:'飽和'}[b.dataset.preset]===state.region)));
 slices.forEach((m,i)=>{m.visible=state.channel;const f=(i+.5)/slices.length;const endCharge=Math.max(0,state.overdrive-Math.min(state.vds,state.overdrive)*f);m.scale.y=Math.max(.025,endCharge/4.5*2.1);m.position.y=.748-.05*m.scale.y;});
 channelPick.visible=state.channel;electric.visible=$('field').checked&&state.vgs>0;fieldCaption.visible=electric.visible;electric.children.forEach(a=>{a.position.y=1.01+(exploded?1.1:0);a.setLength(.3+state.vgs*.045+(exploded?1.1:0),.09,.045);});
 flow.element.textContent=state.id===0?(state.channel?'チャネルあり / 電流 0':'チャネルなし / 電流 0'):($('flow-direction').value==='electrons')?'電子：S → D':'慣用電流：D → S';
 plot();drawParticles();
}
function drawParticles(){const count=state.id>0?Math.max(5,Math.round(state.id/.020*60)):0;dots.forEach((p,i)=>{p.visible=i<count;if(!p.visible)return;const f=(time*.35+i/Math.max(1,count))%1;p.position.set(-2.85+5.7*(($('flow-direction').value==='electrons')?f:1-f),.755,((i%6)-2.5)*.35);});}
for(const id of ['gate-voltage','drain-voltage','threshold','field','flow-direction'])$(id).addEventListener('input',update);
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{$('gate-voltage').value=b.dataset.preset==='off'?0:Number($('threshold').value)+2;$('drain-voltage').value=b.dataset.preset==='linear'?.5:3;update();});
select('gate');setRunning(running);update();stage.animate(dt=>{if(running)time+=dt;drawParticles();});
