'use client';
import {useCallback,useEffect,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
import {formats,items,clamp,round,type Format,type Item,type Prop} from './layout-model';

type Rect={x:number;y:number;w:number;h:number};
type Props={format:Format;props:Prop[];selected:Item|null;zoom:boolean;onSelect:(id:Item)=>void;onStart:()=>void;onEnd:()=>void;onMove:(id:Item,change:Partial<Prop>)=>void};
const masks=new Map<Item,ImageData>();
function loadMask(id:Item,img:HTMLImageElement){
 if(masks.has(id))return;
 const canvas=document.createElement('canvas');canvas.width=180;canvas.height=Math.round(180/items[id].ratio);
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 if(!ctx)return;
 ctx.drawImage(img,0,0,canvas.width,canvas.height);
 masks.set(id,ctx.getImageData(0,0,canvas.width,canvas.height));
}
function contains(id:Item,u:number,v:number){
 if(u<0||u>=1||v<0||v>=1)return false;
 if(id==='ball')return (u-.5)**2+(v-.5)**2<=.25;
 const pic=masks.get(id);
 return !pic||pic.data[(Math.floor(v*pic.height)*pic.width+Math.floor(u*pic.width))*4+3]>24;
}
export default function Board({format,props,selected,zoom,onSelect,onStart,onEnd,onMove}:Props){
 const mount=useRef<HTMLDivElement>(null),frame=useRef<HTMLIFrameElement>(null),paper=useRef<HTMLDivElement>(null);
 const [space,setSpace]=useState({w:1,h:1}),[art,setArt]=useState<Rect|null>(null);
 const observer=useRef<ResizeObserver|null>(null);
 const drag=useRef<{pointer:number;id:Item;clientX:number;clientY:number;x:number;y:number;w:number;basis:Rect}|null>(null);
 const size=formats[format];
 const measure=useCallback(()=>{
  const el=frame.current?.contentDocument?.getElementById('art-registration');
  if(!el)return;
  const r=el.getBoundingClientRect();
  if(r.width&&r.height)setArt(prev=>prev&&prev.x===r.x&&prev.y===r.y&&prev.w===r.width&&prev.h===r.height?prev:{x:r.x,y:r.y,w:r.width,h:r.height});
 },[]);
 function connect(){
  observer.current?.disconnect();
  const doc=frame.current?.contentDocument,el=doc?.getElementById('art-registration');
  if(!el||!doc)return;
  observer.current=new ResizeObserver(measure);
  for(const target of [el,doc.documentElement,doc.querySelector('.set-frame'),doc.querySelector('.ny-dock')])if(target)observer.current.observe(target);
  measure();
 }
 useEffect(()=>{
  const el=mount.current!;
  const resize=()=>setSpace({w:el.clientWidth,h:el.clientHeight});
  resize();const ro=new ResizeObserver(resize);ro.observe(el);
  return ()=>{ro.disconnect();observer.current?.disconnect()};
 },[]);
 useEffect(()=>{const raf=requestAnimationFrame(measure);return ()=>cancelAnimationFrame(raf)},[format,measure]);
 const camera=zoom&&art?art:{x:0,y:0,w:size.w,h:size.h};
 const padding=space.w<520?8:18;
 const scale=Math.max(.01,Math.min((space.w-padding*2)/camera.w,(space.h-padding*2)/camera.h));
 const left=(space.w-camera.w*scale)/2-camera.x*scale,top=(space.h-camera.h*scale)/2-camera.y*scale;
 function start(e:ReactPointerEvent<HTMLDivElement>){
  if(!art||!paper.current||e.button!==0||!e.isPrimary)return;
  const rect=paper.current.getBoundingClientRect(),x=(e.clientX-rect.left)/scale,y=(e.clientY-rect.top)/scale;
  let id=(e.target as HTMLElement).closest<HTMLElement>('[data-drag-handle]')?.dataset.dragHandle as Item|undefined;
  if(!id){
   const hit=[...props].reverse().find(p=>{
    const width=p.w*art.w,height=width/items[p.id].ratio;
    return contains(p.id,(x-art.x-p.x*art.w+width/2)/width,(y-art.y-p.y*art.h+height)/height);
   });
   id=hit?.id;
  }
  const obj=props.find(p=>p.id===id);if(!obj)return;
  e.preventDefault();e.currentTarget.focus({preventScroll:true});onSelect(obj.id);onStart();
  e.currentTarget.setPointerCapture(e.pointerId);
  drag.current={pointer:e.pointerId,id:obj.id,clientX:e.clientX,clientY:e.clientY,x:obj.x,y:obj.y,w:obj.w,basis:art};
 }
 function move(e:ReactPointerEvent<HTMLDivElement>){
  const d=drag.current;if(!d||e.pointerId!==d.pointer)return;
  const b=d.basis;
  const dx=(e.clientX-d.clientX)/(scale*b.w),dy=(e.clientY-d.clientY)/(scale*b.h);
  const height=d.w*b.w/items[d.id].ratio;
  onMove(d.id,{x:round(clamp(d.x+dx,(-b.x+8)/b.w,(size.w-b.x-8)/b.w)),
   y:round(clamp(d.y+dy,(-b.y+Math.min(16,height))/b.h,(size.h-b.y+height-Math.min(16,height))/b.h))});
 }
 function end(e:ReactPointerEvent<HTMLDivElement>){
  if(!drag.current||e.pointerId!==drag.current.pointer)return;
  drag.current=null;onEnd();
 }
 return <div ref={mount} className="kv-workbench" aria-label="Макет первого экрана">
  <div className="kv-paper" ref={paper} style={{width:size.w,height:size.h,left,top,transform:'scale('+scale+')'}}>
   <iframe title="Фон и интерфейс первого экрана" onLoad={connect} src="/kv-editor/frame" ref={frame} tabIndex={-1} aria-hidden="true"/>
   <div className="kv-hit-plane" role="group" aria-label="Перемещение предметов стрелками" tabIndex={0}
    onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}
    onKeyDown={e=>{
     const arrows:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
     const delta=arrows[e.key];if(!delta||!art||!selected)return;e.preventDefault();
     const p=props.find(t=>t.id===selected)!;const step=e.shiftKey?10:1;
     onMove(selected,{x:round(clamp(p.x+step*delta[0]/art.w,(-art.x+8)/art.w,(size.w-art.x-8)/art.w)),y:round(clamp(p.y+step*delta[1]/art.h,(-art.y+8)/art.h,(size.h-art.y+p.w*art.w/items[selected].ratio-8)/art.h))});
    }}>
    {art&&<div className="kv-layer-box" style={{left:art.x,top:art.y,width:art.w,height:art.h}}>
     {props.map(p=><div key={p.id} className="kv-prop" data-object={p.id} style={{left:(p.x*100)+'%',bottom:((1-p.y)*100)+'%',width:(p.w*100)+'%'}}>
       {p.id==='ball'?<i className="kv-editor-ball" role="img" aria-label="Шар"/>:<img src={items[p.id].src} alt={items[p.id].label} draggable={false} onLoad={e=>loadMask(p.id,e.currentTarget)}/>}
     </div>)}
     {props.filter(p=>p.id===selected).map(p=><div key={p.id} className="kv-selection" style={{left:(p.x*100)+'%',bottom:((1-p.y)*100)+'%',width:(p.w*100)+'%',aspectRatio:String(items[p.id].ratio),outlineWidth:1/scale}}>
      <span data-drag-handle={p.id} style={{fontSize:Math.min(22,11/scale),padding:(2/scale)+'px '+(6/scale)+'px'}}>{items[p.id].label}</span>
     </div>)}
    </div>}
   </div>
  </div>
 </div>
}
