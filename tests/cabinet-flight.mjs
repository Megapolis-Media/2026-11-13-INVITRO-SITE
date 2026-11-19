import assert from 'node:assert/strict';
import {antennaEntry} from '../components/cabinet-flight.ts';
for(const w of [320,390,820,1440,2048]){
 const start={x:w*.44,y:450},rim={x:w*.71,y:880},r=Math.min(29,w*.031);
 assert.deepEqual(antennaEntry(start,rim,r,0),{...start,hidden:0});
 let prev={...start,hidden:0},partial=false;
 for(let i=1;i<=300;i++){
  const q=antennaEntry(start,rim,r,i/300);
  assert.ok(q.x>prev.x&&q.y>prev.y);
  assert.ok(Math.abs((q.x-start.x)*(rim.y-start.y)-(q.y-start.y)*(rim.x-start.x))<1e-7);
  assert.ok(q.hidden>=prev.hidden);
  if(q.y+r<rim.y)assert.equal(q.hidden,0);
  partial ||= q.hidden>0&&q.hidden<1;prev=q;
 }
 assert.ok(partial);assert.equal(prev.hidden,1);
}
console.log('PASS: uninterrupted outgoing diagonal and exact top-down occlusion at five widths');
