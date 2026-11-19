'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import '@fontsource/oswald/cyrillic-400.css';
import '@fontsource/oswald/latin-400.css';
import './radio-dial.css';
import CabinetVolume from './cabinet-volume';

// Unique physical tuning positions; multiple rows accommodate long labels.
const stations=[
 {name:'Москва и Центр компетенций',lines:['Москва и Центр','компетенций'],x:8,left:1,row:0,width:43},
 {name:'Сибирь и Дальний восток',lines:['Сибирь и','Дальний восток'],x:63,left:52,row:0,width:48},
 {name:'Юг',lines:['Юг'],x:17,left:12,row:46,width:15},
 {name:'Казахстан',lines:['Казахстан'],x:35,left:29,row:46,width:26},
 {name:'Беларусь',lines:['Беларусь'],x:54,left:54,row:46,width:23},
 {name:'Урал',lines:['Урал'],x:82,left:77,row:46,width:23},
 {name:'Северо-запад',lines:['Северо-запад'],x:26,left:4,row:76,width:35},
 {name:'Vet union',lines:['Vet union'],x:44,left:39,row:76,width:23},
 {name:'Приволжье',lines:['Приволжье'],x:72,left:60,row:76,width:27},
 {name:'Центр',lines:['Центр'],x:91,left:87,row:76,width:13},
];
export default function RadioDial({playing=false, miniature=false}:{playing?:boolean;miniature?:boolean}){
 const root=useRef<HTMLDivElement>(null),needle=useRef<HTMLDivElement>(null),plate=useRef<HTMLVideoElement>(null);
 const elapsed=useRef(0),lastActive=useRef(-1);
 const [tuning,setTuning]=useState(false),[visible,setVisible]=useState(false),[reduced,setReduced]=useState(false),[active,setActive]=useState(-1);
 useEffect(()=>{const change=(event:Event)=>setTuning(!!(event as CustomEvent<boolean>).detail);window.addEventListener('telecenter:radio-tuning',change);return()=>window.removeEventListener('telecenter:radio-tuning',change)},[]);
 useEffect(()=>{
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.1});
  if(root.current)observer.observe(root.current);
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);
  return()=>{observer.disconnect();media.removeEventListener('change',update)};
 },[]);
 useEffect(()=>{
  const video=plate.current;if(!video)return;
  if(visible&&!reduced&&(playing||tuning)){void video.play().catch(()=>{})}else video.pause();
 },[visible,reduced,playing,tuning]);
 useEffect(()=>{
  if((!playing&&!tuning)||!visible||reduced)return;
  let frame=0,last=0,tuningElapsed=0;
  const tick=(now:number)=>{
   if(last&&!document.hidden){if(tuning)tuningElapsed+=Math.min(now-last,70);else elapsed.current+=Math.min(now-last,70);}
   last=now;
   const phase=elapsed.current/24000*Math.PI;
   const u=Math.min(1,tuningElapsed/280);const position=tuning?8+57*Math.sin(u*Math.PI)**2+10*Math.sin(u*Math.PI*4)*(1-u):8+83*(1-Math.cos(phase))/2;
   if(needle.current)needle.current.style.transform=`translateX(${position-50}%)`;
   const hit=stations.findIndex(s=>Math.abs(s.x-position)<2.8);
   if(hit!==lastActive.current){lastActive.current=hit;setActive(hit)}
   frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>cancelAnimationFrame(frame);
 },[playing,tuning,visible,reduced]);
 return <div ref={root} className={'radio-dial rigonda-dial kv-radio '+(playing?'is-playing':'')+(tuning?' is-tuning':'')}>
  <div className="rigonda-object">{!miniature&&<CabinetVolume instrument="radio"/>}{miniature&&Array.from({length:16},(_,i)=><span key={i} className="hero-radio-depth" style={{transform:`translateZ(${-2-i*2}px)`}} aria-hidden="true"/>)}{!miniature&&<i className="receiver-contact-point" aria-hidden="true"/>}
   <img className="rigonda-body" src="/media/radio-kv-2026.webp" alt="" width="1920" height="1080" loading="lazy"/>
   {!miniature&&<video ref={plate} className="kv-radio-plate" src="/media/radio-kv-loop.mp4" poster="/media/radio-kv-2026.webp" muted loop playsInline preload="none" aria-hidden="true"/>}
   <h3 className="rigonda-title">ИНВИТРО FM</h3>
   <div className="rigonda-glass" role="group" aria-label="Радиошкала: десять агломераций INVITRO">
    <div className="kv-lamplight" aria-hidden="true"/>
    <div className="rigonda-print">
     <div className="rigonda-indices" aria-hidden="true">{[...stations].sort((a,b)=>a.x-b.x).map((s,i)=><span key={s.name} style={{left:s.x+'%'}}>{String(i+1).padStart(2,'0')}</span>)}</div>
     <div className="rigonda-top-ticks" aria-hidden="true"/>
     <div className="rigonda-stations">{stations.map((s,i)=><div key={s.name} aria-label={s.name} className={'rigonda-station '+(playing&&active===i?'is-tuned':'')} style={{'--station-left':s.left+'%','--station-width':s.width+'%','--station-row':s.row,'--pin-offset':(s.x-s.left)/s.width*100+'%'} as CSSProperties}>
      <span className="rigonda-station-pin" aria-hidden="true"/>
      <span className="rigonda-station-name">{s.lines.map(line=><span key={line}>{line}</span>)}</span>
     </div>)}</div>
     <div className="rigonda-bottom-ticks" aria-hidden="true"/>
     <div className="rigonda-frequency" aria-hidden="true"><span>НА ОДНОЙ ВОЛНЕ</span><span>INVITRO</span><span>23 ДЕКАБРЯ · 12:00</span></div>
    </div>
    <div ref={needle} className="rigonda-needle-track" aria-hidden="true"><span/></div>
    <div className="rigonda-front-glass" aria-hidden="true"/>
   </div>
  </div>
 </div>
}
