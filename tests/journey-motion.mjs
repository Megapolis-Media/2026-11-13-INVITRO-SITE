import assert from 'node:assert/strict';
import {poseAt,ease} from '../components/journey-motion.ts';
const stops=[{scroll:0,distance:0},{scroll:100,distance:.1,fall:true},{scroll:250,distance:.3},{scroll:340,distance:.3},{scroll:1000,distance:.3},{scroll:1300,distance:1}];
// Falling accelerates, contact pauses, gameplay has a genuinely stationary interval.
assert.equal(poseAt(50,stops),.025);
assert.ok(poseAt(100,stops)-poseAt(75,stops)>poseAt(50,stops)-poseAt(25,stops));
for(let y=250;y<=1000;y++)assert.equal(poseAt(y,stops),.3);
const forward=Array.from({length:1301},(_,i)=>poseAt(i,stops));
for(let i=1300;i>=0;i--)assert.equal(poseAt(i,stops),forward[i]);
for(let i=1;i<forward.length;i++){assert.ok(forward[i]>=forward[i-1]);assert.ok(forward[i]-forward[i-1]<.01)}
assert.equal(poseAt(-100,stops),0);assert.equal(poseAt(9000,stops),1);
// Switch does not actuate before arrival; its lamp comes on after the press.
assert.equal(ease((-1)/64),0);assert.equal(ease(0),0);assert.equal(ease(64/64),1);
assert.equal(ease((ease(20/64)-.65)/.35),0);
console.log('PASS: accelerated drop, no pre-contact activation, stationary game interval, continuous bounded progress, identical reverse');
