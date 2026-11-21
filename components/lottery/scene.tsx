'use client';
import {useEffect,useRef} from 'react';
import * as T from 'three';
import {geometryUrl} from 'virtual:invitro-typography';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
type Props={count:number|null;ticket:string;phase:number;digits:string;drawOnly?:boolean};
export default function LotteryScene(props:Props){const host=useRef<HTMLDivElement>(null),current=useRef(props);current.current=props;
useEffect(()=>{const el=host.current!;let renderer:T.WebGLRenderer|undefined,env:T.WebGLRenderTarget|undefined,raf=0,active=false,dead=false,ready=false,started=false,lastCount='',lastTicket='',lastPhase=0,phaseAt=0,previousTime=0;const scene=new T.Scene();let floor:Reflector|undefined;const camera=new T.PerspectiveCamera(34,1,.1,80);const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const counter:T.Mesh[]=[],ticketDigits:T.Mesh[]=[],balls:{o:T.Group;home:T.Vector3;from:T.Vector3;k:number;n:number}[]=[],flips=new Map<T.Mesh,number>();let font:Awaited<ReturnType<FontLoader['loadAsync']>>;
const m=(color:string,metalness=.15,roughness=.24,extra={})=>new T.MeshPhysicalMaterial({color,metalness,roughness,...extra});
const teal=m('#00acc6',.2,.2,{clearcoat:1}),ivory=m('#ffffff'),dark=m('#141e24',.7,.24),steel=m('#85939a',.85,.2),lit=m('#ffffff',.15,.2,{emissive:'#ffffff',emissiveIntensity:.35}),glass=m('#e1fffa',0,.07,{transmission:.97,thickness:.08,ior:1.46,transparent:true,opacity:.48,depthWrite:false}),red=m('#d71f24',.2,.2,{emissive:'#a80000',emissiveIntensity:.5});
const add=(g:T.Object3D,geo:T.BufferGeometry,mat:T.Material,p:number[])=>{const o=new T.Mesh(geo,mat);o.position.set(p[0],p[1],p[2]);g.add(o);return o};
const box=(g:T.Object3D,w:number,h:number,d:number,mat:T.Material,p:number[])=>add(g,new RoundedBoxGeometry(w,h,d,2,.035),mat,p);
function textGeometry(s:string,size:number){const geo=new TextGeometry(s,{font,size,depth:.045,bevelEnabled:true,bevelThickness:.006,bevelSize:.006,bevelSegments:2,curveSegments:5});geo.computeBoundingBox();const b=geo.boundingBox!;geo.translate(-(b.max.x+b.min.x)/2,-(b.max.y+b.min.y)/2,0);return geo}
function label(g:T.Object3D,s:string,size:number,mat:T.Material,p:number[]){return add(g,textGeometry(s,size),mat,p)}
function resize(){if(!renderer)return;camera.aspect=el.clientWidth/el.clientHeight;const dist=Math.max(11.6,8.1/(2*Math.tan(T.MathUtils.degToRad(17))*camera.aspect));camera.position.set(dist*.055,2.45+dist*.10,dist);camera.lookAt(0,2.45,0);if(props.drawOnly){camera.position.set(.4,3,Math.max(8.8,7.8/(2*Math.tan(T.MathUtils.degToRad(17))*camera.aspect)));camera.lookAt(0,.2,0);}camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight)}
async function init(){if(started)return;started=true;try{renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=T.NeutralToneMapping;renderer.toneMappingExposure=1;renderer.outputColorSpace=T.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;el.appendChild(renderer.domElement);const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment();env=pm.fromScene(room,.03);scene.environment=env.texture;scene.environmentIntensity=.55;room.dispose();pm.dispose();for(const [c,pos,intensity] of [[0xffffff,[-4,6,7],2.4],[0xffffff,[4,3,-2],.75]] as const){const light=new T.DirectionalLight(c,intensity);light.position.set(pos[0],pos[1],pos[2]);if(pos[0]<0){light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-7,right:7,top:8,bottom:-5});light.shadow.normalBias=.02;}scene.add(light)}font=await new FontLoader().loadAsync(geometryUrl);if(dead)return;
// One studio floor, shared light and grounded equipment.
floor=new Reflector(new T.PlaneGeometry(60,60),{color:0x00acc6,textureWidth:640,textureHeight:640,multisample:0});const fm=floor.material as T.ShaderMaterial;fm.fragmentShader=fm.fragmentShader.replace('blendOverlay( base.rgb, color )','mix( color, base.rgb, 0.16 )');floor.rotation.x=-Math.PI/2;floor.position.y=-1;scene.add(floor);
const shadow=add(scene,new T.PlaneGeometry(60,60),new T.ShadowMaterial({opacity:.22,color:'#003b50',depthWrite:false}),[0,-.99,0]);shadow.rotation.x=-Math.PI/2;shadow.receiveShadow=true;
box(scene,7.5,.22,3.8,ivory,[0,-.86,.1]);box(scene,7.3,.11,3.6,teal,[0,-.98,.1]);
if(!props.drawOnly){for(const x of [-3.1,3.1]){box(scene,.16,3.85,.22,steel,[x,1.20,-.55]);box(scene,.42,.10,.7,dark,[x,-.68,-.55]);}
// Five independent acrylic cassettes in an enamel broadcast chassis.
box(scene,6.85,2.04,.84,dark,[0,4,-.29]);box(scene,6.72,1.86,.66,ivory,[0,4,-.2]);
for(const x of [-3.33,3.33])box(scene,.17,1.77,.72,teal,[x,4,-.19]);
box(scene,5.1,.43,.34,ivory,[0,5.12,-.23]);label(scene,'УЖЕ В ИГРЕ',.24,dark,[0,5.12,-.035]);
const digitMaterial=m('#ffffff',.04,.23,{clearcoat:1,emissive:'#ffffff',emissiveIntensity:.12});
const trim=m('#bdeaf1',.6,.14,{clearcoat:1});
for(let i=0;i<5;i++){
 const x=(i-2)*1.17+(i>1?.10:0);
 box(scene,1.10,1.30,.32,trim,[x,4,.18]);
 box(scene,.97,1.17,.12,dark,[x,4,.37]);
 for(const side of [-1,1]){box(scene,.034,1.25,.22,glass,[x+side*.52,4,.42]);box(scene,1.05,.035,.22,glass,[x,4+side*.625,.42]);}
 const d=label(scene,'0',.88,digitMaterial.clone(),[x,4,.45]);d.name='counter_digit_'+i;counter.push(d);
 box(scene,.97,.015,.018,dark,[x,4,.52]);
 for(const side of [-1,1]){box(scene,.046,.095,.07,steel,[x+side*.48,4,.53]);}
}
label(scene,'ИЗ 13 000 БИЛЕТОВ',.21,dark,[0,3.20,.40]);
box(scene,.11,.11,.07,m('#ff5601',.1,.18,{emissive:'#ff5601',emissiveIntensity:.45}),[3.12,4,.21]);
}
for(let k=0;k<3;k++){const g=new T.Group();g.position.set((k-1)*2.3,-.8,0);scene.add(g);add(g,new T.CylinderGeometry(.9,.96,.22,40),teal,[0,.2,0]);add(g,new T.CylinderGeometry(.82,.9,.1,40),dark,[0,.36,0]);add(g,new T.SphereGeometry(.87,32,24),glass,[0,1.35,0]);for(const y of [.64,1.35]){const ring=add(g,new T.TorusGeometry(y===1.35?.875:.50,.015,8,48),steel,[0,y,0]);ring.rotation.x=Math.PI/2}for(const x of [-.91,.91])box(g,.06,1,.08,steel,[x,.91,0]);for(let n=0;n<10;n++){const b=new T.Group(),a=n*2.399,rr=.25+(n%3)*.105;b.position.set(Math.cos(a)*rr,.95+Math.floor(n/4)*.27,Math.sin(a)*rr);g.add(b);add(b,new T.SphereGeometry(.165,16,12),ivory,[0,0,0]);label(b,String(n),.17,teal,[0,0,.16]);balls.push({o:b,home:b.position.clone(),from:b.position.clone(),k,n})}box(g,.56,.06,.6,dark,[0,.46,.83]);label(g,'0'+(k+1),.18,ivory,[0,.2,.93]);}
const ticket=new T.Group();ticket.visible=!props.drawOnly;ticket.position.set(0,-.17,1.6);ticket.rotation.set(-.08,-.05,.025);scene.add(ticket);box(ticket,3.55,.94,.12,teal,[0,0,-.09]);box(ticket,3.48,.87,.1,ivory,[0,0,0]);const xs=[-1.16,-.69,.2,.67,1.14];for(let i=0;i<5;i++)ticketDigits.push(label(ticket,'0',.5,teal,[xs[i],0,.08]));box(ticket,.20,.035,.04,teal,[-.22,0,.10]);label(ticket,'БИЛЕТ',.13,dark,[0,.65,.08]);scene.traverse(o=>{if(o instanceof T.Mesh&&o!==floor&&o!==shadow){o.castShadow=true;o.receiveShadow=true}});resize();ready=true;el.classList.add('lottery-rendered');}catch{renderer?.domElement.remove();renderer?.dispose();renderer=undefined}}
const io=new IntersectionObserver(([e])=>{active=e.isIntersecting;if(active)void init()},{rootMargin:'120px'});io.observe(el);const ro=new ResizeObserver(resize);ro.observe(el);
function tick(ms:number){raf=requestAnimationFrame(tick);if(!ready||!renderer||!active||document.hidden){previousTime=ms;return}const t=ms/1000,dt=Math.min(.05,(ms-previousTime)/1000);previousTime=ms;const p=current.current,c=p.count===null?'-----':String(p.count).padStart(5,'0'),ticket=p.ticket.replace(/\D/g,'');if(c!==lastCount){counter.forEach((o,i)=>{if(c[i]===lastCount[i])return;o.visible=/\d/.test(c[i]);if(o.visible){o.geometry.dispose();o.geometry=textGeometry(c[i],.88);if(lastCount&&!reduced)flips.set(o,t)}});lastCount=c}if(ticket!==lastTicket){ticketDigits.forEach((o,i)=>{o.geometry.dispose();o.geometry=textGeometry(ticket[i]||'0',.5)});lastTicket=ticket}for(const [o,start] of flips){const u=Math.min(1,(t-start)/.45);o.rotation.x=(1-u)**3*1.2;(o.material as T.MeshPhysicalMaterial).emissiveIntensity=.35+Math.sin(u*Math.PI)*.2;if(u===1)flips.delete(o)}if(p.phase!==lastPhase){balls.forEach(b=>b.from.copy(b.o.position));phaseAt=t;lastPhase=p.phase}for(const b of balls){if(p.phase>=b.k+2&&b.n===Number(p.digits[b.k])){const u=reduced||p.phase>b.k+2?1:Math.min(1,(t-phaseAt)/.9),ease=u*u*(3-2*u);b.o.position.copy(b.from).lerp(new T.Vector3(0,.66,.93),ease);b.o.position.y+=Math.sin(u*Math.PI)*.4}else if(!reduced&&p.phase===b.k+1){const a=t*1.8+b.n*2.399;b.o.position.lerp(new T.Vector3(Math.cos(a)*.43,1.35+Math.sin(a*1.3)*.35,Math.sin(a)*.35),1-Math.exp(-8*dt))}else b.o.position.lerp(b.home,reduced?1:1-Math.exp(-8*dt))}renderer.render(scene,camera)}raf=requestAnimationFrame(tick);
return()=>{dead=true;cancelAnimationFrame(raf);io.disconnect();ro.disconnect();scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(x=>x.dispose())}});[teal,ivory,dark,steel,lit,glass,red].forEach(x=>x.dispose());floor?.getRenderTarget().dispose();env?.dispose();renderer?.dispose();renderer?.domElement.remove()};
},[]);
const display=props.count===null?'—————':String(props.count).padStart(5,'0');
return <div className={"lottery-scene "+(props.drawOnly?"lottery-draw-only":"")} ref={host} role="img" aria-label="3D-счётчик зарегистрированных билетов, три стеклянных лототрона и персональный билет"><div className="lottery-fallback">
 <div className="counter-equipment"><div className="counter-equipment__title">УЖЕ В ИГРЕ</div><div className="counter-equipment__digits">{display.split('').map((digit,i)=><span className="counter-cassette" key={i}><b key={digit}>{digit}</b></span>)}</div><div className="counter-equipment__capacity">ИЗ 13 000 БИЛЕТОВ</div></div>
 <div className="counter-fallback-note">Три лототрона · три независимых набора 0–9</div>
 </div></div>;
}
