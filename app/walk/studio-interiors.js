// @ts-nocheck
import * as T from 'three';
// Architectural set dressing uses the same navigable world and collision system.
// Practical lamps, acoustic joinery and working props replace the office fit-out.
export function dressTelecentre({world,box,sphere,cyl,rod,group,panel,mat,mesh,caseBox,cable,person,textures,collisions,soft}){
 const navy='#0b2231',teal='#005564',blue='#00acc6',ice='#6ed2e6',wood='#005564',cream='#ffffff',metal='#94a5ac',amber='#ffdfaf';
 const luminous=c=>new T.MeshBasicMaterial({color:c,toneMapped:false});
 function art(src,x,y,z,w,h,parent=world,rotation=0){const t=new T.TextureLoader().load(src);t.colorSpace=T.SRGBColorSpace;textures.push(t);const m=mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t,toneMapped:false}),x,y,z,parent);m.rotation.y=rotation;m.castShadow=false;return m;}
 function lamp(x,z){const g=group(x,0,z);rod([0,4.36,0],[0,3.58,0],.018,navy,g);cyl(0,3.55,0,.31,.28,navy,g,.13);cyl(0,3.4,0,.285,.035,luminous(amber),g);const l=new T.PointLight('#ffdfb5',13,8,2);l.position.set(0,3.2,0);g.add(l);return g;}
 function festoon(a,b,y){const points=[];for(let i=0;i<=20;i++){const u=i/20;points.push([a[0]+(b[0]-a[0])*u,y-Math.sin(u*Math.PI)*.32,a[1]+(b[1]-a[1])*u]);}cable(points,world,navy,.014);for(let i=1;i<20;i++){const p=points[i];rod(p,[p[0],p[1]-.08,p[2]],.011,navy);sphere(p[0],p[1]-.12,p[2],.038,luminous(i%5?amber:ice));}}
 // Broad timber boards with real joints, and a dark woven centre runner.
 const boards=['#bcd9e3','#d3e8ed','#c9e1e8','#e0eff2'];
 for(let x=-3.75;x<4;x+=.5)for(let z=-12.1;z<25.8;z+=3.1){box(x,.006,z,.49,.012,3.07,mat(boards[(Math.round((x+4)*2)+Math.round(z+13))%4]||wood,0,.82),world);}
 box(0,.023,6.5,3.2,.025,38.7,mat('#005564',.22,.28));for(const x of [-1.53,1.53])box(x,.037,6.5,.03,.003,38.5,mat('#57858d',0,.92));
 // Recessed acoustic panels, warm timber reveals and dark exposed ceiling.
 for(const side of [-1,1])for(const [z,len] of [[23.5,5],[16.5,5],[9,10],[-3.4,8.8],[-11.6,2.8]]){
  const x=side*3.88;box(x,1,z,.08,1.75,len-.12,mat('#f0f8fa',.12,.32));box(side*3.81,1.9,z,.09,.065,len-.12,mat(wood,0,.72));
  for(let d=-len/2+.14;d<len/2-.12;d+=.22)box(side*3.86,2.96,z+d,.055,1.8,.036,mat(d%1>.4?'#005564':'#00acc6',0,.85));
  box(side*3.81,4.1,z,.09,.055,len-.12,luminous('#d5f7ff'));
 }
 for(const z of [23,16,9,2,-5,-12]){box(0,4.28,z,7.9,.16,.22,mat(navy,.45,.5));for(const x of [-3,3]){box(x,4.01,z,.26,.35,.25,navy);cyl(x,3.82,z,.09,.015,luminous(amber));}lamp(0,z);}
 for(const z of [18.4,4.8,-8.2])festoon([-3.8,z],[3.8,z],3.85);
 // A small gallery of programme posters, each framed as a working studio artefact.
 for(const [side,z,id,title] of [[-1,23.5,'radio','СТОЛ ЗАКАЗОВ'],[1,23.5,'postoffice','УТРЕННЯЯ ПОЧТА'],[-1,15.9,'yak','ПОЛЕ ЧУДЕС'],[1,15.9,'pelsh','УГАДАЙ МЕЛОДИЮ']]){
  const g=group(side*3.75,0,z,side<0?Math.PI/2:-Math.PI/2);box(0,2.25,0,2.45,2.25,.09,navy,g,.04);art('/studio-icons/'+id+'.webp',0,2.56,.055,1.45,1.45,g);panel([title,'ТЕЛЕЦЕНТР / INVITRO'],0,1.65,.061,2.25,.48,{parent:g,bg:navy,color:cream});rod([-.8,3.47,.10],[.8,3.47,.10],.016,metal,g);box(0,3.42,.22,1.8,.035,.16,luminous(amber),g);}
 // Welcome lounge: upholstered bench, scripts, coffee and a running order.
 const lounge=group(3.19,0,12.7,-Math.PI/2);box(0,.42,0,1.9,.28,.64,mat(teal,0,.98),lounge,.13);box(0,.8,-.25,1.9,.64,.18,mat(teal,0,.98),lounge,.09);for(const x of [-.8,.8])rod([x,.07,-.2],[x,.31,.22],.035,metal,lounge);for(const x of [-.52,.05,.60])box(x,.63,-.08,.5,.09,.47,mat('#164b55',0,.98),lounge,.07);
 cyl(2.9,.43,10.8,.42,.065,mat(wood,0,.6));cyl(2.9,.21,10.8,.035,.42,metal);cyl(2.9,.58,10.8,.072,.23,cream);box(2.71,.48,10.9,.22,.016,.33,navy,world,.008);panel(['ЭФИР','23 / 12'],2.71,.491,10.9,.19,.28,{bg:cream,color:navy}).mesh.rotation.x=-Math.PI/2;
 collisions.push({x:3.15,z:12.7,w:1.15,d:2.25},{x:2.9,z:10.8,w:1.1,d:1.1});
 const station=group(-3,0,13.4,Math.PI/2);box(0,.81,0,1.5,.12,.66,mat(wood,0,.7),station,.04);for(const x of [-.6,.6])box(x,.39,0,.06,.78,.5,navy,station);box(-.3,1.15,-.07,.68,.49,.065,navy,station,.025);panel(['В ЭФИРЕ СКОРО','23.12 / 14:00'],-.3,1.15,-.028,.60,.40,{parent:station,bg:teal,color:cream});box(.4,.92,.08,.23,.08,.3,navy,station,.025);for(let i=0;i<4;i++)box(.4,.97+i*.008,.08,.22,.008,.29,cream,station);person(-2.65,14.7,-.55,'check');collisions.push({x:-3,z:13.4,w:1.15,d:1.8},{x:-2.65,z:14.7,w:.75,d:.75});
 caseBox(-3.15,8.5,.9);const upperCase=caseBox(-3.15,8.5,.72);upperCase.position.y=.7;panel(['КАМЕРА 02','ОСТОРОЖНО'], -3.15,.93,8.87,.57,.22,{bg:navy,color:cream});
 // A single TV palette artefact belongs on the gallery wall, never between site sections.
 const testcard=group(3.75,0,-7.2,-Math.PI/2);box(0,2.23,0,1.7,1.08,.09,navy,testcard,.045);['#fff',ice,blue,teal,navy,'#ff5601'].forEach((c,i)=>box(-.64+i*.255,2.27,.057,.25,.70,.012,luminous(c),testcard));panel(['НАСТРОЙКА НА ПРАЗДНИК'],0,1.80,.067,1.5,.20,{parent:testcard,bg:navy,color:cream});
 // Each room receives a distinct material and practical-light layer.
 for(const [cx,z,depth] of [[-10.5,2,13.8],[10.5,2,13.8],[-10.5,20,11.8],[10.5,20,11.8],[10.5,-9,7.8]]){
  // Real floor strips make the spaces tactile without a large baked scene image.
  for(let x=cx-6.15;x<cx+6.2;x+=.7)box(x,.011,z,.687,.022,depth,mat(boards[Math.abs(Math.round(x*4))%4],0,.86));
  for(const sx of [-5.9,5.9]){box(cx+sx,1.1,z,.08,2.1,depth-.1,mat('#e5f3f7',.1,.35));for(let zz=z-depth/2+.15;zz<z+depth/2-.1;zz+=.33)box(cx+sx,2.95,zz,.11,1.65,.07,mat(wood,0,.82));}
 }
 // Game studios: velvet legs and illuminated portals around the existing games.
 for(const cx of [-10.5,10.5]){for(const s of [-1,1]){for(let i=0;i<9;i++)cyl(cx+s*(4.4+i*.16),2.2,-4.57,.105,4.3,mat(s<0?'#123841':'#154651',0,1));box(cx+s*3.8,2.1,-4.52,.05,3.65,.07,luminous(blue));}festoon([cx-5.5,-4.0],[cx+5.5,-4.0],3.8);}
 // Radio desk: walnut joinery, warm task lights and tactile records.
 for(let i=0;i<30;i++)box(-15.65+i*.355,2.1,14.26,.13,3.75,.065,mat(i%2?wood:'#007f97',0,.8));box(-10.5,.55,17.9,6.4,.89,.08,mat(wood,0,.72));for(let i=0;i<34;i++)box(-13.55+i*.184,.55,17.96,.045,.82,.06,mat('#00acc6',.3,.28));
 for(const x of [-13.5,-7.5]){cyl(x,1.2,17.7,.18,.06,teal);rod([x,1.23,17.7],[x,1.8,17.7],.017,metal);cyl(x,1.9,17.7,.23,.20,teal,world,.10);cyl(x,1.80,17.7,.21,.018,luminous(amber));}festoon([-16,14.6],[-5,14.6],4.05);
 // Morning mail: a soft editorial rug, warm wood desk fascia and shelves of letters.
 box(10.5,.025,20.1,8.6,.022,7.1,mat('#214d57',0,1));box(10.5,.56,18.41,6.2,.85,.065,mat(wood,0,.8));for(let i=0;i<24;i++)box(7.55+i*.26,.56,18.46,.035,.81,.04,mat('#00acc6',.2,.3));
 for(const z of [15.7,18.2]){box(16.15,1.7,z,.36,.06,2.0,wood);for(let i=0;i<8;i++)box(16.1,1.82+(i%2)*.025,z-.75+i*.2,.28,.19,.12,i%3?cream:blue);}
 festoon([5.2,14.6],[15.8,14.6],4.05);
 // Dressing room: actual collection images and warm mirror bulbs already in scene.
 art('/merch/crew.webp',6.12,2.2,-9.2,2.6,1.46,world,Math.PI/2);box(10.5,.027,-9,8.5,.025,3.5,mat('#244850',0,1));
 // Lottery: acoustic timber wings, soft drapery and a festive proscenium.
 for(const side of [-1,1])for(let z=-33.8;z<-14;z+=.30)box(side*9.84,3,z,.08,5.8,.045,mat(wood,0,.85));
 for(const side of [-1,1]){for(let i=0;i<10;i++)cyl(side*(7.5+i*.18),3,-34.3,.13,6,mat('#005564',0,.98));rod([side*9,5.8,-33.5],[side*9,5.8,-16],.028,navy);for(let z=-33;z<-16;z+=.55)sphere(side*9,5.72,z,.045,luminous(amber));}
 festoon([-8,-27],[8,-27],5.7);
 // KV collection: continuous chrome portals, recessed enamel panels and physical screens.
 const chrome=mat('#c6dce5',.92,.16),enamel=mat(blue,.3,.22),white=mat('#ffffff',.15,.25);
 for(const z of [24,12,-.5,-11.7]){
  for(const side of [-1,1]){box(side*3.73,2.16,z,.24,4.3,.35,enamel,world,.10);box(side*3.59,2.16,z+.19,.045,4.08,.035,luminous(ice),world,.015);}
  box(0,4.22,z,7.5,.22,.35,enamel,world,.09);box(0,4.10,z+.19,7.15,.025,.035,luminous('#ffffff'));
 }
 for(const side of [-1,1]){box(side*1.62,.052,6.5,.025,.012,38.5,luminous(ice));box(side*3.77,.20,6.5,.035,.035,38.5,chrome);}
 // Exact supplied KV on a wall-mounted broadcast display, visible on turning towards the entrance.
 const welcome=group(0,0,25.72,Math.PI);box(0,2.35,0,5.8,3.38,.20,enamel,welcome,.12);box(0,2.35,.12,5.6,3.18,.06,chrome,welcome,.07);art('/brand/invitro-kv-2026.webp',0,2.35,.16,5.44,3.063,welcome);
 // Studio prosceniums frame the existing game boards; no doorway or target is obstructed.
 for(const cx of [-10,10]){
  for(const side of [-1,1]){box(cx+side*4.7,2.3,-4.35,.36,4.5,.35,white,world,.14);box(cx+side*4.46,2.3,-4.12,.05,4.18,.04,luminous(ice));}
  box(cx,4.35,-4.35,9.5,.3,.35,enamel,world,.13);
  for(const side of [-1,1]){box(cx+side*3.75,.20,1,.06,.06,6,chrome);box(cx+side*3.67,.20,1,.024,.024,6,luminous(ice));}
 }
 // Radio: curved white canopy and chrome reveals around the warm miniature-world palette.
 for(const side of [-1,1]){box(-10.5+side*5.5,2.2,14.44,.24,4.2,.24,enamel,world,.10);box(-10.5+side*5.3,2.2,14.58,.035,3.8,.03,luminous(ice));}
 box(-10.5,4.18,14.44,11.2,.25,.3,white,world,.11);
 box(-10.5,1.03,17.99,6.6,.035,.08,luminous(ice));
 // Main broadcast stage: three nested equipment-like portal frames.
 for(let i=0;i<3;i++){const w=17-i*.6,z=-34.0+i*.24,h=5.8-i*.15;for(const side of [-1,1])box(side*w/2,h/2,z,.16,h,.15,i===1?chrome:enamel,world,.06);box(0,h,z,w,.16,.15,i===1?chrome:enamel,world,.06);}
 for(const side of [-1,1]){const g=group(side*8.5,0,-25,side<0?.28:-.28);box(0,2.7,0,2.45,4.5,.28,enamel,g,.12);art('/brand/invitro-kv-2026.webp',0,3.28,.16,2.25,1.266,g);panel(['23 ДЕКАБРЯ','14:00 МСК'],0,1.96,.16,2.1,.72,{parent:g,bg:teal});collisions.push({x:side*8.5,z:-25,w:2.6,d:.8});}

}
