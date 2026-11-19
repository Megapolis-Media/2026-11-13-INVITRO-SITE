import type {CSSProperties} from 'react';

type Instrument='radio'|'tv';
// Model space follows the 600 × 337.5 front elevation used for both approved renders.
// These quads join the curved enamel front to a recessed back. CSS 3D keeps the
// live dial, film and glass on the front plane while the side walls turn into view.
const bodies={
 radio:{left:33,top:48,right:566,bottom:282,corner:35,depth:83},
 tv:{left:104,top:70,right:494,bottom:301,corner:22,depth:112}
};
export default function CabinetVolume({instrument}:{instrument:Instrument}){
 const {left,top,right,bottom,corner,depth}=bodies[instrument];
 const corners=[[right-corner,top+corner,-90],[right-corner,bottom-corner,0],
  [left+corner,bottom-corner,90],[left+corner,top+corner,180]];
 const points=corners.flatMap(([cx,cy,start])=>Array.from({length:7},(_,i)=>{
  const theta=(start+15*i)*Math.PI/180;return [cx+corner*Math.cos(theta),cy+corner*Math.sin(theta)];
 }));
 const length=(n:number)=>(n/6).toFixed(4)+'cqw';
 return <div className={'cabinet-volume '+instrument+'-volume'} aria-hidden="true">
  <i className="cabinet-back" style={{left:length(left),top:length(top),width:length(right-left),height:length(bottom-top),borderRadius:length(corner),transform:`translateZ(${length(-depth)})`}}/>
  {points.map(([x,y],i)=>{
   const [bx,by]=points[(i+1)%points.length],dx=bx-x,dy=by-y;
   const angle=Math.atan2(dy,dx),light=Math.round(34+8*Math.cos(angle)-7*Math.sin(angle));
   const vented=Math.abs(dy)>Math.abs(dx)*8&&Math.abs(dy)>50;
   return <i key={i} className={'cabinet-facet'+(vented?' vented':'')}
    style={{left:length(x),top:length(y),width:length(Math.hypot(dx,dy)+.23),height:length(depth),
     '--enamel-light':light+'%',transform:`translateZ(-.4px) rotateZ(${angle}rad) rotateX(-90deg)`} as CSSProperties}/>;
  })}
 </div>;
}

// The centre of mass sits behind the fascia. An off-centre impact twists the
// cabinet around the opposite foot, then damping dissipates the impulse.
export function rockCabinet(rig:HTMLElement,instrument:Instrument){
 const tv=instrument==='tv',width=rig.offsetWidth;
 const make=(u:number)=>{
  const impulse=Math.exp(-4.9*u)*Math.sin(2.22*Math.PI*u);
  const magnitude=u===1?0:impulse;
  const yaw=(tv?-4:-3.2)+magnitude*(tv?14:-24);
  const pitch=-1.4+magnitude*(tv?6:7.5),roll=magnitude*(tv?2.8:-4.8);
  return {offset:u,transform:`perspective(${width*2.4}px) translateX(${magnitude*(tv?.7:-1.3)}%) rotateY(${yaw}deg) rotateX(${pitch}deg) rotateZ(${roll}deg)`};
 };
 return rig.animate(Array.from({length:43},(_,i)=>make(i/42)),{duration:tv?660:580,easing:'linear'});
}
