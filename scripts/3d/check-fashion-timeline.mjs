import assert from 'node:assert/strict';
import {runwayPose,SHOW_DURATION} from '../../app/walk/fashion-timeline.mjs';
let closest=Infinity;
for(let t=0;t<=SHOW_DURATION;t+=.05){
 const poses=Array.from({length:5},(_,i)=>runwayPose(i,t)).filter(p=>p.visible);
 for(const p of poses){assert.ok(Object.values(p).every(v=>typeof v!=='number'||Number.isFinite(v)));assert.ok(p.z>=-31.001&&p.z<=-6.799,'Stay clear of rear wall and runway end');assert.ok(Math.abs(p.x)<2.2,'Remain inside the expanded front platform');}
 for(let i=0;i<poses.length;i++)for(let j=i+1;j<poses.length;j++)closest=Math.min(closest,Math.hypot(poses[i].x-poses[j].x,poses[i].z-poses[j].z));
}
assert.ok(closest>.8,'Clothed models must not intersect');
for(let i=0;i<5;i++){const p=runwayPose(i,SHOW_DURATION);assert.ok(p.visible);assert.equal(p.walk,0);assert.equal(p.yaw,0);}
console.log(`Runway: 5 looks, bounded routes, ${closest.toFixed(2)}m minimum separation, stable finale.`);
