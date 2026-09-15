export const order = [1, 5, 3, 6, 2, 4];
export const phases = [
 {name:'燃焼・膨張',color:0xf69e63,description:'点火された混合気が膨張し、ピストンを押し下げます。コンロッドを介してクランクシャフトに回転力を伝えます。'},
 {name:'排気',color:0x88c5af,description:'排気バルブが開き、上昇するピストンが燃焼後のガスをシリンダーの外へ押し出します。'},
 {name:'吸気',color:0x78b9e3,description:'吸気バルブが開き、下降するピストンが空気と燃料の混合気をシリンダー内に取り込みます。'},
 {name:'圧縮',color:0xb2a3dc,description:'両方のバルブを閉じ、ピストンが上昇して混合気を圧縮します。次の燃焼に向けて上死点へ近づきます。'}
];
export function cylinderState(angle,index){
 const local=((angle-order.indexOf(index+1)*120)%720+720)%720;
 const a=local*Math.PI/180, r=.62,l=2.1;
 const pin={x:r*Math.sin(a),y:r*Math.cos(a)};
 const y=pin.y+Math.sqrt(l*l-pin.x*pin.x);
 return {local,phase:Math.floor(local/180),pin,y,displacement:(r+l-y)/(2*r)*86,intake:local>360&&local<540,exhaust:local>180&&local<360};
}
