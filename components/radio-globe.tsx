'use client';
import {readyCanvasFonts} from '@/lib/canvas-fonts';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {ZoomIn,ZoomOut} from 'lucide-react';

/** Live miniature: physical materials, independently driven working parts, lazy mobile renderer. */
export default function RadioGlobe({playing=false}:{playing?:boolean}){
 const host=useRef<HTMLDivElement>(null),playRef=useRef(playing),detailRef=useRef(false);
 const [detail,setDetail]=useState(false),[ready,setReady]=useState(false),[fallbackMotion,setFallbackMotion]=useState(false);
 useEffect(()=>{playRef.current=playing},[playing]);
 useEffect(()=>{detailRef.current=detail},[detail]);
 useEffect(()=>{
  const el=host.current!;let renderer:T.WebGLRenderer|undefined,frame=0,active=false,dead=false,loaded=false;
  let model:T.Group|undefined,environment:T.WebGLRenderTarget|undefined;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.1,50);
  const mobile=matchMedia('(max-width: 850px), (pointer: coarse)');
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),textures:T.Texture[]=[];
  const baseCamera=new T.Vector3(1.35,1.48,11.30),closeCamera=new T.Vector3(.52,1.24,7.85),look=new T.Vector3(0,.28,0);
  camera.position.copy(baseCamera);camera.lookAt(look);
  const pivot=new T.Group();scene.add(pivot);
  const hemi=new T.HemisphereLight(0xffffff,0x426770,.8);scene.add(hemi);
  const key=new T.DirectionalLight(0xffffff,2.6);key.position.set(-3,6,7);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-3;key.shadow.camera.right=3;key.shadow.camera.top=4;key.shadow.camera.bottom=-3;key.shadow.normalBias=.016;key.shadow.bias=-.0002;scene.add(key);
  const fill=new T.DirectionalLight(0xffffff,.85);fill.position.set(4,2,5);scene.add(fill);
  const edge=new T.DirectionalLight(0xffffff,1.5);edge.position.set(-1,4,-4);scene.add(edge);
  const practical=new T.PointLight(0xffddb4,.42,4,2);practical.position.set(.48,.35,.2);pivot.add(practical);
  const positions=new Float32Array(130*3),snowMeta:number[]=[];
  for(let i=0;i<130;i++){const y=-1.2+(i%31)/30*3.65,a=i*2.39996,r=Math.sqrt(Math.max(0,2.66**2-y*y))*(.58+(i%9)/24);positions.set([Math.cos(a)*r,y,Math.sin(a)*r],i*3);snowMeta.push(a)}
  const snowGeo=new T.BufferGeometry();snowGeo.setAttribute('position',new T.BufferAttribute(positions,3));
  const snowMat=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{pointScale:{value:1}},vertexShader:'uniform float pointScale; void main(){vec4 p=modelViewMatrix*vec4(position,1.0); gl_PointSize=clamp(18.0*pointScale/-p.z,1.2,4.5); gl_Position=projectionMatrix*p;}',fragmentShader:'void main(){float d=length(gl_PointCoord-.5);float a=(1.-smoothstep(.20,.5,d))*.65;gl_FragColor=vec4(.95,.99,1.,a);}'});
  const snow=new T.Points(snowGeo,snowMat);pivot.add(snow);
  let drawScreen:((t:number)=>void)|undefined;
  let vinyl:T.Object3D[]=[],reels:T.Object3D[]=[],dj:T.Object3D|undefined,hands:T.Object3D[]=[];
  let targetYaw=0,targetPitch=0,dragging=false,dragX=0,startYaw=0,zoom=0,speed=0,phase=0;
  const mixerMat:T.MeshStandardMaterial[]=[];
  function resize(){if(!renderer)return;const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();snowMat.uniforms.pointScale.value=renderer.getPixelRatio()}
  function disposeObject(obj:T.Object3D){const geos=new Set<T.BufferGeometry>(),mats=new Set<T.Material>();obj.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Points){geos.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m))}});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose())}
  function texture(path:string){const t=new T.TextureLoader().load(path);t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer?.capabilities.getMaxAnisotropy()??1;textures.push(t);return t}
  function nowPlaying(obj:T.Object3D){
   const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=476;const ctx=canvas.getContext('2d')!;
   const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;textures.push(tex);const cover=new Image();cover.src='/media/plamya-cover.jpg';
   drawScreen=()=>{ctx.fillStyle='#0b2231';ctx.fillRect(0,0,1280,476);if(cover.complete&&cover.naturalWidth)ctx.drawImage(cover,38,58,360,360);ctx.fillStyle='#6ed2e6';ctx.font='bold 32px "Code Next", sans-serif';ctx.fillText('СЕЙЧАС В ЭФИРЕ',450,121);ctx.fillStyle='#fff';ctx.font='bold 76px "Code Next", sans-serif';ctx.fillText('Снег кружится',450,244,785);ctx.fillStyle='#d0edf2';ctx.font='47px "Code Next", sans-serif';ctx.fillText('ВИА Пламя',450,326);tex.needsUpdate=true};drawScreen(0);void readyCanvasFonts().then(()=>{if(!dead)drawScreen?.(0)});cover.onload=()=>drawScreen?.(0);
   if(obj instanceof T.Mesh)obj.material=new T.MeshBasicMaterial({map:tex});
  }
  function contextLost(e:Event){e.preventDefault();loaded=false;setReady(false)}
  function setup(){
   if(renderer||dead)return;
   try{
    renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.toneMapping=T.NeutralToneMapping;renderer.toneMappingExposure=1;renderer.outputColorSpace=T.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.domElement.addEventListener('webglcontextlost',contextLost);el.insertBefore(renderer.domElement,el.firstChild);
    const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();environment=pmrem.fromScene(room,.035);scene.environment=environment.texture;scene.environmentIntensity=.35;room.dispose();pmrem.dispose();resize();
    new GLTFLoader().load('/models-brand/RADIO_STUDIO.glb?v=20261005',g=>{
     if(dead){disposeObject(g.scene);return}model=g.scene;model.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=o.name!=='GlassShell';o.receiveShadow=o.name!=='GlassShell';if(o.material instanceof T.MeshStandardMaterial){if(o.material.name==='Warm white bulbs')mixerMat.push(o.material);if(o.material.name==='Fresh snow')o.material.roughness=.96;}if(o.name==='GlassShell'){o.castShadow=false;o.receiveShadow=false;o.renderOrder=4;if(o.material instanceof T.MeshPhysicalMaterial){o.material.opacity=1;o.material.envMapIntensity=1.3;o.material.side=T.FrontSide;}}}});
     pivot.add(model);vinyl=['Vinyl_0','Vinyl_1'].map(n=>model!.getObjectByName(n)!).filter(Boolean);reels=['Reel_0','Reel_1'].map(n=>model!.getObjectByName(n)!).filter(Boolean);dj=model.getObjectByName('Snowman_DJ')??model.getObjectByName('Snowman DJ');hands=['DJHand_left','DJHand_right'].map(n=>model!.getObjectByName(n)!).filter(Boolean);
     // External images use the original PlaneGeometry UV orientation (flipY=true).
     const logo=texture('/brand/invitro-wordmark-source.png');for(const name of ['WordmarkBase','WordmarkDesk']){const plane=model.getObjectByName(name);if(plane instanceof T.Mesh)plane.material=new T.MeshBasicMaterial({map:logo})}
     const screen=model.getObjectByName('NowPlaying');if(screen)nowPlaying(screen);
     renderer!.render(scene,camera);loaded=true;setReady(true);
    },undefined,()=>{setReady(false)});
   }catch{renderer?.dispose();renderer?.domElement.remove();renderer=undefined;setFallbackMotion(true)}
  }
  const io=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;if(active)setup()},{rootMargin:'160px'});io.observe(el);
  const ro=new ResizeObserver(resize);ro.observe(el);
  const down=(e:PointerEvent)=>{if(mobile.matches||(e.target as HTMLElement).closest('button'))return;dragging=true;dragX=e.clientX;startYaw=targetYaw;el.setPointerCapture(e.pointerId)};
  const move=(e:PointerEvent)=>{if(mobile.matches)return;if(dragging){targetYaw=T.MathUtils.clamp(startYaw+(e.clientX-dragX)*.0038,-.46,.46)}else if(e.pointerType==='mouse'){const rect=el.getBoundingClientRect();targetYaw=(e.clientX-rect.left-rect.width/2)/rect.width*.19;targetPitch=(e.clientY-rect.top-rect.height/2)/rect.height*.025}};
  const up=()=>{dragging=false};const leave=()=>{if(!dragging){targetYaw=0;targetPitch=0}};
  el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('pointerleave',leave);
  let last=0,lastDraw=0;function tick(t:number){frame=requestAnimationFrame(tick);if(!active||!renderer||!loaded||document.hidden){last=t;return}if(t-lastDraw<30)return;const dt=Math.min((t-last)/1000,.05);last=t;lastDraw=t;
   const reduced=motion.matches;
   // Mobile keeps a fixed camera: scrolling never changes the ornament framing.
   if(mobile.matches){zoom=0;targetYaw=0;targetPitch=0;dragging=false;pivot.rotation.set(0,0,0)}
   else zoom=T.MathUtils.damp(zoom,detailRef.current?1:0,5,dt);camera.position.lerpVectors(baseCamera,closeCamera,zoom);look.set(0,T.MathUtils.lerp(.28,-.07,zoom),0);camera.lookAt(look);
   pivot.rotation.y=T.MathUtils.damp(pivot.rotation.y,targetYaw,5,dt);pivot.rotation.x=T.MathUtils.damp(pivot.rotation.x,targetPitch,4,dt);
   speed=T.MathUtils.damp(speed,playRef.current?1:.26,2.2,dt);phase+=dt*speed;
   if(!reduced){
    vinyl.forEach(v=>{v.rotation.y+=dt*speed*3.49});reels.forEach((r,i)=>{r.rotation.z-=dt*speed*(1.65+i*.18)});
    if(dj)dj.rotation.z=Math.sin(phase*2.4)*.018*speed;hands.forEach((h,i)=>h.rotation.x=Math.sin(phase*2.4+i*2)*.06*speed);
    for(let i=0;i<130;i++){const y=positions[i*3+1]-dt*(.075+(i%7)*.014);positions[i*3+1]=y< -1.28?2.56:y;const r=Math.sqrt(Math.max(0,2.62**2-positions[i*3+1]**2))*(.56+(i%9)/25);positions[i*3]=Math.cos(snowMeta[i]+t*.000021)*r;positions[i*3+2]=Math.sin(snowMeta[i]+t*.000021)*r}snowGeo.attributes.position.needsUpdate=true;
   }
   mixerMat.forEach(m=>m.emissiveIntensity=reduced?1.5:1.3+(Math.sin(t*.0024)+1)*.18);
   renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(tick);
  return()=>{dead=true;cancelAnimationFrame(frame);io.disconnect();ro.disconnect();el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('pointerleave',leave);renderer?.domElement.removeEventListener('webglcontextlost',contextLost);disposeObject(scene);textures.forEach(t=>t.dispose());environment?.dispose();renderer?.dispose();renderer?.domElement.remove()};
 },[]);
 return <div className={'radio-globe radio-studio-detailed radio-atelier'+(detail?' is-close':'')+(ready?' ready':'')} ref={host}>
  <picture hidden={ready}><source media="(prefers-reduced-motion: reduce)" srcSet="/models-brand/RADIO_STUDIO.webp?v=20261005"/><img hidden={ready} className="radio-studio-poster" src={fallbackMotion?'/models-brand/RADIO_STUDIO_motion.webp?v=20261005':'/models-brand/RADIO_STUDIO.webp?v=20261005'} alt="Стеклянная игрушка INVITRO: снеговик-диджей, виниловые проигрыватели, катушечник, микрофон, пульт, ёлка и снег" loading="lazy" width="1400" height="1400"/></picture>
  <div className="radio-object-controls"><span>НОВОГОДНЯЯ ВОЛНА</span><button type="button" aria-pressed={detail} onClick={()=>setDetail(!detail)} aria-label={detail?'Показать шар целиком':'Рассмотреть микродетали студии'}>{detail?<ZoomOut size={17}/>:<ZoomIn size={17}/>} {detail?'Весь шар':'Детали'}</button></div>
  <span className="radio-object-hint">{ready?<><span className="radio-desktop-hint">Поверните шар мышью</span><span className="radio-mobile-hint">Миниатюрная радиостудия</span></>:'Миниатюрная радиостудия'}</span>
 </div>
}
