import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {CSS2DRenderer,CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {addCameraControls} from './navigation.js';
export {T};
export function createStage({position=[9,7,14],target=[0,0,0],floor=-2.8}={}){
 const host=document.getElementById('scene'),scene=new T.Scene();scene.background=new T.Color(0x141c19);
 let renderer;try{renderer=new T.WebGLRenderer({antialias:true});}catch(error){host.innerHTML='<div class="failure" role="alert">3D表示を開始できません。WebGL対応ブラウザで再読み込みしてください。<button onclick="location.reload()">再読み込み</button></div>';throw error;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;host.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','操作できる3Dモデル。視点ボタンと部品ボタンでも操作できます。');
 const env=new RoomEnvironment(),pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromScene(env,.05).texture;env.dispose();pm.dispose();
 const camera=new T.PerspectiveCamera(38,1,.1,100);camera.position.set(...position);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(...target);controls.enableDamping=true;controls.minDistance=7;controls.maxDistance=30;
 scene.add(new T.HemisphereLight(0xe2f0e7,0x45594a,2));for(const xyz of [[4,8,7],[-5,3,-4]]){const light=new T.DirectionalLight(0xffffff,3);light.position.set(...xyz);scene.add(light);}
 const grid=new T.GridHelper(40,40,0x425346,0x24332a);grid.position.y=floor;scene.add(grid);
 const labels=new CSS2DRenderer();labels.domElement.style.cssText='position:absolute;inset:0;pointer-events:none';host.append(labels.domElement);
 const group=new T.Group();scene.add(group);
 function label(text,position,parent=group,onClick){const el=document.createElement(onClick?'button':'span');el.textContent=text;el.className=onClick?'part-label':'measure-label';if(onClick)el.onclick=onClick;const obj=new CSS2DObject(el);obj.position.set(...position);parent.add(obj);return obj;}
 let selectedHandler;const pickables=[];function pick(obj,key){obj.userData.part=key;pickables.push(obj);}const ray=new T.Raycaster();let down;
 renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const r=host.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(pickables,true)[0];if(hit){let obj=hit.object;while(obj&&obj.userData.part===undefined)obj=obj.parent;if(obj)selectedHandler?.(obj.userData.part);}});
 new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();camera.aspect=width/height;camera.zoom=Math.min(1,camera.aspect/1.3);camera.updateProjectionMatrix();renderer.setSize(width,height);labels.setSize(width,height);}).observe(host);
 addCameraControls(camera,controls);
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{camera.position.set(...(b.dataset.view==='front'?[0,1,18]:b.dataset.view==='top'?[0,19,.01]:position));controls.target.set(...target);controls.update();});
 document.getElementById('reset-view').onclick=()=>{camera.position.set(...position);controls.target.set(...target);controls.update();};
 let last=performance.now();return {scene,group,camera,renderer,controls,label,pick,onPick:fn=>selectedHandler=fn,animate(fn){renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.05);last=now;if(!document.hidden)fn(dt);controls.update();renderer.render(scene,camera);labels.render(scene,camera);});}};
}
export function material(color,metalness=.65,roughness=.3){return new T.MeshStandardMaterial({color,metalness,roughness});}
export function add(geo,mat,parent,position=[0,0,0]){const m=new T.Mesh(geo,mat);m.position.set(...position);parent.add(m);return m;}
export function cylinder(radius,height,mat,parent,position){return add(new T.CylinderGeometry(radius,radius,height,64),mat,parent,position);}
export function tube(points,r,mat,parent){return add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),48,r,10,false),mat,parent);}
