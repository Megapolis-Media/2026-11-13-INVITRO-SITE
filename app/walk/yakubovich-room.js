import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {SECTORS,PUZZLES} from './yak-game-logic.mjs';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export function buildYakubovichRoom(a){
 const {world,mesh,box,cyl,rod,sphere,group,text,mat,light,spot,npc,target,backdoor,colliders,dialogue,surface}=a;
 const brass=mat('#aa9162',.72,.36),darkBrass=brass,wood=surface('wood','#38261c'),charcoal=mat('#12171a'),cream=mat('#d7cbb1'),teal=mat('#103c39');
 const rounded=(name,x,y,z,w,h,d,m,r=.025,p=world)=>{const o=mesh(new RoundedBoxGeometry(w,h,d,2,r),m,x,y,z,p);o.name=name;return o};
 function ring(name,x,y,z,r,t,m,rx=0,p=world){const o=mesh(new T.TorusGeometry(r,t,8,48),m,x,y,z,p);o.rotation.x=rx;o.name=name;return o}
 let alive=true;
 const loading=text('ЗАГРУЖАЕМ НОВУЮ СТУДИЮ…',0,2,-4.2,5,.45);
 new GLTFLoader().load(a.isSoftware?'/walk-assets/scenes/Studio_v4_lite.glb':'/walk-assets/scenes/Studio_v4_web.glb',asset=>{
  if(!alive){asset.scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});return}
  world.remove(loading);loading.geometry.dispose();loading.material.map.dispose();loading.material.dispose();
  const discard=[];
  asset.scene.traverse(o=>{
   if(o.isMesh){o.castShadow=true;o.receiveShadow=true;
    if(/^(Sector_|Sector_divider|Pin_|Pin_cap|Central_hub|Wheel_sectors|Cell_)/.test(o.name))discard.push(o);
    if(a.isSoftware&&/^(Tree_|Planter_|Branch_network|Individual_needle|Ornament_|Fairy_light_)/.test(o.name))discard.push(o);
    if(o.material?.name==='Walnut'){o.material=surface('wood','#795334')}
    if(/^(Rear_wall|Side_wall|Upholstered_panel)/.test(o.name))o.material=surface('marble','#e8e1d4');
    if(o.name==='Floor')o.material=surface('marble','#deded6');
    if(o.material?.name==='Warm_ivory')o.material=surface('marble','#eee9df');
    if(o.material?.name==='Brushed_champagne'){o.material.color.set('#c7aa73');o.material.roughness=.27}
    if(o.material?.name==='Petrol_velvet'){o.material.color.set('#12696c')}

   }
  });
  discard.forEach(o=>{o.removeFromParent();o.geometry.dispose()});
  world.add(asset.scene);
  new GLTFLoader().load('/walk-assets/ab/room-baked.glb',baked=>{
   if(!alive){baked.scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});return}
   const old=[];asset.scene.traverse(o=>{if(o.isMesh&&(/^(Rear_wall|Side_wall|Upholstered_panel)/.test(o.name)||o.name==='Floor'))old.push(o)});old.forEach(o=>{o.removeFromParent();o.geometry.dispose()});
   baked.scene.traverse(o=>{if(o.isMesh){const m=o.material;const map=m.emissiveMap||m.map;if(map){o.material=new T.MeshBasicMaterial({map,color:'#ffffff'});m.dispose()}}});world.add(baked.scene);
  },undefined,()=>a.onEvent?.('Запечённый свет не загрузился — показан обычный 3D-свет.'));
  if(a.isSoftware)a.tree(-3.8,-3.1,1.02);
 },undefined,()=>{if(alive)a.onEvent?.('Не удалось загрузить студию. Обновите страницу.');});
 const wheelRoot=group(-.4,0,.25);wheelRoot.name='Interactive prize wheel';
 const rotor=group(0,1.145,0,0,wheelRoot);rotor.name='Wheel spinning assembly';
 const labels=SECTORS.map(String);
 const cv=document.createElement('canvas');cv.width=cv.height=2048;const c=cv.getContext('2d');const R=1000,N=12;
 for(let i=0;i<N;i++){const th=i*2*Math.PI/N;c.beginPath();c.moveTo(1024,1024);c.arc(1024,1024,R,th,th+2*Math.PI/N);c.closePath();c.fillStyle=i%2?'#dfcc9d':'#143b3c';c.fill();c.strokeStyle='#b38f54';c.lineWidth=7;c.stroke();c.save();c.translate(1024,1024);c.rotate(th+Math.PI/N);c.fillStyle=i%2?'#142e32':'#eee1c2';c.textAlign='center';c.textBaseline='middle';c.font=i<10?'bold 94px Georgia':'bold 68px Arial';c.translate(750,0);c.rotate(Math.PI/2);c.fillText(labels[i],0,0);c.restore()}
 c.beginPath();c.arc(1024,1024,220,0,Math.PI*2);c.fillStyle='#b28d4a';c.fill();c.strokeStyle='#f1dfb5';c.lineWidth=12;c.stroke();c.fillStyle='#153b3d';c.font='bold 55px Arial';c.textAlign='center';c.fillText('INVITRO',1024,1044);
 const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;const face=mesh(new T.CircleGeometry(1.28,96),new T.MeshStandardMaterial({map:tex,roughness:.38,metalness:.16}),0,.014,0,rotor);face.rotation.x=-Math.PI/2;face.name='Numbered wheel face';
 for(let i=0;i<48;i++){const th=i*2*Math.PI/48;rod([Math.sin(th)*1.32,0,Math.cos(th)*1.32],[Math.sin(th)*1.32,.065,Math.cos(th)*1.32],.014,brass,rotor);sphere(Math.sin(th)*1.32,.068,Math.cos(th)*1.32,.022,cream,rotor)}
 sphere(0,.09,0,.14,brass,rotor,[1,.45,1]);
 const pointer=mesh(new T.ConeGeometry(.065,.19,3),mat('#963f3f'),0,1.24,1.40,wheelRoot);pointer.rotation.x=-Math.PI/2;pointer.name='Fixed wheel pointer';
 colliders.push({x:-.4,z:.25,r:1.50});target('wheel','Вращать игровое колесо',[-.4,1.4,1.4],{id:'wheel'});

 npc('yak',1.8,-1.4,0);target('yak','Поговорить с Якубовичем',[1.8,1.5,-1.4],dialogue);
 colliders.push({x:-3.8,z:-3.1,r:1.15},{x:3.1,z:-2.6,r:.82},{x:1.8,z:-1.4,r:.35});
 box(-4.6,.5,1.8,1,.98,.65,wood);colliders.push({x:-4.6,z:1.8,r:.7});
 // Three physical clues reward exploring the set; they never block guessing.
 const clueMeshes=new Map();let focusId=null;
 const evidence=[['light',-4.6,1.05,1.8],['script',3.1,1.50,-2.4],['clock',4.9,1.65,-3.8]];
 for(const [id,x,y,z] of evidence){
  const p=PUZZLES.find(p=>p.prop===id);const g=group(x,y,z);g.name=p.propName;
  const edge=new T.MeshStandardMaterial({color:'#b59358',emissive:'#6fe0cf',emissiveIntensity:0});clueMeshes.set('evidence-'+id,edge);
  if(id==='clock'){const rim=ring('Clock brass case',0,0,0,.34,.035,edge,0,g);const face=mesh(new T.CircleGeometry(.31,48),cream,0,0,.012,g);for(let i=0;i<12;i++){const a=i*Math.PI/6;const mark=box(Math.sin(a)*.26,Math.cos(a)*.26,.025,.015,.04,.01,charcoal,g);mark.rotation.z=-a}rod([0,0,.04],[-.09,.14,.04],.014,charcoal,g);rod([0,0,.05],[-.025,.23,.05],.009,charcoal,g);sphere(0,0,.055,.025,brass,g)}
  else if(id==='script'){const paper=rounded('Director script folder',0,0,0,.68,.46,.055,edge,.01,g);box(0,0,.04,.59,.38,.015,cream,g);for(let i=0;i<6;i++)box(-.03,.12-i*.045,.055,i===0?.43:.35,.008,.006,charcoal,g);box(.18,-.10,.07,.10,.025,.01,teal,g)}
  else {rounded('Lighting console',0,0,0,.78,.44,.16,edge,.03,g);box(0,0,.09,.70,.36,.03,charcoal,g);for(let i=0;i<5;i++){box(-.26+i*.13,-.04,.12,.014,.20,.01,cream,g);box(-.26+i*.13,-.10+(i%3)*.07,.14,.065,.028,.03,brass,g);sphere(-.26+i*.13,.12,.13,.022,i%2?teal:cream,g)}}
  text('ОСМОТРЕТЬ',0,-.36,0,.88,.16,g,{bg:'#173e41',color:'#b8eee2'});
  target('evidence-'+id,'Осмотреть: '+p.propName,[x,y,z],{id:'evidence',prop:id,name:p.propName,text:p.hint});
 }

 const ambient=new T.HemisphereLight('#edf7ff','#85765f',1.25);world.add(ambient);
 const keyLight=spot(-2,4,1,-.4,1,.25,'#fff0dc',100);keyLight.angle=1;keyLight.penumbra=.9;
 spot(4,3.8,1,1.8,1,-1.4,'#c1dbe5',45);light(0,3,-3,'#ffe3b5',35,10);
 for(const x of [-3.3,3.3])light(x,2.3,-4.25,'#ffe4b3',12,5);
 backdoor(4.95);text('В ТЕЛЕЦЕНТР',0,3.2,4.85,2.8,.3).rotation.y=Math.PI;
 let from=0,to=0,start=-100,spinning=false;let questKey='',lastStage=0,celebrateUntil=0,lastTime=0;const questBoard=group(0,3.55,-4.4);const cueMats=[0,1,2].map(()=>new T.MeshStandardMaterial({color:'#123c40',emissive:'#ffd789',emissiveIntensity:0}));for(let i=0;i<3;i++){box(-2.2+i*2.2,.09,-3.6,1.7,.03,.12,cueMats[i]);text(['СВЕТ','ГОЛОС','ПОЛНОЧЬ'][i],-2.2+i*2.2,.35,-4.4,1.6,.22,world,{bg:'#102e38',color:'#dbcb9d'})}const board=group(0,2.35,-4.38);board.name='Live puzzle board';
 return{initial:[0,1.8,4.7,0],rotor,focus(id){focusId=id},setQuest(title,stage){const key=title+stage;if(key===questKey)return;questKey=key;if(stage>lastStage)celebrateUntil=lastTime+2.8;lastStage=stage;for(const o of [...questBoard.children]){o.geometry?.dispose();o.material?.map?.dispose();o.material?.dispose();questBoard.remove(o)}text(stage===3?'В ЭФИРЕ · INVITRO':title.toUpperCase(),0,0,0,5.6,.3,questBoard,{bg:stage===3?'#15675b':'#102e38',color:'#f0dfb8',bold:true});cueMats.forEach((m,i)=>{m.color.set(i<stage?'#f3cf87':'#123c40');m.emissiveIntensity=i<stage?1.4:0});ambient.intensity=1.15+stage*.09;keyLight.intensity=100+stage*9},setPuzzle(word,letters,reveal){for(const o of [...board.children]){o.geometry?.dispose();o.material?.map?.dispose();o.material?.dispose();board.remove(o)}const w=Math.min(.5,5/word.length);[...word].forEach((l,i)=>{text(reveal||letters.includes(l)?l:'·',(i-(word.length-1)/2)*(w+.06),0,0,w,.48,board,{bg:reveal||letters.includes(l)?'#e9dfc5':'#153b3d',color:reveal||letters.includes(l)?'#153b3d':'#749c91',bold:true})})},spin(t,sector=0){if(spinning)return false;from=rotor.rotation.y;const turn=Math.PI*2,angle=(sector+.5)*turn/12-Math.PI/2;to=from+turn*4+((angle-from)%turn+turn)%turn;start=t;spinning=true;return true},update(t){lastTime=t;clueMeshes.forEach((m,id)=>{m.emissiveIntensity=id===focusId?.22+.12*Math.sin(t*4):0});board.children.forEach((o,i)=>{o.position.y=!matchMedia('(prefers-reduced-motion: reduce)').matches&&t<celebrateUntil?Math.sin((t-celebrateUntil)*5+i*.5)*.035:0});if(!spinning)return;const k=Math.min(1,(t-start)/3.1);rotor.rotation.y=from+(to-from)*(1-Math.pow(1-k,4));if(k===1)spinning=false},dispose(){clueMeshes.forEach(m=>m.dispose());cueMats.forEach(m=>m.dispose());alive=false}};
}
