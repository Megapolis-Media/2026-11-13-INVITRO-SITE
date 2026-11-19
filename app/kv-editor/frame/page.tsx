'use client';
import {useEffect,useRef} from 'react';
import {Play,Mail,Music2,Ticket,Box} from 'lucide-react';
import '../../event.css';
import '../../new-year.css';
import '../../cinema.css';
import '../../motion-repair.css';
import '../../kv-stage.css';
import '../../kv-studio.css';

export default function ReferenceFrame(){
 const site=useRef<HTMLDivElement>(null),dock=useRef<HTMLElement>(null);
 useEffect(()=>{
  const measure=()=>{
   if(!dock.current||!site.current)return;
   const reserve=dock.current.offsetHeight+(parseFloat(getComputedStyle(dock.current).bottom)||0)+8;
   site.current.style.setProperty('--kv-dock-reserve',Math.ceil(reserve)+'px');
  };
  measure();const observer=new ResizeObserver(measure);observer.observe(dock.current!);
  return ()=>observer.disconnect();
 },[]);
 return <div className="ny-site" ref={site} inert>
  <header className="ny-header"><a className="ny-brand"><img src="/favicon.svg" alt="" width="48" height="44"/><b>INVITRO</b></a>
   <nav>{['Анонс','Радио','Игры','Стол заказов'].map(label=><a key={label}>{label}</a>)}</nav></header>
  <main><section className="kv-hero set-hero"><div className="set-frame">
   <div className="set-copy"><span className="set-date"><i/>23 декабря · 12:00 МСК</span><h1>{'НОВОГОДНИЙ\nТЕЛЕЦЕНТР'}</h1><button className="ny-button orange">Получить билет</button></div>
   <div className="set-art"><div className="set-tableau"><div className="set-breathe" id="art-registration"/></div></div>
  </div></section></main>
  <aside className="ny-dock" ref={dock}>{[Play,Mail,Music2,Ticket,Box].map((Icon,i)=><button key={i} className={i===4?'ball-switch':''}><Icon size={19}/><span>{['Радио','Передать привет','Заказать песню','Мой билет','3D'][i]}</span></button>)}</aside>
 </div>
}
