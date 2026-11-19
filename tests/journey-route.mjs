import assert from 'node:assert/strict';
import {makeLeg,sampleJourney,bezier} from '../components/journey-route.ts';
// Landing, compression, rebound, roll: the same coordinates must meet exactly.
const anchors=[{x:180,y:90},{x:310,y:420},{x:310,y:425},{x:280,y:420},{x:160,y:420}];
const spans=[260,18,65,125],lifts=[32,0,22,0];let time=0,distance=0;
const legs=spans.map((span,i)=>{const l=makeLeg(anchors[i],anchors[i+1],time,time+span,['flight','press','bounce','roll'][i],lifts[i],i===1||i===3,distance);time+=span;distance+=l.length;return l});
for(let i=0;i<legs.length-1;i++)assert.deepEqual(bezier(legs[i],1),bezier(legs[i+1],0));
let previous=-1;for(let s=0;s<=time;s+=.5){const f=sampleJourney(legs,s),back=sampleJourney(legs,time-(time-s));assert.deepEqual(f.point,back.point);assert.ok(Number.isFinite(f.point.x)&&Number.isFinite(f.point.y));assert.ok(f.distance>=previous);previous=f.distance;}
// An airborne arc has constant downward acceleration and no x-axis reversal.
const l=legs[0],points=Array.from({length:11},(_,i)=>bezier(l,i/10));const accel=points.slice(2).map((p,i)=>p.y-2*points[i+1].y+points[i].y);for(const a of accel){assert.ok(a>0);assert.ok(Math.abs(a-accel[0])<1e-9)}
assert.deepEqual(sampleJourney(legs,-100).point,anchors[0]);assert.deepEqual(sampleJourney(legs,99999).point,anchors.at(-1));
console.log('PASS: exact contacts, no seams, reversible positions, monotonic rotation distance, constant gravity acceleration, bounded endpoints');
// A manufactured chute follows its controls, including in the rotation distance.
const mouth={x:101,y:80},lip={x:82,y:105};
const controls=[{x:103,y:96},{x:90,y:101}];
const chute=makeLeg(mouth,lip,0,100,'hero-release',0,true,0,controls);
assert.deepEqual(bezier(chute,0),mouth);
assert.deepEqual(bezier(chute,1),lip);
assert.deepEqual(bezier(chute,.5),{x:95.25,y:97});
assert.ok(chute.length>Math.hypot(lip.x-mouth.x,lip.y-mouth.y));
assert.equal(sampleJourney([chute],100).distance,chute.length);
