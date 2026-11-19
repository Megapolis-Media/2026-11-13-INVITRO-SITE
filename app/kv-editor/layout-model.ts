import solo from '../../lib/kv-solo.json';
import poses from '../../lib/kv-poses.json';

export const formats={
 mobile:{label:'Телефон',w:390,h:665},tablet:{label:'Планшет',w:820,h:1180},desktop:{label:'Десктоп',w:1440,h:900}
};
export const items={
 tv:{label:'Телевизор',src:'/hero-v74/tv.webp',ratio:1059/1060},
 camera:{label:'Камера',src:'/hero-v74/camera.webp',ratio:703/1120},
 drum:{label:'Лототрон',src:'/hero-v74/drum.webp',ratio:1060/989},
 radio:{label:'Радиоприёмник',src:'/hero-v76/kv-pocket-radio.webp',ratio:850/581},
 ball:{label:'Шар',src:'',ratio:1}
};
export type Format=keyof typeof formats;
export type Item=keyof typeof items;
export type Prop={id:Item;x:number;y:number;w:number};
export type Layout=Record<Format,Prop[]>;
export const formatKeys=Object.keys(formats) as Format[];
export const itemKeys=Object.keys(items) as Item[];
export const storageKey='invitro.kv-editor.v1';
export const round=(n:number)=>Math.round(n*100000)/100000;
export const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(n,max));
export function defaults(format:Format):Prop[]{
 const base=poses[format];
 const layers=(Object.keys(base) as (keyof typeof base)[]).map(id=>{
  const [x,y,w]=base[id];return {id,x,y,w};
 });
 const [x,y,w]=base.drum;
 const ratio={mobile:990/820,tablet:1120/792,desktop:1536/972}[format];
 return [...layers,{id:'ball',x:round(x+w*(.7364-.5)),y:round(y-(1-.5865)*w*ratio/items.drum.ratio),w:round(w*.063)}];
}
export function restoreItem(format:Format,props:Prop[],id:Item):Prop[]{
 const base=defaults(format);
 const layer=base.find(p=>p.id===id);
 if(!layer||props.some(p=>p.id===id))return props;
 const drum=props.find(p=>p.id==='drum');
 if(id==='ball'&&drum){
  const original=base.find(p=>p.id==='drum')!;
  const ratio=drum.w/original.w;
  layer.x=round(drum.x+(layer.x-original.x)*ratio);
  layer.y=round(drum.y+(layer.y-original.y)*ratio);
  layer.w=round(layer.w*ratio);
 }
 const next=[...props];
 const above=next.findIndex(p=>itemKeys.indexOf(p.id)>itemKeys.indexOf(id));
 next.splice(above<0?next.length:above,0,layer);
 return next;
}
export function soloLayout(format:Format):Prop[]{
 return (['drum','ball'] as const).map(id=>{const [x,y,w]=solo[format][id];return {id,x,y,w}});
}
export function initialLayout():Layout{return {mobile:soloLayout('mobile'),tablet:soloLayout('tablet'),desktop:soloLayout('desktop')}}
export function serialize(layout:Layout,format:Format){
 return JSON.stringify({version:2,baseKV:82,format,anchor:'artwork: center-x, bottom-y, width; fractions; layers back-to-front',layouts:layout});
}
export function readLayout(text:string):{layout:Layout;format:Format}{
 if(text.length>14000)throw Error('Размер раскладки');
 const data=JSON.parse(text);
 if(![1,2].includes(data?.version)||!formatKeys.includes(data.format))throw Error('Формат раскладки');
 const layout=initialLayout();
 for(const format of formatKeys){
  const props=data.layouts?.[format];
  if(!Array.isArray(props)||props.length>itemKeys.length||(data.version===1&&props.length!==itemKeys.length))throw Error('Объекты');
  const seen=new Set();
  layout[format]=props.map((p:Prop)=>{
   if(!p||!itemKeys.includes(p.id)||seen.has(p.id)||![p.x,p.y,p.w].every(Number.isFinite)||Math.abs(p.x)>12||Math.abs(p.y)>12||p.w<(p.id==='ball'?.001:.025)||p.w>2.5)throw Error('Координаты');
   seen.add(p.id);return {id:p.id,x:round(p.x),y:round(p.y),w:round(p.w)};
  });
 }
 return {layout,format:data.format};
}
export function asLink(layout:Layout,format:Format){
 const url=new URL(window.location.href);
 url.search='';url.hash='kv='+btoa(serialize(layout,format)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 return url.href;
}
export function fromHash(hash:string){return readLayout(atob(hash.slice(4).replace(/-/g,'+').replace(/_/g,'/')))}
