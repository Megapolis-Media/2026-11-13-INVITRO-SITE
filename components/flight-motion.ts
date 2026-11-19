// Deterministic ballistic segment, followed by one energy-losing rebound.
// Scroll selects time; no independent tweens can disagree about contact.
export function flightPose(t:number,a:{x:number;y:number},b:{x:number;y:number},radius:number){
 t=Math.max(0,Math.min(1,t));const hit=.78;
 if(t<=hit){const u=t/hit;return {x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*(.16*u+.84*u*u),press:0,phase:'flight',roll:u*5.6};}
 const u=(t-hit)/(1-hit);const bounce=radius*.32*4*u*(1-u)*(1-u);
 return {x:b.x,y:b.y-bounce,press:1-Math.min(1,bounce/(radius*.16)),phase:u>=1?'rest':'contact',roll:5.6+Math.sin(u*Math.PI)*.12};
}
