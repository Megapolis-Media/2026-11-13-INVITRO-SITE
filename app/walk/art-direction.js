import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
// Reusable, deterministic PBR surface maps. These are actual mesh materials.
export function createArtDirection(renderer){
 const owned=[],cache={};let seed=219;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 function surface(kind,color){const key=kind+color;if(cache[key])return cache[key];const c=document.createElement('canvas');c.width=c.height=512;const q=c.getContext('2d');q.fillStyle=color;q.fillRect(0,0,512,512);
 if(kind==='marble'){for(let i=0;i<12;i++){q.strokeStyle='#81949620';q.lineWidth=.4+rand()*1.2;q.beginPath();const y=rand()*512;q.moveTo(0,y);q.bezierCurveTo(150,y-35,280,y+50,512,y+80);q.stroke()}}
 else if(kind==='wood'){for(let i=0;i<260;i++){const x=rand()*512;q.strokeStyle=`rgba(${rand()>.5?'160,129,100':'12,7,4'},${.006+rand()*.022})`;q.lineWidth=.3+rand()*.7;q.beginPath();q.moveTo(x,0);q.bezierCurveTo(x+rand()*14,180,x-rand()*14,350,x,512);q.stroke()}for(let x=0;x<512;x+=128){q.fillStyle='#09060318';q.fillRect(x,0,2,512)}}
 else if(kind==='fabric'){for(let i=0;i<512;i+=3){q.fillStyle=i%2?'#ffffff16':'#00000026';q.fillRect(i,0,1,512);q.fillRect(0,i,512,1)}}
 else{for(let i=0;i<2600;i++){const x=rand()*512,y=rand()*512,s=rand()*2.3;q.fillStyle=rand()>.5?'#ffffff17':'#0000001a';q.fillRect(x,y,s,s)}}
 const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;if(kind==='fabric')map.repeat.set(3,3);map.anisotropy=renderer.isSoftware?1:Math.min(8,renderer.capabilities.getMaxAnisotropy());owned.push(map);const m=new T.MeshStandardMaterial({color:'#ffffff',map,roughness:kind==='marble'?.21:kind==='wood'?.69:kind==='fabric'?.92:.62,bumpMap:map,bumpScale:kind==='fabric'?.003:.002});m.userData.baseColor=color;owned.push(m);cache[key]=m;return m}
 let env=null;if(!renderer.isSoftware){const pm=new T.PMREMGenerator(renderer);const room=new RoomEnvironment();env=pm.fromScene(room,.035);room.dispose();pm.dispose();}
 return{surface,environment:env?.texture,dispose(){owned.forEach(o=>o.dispose());env?.dispose()}};
}
export function dressRoom(api,id,bounds){
 const {box,cyl,sphere,rod,group,text,light,mat,world,surface}=api;
 const gold=mat('#aa8149',.85,.26),black=mat('#151c21',.55,.4),oak=surface('marble','#e6e0d4'),cloth=surface('fabric','#29393d');
 // Lighting trusses, baffles, fixtures and cables are real geometry.
 for(const z of [-5,2]){
  rod([-bounds.x,3.92,z],[bounds.x,3.92,z],.035,black);rod([-bounds.x,3.69,z],[bounds.x,3.69,z],.026,black);
  for(let x=-bounds.x+.5;x<bounds.x;x+=1.3){rod([x,3.92,z],[x+.55,3.69,z],.016,black);rod([x+.55,3.69,z],[x+1.1,3.92,z],.016,black)}
  for(const x of [-3,3]){const g=group(x,3.67,z);box(0,0,0,.42,.2,.30,black,g);box(0,-.11,.03,.34,.018,.24,mat('#fff1cd',0,.25,1.3),g);rod([-.23,.13,0],[-.23,-.1,0],.016,black,g);rod([.23,.13,0],[.23,-.1,0],.016,black,g)}
 }
 function caseProp(x,z,ry=0){const g=group(x,0,z,ry);box(0,.42,0,1.1,.72,.60,cloth,g);for(const y of [.1,.76])for(const zz of [-.31,.31])box(0,y,zz,1.14,.035,.035,gold,g);for(const s of [-1,1]){box(s*.55,.43,.31,.035,.68,.03,gold,g);for(const zz of [-.22,.22]){const wheel=cyl(s*.43,.07,zz,.075,.045,black,g);wheel.rotation.z=Math.PI/2}box(s*.36,.54,.32,.10,.17,.018,gold,g)}box(0,.44,.33,.28,.12,.025,black,g);text('INVITRO · TV',0,.26,.326,.65,.14,g,{bg:'#29393d'});return g}
 function cameraProp(x,z,ry){const g=group(x,0,z,ry);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;rod([0,1.28,0],[Math.sin(a)*.48,.04,Math.cos(a)*.48],.025,black,g)}box(0,1.4,0,.42,.25,.60,black,g);const lens=cyl(0,1.43,.38,.11,.25,black,g);lens.rotation.x=Math.PI/2;const glass=cyl(0,1.43,.51,.095,.008,mat('#315b63',.9,.12),g);glass.rotation.x=Math.PI/2;box(-.28,1.51,-.03,.22,.15,.04,black,g);rod([0,1.37,-.2],[.35,1.17,-.45],.014,black,g);box(0,1.57,0,.22,.09,.14,black,g)}
 function wallSconce(x,z,rotation){const g=group(x,0,z,rotation);box(0,2.42,0,.18,.42,.09,gold,g);rod([0,2.35,0],[0,2.35,.24],.018,gold,g);cyl(0,2.48,.25,.13,.28,mat('#ffe4ae',0,.7,.55),g);light(x*.97,2.4,z,'#ffdcb0',9,4)}
 for(const z of [-5,1,6])for(const s of [-1,1])wallSconce(s*(bounds.x+.32),z,-s*Math.PI/2);
 if(id==='hub'){
  for(const s of [-1,1])for(let z=-12;z<13;z+=1.6)box(s*(bounds.x+.28),.97,z,.065,1.46,1.49,oak);
  caseProp(3.9,3,.2);caseProp(-4.2,-4,-.1);cameraProp(3.9,-3,-.3);
  for(const s of [-1,1]){const g=group(s*4.4,0,9,s*Math.PI/2);box(0,.45,0,2,.16,.65,cloth,g);box(0,.78,-.27,2,.6,.13,cloth,g);for(const x of [-.8,.8])rod([x,.1,0],[x,.44,0],.035,gold,g)}
 }else if(id==='yak'||id==='pelsh'){
  for(let x=-bounds.x+.25;x<bounds.x;x+=.35)box(x,2,-7.95,.16,3.2,.16,oak);
  caseProp(-5,3,.2);cameraProp(5,2,-.5);
  // Acoustic fabric panels along side walls.
  for(const s of [-1,1])for(let z=-6;z<5;z+=2){box(s*(bounds.x+.27),2.1,z,.1,2,1.5,cloth);box(s*(bounds.x+.2),1,z,.04,.035,1.6,gold)}
  if(id==='pelsh'){
   const g=group(-3.8,0,-2.8,.45);box(0,.87,0,1.8,.2,1.8,black,g);box(0,.99,-.55,1.8,.10,.7,black,g);for(const x of [-.72,.72])for(const z of [-.65,.6])rod([x,.05,z],[x,.85,z],.065,black,g);
   for(let i=0;i<28;i++){box(-.77+i*.057,1,-.01,.052,.04,.38,'#e9e0c8',g);if(![2,6].includes(i%7))box(-.745+i*.057,1.035,-.09,.027,.045,.22,black,g)}
   const lid=box(0,1.53,-.55,1.86,.055,1.6,black,g);lid.rotation.x=-.45;rod([.7,.97,.1],[.7,1.74,.1],.015,gold,g);box(0,.48,1.1,.85,.14,.4,cloth,g);
  }
 }else {caseProp(bounds.x-1,4,.25);if(id==='roof'||id==='fire')cameraProp(-bounds.x+1,4,.28)}
}
