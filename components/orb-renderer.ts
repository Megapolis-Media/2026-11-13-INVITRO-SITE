import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

export function createOrbRenderer(){
 const canvas=document.createElement('canvas');
 const options={alpha:true,antialias:true,powerPreference:'low-power' as const};
 const context=canvas.getContext('webgl2',options) as WebGL2RenderingContext|null;
 if(!context)return null;
 const gpu=new THREE.WebGLRenderer({canvas,context,...options});
 gpu.setPixelRatio(Math.min(devicePixelRatio,1.5));
 const world=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,1000);
 camera.position.z=500;
 const room=new RoomEnvironment(),generator=new THREE.PMREMGenerator(gpu);
 let env:THREE.WebGLRenderTarget;
 try{env=generator.fromScene(room,.04)}catch{gpu.dispose();return null}
 finally{room.dispose();generator.dispose()}
 world.environment=env.texture;
 world.add(new THREE.HemisphereLight(0xf0feff,0x003545,2));
 const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-180,250,400);world.add(light);
 const sphere=new THREE.SphereGeometry(1,48,32);
 const material=new THREE.MeshPhysicalMaterial({color:0x00a9ba,metalness:.18,roughness:.16,clearcoat:1,clearcoatRoughness:.09});
 const seam=new THREE.TorusGeometry(1.002,.009,8,96),seamMaterial=new THREE.MeshStandardMaterial({color:0x96e6ec,roughness:.22,metalness:.4});
 const ball=new THREE.Group();ball.add(new THREE.Mesh(sphere,material),new THREE.Mesh(seam,seamMaterial));world.add(ball);
 let previousSize=0;
 function draw(x:number,y:number,half:number,rx:number,ry:number,r:number,roll:number,warm:number){
  if(context!.isContextLost())return false;
  if(half!==previousSize){
   gpu.setSize(half*2,half*2);camera.left=camera.bottom=-half;camera.right=camera.top=half;
   camera.updateProjectionMatrix();previousSize=half;
  }
  ball.scale.set(rx,ry,r);ball.rotation.set(roll*.12,0,-roll);
  material.emissive.setRGB(.055*warm,.025*warm,0);light.color.setRGB(1,1-warm*.08,1-warm*.2);
  canvas.style.transform=`translate3d(${x-half}px,${y-half}px,0)`;
  gpu.render(world,camera);return true;
 }
 function dispose(){
  canvas.remove();sphere.dispose();material.dispose();seam.dispose();seamMaterial.dispose();env.dispose();gpu.dispose();gpu.forceContextLoss();
 }
 canvas.style.display='none';
 return {canvas,draw,dispose};
}
