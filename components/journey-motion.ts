// Scroll is the playhead. No time-based physics: reverse and deep links reproduce the same pose.
export const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export const ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
export function poseAt(scroll:number,stops:{scroll:number;distance:number;fall?:boolean}[]){
  if(!stops.length)return 0;
  if(scroll<=stops[0].scroll)return stops[0].distance;
  for(let i=1;i<stops.length;i++)if(scroll<=stops[i].scroll){const a=stops[i-1],b=stops[i];return a.distance+(b.distance-a.distance)*(b.fall?clamp((scroll-a.scroll)/Math.max(1,b.scroll-a.scroll))**2:ease((scroll-a.scroll)/Math.max(1,b.scroll-a.scroll)))}
  return stops[stops.length-1].distance;
}
