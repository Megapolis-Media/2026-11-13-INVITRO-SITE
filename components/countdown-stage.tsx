'use client';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {geometryUrl} from 'virtual:invitro-typography';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {Reflector} from 'three/addons/objects/Reflector.js';

export default function CountdownStage({values}:{values:string[]}){
 const host=useRef<HTMLDivElement>(null),value=useRef(values),[ready,setReady]=useState(false);value.current=values;
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
  function resize(){if(!renderer)return;const aspect=el.clientWidth/el.clientHeight,half=Math.max(2.1,6.4/aspect);camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.position.set(.15,4.4,23);camera.lookAt(.15,1.65,0);camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight)}
  async function init(){if(started)return;started=true;try{
   renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setClearColor(0xffffff,0);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NeutralToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;el.insertBefore(renderer.domElement,el.firstChild);
   const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment();env=pm.fromScene(room,.035);scene.environment=env.texture;scene.environmentIntensity=.65;room.dispose();pm.dispose();
   scene.add(new T.HemisphereLight('#ffffff','#c5e7ec',.7));const key=new T.DirectionalLight('#ffffff',2.4);key.position.set(-3,11,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-9,right:9,top:8,bottom:-6});key.shadow.normalBias=.025;scene.add(key);const rim=new T.DirectionalLight('#e1faff',1.5);rim.position.set(6,6,-3);scene.add(rim);
   floor=new Reflector(new T.PlaneGeometry(80,80),{color:0xffffff,textureWidth:768,textureHeight:384,multisample:0});const fm=floor.material as T.ShaderMaterial;// Keep empty pixels transparent: white tone mapping must not create a grey rectangle.
   fm.transparent=true;fm.depthWrite=false;
   fm.vertexShader=fm.vertexShader.replace('varying vec4 vUv;','varying vec4 vUv; varying vec3 vFloorWorld;').replace('vUv = textureMatrix', 'vFloorWorld = (modelMatrix * vec4(position, 1.0)).xyz; vUv = textureMatrix');
   fm.fragmentShader=fm.fragmentShader.replace('varying vec4 vUv;','varying vec4 vUv; varying vec3 vFloorWorld;').replace('vec4( blendOverlay( base.rgb, color ), 1.0 )','vec4( base.rgb, base.a * 0.15 * (1.0 - smoothstep(0.5, 6.0, abs(vFloorWorld.z - 0.5))) )');
   floor.rotation.x=-Math.PI/2;floor.position.y=-.025;scene.add(floor);
   const shadow=mesh(scene,new T.PlaneGeometry(80,80),new T.ShadowMaterial({color:'#5e95a0',opacity:.10,depthWrite:false}),0,-.015,0);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;
   font=await new FontLoader().loadAsync(geometryUrl);if(dead)return;
   // Four individual enamel modules with cyan depth and white split-flap faces.
   for(let k=0;k<4;k++){
    const x=(k-1.5)*3;
    box(2.78,2.52,.72,.20,edge,x,1.35,-.16);
    box(2.65,2.38,.65,.18,pearl,x,1.35,.02);
    for(let j=0;j<2;j++){
     const dx=x+(j-.5)*1.16;
     box(1.10,1.88,.16,.10,silver,dx,1.39,.39);
     box(1.02,1.80,.18,.09,white,dx,1.39,.45);
     digits.push(label('0',1.12,cyan,dx,1.39,.56));
     box(.99,.012,.025,.003,silver,dx,1.39,.64);
    }
    box(2.26,.12,.68,.045,cyan,x,.10,.02);
   }
   box(3.8,.55,.30,.12,edge,0,3.2,-.08);
   box(3.67,.44,.29,.10,white,0,3.2,.02);
   label('ПРЯМОЙ ЭФИР',.23,ink,0,3.2,.20);
   resize();loaded=true;setReady(true);
  }catch{renderer?.domElement.remove();setReady(false)}}
  const io=new IntersectionObserver(([e])=>{active=e.isIntersecting;if(active)void init()},{rootMargin:'160px'});io.observe(el);const ro=new ResizeObserver(resize);ro.observe(el);
  function tick(ms:number){raf=requestAnimationFrame(tick);if(!active||!loaded||!renderer||dead||document.hidden||ms-lastFrame<33)return;lastFrame=ms;const c=value.current.map(n=>n.padStart(2,'0')).join('');
   if(c!==last){digits.forEach((d,i)=>{if(c[i]===last[i])return;d.geometry.dispose();d.geometry=geometry(c[i],1.12);if(last&&!motion.matches)flips.set(d,ms)});last=c}
   for(const [d,start] of flips){const t=Math.min(1,(ms-start)/420);d.rotation.x=motion.matches?0:(1-t)**3*.8;if(t===1||motion.matches)flips.delete(d)}renderer.render(scene,camera);
  }raf=requestAnimationFrame(tick);
  return()=>{dead=true;cancelAnimationFrame(raf);io.disconnect();ro.disconnect();const materials=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m))}});[pearl,cyan,ink,edge,silver,white].forEach(m=>materials.add(m));materials.forEach(m=>{for(const v of Object.values(m))if(v instanceof T.Texture)v.dispose();m.dispose()});floor?.getRenderTarget().dispose();env?.dispose();renderer?.dispose();renderer?.domElement.remove()};
 },[]);
 return <div className="countdown-instrument">
 <div className={'registration-counter countdown-stage '+(ready?'is-ready':'')} ref={host}>
 <div className="countdown-fallback" aria-hidden="true">{values.map((n,i)=><strong key={i}>{n}</strong>)}</div>
 </div>
 <div className="countdown-units" aria-hidden="true">{['ДНЕЙ','ЧАСОВ','МИНУТ','СЕКУНД'].map(s=><span key={s}>{s}</span>)}</div>
 <span className="sr-only" role="timer" aria-live="off">До эфира: {values[0]} дней, {values[1]} часов, {values[2]} минут, {values[3]} секунд</span>
 </div>;
}
