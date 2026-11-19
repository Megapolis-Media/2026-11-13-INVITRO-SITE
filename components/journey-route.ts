export type RoutePoint={x:number;y:number};
export const clamp01=(n:number)=>Math.max(0,Math.min(1,n));
// Vertical tangents at both ends: adjacent sections share one continuous path.
export function routePoint(a:RoutePoint,b:RoutePoint,u:number):RoutePoint{
 const t=clamp01(u),v=1-t,dy=b.y-a.y;
 return {x:a.x+(b.x-a.x)*t*t*(3-2*t),y:v*v*v*a.y+3*v*v*t*(a.y+dy/3)+3*v*t*t*(b.y-dy/3)+t*t*t*b.y};
}
export function routeAt(points:RoutePoint[],keys:number[],scroll:number){
 let i=0;while(i<keys.length-2&&scroll>keys[i+1])i++;
 const u=clamp01((scroll-keys[i])/Math.max(1,keys[i+1]-keys[i]));
 return {point:routePoint(points[i],points[i+1],u),index:i,u};
}

export type JourneyLeg={a:RoutePoint;b:RoutePoint;c1:RoutePoint;c2:RoutePoint;start:number;end:number;phase:string;surface:boolean;length:number;distance:number;arcLengths:number[]};
export function bezier(leg:Pick<JourneyLeg,'a'|'b'|'c1'|'c2'>,t:number):RoutePoint{const v=1-t;return{x:v*v*v*leg.a.x+3*v*v*t*leg.c1.x+3*v*t*t*leg.c2.x+t*t*t*leg.b.x,y:v*v*v*leg.a.y+3*v*v*t*leg.c1.y+3*v*t*t*leg.c2.y+t*t*t*leg.b.y};}
export function makeLeg(a:RoutePoint,b:RoutePoint,start:number,end:number,phase:string,lift:number,surface:boolean,distance:number,controls?:[RoutePoint,RoutePoint]):JourneyLeg{
 const dx=b.x-a.x,dy=b.y-a.y;
 // Quadratic gravity trajectory represented exactly as cubic Bezier.
 const [c1,c2]=controls??[{x:a.x+dx/3,y:a.y+dy/3-lift*4/3},{x:a.x+dx*2/3,y:a.y+dy*2/3-lift*4/3}];
 const leg:JourneyLeg={a,b,c1,c2,start,end,phase,surface,length:0,distance,arcLengths:[0]};
 let previous=a;for(let i=1;i<=32;i++){const p=bezier(leg,i/32);leg.length+=Math.hypot(p.x-previous.x,p.y-previous.y);leg.arcLengths.push(leg.length);previous=p;}return leg;
}
export function sampleJourney(legs:JourneyLeg[],scroll:number){let i=0;while(i<legs.length-1&&scroll>legs[i].end)i++;const leg=legs[i],u=clamp01((scroll-leg.start)/(leg.end-leg.start)),n=u*32,j=Math.min(31,Math.floor(n)),distance=leg.distance+leg.arcLengths[j]+(leg.arcLengths[j+1]-leg.arcLengths[j])*(n-j);return{leg,index:i,u,point:bezier(leg,u),distance};}
