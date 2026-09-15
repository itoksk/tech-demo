import * as T from 'three';
import {order} from './physics.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
export function enrichEngine(engine,renderer,scene){
 renderer.localClippingEnabled=true;
 const pmrem=new T.PMREMGenerator(renderer), room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();
 const cut=new T.Plane(new T.Vector3(-1,0,0),.05);
 const alloy=new T.MeshStandardMaterial({color:0x969ea0,metalness:.82,roughness:.38,side:T.DoubleSide});
 const black=new T.MeshStandardMaterial({color:0x252b2c,metalness:.4,roughness:.35,side:T.DoubleSide});
 const bright=new T.MeshStandardMaterial({color:0xd2d6d7,metalness:.92,roughness:.23});
 const copper=new T.MeshStandardMaterial({color:0x8f6452,metalness:.78,roughness:.4});
 const rubber=new T.MeshStandardMaterial({color:0x151a1a,roughness:.8});
 const body=new T.Group(),top=new T.Group(),sump=new T.Group(),accessories=new T.Group(),cams=new T.Group();engine.add(body,top,sump,accessories,cams);
 const add=(g,m,p,pos)=>{const o=new T.Mesh(g,m);p.add(o);if(pos)o.position.set(...pos);return o};
 const box=(w,h,d,m,p,pos)=>add(new RoundedBoxGeometry(w,h,d,2,.08),m,p,pos);
 const cylinder=(r,h,m,p,pos)=>add(new T.CylinderGeometry(r,r,h,48),m,p,pos);
 const tube=(points,r,m,p)=>add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),40,r,12,false),m,p);
 function boredSlab(width,length,depth,y,parent,material){
  const s=new T.Shape();s.moveTo(-width/2,-length/2);s.lineTo(width/2,-length/2);s.lineTo(width/2,length/2);s.lineTo(-width/2,length/2);s.closePath();
  for(let i=0;i<6;i++){const h=new T.Path();h.absarc(0,(i-2.5)*1.52,.675,0,Math.PI*2,true);s.holes.push(h);}
  const slab=add(new T.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:36}),material,parent,[0,y,0]);slab.rotation.x=Math.PI/2;return slab;
 }
 boredSlab(2.12,9.65,1.85,3.16,body,alloy);
 boredSlab(2.34,9.83,.16,3.25,body,bright);
 box(2.3,1.2,9.65,alloy,body,[0,.65,0]);
 box(2.4,.18,9.9,bright,sump,[0,-.18,0]);box(2.1,.72,9.4,black,sump,[0,-.59,0]);
 for(let i=0;i<9;i++)box(2.2,.07,.13,alloy,sump,[0,-.89,(i-4)*1.03]);
 box(2.14,.42,9.55,alloy,top,[0,3.46,0]);box(1.97,.59,9.28,black,top,[0,3.94,0]);
 for(const x of [-.64,-.46,.46,.64])box(.045,.03,8.75,bright,top,[x,4.245,0]);
 const textureCanvas=document.createElement('canvas');textureCanvas.width=256;textureCanvas.height=1024;const ctx=textureCanvas.getContext('2d');ctx.fillStyle='#252b2c';ctx.fillRect(0,0,256,1024);ctx.fillStyle='#cfd8d7';ctx.font='bold 75px Arial';ctx.translate(128,512);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillText('S I X   /   2 4 V',0,25);const texture=new T.CanvasTexture(textureCanvas);texture.colorSpace=T.SRGBColorSpace;
 const plaque=add(new T.PlaneGeometry(.72,6.2),new T.MeshStandardMaterial({map:texture,roughness:.5}),top,[0,4.247,0]);plaque.rotation.x=-Math.PI/2;
 const oilcap=cylinder(.23,.13,black,top,[-.55,4.3,3.72]);
 for(let i=0;i<6;i++){
  const z=(i-2.5)*1.52;
  for(const x of [-1.11,1.11]){
   cylinder(.07,.12,bright,body,[x,3.34,z]);
   const plug=cylinder(.17,.08,bright,body,[x,2.12,z]);plug.rotation.z=Math.PI/2;
   box(.12,1.85,.13,alloy,body,[x,1.5,z+.55]);
  }
  tube([[-.9,3.43,z],[-1.65,3.6,z],[-2.08,2.9,z],[-2.3,2.6,z]],.21,bright,accessories);
  tube([[.9,3.38,z],[1.6,3.08,z],[1.87,2.38,z+.2],[2.0,1.62,z*.5]],.14,copper,accessories);
  const boot=cylinder(.13,.22,black,top,[0,4.31,z]);
 }
 const intake=cylinder(.43,8.9,alloy,accessories,[-2.35,2.56,0]);intake.rotation.x=Math.PI/2;
 const collector=cylinder(.22,5.6,copper,accessories,[2,1.62,0]);collector.rotation.x=Math.PI/2;
 tube([[2,1.62,2.8],[2,.5,4],[2,-.4,5.25]],.23,copper,accessories);
 const throttle=cylinder(.5,.8,black,accessories,[-2.35,2.56,4.78]);throttle.rotation.x=Math.PI/2;
 tube([[-2.35,2.56,5.15],[-2.5,1.6,5.35],[-2.55,.6,4.9]],.39,rubber,accessories);
 const timing=box(2.12,4.1,.2,alloy,body,[0,1.6,-4.96]);
 const pulleyGroup=new T.Group();accessories.add(pulleyGroup);const accessoryRotors=[];
 for(const [x,y,r] of [[0,0,.68],[1.85,1.2,.43],[-1.5,1.2,.36],[0,2.5,.45]]){
  const hub=cylinder(r,.22,black,pulleyGroup,[x,y,5.21]);hub.rotation.x=Math.PI/2;
  const disk=cylinder(r*.8,.24,bright,pulleyGroup,[x,y,5.24]);disk.rotation.x=Math.PI/2;
  for(let j=0;j<6;j++){const bolt=cylinder(.045,.025,black,hub,[Math.cos(j*Math.PI/3)*r*.55,.14,Math.sin(j*Math.PI/3)*r*.55]);}
  const pivot=new T.Group();pivot.position.set(x,y,0);pulleyGroup.add(pivot);pivot.add(hub,disk);hub.position.x=hub.position.y=disk.position.x=disk.position.y=0;accessoryRotors.push({pivot,r});
 }
 const beltPoints=[[0,-.67,5.28],[1.7,.77,5.28],[2.27,1.2,5.28],[1.85,1.65,5.28],[.4,2.68,5.28],[0,2.95,5.28],[-.4,2.68,5.28],[-1.76,1.4,5.28],[-1.83,1.05,5.28],[-.6,-.25,5.28],[0,-.67,5.28]];
 tube(beltPoints,.065,rubber,accessories);
 const alt=cylinder(.51,.95,alloy,accessories,[1.85,1.2,4.6]);alt.rotation.x=Math.PI/2;
 for(let j=0;j<14;j++){const a=j/14*Math.PI*2;box(.07,.07,.82,black,accessories,[1.85+.5*Math.cos(a),1.2+.5*Math.sin(a),4.6]);}
 const filter=cylinder(.32,.9,new T.MeshStandardMaterial({color:0x80332b,metalness:.35,roughness:.4}),accessories,[1.35,.62,-3.3]);
 for(const x of [-.42,.42]){const cam=new T.Group();cams.add(cam);cam.position.set(x,3.62,0);const shaft=cylinder(.075,9.1,bright,cam);shaft.rotation.x=Math.PI/2;for(let i=0;i<6;i++){const lobe=add(new T.SphereGeometry(.16,16,12),bright,cam,[0,.06,(i-2.5)*1.52]);const offset=(order.indexOf(i+1)*120+(x<0?450:270))*Math.PI/360+Math.PI;lobe.position.x=-.06*Math.sin(offset);lobe.position.y=.06*Math.cos(offset);lobe.rotation.z=offset;lobe.scale.set(1,1.4,.55);}}
 const parts={block:body,head:top,accessories,oil:sump,cam:cams};
 for(const [key,group] of Object.entries(parts))group.userData.enginePart=key;
 let mode='cutaway';
 function setMode(value){mode=value;alloy.clippingPlanes=black.clippingPlanes=value==='cutaway'?[cut]:[];alloy.needsUpdate=black.needsUpdate=true;body.visible=top.visible=sump.visible=value!=='mechanism';accessories.visible=value!=='mechanism';cams.visible=value!=='exterior';plaque.visible=value==='exterior';oilcap.visible=value==='exterior';}
 function update(angle,explosion){accessoryRotors.forEach(({pivot,r})=>pivot.rotation.z=-angle*Math.PI/180*.68/r);top.position.y=explosion*2.7;sump.position.y=-explosion*.7;body.position.y=explosion*.1;accessories.position.x=explosion*.4;cams.children.forEach(c=>c.rotation.z=-angle*Math.PI/360);}
 setMode(mode);return {setMode,update,parts};
}
