// @ts-nocheck
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {runwayPose,lookAtTime} from './fashion-timeline.mjs';

const C={navy:'#0b2231',teal:'#005564',blue:'#00acc6',ice:'#6ed2e6',cream:'#edf8fc',white:'#ffffff',orange:'#ff5601',chrome:'#b7c4cd'};
export function createFashionPavilion(scene,{soft=false,textures=[]}={}){
 const root=new T.Group();root.position.x=-32;root.name='INVITRO / Новый сезон 2026';scene.add(root);
 const stage=new T.Group();root.add(stage);const materials=new Map();
 const material=(color,metal=0,rough=.6)=>{const key=[color,metal,rough].join();if(!materials.has(key))materials.set(key,new T.MeshPhysicalMaterial({color,metalness:metal,roughness:rough,clearcoat:[C.blue,C.teal,C.white].includes(color)?.8:0,clearcoatRoughness:.2}));return materials.get(key)};
 const glow=color=>new T.MeshBasicMaterial({color,toneMapped:false});
 const add=(geo,mat,x,y,z,parent=stage)=>{const m=new T.Mesh(geo,typeof mat==='string'?material(mat):mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
 const box=(x,y,z,w,h,d,col,parent=stage,r=.025)=>add(r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)):new T.BoxGeometry(w,h,d),col,x,y,z,parent);
 const ball=(x,y,z,r,col,parent=stage)=>add(new T.SphereGeometry(r,soft?10:16,soft?7:12),col,x,y,z,parent);
 const cylinder=(x,y,z,r,h,col,parent=stage,top=r)=>add(new T.CylinderGeometry(top,r,h,soft?10:18),col,x,y,z,parent);
 const rod=(a,b,r,col,parent=stage)=>{const from=new T.Vector3(...a),to=new T.Vector3(...b),delta=to.clone().sub(from);const m=cylinder(...from.add(to).multiplyScalar(.5).toArray(),r,delta.length(),col,parent);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m};
 const group=(parent=stage)=>{const g=new T.Group();parent.add(g);return g};
 function label(lines,x,y,z,w,h,{parent=stage,bg=C.navy,color=C.white,rotation=0,size=70}={}){const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*h/w));const q=c.getContext('2d');q.fillStyle=bg;q.fillRect(0,0,c.width,c.height);q.textAlign='center';q.textBaseline='middle';lines.forEach((line,i)=>{q.fillStyle=color;q.font=`700 ${Math.min(size,c.height/(lines.length+.4)*.68)}px "Code Next", sans-serif`;q.fillText(line,512,c.height*(i+.5)/lines.length,960)});const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;textures.push(tex);const m=add(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,toneMapped:false}),x,y,z,parent);m.rotation.y=rotation;m.castShadow=false;return m}
 function artwork(image,x,y,z,w,h,rotation=0){box(x,y,z-.12,w+.22,h+.22,.20,C.navy);const tex=new T.TextureLoader().load('/merch/'+image+'.webp');tex.colorSpace=T.SRGBColorSpace;textures.push(tex);const m=add(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,toneMapped:false}),x,y,z);m.rotation.y=rotation;return m}
 // A 32 x 44 metre sound stage, with a real connection to the corridor foyer.
 box(0,-.12,-16,32,.24,44,C.navy,stage,0);box(0,10.3,-16,32,.16,44,C.navy,stage,0);
 box(-16,5,-16,.2,10,44,C.navy,stage,0);box(0,5,-38,32,10,.2,C.navy,stage,0);box(0,5,6,32,10,.2,C.navy,stage,0);
 box(15,5,-25.5,.2,10,25,C.navy,stage,0);box(15,5,.5,.2,10,11,C.navy,stage,0);
 box(0,.24,-30,26,.48,9,C.teal,stage,.1);box(0,.51,-18.5,4.6,.54,25.5,C.cream,stage,.09);
 box(0,.78,-18.5,4.48,.03,25.35,C.white,stage,.02);
 box(0,.51,-7.8,6.6,.54,4.1,C.cream,stage,.10);box(0,.788,-7.8,6.46,.025,3.98,C.white,stage,.05);for(const x of [-3.31,3.31])box(x,.7,-7.8,.04,.06,4.0,glow(C.blue));
 // Underlit runway edges and a broad front turn platform; no route reaches a wall.
 for(const x of [-2.34,2.34]){box(x,.71,-18.5,.045,.08,25.3,glow(C.blue));box(x,.23,-18.5,.08,.05,25.3,glow(C.ice));}
 for(let z=-30;z<-6;z+=2.4)for(const x of [-2.38,2.38])box(x,.82,z,.045,.015,.3,glow(C.white));
 for(const x of [-7.3,7.3]){box(x,4.5,-34.7,10.8,8.5,.35,C.teal);artwork(x<0?'crew':'footwear',x,4.8,-34.48,10.35,5.83);label([x<0?'НОСИ СВОЮ РОЛЬ':'ТВОЙ ВЫХОД'],x,1.2,-34.46,9.4,.65,{bg:C.teal,size:74});}
 // Recessed, separated entrances and off-stage holding areas.
 for(const x of [-1.65,1.65]){box(x,3,-35,2.4,6,.15,'#030e16');for(const s of [-1,1])box(x+s*1.25,3,-34.9,.07,6,.09,glow(C.blue));box(x,6,-34.9,2.6,.07,.09,glow(C.white));}
 label(['ТЕЛЕЦЕНТР INVITRO'],0,8.85,-34.35,24,1.0,{bg:C.navy,size:84});label(['НОВЫЙ СЕЗОН 2026'],0,7.25,-34.3,13,1.2,{bg:C.navy,color:C.ice,size:104});
 for(const x of [-13.5,13.5])for(let i=0;i<11;i++){box(x+i*.04,4.5,-34.9+i*.3,.05,8.4,.06,glow(i%3?C.teal:C.blue));}
 const strip=[C.white,C.ice,C.blue,C.teal,C.navy,C.orange];strip.forEach((c,i)=>box(-12.1+i*4.85,.52,-25.55,4.8,.06,.3,glow(c)));
 label(['ВЫ В ЭФИРЕ'],0,.35,-5.70,3.6,.42,{bg:C.teal,size:108});
 // Audience banks face the runway, with a clear photographers' pit in front.
 for(const side of [-1,1])for(let row=0;row<3;row++)for(let i=0;i<10;i++){
  const seat=group(),x=side*(4.7+row*1.55),z=-7.8-i*2.1;seat.position.set(x,row*.24,z);seat.rotation.y=-side*Math.PI/2;
  box(0,.47,0,.64,.13,.64,C.teal,seat,.08);box(0,.89,-.3,.66,.78,.10,C.navy,seat,.06);for(const s of [-1,1])rod([s*.24,.43,0],[s*.26,0,.15],.022,C.chrome,seat);
  if((i+row)%3!==0){const coat=[C.navy,'#586670','#e1dfd6'][((i*3+row)%3)];box(0,.91,-.03,.43,.56,.26,coat,seat,.1);const head=ball(0,1.4,-.015,.135,['#b98668','#e2b798','#8c604b'][(row+i)%3],seat);head.scale.y=1.2;ball(0,1.47,-.03,.139,i%2?'#35251c':'#56514c',seat).scale.set(1,.7,1);for(const s of [-1,1]){rod([s*.14,.62,.04],[s*.14,.54,.37],.08,C.navy,seat);rod([s*.14,.54,.37],[s*.14,.10,.4],.065,C.navy,seat);rod([s*.21,1.12,0],[s*.23,.77,.24],.052,coat,seat);}}
 }
 // Structural rigging, moving heads, cable runs, speaker arrays and show lighting.
 const lamps=[];
 for(const z of [-31,-21,-11]){for(const y of [8.1,8.5])for(const d of [-.17,.17])rod([-14,y,z+d],[14,y,z+d],.04,material(C.chrome,.7,.35));for(let x=-14;x<14;x+=1)rod([x,8.1,z+.17],[x+1,8.5,z+.17],.025,C.chrome);for(const x of [-10,-5,0,5,10]){const fixture=group();fixture.position.set(x,7.83,z);box(0,0,0,.45,.28,.5,C.navy,fixture,.05);const lamp=cylinder(0,-.26,0,.18,.28,C.navy,fixture);const lens=cylinder(0,-.411,0,.16,.02,glow(C.ice),fixture);lamps.push({fixture,lens,x,z});}}
 for(const x of [-13,13])for(let i=0;i<6;i++){box(x,5.1+i*.41,-29,.9,.37,.75,C.navy);for(let j=0;j<5;j++)box(x-.31+j*.155,5.1+i*.41,-28.61,.025,.29,.015,C.chrome);}
 for(const side of [-1,1]){const g=group();g.position.set(side*3.6,0,-3.8);g.rotation.y=side*.18;for(let j=0;j<3;j++){const a=j*Math.PI*2/3;rod([0,1.3,0],[Math.cos(a)*.5,.04,Math.sin(a)*.5],.026,C.chrome,g)}box(0,1.5,0,.4,.35,.6,C.navy,g,.06);const lens=cylinder(0,1.5,-.41,.11,.28,material(C.chrome,.6,.24),g);lens.rotation.x=Math.PI/2;box(.24,1.57,.08,.17,.15,.15,C.teal,g);ball(0,1.73,-.2,.028,glow(C.orange),g);}
 const spots=[];
 if(!soft){for(const z of [-28,-18,-8])for(const x of [-5,5]){const l=new T.SpotLight('#ffffff',95,30,.65,.7,1.5);l.position.set(x,7.5,z);l.target.position.set(0,1,z+2);root.add(l,l.target);spots.push(l)}const front=new T.SpotLight('#ffffff',65,30,.70,.7,1.5);front.position.set(-3,7.5,-3);front.target.position.set(0,.8,-8);front.castShadow=true;front.shadow.mapSize.set(1024,1024);front.shadow.normalBias=.018;root.add(front,front.target);const fill=new T.DirectionalLight('#ffffff',1.1);fill.position.set(-34,6,-1);fill.target.position.set(-32,1,-15);scene.add(fill,fill.target);const rim=new T.PointLight(C.blue,85,30,1.5);rim.position.set(0,6,-33);root.add(rim);}
 // Garments are modeled from the supplied collection: cream work jacket, navy knits,
 // waveform scarf, TV clogs/sneakers, canvas tote, chrome charms and home accessories.
 function curvedBody(parent,color){const pts=[[.23,0],[.25,.12],[.24,.4],[.29,.62],[.20,.70]].map(([r,y])=>new T.Vector2(r,y));const m=add(new T.LatheGeometry(pts,20),color,0,1.15,0,parent);m.scale.set(1.1,1,.62);return m}
 function shoe(parent,clog){box(0,-.06,.095,.24,.11,.42,C.navy,parent,.06);box(0,.015,.095,.245,.105,.415,C.cream,parent,.07);box(0,-.105,.12,.245,.035,.4,C.blue,parent,.018);if(clog){box(0,.066,.15,.18,.035,.18,C.blue,parent,.025);for(let j=0;j<5;j++)box(-.064+j*.032,.087,.15,.015,.006,.145,C.navy,parent,.002);rod([-.135,.05,-.08],[.135,.05,-.08],.025,C.blue,parent);for(const s of [-1,1]){ball(s*.125,.035,-.07,.019,material(C.chrome,.8,.23),parent);for(let j=0;j<2;j++)box(s*.126,.02,.09+j*.08,.003,.018,.037,C.navy,parent,.002)}}else{box(0,.021,.238,.233,.088,.105,C.navy,parent,.035);box(0,.08,-.025,.13,.11,.08,C.navy,parent,.02);for(let i=0;i<5;i++)rod([-.067,.088,.02+i*.026],[.067,.088,.04+i*.026],.006,C.white,parent);label(['В ЭФИРЕ'],0,.099,.085,.11,.035,{parent,bg:C.blue,size:50}).rotation.x=-Math.PI/2;}}
 function television(parent,x,y,z,small=.13){const g=group(parent);g.position.set(x,y,z);box(0,0,0,small*1.35,small,.04,material(C.chrome,.78,.22),g,.014);box(-small*.13,0,.026,small*.96,small*.78,.02,C.blue,g,.017);for(let j=0;j<3;j++)box(small*.53,-small*.25+j*small*.16,.027,.013,.004,.008,C.navy,g,.001);return g}
 function model(index){
  const g=group(root),body=group(g),navy=C.navy,jacket=index===0||index===2,skin=['#d9af91','#c49672','#966548','#e4c1a1','#be8e73'][index],hair=['#543b2d','#302720','#241b18','#735847','#31251e'][index],cloth=jacket?C.cream:navy;
  const torso=group(body);curvedBody(torso,cloth);box(0,1.14,0,.47,.15,.29,navy,torso,.055);cylinder(0,1.9,0,.075,.19,skin,torso);
  const head=group(torso);head.position.y=2.12;ball(0,0,0,.167,skin,head).scale.set(.82,1.25,.87);ball(0,.065,-.03,.176,hair,head).scale.set(.92,1.0,.9);
  // Face planes remain unobscured by hair; small neutral features, no cartoon eyes.
  const face=ball(0,-.014,.067,.132,skin,head);face.scale.set(.90,1.34,.62);ball(0,-.012,.159,.027,skin,head).scale.set(.8,1.6,1.25);
  for(const s of [-1,1]){box(s*.058,.037,.140,.025,.008,.009,'#302a27',head,.003);rod([s*.035,.058,.137],[s*.078,.064,.128],.005,hair,head);ball(s*.142,-.02,0,.025,skin,head)}box(0,-.091,.139,.046,.009,.007,'#a27565',head,.003);
  if(index===0||index===2||index===4){for(const s of [-1,1]){const curl=ball(s*.128,-.03,-.02,.105,hair,head);curl.scale.set(.5,2.3,1);for(let j=0;j<4;j++)rod([s*(.14+j*.004),.08,-.02-j*.027],[s*(.15+j*.006),-.22,-.02-j*.019],.009,hair,head);}}
  if(jacket){for(const s of [-1,1]){const collar=box(s*.108,1.818,.141,.18,.16,.025,navy,torso,.015);collar.rotation.z=s*.23;box(s*.243,1.42,.004,.045,.5,.275,C.blue,torso,.025);box(s*.145,1.38,.17,.17,.19,.026,C.cream,torso,.012);box(s*.145,1.485,.184,.17,.012,.006,'#d5d0c3',torso,.002);rod([s*.23,1.23,.15],[s*.23,1.63,.153],.003,'#ded8ca',torso);}
   box(0,1.48,.172,.045,.58,.018,C.cream,torso,.009);for(let j=0;j<5;j++)ball(0,1.22+j*.117,.188,.013,material(C.chrome,.75,.28),torso);label(['В ЭФИРЕ'],-.136,1.67,.171,.167,.057,{parent:torso,bg:C.blue,size:58});label(['СЪЁМОЧНАЯ','ГРУППА','I N V I T R O'],0,1.57,-.162,.41,.26,{parent:torso,bg:C.cream,color:navy,rotation:Math.PI,size:90});
  }else{for(const s of [-1,1]){const collar=box(s*.075,1.83,.13,.12,.12,.025,navy,torso,.015);collar.rotation.z=s*.25;}for(let j=0;j<3;j++)ball(0,1.79-j*.067,.165,.009,C.cream,torso);for(let j=0;j<18;j++)rod([-.22+j*.026,1.18,.165],[-.22+j*.026,1.67,.165],.0025,'#172f3c',torso);}
  const legs=[],arms=[];
  for(const s of [-1,1]){const leg=group(body);leg.position.set(s*.13,1.18,0);cylinder(0,-.265,0,.107,.53,navy,leg,.125);const lower=group(leg);lower.position.y=-.53;cylinder(0,-.24,0,.103,.48,navy,lower,.112);const foot=group(lower);foot.position.y=-.49;shoe(foot,index===2);rod([s*.103,-.07,.05],[s*.098,-.44,.05],.003,'#223b48',lower);legs.push({upper:leg,lower,foot});
   const arm=group(torso);arm.position.set(s*.30,1.74,0);arm.rotation.z=s*.09;cylinder(0,-.17,0,.074,.34,cloth,arm,.094);const fore=group(arm);fore.position.y=-.34;cylinder(0,-.135,0,.058,.27,jacket?cloth:skin,fore,.072);box(0,-.272,0,.12,.052,.13,jacket?navy:skin,fore,.018);ball(0,-.328,.005,.059,skin,fore).scale.set(.70,1.35,.60);for(let j=0;j<4;j++)rod([-.026+j*.016,-.346,.015],[-.026+j*.016,-.399,.019],.006,skin,fore);arms.push({upper:arm,fore});}
  if(index===1){const hat=ball(0,2.25,-.015,.171,navy,torso);hat.scale.set(.9,.86,.89);box(0,2.215,.133,.10,.035,.009,C.blue,torso,.006);for(let j=0;j<14;j++){const a=j/14*Math.PI*2;rod([Math.sin(a)*.151,2.185,Math.cos(a)*.142],[Math.sin(a)*.13,2.32,Math.cos(a)*.122],.005,'#274452',torso);}for(const s of [-1,1]){box(s*.115,1.57,.202,.12,.62,.035,C.cream,torso,.012);box(s*.115,1.56,.225,.121,.28,.008,C.blue,torso,.005);for(let j=0;j<6;j++){box(s*.115-.051+j*.020,1.58,.232,.009,.09+((j*3)%5)*.039,.003,C.white,torso,.001);rod([s*.115-.05+j*.02,1.27,.20],[s*.115-.05+j*.02,1.18,.21],.004,C.cream,torso);}}}
  if(index===2){const bag=group(arms[1].fore);bag.position.set(.02,-.47,.02);box(0,-.10,0,.38,.37,.105,C.cream,bag,.03);for(const s of [-1,1]){rod([s*.135,.085,.045],[s*.09,.25,.045],.012,C.cream,bag);rod([s*.09,.25,.045],[0,.27,.045],.012,C.cream,bag)}box(.11,-.08,.057,.035,.35,.007,C.blue,bag,.003);television(bag,.17,.06,.075,.10);for(const x of [-.168,.168])rod([x,-.245,.057],[x,.05,.057],.002,'#c4bead',bag);}
  if(index===3){box(-.14,1.64,.181,.075,.17,.025,C.cream,torso,.008);box(-.14,1.64,.198,.012,.115,.006,C.blue,torso,.002);box(-.14,1.655,.204,.041,.018,.014,C.orange,torso,.003);const charm=television(torso,.23,1.16,.18,.15);label(['FM 88—108'],-.013,.01,.038,.11,.023,{parent:charm,bg:C.blue,size:60});rod([.2,1.33,.17],[.23,1.235,.18],.012,C.blue,torso);}
  if(index===4){const blanket=group(arms[0].fore);blanket.position.set(-.05,-.14,.10);box(0,-.08,0,.34,.55,.06,navy,blanket,.028);for(let j=0;j<3;j++){label(['▱'],0,.11-j*.16,.033,.25,.12,{parent:blanket,bg:navy,color:C.cream,size:90});box(0,.095-j*.16,.035,.16,.012,.003,C.blue,blanket,.002)}for(let j=0;j<9;j++)rod([-.14+j*.035,-.35,.02],[-.14+j*.035,-.41,.02],.004,C.cream,blanket);
   const lamp=group(arms[1].fore);lamp.position.set(.04,-.32,.12);box(0,0,0,.31,.26,.16,C.cream,lamp,.035);box(-.025,0,.088,.22,.18,.012,C.blue,lamp,.022);box(-.025,0,.097,.18,.15,.009,'#e8c69b',lamp,.018);for(let j=0;j<9;j++)box(-.104+j*.020,0,.104,.004,.12,.006,'#b69062',lamp,.001);ball(.115,.075,.095,.018,C.orange,lamp);label(['ПАУЗА'],0,-.106,.090,.16,.035,{parent:lamp,bg:C.cream,color:C.navy,size:55});}
  // Batch rigid garment pieces within each articulated node; joints stay independent.
  for(const node of [head,...legs.flatMap(v=>[v.foot,v.lower,v.upper]),...arms.flatMap(v=>[v.fore,v.upper]),torso])batch(node);
  return {g,body,torso,legs,arms};
 }
 function batch(parent){parent.updateMatrix();const entries=new Map();for(const o of [...parent.children]){if(!o.isMesh||o.material.map||o.material.transparent)continue;o.updateMatrix();const geo=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrix);if(!entries.has(o.material))entries.set(o.material,[]);entries.get(o.material).push({o,geo})}for(const [mat,items] of entries){if(items.length<2){items.forEach(v=>v.geo.dispose());continue}const geo=mergeGeometries(items.map(v=>v.geo));const m=new T.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);items.forEach(v=>{v.o.removeFromParent();v.o.geometry.dispose();v.geo.dispose()})}}
 // Static stage is batched in spatial groups, retaining effective frustum culling.
 root.updateMatrixWorld(true);const inv=new T.Matrix4().copy(stage.matrixWorld).invert(),buckets=new Map();stage.traverse(o=>{if(!o.isMesh||o.material.map||o.material.transparent)return;const worldPos=o.getWorldPosition(new T.Vector3());const key=o.material.uuid+'/'+Math.floor(worldPos.z/8);if(!buckets.has(key))buckets.set(key,[]);const geo=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));buckets.get(key).push({o,geo})});for(const items of buckets.values()){const geo=mergeGeometries(items.map(v=>v.geo));const combined=new T.Mesh(geo,items[0].o.material);combined.castShadow=true;combined.receiveShadow=true;stage.add(combined);for(const v of items){v.o.removeFromParent();v.o.geometry.dispose();v.geo.dispose()}}
 const models=Array.from({length:5},(_,i)=>model(i));
 function update(time=0,playing=false,reduced=false){const beat=reduced?0:(.5+.5*Math.sin(time*Math.PI*2*128/60));for(const [i,m] of models.entries()){const p=runwayPose(i,time);m.g.visible=p.visible;if(!p.visible)continue;m.g.position.set(p.x,.73,p.z);m.g.rotation.y=p.yaw;m.body.rotation.z=p.pose*(i%2?-.025:.025);m.body.position.y=Math.abs(Math.sin(p.phase*2))*.008*p.walk;
  m.legs.forEach(({upper,lower,foot},j)=>{const phase=p.phase+j*Math.PI,stride=Math.sin(phase)*.19*p.walk,lift=Math.max(0,Math.cos(phase))*.085*p.walk,Y=1.02-lift,Z=stride,D=Math.min(1.019,Math.hypot(Y,Z)),a=.53,b=.49;const hip=Math.atan2(Z,Y)+Math.acos(T.MathUtils.clamp((a*a+D*D-b*b)/(2*a*D),-1,1)),knee=Math.PI-Math.acos(T.MathUtils.clamp((a*a+b*b-D*D)/(2*a*b),-1,1));upper.rotation.x=-hip;lower.rotation.x=knee;foot.rotation.x=hip-knee;});
  m.arms.forEach(({upper,fore},j)=>{upper.rotation.x=Math.sin(p.phase+j*Math.PI)*.15*p.walk;upper.rotation.z=(j===0?1:-1)*(.06+p.pose*.055);fore.rotation.x=i===4?(j===0?-.4:-1.05):-.06;});}
  for(const [i,l] of spots.entries()){l.intensity=75+beat*15;l.target.position.x=reduced?0:Math.sin(time*.25+i)*1.1;}return lookAtTime(time);
 }
 update(0);return {update,root};
}
