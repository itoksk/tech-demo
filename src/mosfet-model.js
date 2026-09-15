// Ideal long-channel enhancement NMOS; source/body grounded, VDS >= 0.
// k = μn Cox W/L, in A/V². No channel-length modulation or subthreshold current.
export function mosfetState(vgs,vds,vth=1.5,k=.002){
 const overdrive=Math.max(0,vgs-vth);
 const region=overdrive===0?'遮断':vds<overdrive?'線形':'飽和';
 const id=region==='遮断'?0:region==='線形'?k*(overdrive*vds-vds*vds/2):k*overdrive*overdrive/2;
 return {vgs,vds,vth,overdrive,region,id,ig:0,power:id*vds,pinchOff:region==='飽和',channel:overdrive>0};
}
