'use client';
import {useEffect,useRef,useState} from 'react';
import {Monitor,Tablet,Smartphone,Link2,Undo2,ZoomIn,ZoomOut,ChevronUp,ChevronDown,Check,Download,X,Copy,RotateCcw,Grip,Trash2} from 'lucide-react';
import Board from './board';
import {formats,items,itemKeys,formatKeys,defaults,soloLayout,restoreItem,initialLayout,serialize,readLayout,asLink,fromHash,round,clamp,storageKey,type Layout,type Format,type Prop,type Item} from './layout-model';
import './editor.css';

const icons={mobile:Smartphone,tablet:Tablet,desktop:Monitor};
export default function KVEditor(){
 const [layout,setLayout]=useState(initialLayout),[format,setFormat]=useState<Format>('desktop'),[preferred,select]=useState<Item>('drum');
 const [zoom,setZoom]=useState(false),[ready,setReady]=useState(false),[status,setStatus]=useState(''),[count,setCount]=useState(0);
 const [share,setShare]=useState(''),[copied,setCopied]=useState(false),shareInput=useRef<HTMLTextAreaElement>(null),shareDialog=useRef<HTMLDialogElement>(null);
 const draft=useRef(layout),lastFormat=useRef(format),history=useRef<{layout:Layout;format:Format}[]>([]),gesture=useRef<Layout|null>(null),skipSave=useRef(true);
 useEffect(()=>{
  function open(){
   let next=initialLayout(),preset:Format=window.innerWidth<=650?'mobile':window.innerWidth<1100||matchMedia('(orientation:portrait)').matches?'tablet':'desktop',message='';
   try{
    const shared=location.hash.startsWith('#kv=');
    const stored=shared?null:localStorage.getItem(storageKey);
    const input=shared?fromHash(location.hash):stored?readLayout(stored):null;
    if(input){next=input.layout;preset=input.format;message=shared?'Открыта раскладка по ссылке':'Черновик восстановлен'}
   }catch{message='Не удалось открыть черновик. Загружен исходный KV.'}
   gesture.current=null;history.current=[];setCount(0);skipSave.current=true;draft.current=next;lastFormat.current=preset;
   setLayout(next);setFormat(preset);setStatus(message);setReady(true);setShare('');
  }
  open();
  const flush=()=>{if(!skipSave.current)try{localStorage.setItem(storageKey,serialize(draft.current,lastFormat.current))}catch{}};
  window.addEventListener('hashchange',open);window.addEventListener('pagehide',flush);
  return ()=>{window.removeEventListener('hashchange',open);window.removeEventListener('pagehide',flush);flush()};
 },[]);
 useEffect(()=>{
  if(!ready||skipSave.current)return;
  const timer=setTimeout(()=>{try{localStorage.setItem(storageKey,serialize(layout,format));setStatus('Сохранено на устройстве')}catch{setStatus('Для сохранения скопируйте ссылку')}},220);
  return ()=>clearTimeout(timer);
 },[layout,format,ready]);
 useEffect(()=>{if(share&&!shareDialog.current?.open)shareDialog.current?.showModal();if(!share&&shareDialog.current?.open)shareDialog.current?.close()},[share]);
 function remember(prev:Layout){history.current=[...history.current.slice(-39),{layout:prev,format}];setCount(history.current.length)}
 function setDraft(next:Layout,save=true){draft.current=next;skipSave.current=!save;setLayout(next)}
 function apply(next:Prop[]){
  const prev=draft.current;
  if(next.length===prev[format].length&&next.every((p,i)=>{const a=prev[format][i];return a.id===p.id&&a.x===p.x&&a.y===p.y&&a.w===p.w}))return;
  if(!gesture.current)remember(prev);
  setDraft({...prev,[format]:next});
 }
 function update(id:Item,change:Partial<Prop>){
  const props=draft.current[format],prev=props.find(p=>p.id===id);
  if(!prev)return;
  const next={...prev,...change},factor=next.w/prev.w;
  apply(props.map(p=>{
   if(p.id===id)return next;
   if(id==='drum'&&p.id==='ball'){
    return {...p,x:round(next.x+(p.x-prev.x)*factor),y:round(next.y+(p.y-prev.y)*factor),w:round(p.w*factor)};
   }
   return p;
  }));
 }
 function start(){if(!gesture.current)gesture.current=draft.current}
 function end(){if(gesture.current&&draft.current!==gesture.current)remember(gesture.current);gesture.current=null}
 function undo(){end();const prev=history.current.pop();if(prev){lastFormat.current=prev.format;setFormat(prev.format);setDraft(prev.layout);setCount(history.current.length)}}
 function switchTo(key:Format){end();lastFormat.current=key;setFormat(key);setZoom(false)}
 const list=layout[format];
 const obj=list.find(p=>p.id===preferred)??list.at(-1);
 const selected=obj?.id??null,idx=obj?list.indexOf(obj):-1;
 const missing=itemKeys.filter(id=>!list.some(p=>p.id===id));
 const original=defaults(format).find(p=>p.id===selected);
 const percent=obj&&original?Math.round(obj.w/original.w*100):0;
 function scale(n:number){if(selected&&original)update(selected,{w:round(original.w*clamp(n,30,220)/100)})}
 function reorder(delta:number){const next=[...list];const other=idx+delta;if(idx<0||other<0||other>=next.length)return;[next[other],next[idx]]=[next[idx],next[other]];apply(next)}
 function remove(){
  if(!selected)return;
  end();apply(draft.current[format].filter(p=>p.id!==selected));
 }
 function restore(id:Item){
  end();apply(restoreItem(format,draft.current[format],id));select(id);
 }
 async function copy(){
  try{await navigator.clipboard.writeText(share);setCopied(true)}catch{shareInput.current?.focus();shareInput.current?.select();try{setCopied(document.execCommand('copy'))}catch{setCopied(false)}}
 }
 function download(){
  const blob=new Blob([JSON.stringify(JSON.parse(serialize(draft.current,format)),null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='INVITRO-KV-layout.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
 }
 return <main className="kv-editor" onKeyDown={e=>{
  if(share||e.repeat||e.altKey||e.ctrlKey||e.metaKey||!['Backspace','Delete'].includes(e.key))return;
  if((e.target as HTMLElement).closest('input,textarea,select,[contenteditable=true]'))return;
  e.preventDefault();remove();
 }}>
  <header className="kv-editor-bar"><div className="kv-editor-name"><img src="/favicon.svg" width="35" height="34" alt=""/><div><span>INVITRO</span><h1>Редактор KV</h1></div></div>
   <button data-ui-action="solid" className="kv-main-action" disabled={!ready} onClick={()=>{end();setCopied(false);setShare(asLink(draft.current,format))}}><Link2 size={17}/>Передать раскладку</button></header>
  <div className="kv-editor-work">
   <div className="kv-canvas-pane"><div className="kv-canvas-tools"><div className="kv-formats" role="group" aria-label="Формат экрана">
    {formatKeys.map(key=>{const Icon=icons[key];return <button data-ui-action="secondary" key={key} aria-pressed={format===key} onClick={()=>switchTo(key)}><Icon size={15}/>{formats[key].label}</button>})}
   </div><button data-ui-action="icon" className="kv-icon-btn kv-zoom" title={zoom?'Показать весь экран':'Приблизить сцену'} aria-label={zoom?'Показать весь экран':'Приблизить сцену'} aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{zoom?<ZoomOut size={19}/>:<ZoomIn size={19}/>}</button></div>
   <Board format={format} selected={selected} props={list} zoom={zoom} onSelect={select} onStart={start} onEnd={end} onMove={update}/>
   <div className="kv-canvas-foot"><span>{formats[format].w} × {formats[format].h}</span><span role="status">{status}</span></div></div>
   <aside className="kv-inspector"><div className="kv-panel-heading"><h2>Предметы</h2><div className="kv-object-actions"><button data-ui-action="secondary" className="kv-remove" disabled={!selected} title={obj?'Удалить из композиции: '+items[obj.id].label:'Удалить из композиции'} onClick={remove}><Trash2 size={15}/>Удалить</button><button data-ui-action="icon" className="kv-icon-btn" disabled={!count} onClick={undo} aria-label="Отменить изменение" title="Отменить изменение"><Undo2 size={18}/></button></div></div>
    <div className="kv-objects">{[...list].reverse().map(p=><button key={p.id} onClick={()=>select(p.id)} aria-pressed={p.id===selected}>
     {p.id==='ball'?<i className="kv-ball-thumb"/>:<img src={items[p.id].src} alt="" draggable={false}/>}<span>{items[p.id].label}</span>{p.id===selected&&<Check size={15}/>}</button>)}</div>
    {list.length===0&&<p className="kv-empty">В этом формате все предметы удалены.</p>}
    {missing.length>0&&<select className="kv-restore" aria-label="Вернуть предмет" value="" onChange={e=>restore(e.target.value as Item)}>
     <option value="" disabled>Вернуть предмет…</option>
     {missing.map(id=><option key={id} value={id}>{items[id].label}</option>)}
    </select>}
    {obj&&<><div className="kv-props-controls"><div className="kv-field-heading"><label htmlFor="kv-size">Масштаб</label><output htmlFor="kv-size">{percent}%</output></div>
     <input id="kv-size" type="range" min="30" max="220" value={percent} onPointerDown={start} onPointerUp={end} onPointerCancel={end} onBlur={end} onChange={e=>scale(+e.target.value)}/>
     <div className="kv-order"><span>Слой</span><div><button data-ui-action="icon" disabled={idx===list.length-1} aria-label="На слой выше" title="На слой выше" onClick={()=>reorder(1)}><ChevronUp size={18}/></button><button data-ui-action="icon" disabled={idx===0} aria-label="На слой ниже" title="На слой ниже" onClick={()=>reorder(-1)}><ChevronDown size={18}/></button></div></div>
    </div>
    <p className="kv-tip"><Grip size={16}/>{selected==='ball'?'Шар задаёт точку старта. При перемещении лототрона он сохраняет положение относительно желоба.':'Перетащите предмет пальцем или мышью. Для точной подгонки используйте стрелки на клавиатуре.'}</p></>}
    <button data-ui-action="secondary" className="kv-reset" onClick={()=>apply(soloLayout(format))}><RotateCcw size={15}/>Исходная композиция</button>
   </aside>
  </div>
  <dialog ref={shareDialog} onCancel={()=>setShare('')} onClose={()=>setShare('')} className="kv-share"><div className="kv-panel-heading"><h2>Передать раскладку</h2><button data-ui-action="icon" className="kv-icon-btn" aria-label="Закрыть" onClick={()=>setShare('')}><X size={18}/></button></div>
   <p>Ссылка содержит позиции, масштаб и порядок предметов во всех трёх форматах. Отправьте её в чат.</p>
   <textarea ref={shareInput} aria-label="Ссылка на эту раскладку" readOnly value={share} onFocus={e=>e.target.select()}/>
   <button data-ui-action="solid" className="kv-main-action" onClick={()=>void copy()}>{copied?<Check size={16}/>:<Copy size={16}/>} {copied?'Ссылка скопирована':'Скопировать ссылку'}</button>
   <button data-ui-action="secondary" className="kv-download" onClick={download}><Download size={16}/> Скачать JSON</button>
  </dialog>
 </main>;
}
