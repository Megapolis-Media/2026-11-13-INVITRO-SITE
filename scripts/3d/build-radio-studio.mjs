/** INVITRO miniature broadcast studio. Reconstructed geometry, brand palette from Slide111.
 * Each working part is an independent named node. Static parts are merged by material.
 * No generated logo: the approved raster fragment is applied by the viewer.
 */
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import fs from 'node:fs/promises';
globalThis.FileReader=class{readAsArrayBuffer(b){b.arrayBuffer().then(x=>{this.result=x;this.onloadend?.()})}readAsDataURL(b){b.arrayBuffer().then(x=>{this.result='data:'+b.type+';base64,'+Buffer.from(x).toString('base64');this.onloadend?.()})}};
const root=new T.Group();root.name='INVITRO_RADIO_ATELIER';
const materials=[];
function mat(name,color,roughness=.4,metalness=0,extra={}){const m=new T.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:/enamel|lacquer/.test(name)?1:0,clearcoatRoughness:.12,...extra});m.name=name;materials.push(m);return m}
const white=mat('Porcelain enamel','#ffffff',.22,.08),blue=mat('INVITRO Blue enamel','#00acc6',.24,.28),teal=mat('Dark teal lacquer','#005564',.3,.2),navy=mat('Broadcast anodised chassis','#0b2231',.36,.48),silver=mat('Machined aluminium','#d6e3e7',.23,.85),satin=mat('Satin aluminium','#879da7',.48,.78),black=mat('Rubber and vinyl','#101a21',.65,.12),fabric=mat('Acoustic wool','#28454d',.98),snow=mat('Fresh snow','#f3fcff',.9),knit=mat('Teal knitted wool','#007887',.98),orange=mat('Fiery Orange','#ff5601',.32),paper=mat('Record sleeve ivory','#ebdbbf',.82),ice=mat('Ice blue','#6ed2e6',.34,.15);
const led=mat('Warm white bulbs','#fff5df',.2,0,{emissive:0xffddb0,emissiveIntensity:2.3}),cyan=mat('Cyan LEDs','#8eeeff',.25,0,{emissive:0x6ed2e6,emissiveIntensity:1.35}),amber=mat('Orange tally','#ff5601',.3,0,{emissive:0xff5601,emissiveIntensity:1.1}),vu=mat('VU ivory backlight','#ffefd3',.4,0,{emissive:0xffdd9d,emissiveIntensity:.4});
const dynamic=[];
function group(name,x=0,y=0,z=0,p=root,animated=false){const g=new T.Group();g.name=name;g.position.set(x,y,z);p.add(g);if(animated){g.userData.animated=true;dynamic.push(g)}return g}
function mesh(g,m,x=0,y=0,z=0,p=root,name=''){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.name=name;p.add(o);return o}
function box(w,h,d,m,x,y,z,p=root,r=.035){return mesh(new RoundedBoxGeometry(w,h,d,1,Math.min(w,h,d,r*4)*.24),m,x,y,z,p)}
function cyl(a,b,h,m,x,y,z,p=root,n=32){return mesh(new T.CylinderGeometry(a,b,h,n),m,x,y,z,p)}
function sphere(r,m,x,y,z,p=root,sx=1,sy=1,sz=1){const o=mesh(new T.SphereGeometry(r,r<.05?8:24,r<.05?6:16),m,x,y,z,p);o.scale.set(sx,sy,sz);return o}
function torus(r,t,m,x,y,z,p=root,arc=Math.PI*2){return mesh(new T.TorusGeometry(r,t,6,48,arc),m,x,y,z,p)}
function rod(a,b,r,m,p=root,n=8){const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A),o=mesh(new T.CylinderGeometry(r,r,d.length(),n),m,0,0,0,p);o.position.copy(A.add(B).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o}
function curve(points,r,m,p=root,steps=24){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),steps,r,5,false),m,0,0,0,p)}
const font=new FontLoader().parse(JSON.parse(await fs.readFile('scripts/3d/radio-font.json','utf8')));
function text(s,size,x,y,z,m=white,p=root){const g=new TextGeometry(s,{font,size,depth:.0018,curveSegments:2});g.computeBoundingBox();g.translate(-(g.boundingBox.max.x-g.boundingBox.min.x)/2,0,0);return mesh(g,m,x,y,z,p)}
function screw(x,y,z,p=root){const o=cyl(.014,.014,.012,silver,x,y,z,p,8);o.rotation.x=Math.PI/2;box(.015,.003,.003,navy,x,y,z+.008,p)}
function screwTop(x,y,z,p=root){cyl(.009,.009,.006,silver,x,y,z,p,8);box(.011,.002,.002,black,x,y+.004,z,p)}
function discFront(r,depth,m,x,y,z,p=root){const o=cyl(r,r,depth,m,x,y,z,p);o.rotation.x=Math.PI/2;return o}
// The glass globe encloses a deep miniature room. A porcelain lower bowl replaces gold.
const radius=2.78;
// A slim polished base lets the clear glass silhouette carry the object.
cyl(2.36,2.30,.22,blue,0,-1.56,0,root,96);
cyl(2.365,2.365,.028,silver,0,-1.435,0,root,96);
cyl(2.28,2.28,.055,white,0,-1.395,0,root,96);
cyl(1.96,1.96,.016,teal,0,-1.355,0,root,96);
// Curved acoustic room, individual milled ribs and fabric backing.
for(let i=0;i<47;i++){const a=-1.1+i*2.2/46;const x=Math.sin(a)*2.02,z=-Math.cos(a)*1.39;const panel=box(.088,2.68,.095,i%4===0?teal:fabric,x,.035,z);panel.rotation.y=-a*.62;const rib=box(.019,2.66,.023,teal,x+.036,.055,z+.061);rib.rotation.y=-a*.62;}
curve([[-1.78,1.39,-.62],[-1.24,1.42,-1.15],[0,1.42,-1.43],[1.24,1.42,-1.15],[1.78,1.39,-.62]],.055,silver);
curve([[-1.77,1.335,-.59],[-1.22,1.365,-1.11],[0,1.365,-1.38],[1.22,1.365,-1.11],[1.77,1.335,-.59]],.012,cyan);
// Large single editorial display replaces the repeated wall wordmark.
box(2.23,.86,.10,silver,0,.93,-1.18,root,.04);box(2.16,.79,.024,navy,0,.93,-1.122);
mesh(new T.PlaneGeometry(2.08,.774),navy,0,.93,-1.10,root,'NowPlaying');
box(.12,.018,.008,cyan,0,.535,-1.09);
// Studio speakers on miniature stands, concentric cones, gaskets and cabinet screws.
for(const x of [-1.71,1.72]){
 const p=group('Nearfield monitor',x,.17,-.68);p.rotation.y=-Math.sign(x)*.18;
 box(.36,.65,.29,navy,0,0,0,p,.03);
 for(const [y,r] of [[-.115,.128],[.178,.057]]){
  discFront(r,.018,black,0,y,.15,p);discFront(r*.83,.016,satin,0,y,.165,p);discFront(r*.65,.02,fabric,0,y,.182,p);sphere(r*.27,black,0,y,.199,p,1,1,.33);torus(r*.91,.006,silver,0,y,.17,p);
 }
 for(const a of [-1,1])for(const b of [-1,1])screw(a*.14,b*.278,.151,p);
 box(.023,.012,.006,cyan,.12,-.245,.15,p);rod([0,-.34,0],[0,-1.40,0],.035,silver,p);box(.32,.035,.3,navy,0,-1.44,0,p);
}
// Open tape-machine rack at the left, with separate rotating reels and visible tape path.
const tape=group('Tape machine',-1.10,-.36,-.61);tape.rotation.y=.06;
box(.81,1.46,.4,teal,0,0,0,tape);box(.75,1.37,.025,silver,0,0,.218,tape);
for(const x of [-.34,.34])for(const y of [-.63,.64])screw(x,y,.238,tape);
for(let index=0;index<2;index++){
 const reel=group('Reel_'+index,index===0?-.20:.20,.40,.28,tape,true);
 discFront(.175,.027,black,0,0,0,reel);discFront(.158,.029,silver,0,0,.02,reel);torus(.168,.011,silver,0,0,.041,reel);discFront(.061,.04,navy,0,0,.043,reel);
 for(let j=0;j<3;j++){const a=j*Math.PI*2/3;const hole=sphere(.052,navy,Math.cos(a)*.106,Math.sin(a)*.106,.039,reel,1,1,.13);hole.rotation.z=a;}
 discFront(.025,.055,silver,0,0,.067,reel);for(let j=0;j<16;j++)torus(.079+j*.004,.0012,navy,0,0,.038,reel);
}
curve([[-.33,.29,.31],[-.26,.11,.30],[-.08,.065,.31],[.08,.065,.31],[.26,.11,.30],[.33,.29,.31]],.007,black,tape);
for(const x of [-.26,.26]){discFront(.035,.04,navy,x,.11,.285,tape);discFront(.018,.049,silver,x,.11,.308,tape)}
box(.17,.085,.065,navy,0,.076,.267,tape);box(.13,.06,.014,silver,0,.082,.309,tape);
for(const x of [-.19,.19]){box(.25,.155,.028,navy,x,-.10,.25,tape);box(.22,.115,.01,vu,x,-.098,.269,tape);for(let j=0;j<7;j++)box(.005,.01+(j%3===0?.01:0),.006,black,x-.085+j*.028,-.064,.277,tape);rod([x,-.14,.281],[x-.045,-.071,.281],.003,orange,tape)}
for(let j=0;j<5;j++){box(.071,.05,.03,j===0?orange:navy,-.22+j*.11,-.275,.257,tape);box(.019,.008,.007,white,-.22+j*.11,-.269,.277,tape)}
for(let j=0;j<3;j++)for(let k=0;k<13;k++)box(.026,.005,.006,navy,-.3+k*.05,-.415+j*.035,.24,tape);
for(const x of [-.24,.24]){discFront(.06,.025,navy,x,-.55,.267,tape);discFront(.047,.036,silver,x,-.55,.277,tape);box(.004,.029,.007,white,x,-.53,.298,tape)}
text('STEREO • 38 cm/s',.036,0,-.64,.255,navy,tape);
// Record library and foreground crate: individual covers, spines and partially exposed discs.
function sleeves(p,count,width,y,z){for(let j=0;j<count;j++){const x=-width/2+j*width/count,cover=[teal,white,ice,paper,navy][j%5];const b=box(.021,.40+(j%3)*.009,.30,cover,x,y,z,p,.001);b.rotation.z=(j%4-1.5)*.017;box(.004,.034,.007,orange,x,y+.1,z+.154,p,.001)}}
const shelf=group('Vinyl library',1.52,-.67,-.28);shelf.rotation.y=-.45;
for(const y of [-.56,-.04,.47])box(.59,.04,.41,white,0,y,0,shelf);for(const x of [-.30,.30])box(.036,1.04,.40,silver,x,-.05,0,shelf);
sleeves(shelf,17,.53,.24,.02);sleeves(shelf,16,.53,-.30,.02);
const crate=group('Records crate',1.52,-1.05,.58);crate.rotation.y=-.18;
box(.54,.29,.45,teal,0,0,0,crate);box(.48,.05,.39,navy,0,.152,0,crate);
for(let j=0;j<7;j++){const cover=box(.41,.43,.014,[white,ice,paper,blue,navy][j%5],0,.23,-.15+j*.05,crate,.004);cover.rotation.x=-.10;}
box(.35,.35,.008,blue,0,.23,.165,crate,.002);discFront(.124,.014,black,0,.244,.174,crate);discFront(.039,.016,orange,0,.244,.184,crate);text('ЗИМА',.049,0,.382,.185,white,crate);
for(const x of [-.28,.28])box(.008,.065,.13,silver,x,.025,0,crate);
// Desk: an oval worktop, radial enamel slats and a white luminous edge.
const desk=group('Broadcast desk',0,-.77,.61);
const top=cyl(1,1,.115,white,0,.11,0,desk,96);top.scale.set(1.44,1,.63);
const edge=cyl(1,1,.036,silver,0,.044,0,desk,96);edge.scale.set(1.45,1,.64);
const body=cyl(1,1,.60,teal,0,-.25,0,desk,80);body.scale.set(1.37,1,.56);
for(let i=0;i<47;i++){const a=i*Math.PI/46;const slat=box(.026,.52,.036,i%3===0?blue:teal,Math.cos(a)*1.365,-.23,Math.sin(a)*.563,desk,.008);slat.rotation.y=Math.PI/2-a;}
const bottom=cyl(1,1,.025,silver,0,-.55,0,desk,64);bottom.scale.set(1.36,1,.56);
// Keep the desk front clear: branding is provided by the surrounding page.
// Fir garland under desk lip: hundreds of discrete needles plus tiny practical bulbs.
const garlandPoints=[];for(let i=0;i<=50;i++){const a=.08+i*(Math.PI-.16)/50;const x=Math.cos(a)*1.43,z=Math.sin(a)*.653,y=-.03-.08*Math.sin(a*3)**2;garlandPoints.push([x,y,z]);for(let n=0;n<3;n++){const q=n*2.1+i;rod([x,y,z],[x+Math.cos(q)*.072,y-.03-Math.sin(q)*.045,z+.038],.006,teal,desk,5)}}
curve(garlandPoints,.01,navy,desk,60);for(let i=2;i<49;i+=3){const p=garlandPoints[i];sphere(.018,led,p[0],p[1],p[2]+.024,desk)}
// 10-channel compact broadcast console. Knob collars, fader scales, caps, labels and screws.
const consoleP=group('Precision mixer',0,-.57,.73);consoleP.rotation.x=.18;
box(1.02,.10,.57,navy,0,0,0,consoleP,.025);for(const x of [-.53,.53])box(.035,.11,.59,silver,x,0,0,consoleP,.01);
for(let ch=0;ch<10;ch++){
 const x=-.45+ch*.10;
 box(.005,.006,.51,satin,x+.045,.054,0,consoleP);
 for(let k=0;k<3;k++){cyl(.017,.019,.015,black,x,.061,-.207+k*.055,consoleP,12);cyl(.013,.013,.021,k===0?ice:silver,x,.074,-.207+k*.055,consoleP,12);box(.002,.004,.009,navy,x,.087,-.207+k*.055,consoleP)}
 box(.011,.006,.185,black,x,.056,.08,consoleP);
 for(let j=0;j<7;j++)box(.022,.004,.002,satin,x+.022,.057,.0+j*.026,consoleP);
 box(.048,.02,.025,white,x,.075,.021+(ch%4)*.031,consoleP,.004);box(.03,.003,.003,navy,x,.087,.021+(ch%4)*.031,consoleP);
 box(.04,.012,.024,ch<2?orange:ice,x,.067,.223,consoleP,.003);
 text(String(ch+1),.015,x,-.031,.29,white,consoleP);
}
for(const x of [-.45,.45])for(const z of [-.25,.25])screwTop(x,.062,z,consoleP);
// Stereo meters on the meter bridge, behind the desk edge.
box(.42,.14,.045,navy,0,-.40,.40);for(let i=0;i<16;i++)box(.017,.010,.009,i>12?amber:cyan,-.175+i*.023,-.415,.428);
// Full turntables: grooved rotating vinyl, platter studs, tonearm gimbal, cartridge and controls.
for(const [index,x] of [[0,-.91],[1,.91]]){
 const deck=group('Turntable_'+index,x,-.575,.65);deck.rotation.y=index===0?.10:-.10;
 box(.64,.095,.53,navy,0,0,0,deck,.025);box(.61,.017,.5,satin,0,.057,0,deck,.022);
 for(const xx of [-.255,.255])for(const zz of [-.195,.195])cyl(.036,.045,.06,black,xx,-.074,zz,deck,12);
 cyl(.217,.217,.04,silver,-.045,.084,0,deck,64);for(let j=0;j<52;j++){const a=j*Math.PI/26;sphere(.005,black,-.045+Math.cos(a)*.216,.084,Math.sin(a)*.216,deck)}
 const record=group('Vinyl_'+index,-.045,.109,0,deck,true);cyl(.204,.204,.008,black,0,0,0,record,64);
 for(let j=0;j<17;j++){const r=torus(.074+j*.0073,.0012,satin,0,.005,0,record);r.rotation.x=Math.PI/2;}
 cyl(.062,.062,.009,index===0?blue:orange,0,.005,0,record,40);box(.074,.003,.008,white,0,.012,.026,record);cyl(.005,.005,.023,silver,0,.015,0,record,8);
 cyl(.032,.044,.07,silver,.225,.10,-.156,deck,20);cyl(.021,.025,.055,navy,.225,.151,-.156,deck,16);
 curve([[.225,.173,-.156],[.23,.169,-.07],[.19,.164,.02],[.10,.16,.135]],.009,silver,deck);
 box(.046,.025,.046,navy,.098,.15,.137,deck,.005);box(.023,.014,.022,orange,.088,.133,.144,deck,.002);
 box(.03,.006,.156,black,.275,.071,.045,deck);box(.039,.017,.018,white,.275,.08,.029,deck);
 box(.055,.02,.038,white,-.258,.077,.212,deck,.005);sphere(.01,amber,-.225,.072,-.215,deck);for(let j=0;j<3;j++)box(.028,.012,.018,black,-.265+j*.045,.072,-.22,deck);
}
// A tactile snowman DJ, an intentionally crafted miniature rather than a generic human avatar.
const dj=group('Snowman DJ',0,-.13,.03,root,true);dj.scale.setScalar(1.13);
sphere(.34,snow,0,-.22,0,dj,1,1.13,.86);sphere(.259,snow,0,.29,0,dj,1,1,.97);
for(const x of [-.077,.077])sphere(.018,navy,x,.31,.247,dj,1,1,.6);
const nose=mesh(new T.ConeGeometry(.036,.145,18),orange,0,.258,.292,dj);nose.rotation.x=Math.PI/2;
for(let i=0;i<6;i++){const a=.25+i*.53;sphere(.008,navy,-.074+ i*.03,.17-.026*Math.sin(a),.228,dj)}
// Ribbed knitted beanie, folded brim, pom-pom and individually modelled stitch columns.
sphere(.265,knit,0,.47,-.012,dj,1,.73,1);cyl(.261,.261,.083,teal,0,.414,-.012,dj,48);
for(let i=0;i<48;i++){const a=i*Math.PI/24;rod([Math.cos(a)*.264,.383,Math.sin(a)*.264-.012],[Math.cos(a)*.264,.455,Math.sin(a)*.264-.012],.0045,ice,dj,5);}
for(let i=0;i<34;i++){const a=i*Math.PI/17;const pts=[];for(let j=0;j<9;j++){const h=j/8*Math.PI/2;pts.push([Math.cos(a)*.26*Math.cos(h),.46+.21*Math.sin(h),-.012+Math.sin(a)*.26*Math.cos(h)])}curve(pts,.0035,teal,dj,12)}
sphere(.066,knit,.024,.692,-.014,dj);for(let i=0;i<30;i++){const a=i*2.4;sphere(.011,ice,.024+Math.cos(a)*.052,.68+(i%7)*.008,-.014+Math.sin(a)*.052,dj)}
// Scarf wraps around neck; stitches and fringes are real geometry.
const scarf=torus(.247,.046,knit,0,.027,0,dj);scarf.rotation.x=Math.PI/2;
const tail=box(.106,.35,.053,knit,.178,-.16,.277,dj,.016);tail.rotation.z=.17;
for(let j=0;j<7;j++){rod([.126+j*.014,-.302,.304],[.12+j*.014,-.367,.308],.0048,ice,dj,6);for(let k=0;k<9;k++)box(.004,.011,.003,teal,.13+j*.012,-.27+k*.032,.307,dj)}
for(const y of [-.14,-.30,-.44])sphere(.021,navy,0,y,.303,dj,1,1,.4);
// Headphones, metal yokes, sewn pads, flexible coiled lead.
for(const side of [-1,1]){sphere(.10,black,side*.27,.30,0,dj,.35,1,.85);sphere(.082,silver,side*.302,.30,0,dj,.20,1,.83);box(.016,.11,.098,teal,side*.322,.30,0,dj);rod([side*.292,.30,-.07],[side*.29,.47,-.03],.014,silver,dj)}
const band=torus(.307,.022,navy,0,.37,-.016,dj,Math.PI);const padding=torus(.285,.015,black,0,.37,-.016,dj,Math.PI);
const left=group('DJHand_left',-.27,-.19,.03,dj,true),right=group('DJHand_right',.27,-.19,.03,dj,true);
for(const [p,side] of [[left,-1],[right,1]]){rod([0,0,0],[side*.16,-.16,.34],.077,knit,p,16);sphere(.084,white,side*.175,-.183,.388,p,1,.52,1.1);for(let j=0;j<5;j++)rod([side*.16-.045+j*.016,-.19,.39],[side*.16-.045+j*.016,-.2,.43],.009,snow,p,7)}
curve([[-.30,.22,-.035],[-.37,.08,.06],[-.34,-.31,.18],[-.47,-.40,.22]],.009,black,dj);
// Articulated microphone at left: springs, parallel arms, shock mount and wire grille.
const mic=group('Broadcast microphone',-.73,-.56,.24);
cyl(.086,.10,.021,satin,0,0,0,mic);rod([0,0,0],[0,.48,-.05],.018,silver,mic);
rod([0,.45,-.05],[.26,.68,-.05],.018,navy,mic);rod([.025,.40,-.05],[.285,.63,-.05],.012,silver,mic);
rod([.26,.68,-.05],[.37,.49,.10],.018,navy,mic);rod([.29,.65,-.05],[.4,.46,.10],.012,silver,mic);
for(const [x,y,z] of [[0,.43,-.05],[.274,.658,-.05],[.38,.47,.10]])discFront(.034,.029,silver,x,y,z,mic);
const capsule=mesh(new T.CapsuleGeometry(.055,.13,6,16),satin,.38,.38,.1,mic);
for(let i=0;i<11;i++){const r=torus(.056,.0038,navy,.38,.303+i*.014,.1,mic);r.rotation.x=Math.PI/2;}
for(let i=0;i<9;i++){const a=i*Math.PI*2/9;rod([.38+Math.sin(a)*.056,.304,.1+Math.cos(a)*.056],[.38+Math.sin(a)*.056,.445,.1+Math.cos(a)*.056],.002,satin,mic,5)}
for(const y of [.31,.37]){const r=torus(.077,.006,navy,.38,y,.1,mic);r.rotation.x=Math.PI/2}
curve([[.38,.28,.1],[.43,.22,.12],[.32,.18,.06],[0,.08,0],[.04,-.1,.05]],.008,black,mic);
// Desk lamp, ceramic mug, headphones hook, cue sheet and pencil.
const lamp=group('Desk lamp',.76,-.58,-.03);cyl(.092,.1,.019,teal,0,0,0,lamp);curve([[0,0,0],[.015,.24,0],[-.06,.46,0],[-.19,.47,.04]],.015,satin,lamp);const shade=mesh(new T.SphereGeometry(.133,24,12,0,Math.PI*2,0,Math.PI/2),teal,-.19,.44,.04,lamp);cyl(.123,.123,.01,led,-.19,.441,.04,lamp);
const cup=group('Ceramic mug',-1.24,-.49,.38);cyl(.067,.055,.14,white,0,0,0,cup);cyl(.051,.051,.005,navy,0,.071,0,cup);torus(.041,.01,white,.079,0,0,cup);mesh(new T.PlaneGeometry(.08,.0204),white,0,0,.064,cup,'WordmarkMug');
box(.23,.004,.16,paper,.44,-.586,.36);for(let i=0;i<6;i++)box(.12+(i%2)*.05,.002,.002,satin,.44,-.582,.32+i*.014);rod([.56,-.575,.30],[.61,-.575,.46],.007,orange);
// Snow-dusted fir: irregular needle branches, visible trunk, ornaments and a helical light string.
const tree=group('Snowy fir',-1.61,-1.28,.32);cyl(.045,.067,.34,teal,0,.1,0,tree,12);
for(let level=0;level<9;level++){const y=.13+level*.135,rr=.35*(1-level/10);for(let j=0;j<11;j++){const a=j*Math.PI*2/11+level*.91;const end=[Math.cos(a)*rr,y-.055,Math.sin(a)*rr];rod([0,y+.11,0],end,.009,teal,tree,5);for(let k=1;k<6;k++){const f=k/6,px=end[0]*f,pz=end[2]*f,py=y+.11-.165*f;const spread=.055*(1-f*.4);rod([px,py,pz],[px+Math.cos(a+.8)*spread,py-.03,pz+Math.sin(a+.8)*spread],.005,teal,tree,4);rod([px,py,pz],[px+Math.cos(a-.8)*spread,py-.03,pz+Math.sin(a-.8)*spread],.005,teal,tree,4);if((k+j)%3===0)sphere(.014,snow,px,py+.008,pz,tree,2.2,.65,1.2);}}
}
const string=[];for(let i=0;i<94;i++){const y=.16+i*.0115,r=.335*(1-y/1.5),a=i*.34;string.push([Math.cos(a)*r,y,Math.sin(a)*r]);if(i%4===0)sphere(.013,led,...string[i],tree);if(i%13===0)sphere(.037,i%2?orange:silver,Math.cos(a)*r,y-.028,Math.sin(a)*r,tree)}curve(string,.005,navy,tree,100);sphere(.045,white,0,1.39,0,tree);
for(const [x,z,s] of [[-.19,.17,.16],[.16,.17,.12]]){box(s,s,s,blue,x,s/2,z,tree,.014);box(s+.004,.022,s+.004,white,x,s*.54,z,tree,.001);box(.02,s+.004,s+.004,white,x,s/2,z,tree,.001)}
// Warm miniature fairy lights trace the room arch; electrical cable is kept visible.
const fairy=[];for(let i=0;i<=44;i++){const a=-1.1+i*2.2/44;fairy.push([Math.sin(a)*2.0,1.26-.04*Math.cos(i*.8),-Math.cos(a)*1.32]);if(i%2===0)sphere(.018,led,...fairy[i])}curve(fairy,.006,navy,root,60);
// Pendants: cable, enamel reflector, warm diffuser and visible socket.
for(const x of [-1.31,1.31]){rod([x,1.36,-.78],[x,1.27,-.78],.009,navy);cyl(.048,.072,.10,silver,x,1.27,-.78);const shade=mesh(new T.ConeGeometry(.18,.14,32,1,true),teal,x,1.16,-.78);cyl(.168,.168,.012,led,x,1.09,-.78);}
// Snow banks and granular frost at the perimeter (interior working desk stays clear).
for(let i=0;i<180;i++){const a=i*2.399963,r=1.94+(i%11)*.027,x=Math.cos(a)*r,z=Math.sin(a)*r;sphere(.012+(i%4)*.006,snow,x,-1.31+(i%3)*.012,z,root,1.4,.65,1.1)}
// Studio floor cables connect rack and console; rear patch bay has actual ports.
curve([[-1.15,-1.28,-.48],[-.75,-1.28,-.36],[-.9,-1.28,.2],[-.55,-1.29,.4]],.011,black);
curve([[1.45,-1.29,-.40],[.84,-1.29,-.65],[.69,-1.29,.15],[.73,-1.24,.38]],.012,black);
for(let i=0;i<8;i++){discFront(.022,.018,navy,-.40+i*.085,-1.17,-.99);discFront(.009,.021,silver,-.40+i*.085,-1.17,-.975)}
// Ornament shell and cap. Glass is tuned in the viewer for readable reflections.
const glass=new T.MeshPhysicalMaterial({name:'Optical glass',color:0xeaffff,roughness:.045,metalness:.12,transparent:true,opacity:1,vertexColors:true,depthWrite:false,clearcoat:1,clearcoatRoughness:.06});
const glassGeo=new T.SphereGeometry(radius,112,80,0,Math.PI*2,0,2.14);
const opticalColors=[];const eye=new T.Vector3(1.35,1.48,11.3);
for(let i=0;i<glassGeo.attributes.position.count;i++){
 const p=new T.Vector3().fromBufferAttribute(glassGeo.attributes.position,i),n=p.clone().normalize(),v=eye.clone().sub(p).normalize();
 const rim=Math.pow(1-Math.abs(n.dot(v)),3)*.48;
 // Broad, softly feathered studio softbox reflections, baked as optical vertex alpha.
 const l=Math.exp(-Math.pow((n.x+.53)/.075,2)-Math.pow((n.y-.47)/.28,2));
 const r=Math.exp(-Math.pow((n.x-.77)/.054,2)-Math.pow((n.y-.19)/.26,2));
 const alpha=.014+rim+Math.max(l*.54,r*.39)*Math.max(0,n.z);
 opticalColors.push(.93,.995,1,Math.min(.72,alpha));
}
glassGeo.setAttribute('color',new T.Float32BufferAttribute(opticalColors,4));
mesh(glassGeo,glass,0,0,0,root,'GlassShell');
cyl(.36,.40,.22,silver,0,2.77,0,root,64);cyl(.40,.42,.03,white,0,2.66,0,root,64);cyl(.37,.37,.035,silver,0,2.895,0,root,64);
for(let i=0;i<36;i++){const a=i*Math.PI/18;rod([Math.sin(a)*.393,2.67,Math.cos(a)*.393],[Math.sin(a)*.355,2.87,Math.cos(a)*.355],.007,teal)}
torus(.19,.025,silver,0,3.10,0);
// Export compact indexed batches. Preserve named labels, glass and animated hierarchies.
root.updateMatrixWorld(true);
const preserve=new Set(['NowPlaying','WordmarkBase','WordmarkDesk','WordmarkMug','GlassShell']);
function mergeStatic(container){const batches=new Map();container.updateWorldMatrix(true,true);const inv=container.matrixWorld.clone().invert();container.traverse(o=>{
 if(!o.isMesh||preserve.has(o.name))return;let p=o.parent;while(p&&p!==container){if(p.userData.animated)return;p=p.parent}if(!batches.has(o.material.uuid))batches.set(o.material.uuid,{mat:o.material,items:[],geo:[]});const b=batches.get(o.material.uuid);b.items.push(o);const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(inv.clone().multiply(o.matrixWorld));b.geo.push(g);
 });for(const b of batches.values()){const merged=mergeVertices(mergeGeometries(b.geo),.00001);b.items.forEach(o=>o.removeFromParent());const object=new T.Mesh(merged,b.mat);object.name=b.mat.name;container.add(object);b.geo.forEach(g=>g.dispose())}}
for(const g of dynamic.toReversed())mergeStatic(g);mergeStatic(root);
// Remove now-empty authoring groups, excluding pivots.
function prune(p){for(const c of [...p.children]){prune(c);if(c.isGroup&&!c.children.length)c.removeFromParent()}}prune(root);
await fs.mkdir('public/models-brand',{recursive:true});const data=await new GLTFExporter().parseAsync(root,{binary:true});await fs.writeFile('public/models-brand/RADIO_STUDIO.glb',Buffer.from(data));
let triangles=0,meshes=0;root.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3}});
console.log(JSON.stringify({file:'RADIO_STUDIO.glb',bytes:data.byteLength,meshes,triangles,animated:dynamic.map(g=>g.name)}));
