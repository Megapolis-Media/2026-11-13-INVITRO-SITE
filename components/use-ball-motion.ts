'use client';
import {useSyncExternalStore} from 'react';

const key='invitro.ball-motion.v1',change='invitro:ball-preference';
let volatilePreference:boolean|null=null;
function read(){
 try{const v=localStorage.getItem(key);if(v==='on'||v==='off')return v==='on';}catch{}
 return volatilePreference??!matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function listen(fn:()=>void){
 const m=matchMedia('(prefers-reduced-motion: reduce)');
 const storage=(e:StorageEvent)=>{if(e.key===key||e.key===null)fn()};
 m.addEventListener('change',fn);addEventListener(change,fn);addEventListener('storage',storage);
 return()=>{m.removeEventListener('change',fn);removeEventListener(change,fn);removeEventListener('storage',storage);};
}
export function useBallMotion(){
 const preference=useSyncExternalStore<boolean|null>(listen,read,()=>null);
 function toggle(){const next=!read();try{localStorage.setItem(key,next?'on':'off');volatilePreference=null;}catch{volatilePreference=next;}dispatchEvent(new Event(change));}
 return [preference===true,toggle,preference!==null] as const;
}
