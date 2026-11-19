import * as T from 'three';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {TessellateModifier} from 'three/addons/modifiers/TessellateModifier.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import fs from 'node:fs/promises';
const dir=new URL('../../public/models/',import.meta.url);await fs.mkdir(dir,{recursive:true});
const font=new FontLoader().parse(JSON.parse(await fs.readFile(new URL('./font.json',import.meta.url),'utf8')));
globalThis.FileReader=class{readAsArrayBuffer(b){b.arrayBuffer().then(x=>{this.result=x;this.onloadend?.()})}readAsDataURL(b){b.arrayBuffer().then(x=>{this.result='data:'+b.type+';base64,'+Buffer.from(x).toString('base64');this.onloadend?.()})}};
const mat=(name,color,metalness=.1,roughness=.3,extra={})=>new T.MeshPhysicalMaterial({name,color,metalness,roughness,...extra});
const ivory=mat('Ivory enamel','#f5f3e7',.15,.24),teal=mat('INVITRO teal lacquer','#009ba6',.2,.2,{clearcoat:1,clearcoatRoughness:.15}),gold=mat('Champagne brushed metal','#bc9d69',.85,.28),black=mat('Camera graphite','#141e24',.55,.32),rubber=mat('Grip rubber','#080d11',.05,.62),steel=mat('Machined aluminium','#85939a',.9,.21),glass=mat('Coated optical glass','#163c54',.75,.08,{clearcoat:1}),red=mat('Red acrylic diffuser','#d71f24',.2,.22,{emissive:'#b00000',emissiveIntensity:.65}),white=mat('White illuminated letters','#ffffff',.1,.27,{emissive:'#fff0d3',emissiveIntensity:.35});
function mesh(g,geo,m,n,p=[0,0,0],rot=[0,0,0]){const o=new T.Mesh(geo,m);o.name=n;o.position.set(...p);o.rotation.set(...rot);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
function box(g,n,w,h,d,m,p,rad=.04){return mesh(g,new RoundedBoxGeometry(w,h,d,3,rad),m,n,p)}
function cyl(g,n,r,h,m,p,rot=[Math.PI/2,0,0],r2=r){return mesh(g,new T.CylinderGeometry(r,r2,h,48),m,n,p,rot)}
function tor(g,n,r,t,m,p,rot=[0,0,0]){return mesh(g,new T.TorusGeometry(r,t,10,80),m,n,p,rot)}
function text(g,str,size,depth,p,name,front=ivory,side=teal){let cursor=0;const row=new T.Group();row.name=name;g.add(row);for(const [i,c] of [...str].entries()){if(c===' '){cursor+=size*.35;continue}const geo=new TextGeometry(c,{font,size,depth,curveSegments:8,bevelEnabled:true,bevelThickness:Math.min(.013,size*.016),bevelSize:Math.min(.012,size*.015),bevelSegments:3});geo.computeBoundingBox();mesh(row,geo,[front,side],`${name}_${i}_${c}`,[cursor,0,0]);cursor+=font.data.glyphs[c].ha/1000*size+size*.015;}row.position.set(p[0]-cursor/2,p[1],p[2]);return row;}
const title=new T.Group();title.name='INVITRO_TITLE';
text(title,'ТЕЛЕЦЕНТР',.58,.24,[0,1.42,0],'TELECENTER');text(title,'INVITRO',1.1,.36,[0,.35,-.01],'INVITRO');
box(title,'Architectural plinth',6.5,.20,.9,teal,[0,.15,.06],.055);box(title,'Gold plinth trim',6.56,.027,.96,gold,[0,.258,.06],.008);
const ball=new T.Group();ball.name='LOTTO_BALL_23';const r=.72;mesh(ball,new T.SphereGeometry(r,64,48),teal,'Teal lacquer shell');
const cap=mesh(ball,new T.SphereGeometry(r+.003,48,24,0,Math.PI*2,0,.62),ivory,'Curved white number field');cap.rotation.x=Math.PI/2;
// Rotate north pole toward +Z.
cap.rotation.x=Math.PI/2;cap.rotation.z=0;
// Sphere's north pole +Y becomes +Z under +PI/2.
const number=text(ball,'23',.43,.004,[0,-.155,0],'NUMBER_23',teal,teal);
number.updateMatrixWorld(true);for(const m of number.children){m.geometry=new TessellateModifier(.025,7).modify(m.geometry);m.material=teal;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i)+m.position.x+number.position.x,y=a.getY(i)+number.position.y;const z=Math.sqrt(Math.max(.01,(r+.016)**2-x*x-y*y))+a.getZ(i);a.setZ(i,z)}a.needsUpdate=true;m.geometry.computeVertexNormals();}
tor(ball,'White equatorial inlay',r+.002,.012,ivory,[0,0,0],[.25,0,0]);
const live=new T.Group();live.name='LIVE_LIGHTBOX';box(live,'Champagne metal housing',4,.62,.34,gold,[0,0,0],.08);box(live,'Black rubber gasket',3.91,.54,.08,rubber,[0,0,.185],.05);box(live,'Red luminous lens',3.80,.44,.07,red,[0,0,.237],.035);text(live,'ПРЯМОЙ ЭФИР',.28,.015,[0,-.105,.281],'LIVE_TEXT',white,white);for(const x of [-1.65,1.65])cyl(live,'Mounting foot',.05,.3,steel,[x,-.44,0],[0,0,0]);
const cam=new T.Group();cam.name='BROADCAST_CAMERA';box(cam,'Broadcast camera body',1.12,.91,1.5,black,[0,1.73,0],.11);box(cam,'Shoulder pad',1.05,.15,1.25,rubber,[0,1.25,0],.055);box(cam,'Side housing',.11,.54,.88,rubber,[-.61,1.76,-.1],.035);box(cam,'Side display',.025,.24,.4,glass,[-.679,1.84,-.06],.01);
for(let i=0;i<13;i++)box(cam,'Vent grille '+i,.012,.31,.017,steel,[-.677,1.7,-.55+i*.025],.003);
for(let i=0;i<6;i++)cyl(cam,'Side control '+i,.035,.025,steel,[-.68,1.53,-.25+i*.12],[0,0,Math.PI/2]);
box(cam,'Top handle',.17,.12,1.02,black,[0,2.4,-.05],.055);for(const z of [-.45,.35])box(cam,'Handle riser',.16,.18,.13,black,[0,2.28,z]);box(cam,'Tally lamp',.20,.07,.10,red,[0,2.32,.47],.02);
for(const [j,z,rr,h] of [[0,.84,.34,.20],[1,1.04,.37,.21],[2,1.23,.345,.16],[3,1.41,.405,.22],[4,1.6,.44,.19]]){cyl(cam,'Lens barrel '+j,rr,h,j%2?rubber:black,[0,1.79,z]);for(let k=0;k<5;k++)tor(cam,'Lens focus ring '+j+'-'+k,rr+.005,.009,steel,[0,1.79,z-h*.42+k*h*.19]);}
cyl(cam,'Optical front element',.373,.027,glass,[0,1.79,1.709]);const convex=mesh(cam,new T.SphereGeometry(.367,48,32),glass,'Convex coated lens',[0,1.79,1.712]);convex.scale.z=.14;tor(cam,'Lens blue optical edge',.35,.009,teal,[0,1.79,1.729]);tor(cam,'Front optic highlight',.31,.005,steel,[0,1.79,1.729]);
cyl(cam,'Fluid head',.22,.24,black,[0,1.06,0],[0,0,0]);cyl(cam,'Pedestal column',.075,.76,steel,[0,.58,0],[0,0,0]);cyl(cam,'Pedestal base',.23,.13,black,[0,.16,0],[0,0,0]);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const leg=box(cam,'Dolly leg '+i,.11,.09,.65,black,[Math.sin(a)*.28,.12,Math.cos(a)*.28]);leg.rotation.y=a;cyl(cam,'Dolly wheel '+i,.10,.065,rubber,[Math.sin(a)*.57,.1,Math.cos(a)*.57],[Math.PI/2,0,a]);}
const mic=new T.Group();mic.name='BOOM_MICROPHONE';cyl(mic,'Shotgun shell',.085,1.32,black,[0,0,0]);for(let i=0;i<31;i++)tor(mic,'Acoustic grille '+i,.086,.0045,steel,[0,0,-.53+i*.029]);cyl(mic,'Foam front cap',.084,.10,rubber,[0,0,.7]);for(const z of [-.45,.28]){tor(mic,'Shock mount ring',.16,.017,black,[0,0,z]);for(let i=0;i<4;i++){const a=i*Math.PI/2+.6;const b=box(mic,'Elastic suspension',.011,.15,.013,rubber,[Math.cos(a)*.09,Math.sin(a)*.09,z],.003);b.rotation.z=a-Math.PI/2;}}
box(mic,'Suspension bridge',.065,.04,.83,black,[0,.17,-.08]);cyl(mic,'Boom',.035,2.5,black,[.83,.42,-.08],[0,0,-Math.PI/2+.21]);cyl(mic,'Cable socket',.026,.1,steel,[0,0,-.71]);
const cable=new T.CatmullRomCurve3([new T.Vector3(0,0,-.77),new T.Vector3(0,-.22,-.85),new T.Vector3(.22,-.3,-.5),new T.Vector3(.4,.1,-.1),new T.Vector3(.65,.37,-.08)]);mesh(mic,new T.TubeGeometry(cable,32,.014,8,false),rubber,'XLR cable');
const all=[title,ball,live,cam,mic];const exporter=new GLTFExporter();
for(const g of all){g.userData={provenance:'Reconstructed from approved INVITRO opener, not extracted original production mesh.',units:'meters',version:'1.0'};const data=await exporter.parseAsync(g,{binary:true,onlyVisible:true});await fs.writeFile(new URL(g.name+'.glb',dir),Buffer.from(data));console.log(g.name,Math.round(data.byteLength/1024)+' KB');}
const scene=new T.Scene();title.position.set(0,0,0);ball.position.set(3.8,.73,1.1);live.position.set(0,2.56,0);cam.position.set(-4,0,.2);cam.rotation.y=.48;mic.position.set(3.7,3.18,.1);mic.rotation.y=-.6;all.forEach(g=>scene.add(g));await fs.writeFile(new URL('INVITRO_STAGE.glb',dir),Buffer.from(await exporter.parseAsync(scene,{binary:true})));
// New art direction: a warm, compact broadcast world for the Chirpley-inspired site.
const world=new T.Group();world.name='INVITRO_WORLD';
const cream=mat('Warm ivory studio','#fff0d4',.05,.48),mint=mat('Mint ceramic','#b9dfcc',.1,.36),warm=mat('Warm illuminated diffuser','#ffe6a6',.1,.25,{emissive:'#ffcf77',emissiveIntensity:.45});
cyl(world,'Main rounded studio stage',5,.32,cream,[0,-.17,0],[0,0,0]);cyl(world,'Teal stage rim',5.03,.12,teal,[0,-.36,0],[0,0,0]);
for(const rad of [4.45,4.8])tor(world,'Inlaid floor light',rad,.032,warm,[0,.015,0],[Math.PI/2,0,0]);
const signage=title.clone();signage.scale.setScalar(.79);signage.position.set(0,.03,-1.12);world.add(signage);
const ring=mesh(world,new T.TorusGeometry(3.2,.18,16,80,Math.PI),mint,'Studio arch',[0,.2,-1.9]);
const lightRing=mesh(world,new T.TorusGeometry(2.97,.035,10,80,Math.PI),warm,'Arch practical light',[0,.2,-1.68]);
for(const x of [-3.2,3.2])box(world,'Arch foot',.48,.28,.65,mint,[x,.1,-1.9],.08);
const sign=live.clone();sign.scale.setScalar(.65);sign.position.set(0,2.5,-1.75);world.add(sign);
const mainBall=ball.clone();mainBall.position.set(1.95,.77,1.12);world.add(mainBall);
for(const [x,z,a,sc] of [[-2.9,1.9,.65,.78],[3.35,1.55,-.75,.7]]){const cp=cam.clone();cp.scale.setScalar(sc);cp.position.set(x,0,z);cp.rotation.y=a;world.add(cp)}
const microphone=mic.clone();microphone.scale.setScalar(.8);microphone.position.set(1.5,3.75,-.8);microphone.rotation.y=-.4;world.add(microphone);
for(const [x,z,sc] of [[-3.1,-1.3,1],[3,-1.6,.85]]){const tree=new T.Group();tree.position.set(x,0,z);tree.scale.setScalar(sc);world.add(tree);cyl(tree,'Christmas tree trunk',.13,.35,gold,[0,.15,0],[0,0,0]);for(let i=0;i<3;i++)mesh(tree,new T.ConeGeometry(.66-i*.13,.9,48),i%2?mint:teal,'Ceramic evergreen tier',[0,.55+i*.48,0]);mesh(tree,new T.SphereGeometry(.12,24,16),gold,'Tree topper',[0,2,0]);for(let j=0;j<9;j++){const a=j*2.4,y=.4+j*.14,rr=.56-j*.037;mesh(tree,new T.SphereGeometry(.055,16,12),j%2?gold:ivory,'Christmas ornament',[Math.sin(a)*rr,y,Math.cos(a)*rr]);}}
for(const [x,y,z,rr] of [[-1.8,.16,2.8,.16],[2.7,.22,2.3,.22],[-3.9,.2,.4,.2]])mesh(world,new T.SphereGeometry(rr,32,24),gold,'Floor bauble',[x,y,z]);
await fs.writeFile(new URL('INVITRO_WORLD.glb',dir),Buffer.from(await exporter.parseAsync(world,{binary:true})));
