'use client';
import {useEffect,useRef} from 'react';
import * as T from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
/** Procedural KV reconstruction. The disk and pins rotate around one physical axle. */
export default function DrumModel({spinning=false}:{spinning?:boolean}){
 const host=useRef<HTMLDivElement>(null),spin=useRef(spinning),wake=useRef<()=>void>(()=>{});
 useEffect(()=>{spin.current=spinning;wake.current()},[spinning]);
 useEffect(()=>{
  const el=host.current!,card=el.closest<HTMLElement>('.studio-card-picture,.game-world')!;
  let renderer:T.WebGLRenderer;try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'})}catch{return}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.82;el.appendChild(renderer.domElement);
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,80);camera.position.set(0,5.2,8.5);camera.lookAt(0,.45,0);
  const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pm.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.55;room.dispose();
  scene.add(new T.HemisphereLight(0xeaffff,0x003342,.65));const sun=new T.DirectionalLight(0xffffff,2.1);sun.position.set(-3,7,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-5;sun.shadow.camera.right=5;sun.shadow.camera.top=5;sun.shadow.camera.bottom=-5;sun.shadow.normalBias=.025;scene.add(sun);
  const blue=new T.MeshPhysicalMaterial({color:0x009fc3,metalness:.48,roughness:.19,clearcoat:1});const chrome=new T.MeshStandardMaterial({color:0xd9edf2,metalness:.95,roughness:.17});const white=new T.MeshPhysicalMaterial({color:0xf6ffff,metalness:.08,roughness:.25,clearcoat:1});const orange=new T.MeshPhysicalMaterial({color:0xff5601,roughness:.22,clearcoat:1});
  const mesh=(geo:T.BufferGeometry,mat:T.Material,parent:T.Object3D,x=0,y=0,z=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
  const cylinder=(radius:number,height:number,y:number,mat:T.Material,parent:T.Object3D=scene)=>mesh(new T.CylinderGeometry(radius,radius,height,96),mat,parent,0,y,0);
  cylinder(2.22,.23,.12,chrome);cylinder(2.18,.32,.36,white);cylinder(2.19,.17,.47,blue);cylinder(2.2,.08,.59,chrome);cylinder(2.12,.12,.68,white);
  const rotor=new T.Group();rotor.position.y=.79;scene.add(rotor);cylinder(1.98,.10,0,chrome,rotor);
  const deepBlue=new T.MeshPhysicalMaterial({color:0x0066ac,metalness:.3,roughness:.22,clearcoat:1});
  const colors=[white,deepBlue,white,blue,white,orange,white,deepBlue,white,blue,white,deepBlue];
  for(let i=0;i<12;i++){const g=new T.CircleGeometry(1.94,12,i*Math.PI/6,Math.PI/6);g.rotateX(-Math.PI/2);mesh(g,colors[i],rotor,0,.06,0);const angle=i*Math.PI/6;const x=Math.cos(angle)*1.88,z=Math.sin(angle)*1.88;mesh(new T.CylinderGeometry(.025,.045,.22,12),chrome,rotor,x,.18,z);mesh(new T.SphereGeometry(.065,16,12),chrome,rotor,x,.31,z)}
  const rim=mesh(new T.TorusGeometry(2,.034,12,96),chrome,rotor,0,.08,0);rim.rotation.x=Math.PI/2;
  cylinder(.33,.13,.94,chrome);cylinder(.29,.05,1.03,white);
  // Fixed glass safety arc and fixed pointer: these never rotate with the disk.
  const glass=new T.MeshPhysicalMaterial({color:0x67deeb,transparent:true,opacity:.25,metalness:.08,roughness:.1,side:T.DoubleSide,depthWrite:false});
  mesh(new T.CylinderGeometry(2.38,2.38,.85,64,1,true,Math.PI/2,Math.PI),glass,scene,0,1,0);
  mesh(new T.CylinderGeometry(.055,.07,1.7,16),chrome,scene,0,.95,-2.22);
  const pointer=mesh(new T.ConeGeometry(.19,.38,3),orange,scene,0,1.62,-1.93);pointer.rotation.z=Math.PI;pointer.rotation.y=Math.PI;
  // Small snow banks and ornaments belong to the stage, outside the moving disk.
  const snow=new T.MeshStandardMaterial({color:0xf4ffff,roughness:.92});
  for(let i=0;i<28;i++){const a=i/28*Math.PI*2;const m=mesh(new T.SphereGeometry(.14,12,8),snow,scene,Math.cos(a)*2.13,.72,Math.sin(a)*2.13);m.scale.set(1.5,.34,1)}
  for(const [x,z,r] of [[-2.35,.7,.30],[2.15,1.1,.23],[2.3,-1,.2]]){mesh(new T.SphereGeometry(r,32,20),blue,scene,x,r-.05,z);mesh(new T.CylinderGeometry(.055,.065,.08,12),chrome,scene,x,2*r-.02,z)}
  const floor=mesh(new T.PlaneGeometry(30,30),new T.ShadowMaterial({color:0x00445c,opacity:.22,depthWrite:false}),scene,0,-.025,0);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
  for(let i=0;i<24;i++){const a=i*Math.PI/12;const bolt=mesh(new T.SphereGeometry(.035,12,8),chrome,scene,Math.cos(a)*2.2,.58,Math.sin(a)*2.2);bolt.scale.y=.5;}
  for(const y of [.2,.31,.6]){const ring=mesh(new T.TorusGeometry(2.2,.018,10,96),chrome,scene,0,y,0);ring.rotation.x=Math.PI/2;}
  const fill=new T.DirectionalLight(0x8ddcff,.6);fill.position.set(4,3,-4);scene.add(fill);
  let frame=0,visible=false,turn=0,last=0,active=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function draw(now:number){frame=0;if(!visible||document.hidden)return;const dt=Math.min(.05,(now-last)/1000||.016);last=now;const interactive=card.classList.contains('game-world');const target=reduced.matches?turn:interactive?turn+(spin.current?dt*3:0):parseFloat(card.style.getPropertyValue('--drum-turn')||'0')*Math.PI/180;turn=interactive?target:turn+(target-turn)*(1-Math.exp(-dt*12));rotor.rotation.y=turn;renderer.render(scene,camera);if(!active){active=true;card.dataset.modelReady='true'}if(Math.abs(target-turn)>.001||(spin.current&&!reduced.matches))frame=requestAnimationFrame(draw)}
  const request=()=>{if(!frame&&visible)frame=requestAnimationFrame(draw)};
  wake.current=request;
  const resize=()=>{const box=el.getBoundingClientRect();if(!box.width||!box.height)return;renderer.setSize(box.width,box.height);camera.aspect=box.width/box.height;camera.position.set(0,4.4,camera.aspect<1.25?8.2:6.8);camera.lookAt(0,.65,0);camera.zoom=camera.aspect<1.25?1:1.14;camera.updateProjectionMatrix();camera.updateMatrixWorld();for(const [name,x,z] of [['left',-1.75,.35],['right',1.65,.7]] as [string,number,number][]){const p=new T.Vector3(x,.9,z).project(camera);card.setAttribute('data-drum-'+name,[(p.x+1)/2,(1-p.y)/2].join(','));}window.dispatchEvent(new Event('telecenter:geometry'));request()};
  const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible){resize();request()}else{cancelAnimationFrame(frame);frame=0}},{rootMargin:'150px'});io.observe(el);const ro=new ResizeObserver(resize);ro.observe(el);const mo=new MutationObserver(request);mo.observe(card,{attributes:true,attributeFilter:['style']});document.addEventListener('visibilitychange',request);reduced.addEventListener('change',request);
  const lost=(e:Event)=>{e.preventDefault();card.removeAttribute('data-model-ready');cancelAnimationFrame(frame)};renderer.domElement.addEventListener('webglcontextlost',lost);
  return()=>{wake.current=()=>{};cancelAnimationFrame(frame);io.disconnect();ro.disconnect();mo.disconnect();document.removeEventListener('visibilitychange',request);reduced.removeEventListener('change',request);card.removeAttribute('data-model-ready');scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose()}});env.dispose();pm.dispose();renderer.dispose();el.replaceChildren()};
 },[]);
 return <div className="drum-model" ref={host} aria-hidden="true"/>;
}
