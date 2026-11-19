'use client';
import {type CSSProperties} from 'react';
import poses from '../lib/kv-solo.json';

const ratios={mobile:990/820,tablet:1120/792,desktop:1536/972};
const anchorStyle=Object.fromEntries(Object.entries(poses).flatMap(([format,pose])=>{
 const [x,y,width]=pose.drum,[ox,oy,diam]=pose.ball;
 const ratio=ratios[format as keyof typeof ratios];
 // Convert the approved release point into coordinates on the drum artwork itself.
 const markers={ox:.5+(ox-x)/width,oy:1-(y-oy)/(width*ratio*989/1060),diam:diam/width,lx:.598,ly:.8132};
 return Object.entries(markers).map(([name,n])=>['--'+format+'-'+name,n*100+'%']);
})) as CSSProperties;

export default function CinemaHero({onTicket,allowFullMotion=false,title='НОВОГОДНИЙ\nТЕЛЕЦЕНТР',intro,mode='before'}:{onTicket:()=>void;allowFullMotion?:boolean;title?:string;intro?:string;mode?:string}){
 return <section className="kv-hero set-hero solo-hero" id="home" aria-labelledby="kv-title" style={anchorStyle}>
  <div className="set-frame"><div className="set-copy"><span className="set-date"><i/>23 декабря · 12:00 МСК</span>
   <h1 id="kv-title">{title}</h1>{mode==='before'&&intro&&<p className="set-intro">{intro}</p>}<button data-ui-action="accent" className="ny-button orange" onClick={onTicket}>{mode==='before'?'Получить билет':mode==='live'?'Смотреть эфир':'Смотреть повтор'}</button></div>
   <div className="set-art"><div className="set-tableau"><div className="set-breathe" data-hero-set="">
    <div className="solo-drum"><picture>
     <source media={allowFullMotion?'not all':'(prefers-reduced-motion: reduce)'} srcSet="/hero-v74/drum.webp"/>
     <source media="(max-width: 700px)" srcSet="/hero-v83/drum-turn-mobile.webp"/>
     <img className="set-plate" src="/hero-v83/drum-turn.webp" width="1060" height="989" alt="Прозрачный лототрон с разноцветными шарами и открытым желобом" draggable={false} fetchPriority="high"/></picture></div>
    <i className="hero-outlet" aria-hidden="true"/><i className="hero-lip" aria-hidden="true"/><i data-orb-gauge="" aria-hidden="true"/>
    <span className="sr-only">Кручу-верчу, поздравить хочу</span>
   </div></div></div>
  </div></section>
}
