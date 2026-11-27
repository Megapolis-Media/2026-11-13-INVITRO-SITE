'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import './radio-dial.css';
import CabinetVolume from './cabinet-volume';

const stations=[
 {name:'Беларусь',lines:['Беларусь'],x:7,left:0,row:0,width:22},
 {name:'Северо-Запад',lines:['Северо-Запад'],x:16,left:2,row:71,width:28},
 {name:'Центр',lines:['Центр'],x:26,left:22,row:47,width:14},
 {name:'Москва и Центр компетенций',lines:['Москва и Центр','компетенций'],x:36,left:29,row:0,width:36},
 {name:'Юг',lines:['Юг'],x:45,left:40,row:70,width:10},
 {name:'Приволжье',lines:['Приволжье'],x:54,left:46,row:46,width:23},
 {name:'Урал',lines:['Урал'],x:63,left:57,row:70,width:12},
 {name:'Казахстан',lines:['Казахстан'],x:73,left:69,row:47,width:24},
 {name:'Сибирь и Дальний Восток',lines:['Сибирь и','Дальний Восток'],x:82,left:69,row:0,width:31},
 {name:'VET UNION',lines:['VET UNION'],x:93,left:81,row:75,width:19},
];
const firstMark=stations[0].x,lastMark=stations[stations.length-1].x;
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
   // Dwell at the last mark, then restart at the first.
   const progress=tuning?Math.min(tuningElapsed/280,1)*.06:Math.min((elapsed.current%26000)/24000,1);
   const position=firstMark+(lastMark-firstMark)*progress;
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
   <div className="rigonda-glass" role="group" aria-label="Радиошкала ИНВИТРО">
    <div className="kv-lamplight" aria-hidden="true"/>
    <div className="rigonda-print">
     <div className="rigonda-indices" aria-hidden="true">{stations.map((s,i)=><span key={s.name} style={{left:s.x+'%'}}>{String(i+1).padStart(2,'0')}</span>)}</div>
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
