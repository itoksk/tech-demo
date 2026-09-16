import * as THREE from 'three';
// A stylized flame front, confined to the combustion chamber (not an exhaust flame).
export function createCombustion(parent) {
  const group = new THREE.Group(); parent.add(group);
  const material = new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,side:THREE.DoubleSide,
    uniforms:{phase:{value:0},strength:{value:0}},
    vertexShader:`varying vec2 vUv; uniform float phase;
      void main(){vUv=uv;vec3 p=position;
        float tip=pow(uv.y,1.6);
        p.x+=sin(uv.y*9.0+phase*4.0)*.16*tip;
        p.z+=cos(uv.y*13.0-phase*5.0)*.12*tip;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader:`varying vec2 vUv; uniform float phase; uniform float strength;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){float n=noise(vUv*vec2(12,8)+vec2(phase,-phase*3.0));
        float heat=clamp((1.0-vUv.y)*1.25+n*.35,0.0,1.0);
        vec3 color=mix(vec3(.85,.035,.004),vec3(1.0,.45,.015),smoothstep(.1,.65,heat));
        color=mix(color,vec3(1.0,.94,.57),smoothstep(.67,1.0,heat));
        float alpha=strength*(.6+.4*n)*(1.0-smoothstep(.72,1.0,vUv.y));
        gl_FragColor=vec4(color*1.5,alpha);}`
  });
  const geometry=new THREE.ConeGeometry(1,1,16,12,true);
  geometry.translate(0,.5,0);
  const tongues=[];
  for(let j=0;j<13;j++){
    const m=new THREE.Mesh(geometry,material);group.add(m);
    const a=j*2.39996,r=j===0?0:.12+.24*Math.sqrt(j/12);
    m.position.set(Math.cos(a)*r,0,Math.sin(a)*r);
    m.rotation.z=Math.cos(a)*.18;m.rotation.x=Math.sin(a)*.18;
    tongues.push(m);
  }
  const glowMat=new THREE.MeshBasicMaterial({color:0xff8b12,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
  const glow=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),glowMat);group.add(glow);
  const light=new THREE.PointLight(0xff9b37,0,2.3,2);group.add(light);
  return {update(local,pistonTop,visible){
    const t=local/120,progress=Math.min(1,t*3.5),height=Math.max(.05,3.12-pistonTop);
    group.visible=visible&&local<120;
    if(!group.visible)return;
    group.position.y=pistonTop;
    const strength=Math.pow(Math.sin(Math.PI*Math.min(1,t)),.65);
    material.uniforms.phase.value=local*.13;
    material.uniforms.strength.value=strength;
    tongues.forEach((m,j)=>{
      const flicker=.8+.2*Math.sin(local*.43+j*1.7);
      m.scale.set((j===0?.23:.13)*progress,height*(.55+.4*flicker), (j===0?.23:.13)*progress);
      // The flame initially spreads from the spark plug, then fills the chamber.
      m.position.y=(1-progress)*height*.8;
    });
    glow.position.y=height*.5;glow.scale.set(.49*progress,height*.46,.49*progress);
    glowMat.opacity=strength*.18;light.position.y=height*.55;light.intensity=strength*2.5;
  }};
}
