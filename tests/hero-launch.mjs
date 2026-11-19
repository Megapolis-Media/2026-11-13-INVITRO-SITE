import assert from 'node:assert/strict';
import {downChute,legClock,line,reboundClock} from '../components/hero-launch.ts';
const mouth={x:220,y:150},lip={x:204,y:195},face={x:112,y:550};
assert.deepEqual(downChute(mouth,lip,0),mouth);
assert.deepEqual(downChute(mouth,lip,1),lip);
assert.deepEqual(line(lip,face,0),lip);
assert.deepEqual(line(lip,face,1),face);
for(let i=0;i<=100;i++){
 const q=line(lip,face,i/100);
 assert.ok(Math.abs((q.x-lip.x)*(face.y-lip.y)-(q.y-lip.y)*(face.x-lip.x))<1e-8);
}
for(const height of [568,760,900,1180]){
 const contact=height*1.5,limit=height*.6;
 assert.equal(legClock(0,650,height,0,height*.65,contact,limit,height),0);
 assert.equal(legClock(680,650,contact-limit,0,height*.65,contact,limit,height),1);
 assert.ok(legClock(1500,650,0,0,height*.65,contact,limit,height)<1);
}
console.log('PASS: chute, straight incoming stroke, camera-independent size and scroll timing');

for(const distance of [125,280,550,900]){
 assert.equal(reboundClock(0,0,distance,true),0);
 assert.ok(reboundClock(16,0,distance,true)>0);
 assert.equal(reboundClock(540,0,distance,true),1);
 assert.ok(reboundClock(170,90,distance,true)>reboundClock(170,0,distance,true));
}
console.log('PASS: immediate rebound and complete TV entry with stationary scroll');
