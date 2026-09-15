// Educational ideal models; units documented at each boundary.
export const CENTER_DISTANCE=7.2;
export function beltLength(r1,r2,c=CENTER_DISTANCE){const d=r2-r1,a=Math.asin(d/c);return 2*Math.sqrt(c*c-d*d)+Math.PI*(r1+r2)+2*d*a;}
export const BELT_LENGTH=beltLength(1.5,1.5);
export function cvtState(command,rpm=1200){
 const r1=.85+command/100*1.25;let lo=.2,hi=2.8;
 for(let i=0;i<50;i++){const mid=(lo+hi)/2;if(beltLength(r1,mid)>BELT_LENGTH)hi=mid;else lo=mid;}
 const r2=(lo+hi)/2,ratio=r2/r1;
 return {r1,r2,ratio,outputRPM:rpm/ratio,torqueRatio:ratio,length:beltLength(r1,r2)};
}
export function bjtState(baseMicroamps,beta=100,resistance=1000,supply=5){
 const ib=baseMicroamps*1e-6,limit=(supply-.2)/resistance,demand=beta*ib,ic=Math.min(demand,limit),vce=supply-ic*resistance;
 const region=ib===0?'遮断':demand>=limit?'飽和':'能動';
 return {ib,ic,ie:ic+ib,vce,region,power:ic*vce,limit,betaEffective:ib?ic/ib:0};
}
// Equal-distance traversal of the two external tangents and pulley arcs.
export function beltPoint(s,r1,r2,c=CENTER_DISTANCE){
 const a=Math.acos((r1-r2)/c),line=Math.sqrt(c*c-(r2-r1)**2);
 const arc2=2*a*r2,arc1=(2*Math.PI-2*a)*r1,total=line*2+arc1+arc2;
 let t=((s%1)+1)%1*total;
 const leftTop=[-c/2+r1*Math.cos(a),r1*Math.sin(a)],rightTop=[c/2+r2*Math.cos(a),r2*Math.sin(a)];
 const lerp=(p,q,f)=>[p[0]+(q[0]-p[0])*f,p[1]+(q[1]-p[1])*f];
 if(t<line)return lerp(leftTop,rightTop,t/line);t-=line;
 if(t<arc2){const b=a-t/r2;return [c/2+r2*Math.cos(b),r2*Math.sin(b)];}t-=arc2;
 if(t<line)return lerp([rightTop[0],-rightTop[1]],[leftTop[0],-leftTop[1]],t/line);t-=line;
 const b=-a-t/r1;return [-c/2+r1*Math.cos(b),r1*Math.sin(b)];
}
