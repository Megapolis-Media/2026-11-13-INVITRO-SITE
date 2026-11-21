'use client';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {geometryUrl} from 'virtual:invitro-typography';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';

export default function HeroStage(){
 const host=useRef<HTMLDivElement>(null),[ready,setReady]=useState(false),[paused,setPaused]=useState(false),pause=useRef(false);
 useEffect(()=>{pause.current=paused},[paused]);
 useEffect(()=>{
  const el=host.current!;let dead=false,raf=0,active=true,renderer:T.WebGLRenderer|undefined,env:T.WebGLRenderTarget|undefined;
  const scene=new T.Scene();scene.background=new T.Color('#00acc6');scene.fog=new T.Fog('#00acc6',32,65);
  const camera=new T.PerspectiveCamera(32,1,.1,100),models:Record<string,T.Group>={},owned=new Set<T.Material>();
  const motion=matchMedia('(prefers-reduced-motion: reduce)');let mobile=false,time=0,last=0,lastDraw=0;
  const dispose=(obj:T.Object3D)=>obj.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){owned.add(m);for(const v of Object.values(m))if(v instanceof T.Texture)v.dispose()}}});
  let floor:Reflector|undefined;
  try{
   renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NeutralToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;el.insertBefore(renderer.domElement,el.firstChild);
   const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment();env=pm.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.45;room.dispose();pm.dispose();
   scene.add(new T.HemisphereLight('#ffffff','#005564',.55));const key=new T.DirectionalLight('#ffffff',2.3);key.position.set(-8,12,8);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-13,right:13,top:12,bottom:-12,far:50});key.shadow.normalBias=.025;scene.add(key);const rim=new T.DirectionalLight('#d3f6ff',1.35);rim.position.set(8,8,-6);scene.add(rim);
   floor=new Reflector(new T.PlaneGeometry(120,120),{color:0x00acc6,textureWidth:768,textureHeight:512,multisample:0});const floorMaterial=floor.material as T.ShaderMaterial;floorMaterial.fragmentShader=floorMaterial.fragmentShader.replace('blendOverlay( base.rgb, color )','mix( color, base.rgb, 0.20 )');floorMaterial.needsUpdate=true;floor.rotation.x=-Math.PI/2;floor.position.y=-.04;scene.add(floor);
   const surface=new T.Mesh(new T.PlaneGeometry(120,120),new T.ShadowMaterial({color:'#003b50',opacity:.22,depthWrite:false}));surface.rotation.x=-Math.PI/2;surface.position.y=-.03;surface.receiveShadow=true;scene.add(surface);
  }catch{renderer?.dispose();renderer?.domElement.remove();return}
  function layout(){mobile=el.clientWidth<720;const aspect=el.clientWidth/el.clientHeight;renderer!.setSize(el.clientWidth,el.clientHeight);camera.aspect=aspect;
   if(mobile){camera.position.set(0,7.3,25);camera.lookAt(0,3.4,0);camera.fov=36;}else{const distance=Math.max(16.5,29/aspect);camera.position.set(0,6.3,distance);camera.lookAt(0,2.7,0);camera.fov=36;}camera.updateProjectionMatrix();
   const positions:Record<string,number[]> = mobile?{tv:[-.45,0,-.3],camera:[3.1,0,-1.8],radio:[-2.8,0,2],vinyl:[-.5,.08,2.8],ball:[2.3,0,2.7],remote:[3.5,0,1],title:[0,6.25,0]}:{tv:[3.1,0,-.15],camera:[6.3,0,-1.7],radio:[.35,0,1.8],vinyl:[2.1,.08,2.6],ball:[4.9,0,2.6],remote:[6,0,.8],title:[-4.6,4.4,0]};
   Object.entries(models).forEach(([id,g])=>{g.position.set(...positions[id] as [number,number,number]);g.userData.home=g.position.clone();if(id==='title')g.scale.setScalar(mobile?.90:1)});
  }
  const io=new IntersectionObserver(([e])=>{active=e.isIntersecting},{rootMargin:'80px'});io.observe(el);const ro=new ResizeObserver(layout);ro.observe(el);layout();
  const loader=new GLTFLoader();
  async function load(id:string,asset:string,width:number,rot=0){const gltf=await loader.loadAsync('/models-brand/'+asset+'.glb?v=hero21');if(dead){dispose(gltf.scene);owned.forEach(m=>m.dispose());return}const root=new T.Group(),g=gltf.scene;
   if(id==='vinyl')g.rotation.x=-Math.PI/2;
   // Raise the camera head on its own telescopic pedestal; wheels stay on the floor.
   if(id==='camera'){const lift=.92;g.traverse(o=>{if(!(o instanceof T.Mesh))return;if(o.name==='Pedestal_column'){o.scale.y*=1+lift/.76;o.position.y+=lift/2;}else if(!/^(Pedestal_base|Dolly_leg_|Dolly_wheel_)/.test(o.name)){o.position.y+=lift;}});}

   g.updateMatrixWorld(true);let b=new T.Box3().setFromObject(g),size=b.getSize(new T.Vector3());const scale=width/size.x;g.scale.multiplyScalar(scale);g.updateMatrixWorld(true);b=new T.Box3().setFromObject(g);const c=b.getCenter(new T.Vector3());g.position.sub(new T.Vector3(c.x,b.min.y,c.z));root.add(g);root.rotation.y=rot;root.userData.angle=rot;
   root.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof T.MeshStandardMaterial){m.envMapIntensity=.65;if(/INVITRO.*(Blue|cyan)/i.test(m.name)){m.color.set('#00acc6');m.roughness=.23;m.metalness=.12;}if(/Vinyl grooves|Black Blue rubber/i.test(m.name)){m.envMapIntensity=.28;m.roughness=.32;}}}});
   scene.add(root);models[id]=root;layout();
  }
  async function title(){const font=await new FontLoader().loadAsync(geometryUrl);if(dead)return;const root=new T.Group(),front=new T.MeshPhysicalMaterial({color:'#ffffff',roughness:.23,metalness:.1,clearcoat:1}),side=new T.MeshPhysicalMaterial({color:'#007d96',roughness:.2,metalness:.35,clearcoat:1});
   for(const [str,y,width] of [['ТЕЛЕЦЕНТР',1.32,7.3],['INVITRO',0,7.3]] as [string,number,number][]){const geo=new TextGeometry(str,{font,size:1,depth:.22,curveSegments:8,bevelEnabled:true,bevelThickness:.015,bevelSize:.012,bevelSegments:3});geo.computeBoundingBox();const b=geo.boundingBox!;const scale=width/(b.max.x-b.min.x);geo.scale(scale,scale,1);geo.computeBoundingBox();geo.translate(-(geo.boundingBox!.max.x+geo.boundingBox!.min.x)/2,y,0);const mesh=new T.Mesh(geo,[front,side]);mesh.castShadow=true;root.add(mesh)}scene.add(root);models.title=root;layout();}
  Promise.all([load('tv','RETRO_TV',4.8,-.08),load('camera','BROADCAST_CAMERA',2.35,-.55),load('radio','RETRO_RADIO',2.5,.16),load('vinyl','VINYL_RECORD',3.25),load('ball','LOTTO_BALL_23',2.2,-.16),load('remote','TV_REMOTE',.65,-.16),title()]).then(()=>{if(!dead){renderer!.render(scene,camera);setReady(true)}}).catch(()=>{if(!dead)setReady(false)});
  function tick(now:number){raf=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000||0,.05);last=now;if(!active||document.hidden||now-lastDraw<1000/(mobile?30:45))return;lastDraw=now;if(!pause.current&&!motion.matches)time+=dt;
   const angle=motion.matches?0:Math.sin(time*.45);if(models.camera)models.camera.rotation.y=-.55+angle*.045;
   if(models.radio)models.radio.rotation.z=angle*.013;
   if(models.vinyl)models.vinyl.rotation.y=motion.matches?0:time*.18;
   if(models.ball){models.ball.position.x=models.ball.userData.home.x+angle*.12;models.ball.rotation.z=-angle*.12/1.1;}
   if(models.title)models.title.rotation.y=motion.matches?0:Math.sin(time*.25)*.018;
   renderer!.render(scene,camera);
  }
  const lost=(e:Event)=>{e.preventDefault();cancelAnimationFrame(raf);setReady(false)};renderer.domElement.addEventListener('webglcontextlost',lost);raf=requestAnimationFrame(tick);
  return()=>{dead=true;cancelAnimationFrame(raf);io.disconnect();ro.disconnect();renderer?.domElement.removeEventListener('webglcontextlost',lost);dispose(scene);owned.forEach(m=>m.dispose());floor?.getRenderTarget().dispose();env?.dispose();renderer?.dispose();renderer?.domElement.remove()};
 },[]);
 return <div className={'hero-stage '+(ready?'is-ready':'')} ref={host} role="img" aria-label="Объёмная сцена Телецентра INVITRO: телевизор, камера, радио, вращающаяся пластинка и шар 23 на отражающем полу">
 {!ready&&<div className="hero-stage-fallback"><div className="hero-fallback-title">ТЕЛЕЦЕНТР<br/><strong>INVITRO</strong></div><img src="/models-brand/RETRO_TV.png" alt="Телевизор INVITRO"/></div>}
 {ready&&<button className="hero-motion-control" onClick={()=>setPaused(v=>!v)} aria-pressed={paused}>{paused?'Продолжить движение':'Пауза анимации'}</button>}
 </div>
}
