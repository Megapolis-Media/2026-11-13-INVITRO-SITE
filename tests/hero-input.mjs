import assert from 'node:assert/strict';
import vm from 'node:vm';
import {heroInputScript} from '../lib/hero-input.ts';

function boot(type='navigate',y=0){
 const listeners=new Map(),dataset={};
 const page={
  location:{pathname:'/',hash:''},performance:{getEntriesByType:()=>[{type}]},innerHeight:760,scrollY:y,
  document:{documentElement:{dataset},querySelector:selector=>selector==='.solo-hero'?{getBoundingClientRect:()=>({bottom:760-page.scrollY})}:null},
  Event, addEventListener:(name,fn)=>listeners.set(name,fn),dispatchEvent:()=>{}
 };
 page.window=page;vm.runInNewContext(heroInputScript,page);
 const send=(name,e)=>listeners.get(name)(e);
 const finger=(name,x,y)=>send(name,{touches:[{clientX:x,clientY:y}]});
 return {page,dataset,send,finger};
}
{
 const {dataset,finger}=boot();
 finger('touchstart',30,250);finger('touchmove',30,246);assert.equal(dataset.heroSwipe,undefined);
 finger('touchmove',30,240);assert.equal(dataset.heroSwipe,'queued');
}
{
 const {dataset,page,send}=boot('reload',0);
 page.scrollY=24;send('scroll');assert.equal(dataset.heroSwipe,undefined);
 send('wheel',{deltaY:16});assert.equal(dataset.heroSwipe,'queued');
}
{
 const {dataset,finger}=boot();
 finger('touchstart',50,200);finger('touchmove',110,193);assert.equal(dataset.heroSwipe,undefined);
 finger('touchstart',50,200);finger('touchmove',50,220);assert.equal(dataset.heroSwipe,undefined);
}
console.log('PASS: first swipe queued before hydration, restored scroll stays armed, horizontal gestures and taps ignored');
