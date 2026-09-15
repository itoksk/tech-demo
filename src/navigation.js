import './navigation-layout.css';
export function mountNavigation(current){
 const base=import.meta.env.BASE_URL;const header=document.querySelector('header');header.innerHTML='<a class="brand" href="'+base+'">FORM<span>INTERACTIVE<br>SCIENCE LAB</span></a><nav aria-label="シミュレーションを選択">'+[['engine','/','01','6気筒エンジン'],['cvt','/cvt.html','02','CVT'],['bjt','/bjt.html','03','BJT'],['mosfet','/mosfet.html','04','MOSFET']].map(([id,url,n,label])=>`<a href="${base}${url.slice(1)}" ${id===current?'aria-current="page"':''}><span>${n}</span>${label}</a>`).join('')+'</nav>';
}
export function addCameraControls(camera,controls){
 const container=document.createElement('div');container.className='camera-extra';container.innerHTML='<button aria-label="視点を左へ回転">←</button><button aria-label="視点を右へ回転">→</button><button aria-label="拡大">＋</button><button aria-label="縮小">−</button>';
 document.querySelector('.viewport').append(container);
 [...container.children].forEach((b,i)=>b.onclick=()=>{const v=camera.position.clone().sub(controls.target);if(i<2){const a=i===0?.25:-.25;const x=v.x*Math.cos(a)-v.z*Math.sin(a);v.z=v.x*Math.sin(a)+v.z*Math.cos(a);v.x=x;}else{v.multiplyScalar(i===2?.88:1.14);const length=Math.min(controls.maxDistance,Math.max(controls.minDistance,v.length()));v.setLength(length);}camera.position.copy(controls.target).add(v);controls.update();});
}
