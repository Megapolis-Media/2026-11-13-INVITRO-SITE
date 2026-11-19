'use client';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {Reflector} from 'three/addons/objects/Reflector.js';

export default function RegistrationCounter({count,ticketDisplay=false}:{count:number|null;ticketDisplay?:boolean}){
 const host=useRef<HTMLDivElement>(null),value=useRef(count),[ready,setReady]=useState(false);value.current=count;
 useEffect(()=>{
  const el=host.current!;let renderer:T.WebGLRenderer|undefined,env:T.WebGLRenderTarget|undefined,floor:Reflector|undefined,raf=0,dead=false,active=false,started=false,loaded=false,last='',lastFrame=0;
  const scene=new T.Scene();scene.background=null;const camera=new T.OrthographicCamera(-7,7,3,-3,.1,80);
  const digits:T.Mesh[]=[],flips=new Map<T.Mesh,number>();const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let font:Awaited<ReturnType<FontLoader['loadAsync']>>;
  const mat=(color:string,roughness=.22,metalness=.12)=>new T.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:1,clearcoatRoughness:.12});
  const pearl=mat('#f9fcff'),cyan=mat('#00acc6',.13,.32),ink=mat('#005564',.28),edge=mat('#8bdbe6',.14,.3),silver=mat('#b9d0d7',.24,.5),white=mat('#ffffff',.25,.04);
  const mesh=(g:T.Object3D,geo:T.BufferGeometry,m:T.Material,x:number,y:number,z:number)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o};
  const box=(w:number,h:number,d:number,r:number,m:T.Material,x:number,y:number,z:number)=>mesh(scene,new RoundedBoxGeometry(w,h,d,5,r),m,x,y,z);
  function geometry(text:string,size:number){const g=new TextGeometry(text,{font,size,depth:.035,curveSegments:8,bevelEnabled:true,bevelSize:.006,bevelThickness:.007,bevelSegments:2});g.computeBoundingBox();const b=g.boundingBox!;g.translate(-(b.max.x+b.min.x)/2,-(b.max.y+b.min.y)/2,0);return g}
  function label(s:string,size:number,m:T.Material,x:number,y:number,z:number){return mesh(scene,geometry(s,size),m,x,y,z)}
  function resize(){if(!renderer)return;const aspect=el.clientWidth/el.clientHeight,half=Math.max(2.65,6.55/aspect);camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.position.set(.15,4.4,23);camera.lookAt(.15,1.75,0);camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight)}
  async function init(){if(started)return;started=true;try{
   renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setClearColor(0xffffff,0);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NeutralToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;el.insertBefore(renderer.domElement,el.firstChild);
   const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment();env=pm.fromScene(room,.035);scene.environment=env.texture;scene.environmentIntensity=.65;room.dispose();pm.dispose();
   scene.add(new T.HemisphereLight('#ffffff','#c5e7ec',.7));const key=new T.DirectionalLight('#ffffff',2.4);key.position.set(-3,11,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-9,right:9,top:8,bottom:-6});key.shadow.normalBias=.025;scene.add(key);const rim=new T.DirectionalLight('#e1faff',1.5);rim.position.set(6,6,-3);scene.add(rim);
   floor=new Reflector(new T.PlaneGeometry(18,12),{color:0xffffff,textureWidth:768,textureHeight:384,multisample:0});const fm=floor.material as T.ShaderMaterial;// Keep empty pixels transparent: white tone mapping must not create a grey rectangle.
   fm.transparent=true;fm.depthWrite=false;
   fm.vertexShader=fm.vertexShader.replace('varying vec4 vUv;','varying vec4 vUv; varying vec3 vFloorWorld;').replace('vUv = textureMatrix', 'vFloorWorld = (modelMatrix * vec4(position, 1.0)).xyz; vUv = textureMatrix');
   fm.fragmentShader=fm.fragmentShader.replace('varying vec4 vUv;','varying vec4 vUv; varying vec3 vFloorWorld;').replace('vec4( blendOverlay( base.rgb, color ), 1.0 )','vec4( base.rgb, base.a * 0.15 * (1.0 - smoothstep(0.5, 6.0, abs(vFloorWorld.z - 0.5))) )');
   floor.rotation.x=-Math.PI/2;floor.position.y=-.025;// Reflection is disabled on this transparent stage: avoid an opaque offscreen pass.
   floor.visible=false;scene.add(floor);
   const shadow=mesh(scene,new T.PlaneGeometry(80,80),new T.ShadowMaterial({color:'#5e95a0',opacity:.10,depthWrite:false}),0,-.015,0);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;
   font=await new FontLoader().loadAsync('/lottery/counter-font.json');if(dead)return;
   // Pearlescent face, rounded translucent-colour rim, inset mechanical digits.
   box(7.65,3.84,.55,.26,edge,1.58,1.95,0);box(7.46,3.66,.5,.23,pearl,1.58,1.95,.11);
   label('УЖЕ В ИГРЕ',.36,ink,1.58,3.15,.4);
   for(let i=0;i<5;i++){
    const x=-.93+i*1.25+(i>1?.12:0);
    box(1.20,1.79,.18,.12,silver,x,1.84,.42);box(1.12,1.69,.19,.11,white,x,1.84,.49);
    const d=label('0',1.03,cyan,x,1.84,.60);digits.push(d);
    box(1.08,.012,.025,.003,silver,x,1.84,.685);
   }
   label('БИЛЕТОВ В ИГРЕ',.17,ink,1.58,.59,.4);
   for(const [x,r,z,m] of [[5.5,.68,.5,cyan],[4.94,.43,1.35,white],[-4.86,.65,-.5,pearl],[-5.16,.39,.65,cyan]] as [number,number,number,T.Material][]){mesh(scene,new T.SphereGeometry(r,32,24),m,x,r,z)}
   const gltf=await new GLTFLoader().loadAsync('/models-brand/LOTTO_BALL_23.glb');
   if(dead){gltf.scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())}});return}
   const ball=gltf.scene;ball.updateMatrixWorld(true);let bounds=new T.Box3().setFromObject(ball);ball.scale.multiplyScalar(3.65/bounds.getSize(new T.Vector3()).y);ball.updateMatrixWorld(true);bounds=new T.Box3().setFromObject(ball);const center=bounds.getCenter(new T.Vector3());ball.position.sub(new T.Vector3(center.x,bounds.min.y,center.z));const root=new T.Group();root.add(ball);root.position.set(-3.55,0,1);root.rotation.y=-.06;scene.add(root);ball.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof T.MeshStandardMaterial&&/cyan|blue/i.test(m.name)){m.color.set('#00acc6');m.metalness=.25;m.roughness=.16;}}});
   resize();loaded=true;setReady(true);
  }catch{renderer?.domElement.remove();setReady(false)}}
  const io=new IntersectionObserver(([e])=>{active=e.isIntersecting;if(active)void init()},{rootMargin:'160px'});io.observe(el);const ro=new ResizeObserver(resize);ro.observe(el);
  function tick(ms:number){raf=requestAnimationFrame(tick);if(!active||!loaded||!renderer||dead||document.hidden||ms-lastFrame<33)return;lastFrame=ms;const currentCount=value.current;if(currentCount===null)return;const c=String(currentCount).padStart(5,'0');
   if(c!==last){digits.forEach((d,i)=>{if(c[i]===last[i])return;d.geometry.dispose();d.geometry=geometry(c[i],1.03);if(last&&!motion.matches)flips.set(d,ms)});last=c}
   for(const [d,start] of flips){const t=Math.min(1,(ms-start)/420);d.rotation.x=motion.matches?0:(1-t)**3*.8;if(t===1||motion.matches)flips.delete(d)}renderer.render(scene,camera);
  }raf=requestAnimationFrame(tick);
 const impact=()=>{if(!motion.matches)digits.forEach(d=>flips.set(d,performance.now()))};window.addEventListener('telecenter:counter-impact',impact);
  return()=>{window.removeEventListener('telecenter:counter-impact',impact);dead=true;cancelAnimationFrame(raf);io.disconnect();ro.disconnect();const materials=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m))}});[pearl,cyan,ink,edge,silver,white].forEach(m=>materials.add(m));materials.forEach(m=>{for(const v of Object.values(m))if(v instanceof T.Texture)v.dispose();m.dispose()});floor?.getRenderTarget().dispose();env?.dispose();renderer?.dispose();renderer?.domElement.remove()};
 },[]);
 const showing3D=ready&&count!==null;
 return <div className={'registration-counter '+(showing3D?'is-ready':'')} data-count-loading={count===null||undefined} ref={host}>
 {ticketDisplay ? <div className="ticket-score-preview" aria-hidden="true">
   <img src="/models-brand/LOTTO_BALL_23.png" alt="" />
   <div className="ticket-score-panel">
     <span>Уже в игре</span>
     <div className="ticket-score-digits">{Array.from(count === null ? '—————' : String(count).padStart(5,'0'), (digit,index) => <b key={index}>{digit}</b>)}</div>
     <span>Билетов в игре</span>
   </div>
 </div> : <div className="registration-counter-fallback" aria-hidden={showing3D}><span>УЖЕ В ИГРЕ</span><strong>{count===null?'—':count.toLocaleString('ru-RU')}</strong><span>БИЛЕТОВ В ИГРЕ</span></div>}
 <span className="sr-only" role="status" aria-live="polite">Билетов: {count===null?'загрузка':count.toLocaleString('ru-RU')}</span>
 </div>;
}
