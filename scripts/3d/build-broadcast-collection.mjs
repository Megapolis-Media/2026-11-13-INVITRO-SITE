import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import fs from 'node:fs/promises';
globalThis.FileReader=class{readAsArrayBuffer(b){b.arrayBuffer().then(x=>{this.result=x;this.onloadend?.()})}readAsDataURL(b){b.arrayBuffer().then(x=>{this.result='data:'+b.type+';base64,'+Buffer.from(x).toString('base64');this.onloadend?.()})}};
const font=new FontLoader().parse(JSON.parse(await fs.readFile('scripts/3d/radio-font.json','utf8')));
const m=(name,color,roughness=.28,metalness=.15)=>Object.assign(new T.MeshStandardMaterial({color,roughness,metalness}),{name});
const blue=m('INVITRO Blue enamel','#00acc6'),white=m('White porcelain','#ffffff',.22),navy=m('Black Blue rubber','#0b2231',.5),ice=m('Blue glass','#6ed2e6',.16,.4),chrome=m('Brushed cold aluminium','#d3e4eb',.24,.8),orange=m('Fiery Orange accent','#ff5601'),dark=m('Dark teal','#005564'),vinyl=m('Vinyl grooves','#071a23',.28,.35);
let root;
function mesh(g,mat,x=0,y=0,z=0,p=root){const o=new T.Mesh(g,mat);o.position.set(x,y,z);p.add(o);return o}
function box(w,h,d,mat,x,y,z,p=root,r=.08){return mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)),mat,x,y,z,p)}
function disc(r,h,mat,x,y,z,p=root){const o=mesh(new T.CylinderGeometry(r,r,h,r<.025?8:48),mat,x,y,z,p);o.rotation.x=Math.PI/2;return o}
function ring(r,t,mat,x,y,z,p=root){return mesh(new T.TorusGeometry(r,t,6,64),mat,x,y,z,p)}
function rod(a,b,r,mat,p=root){const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A),o=mesh(new T.CylinderGeometry(r,r,d.length(),12),mat,0,0,0,p);o.position.copy(A.add(B).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o}
function text(s,size,x,y,z,mat=white,p=root){const g=new TextGeometry(s,{font,size,depth:.003,curveSegments:2});g.computeBoundingBox();g.translate(-(g.boundingBox.max.x-g.boundingBox.min.x)/2,0,0);return mesh(g,mat,x,y,z,p)}
function screw(x,y,z){disc(.018,.014,chrome,x,y,z);box(.024,.004,.003,navy,x,y,z+.009)}
function dial(x,y,z,r=.15){disc(r,.08,navy,x,y,z);disc(r*.86,.1,chrome,x,y,z+.025);box(.016,r*.6,.01,orange,x,y+r*.29,z+.08);for(let j=0;j<24;j++){const a=j*Math.PI/12;rod([x+Math.sin(a)*r*.97,y+Math.cos(a)*r*.97,z-.015],[x+Math.sin(a)*r*.97,y+Math.cos(a)*r*.97,z+.03],.004,white)}}
function feet(w,y,z){for(const x of [-w/2,w/2])box(.25,.15,.5,navy,x,y,z)}
async function save(name){root.updateMatrixWorld(true);const batches=new Map();root.traverse(o=>{if(!o.isMesh)return;let p=o.parent;while(p&&p!==root){if(p.name.startsWith('Spin'))return;p=p.parent}const b=batches.get(o.material)||{geo:[],nodes:[]};b.geo.push((o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrixWorld));b.nodes.push(o);batches.set(o.material,b)});for(const [mat,b]of batches){b.nodes.forEach(o=>o.removeFromParent());root.add(new T.Mesh(mergeVertices(mergeGeometries(b.geo)),mat))}const data=await new GLTFExporter().parseAsync(root,{binary:true});await fs.writeFile('public/models-brand/'+name+'.glb',Buffer.from(data));console.log(name,data.byteLength)}
// CRT: soft enclosure, convex glass, branded tuning grid, channel dial, ventilation, aerial.
root=new T.Group();root.name='CRT television';
box(3.55,2.6,1.48,blue,0,0,0,root,.23);box(3.46,2.5,.14,white,0,0,.75,root,.2);box(2.64,2.09,.15,navy,-.29,.06,.86,root,.18);
const screen=box(2.45,1.9,.20,ice,-.29,.06,.94,root,.16);screen.name='CRT glass';
// Physical brand test pattern, laid on convex screen face, no standard rainbow.
const colors=[white,ice,blue,dark,navy,orange];for(let i=0;i<6;i++)box(.362,1.37,.014,colors[i],-1.196+i*.362,.25,1.046,root,.003);
for(let i=0;i<16;i++)box(.136,.11,.017,i%2?navy:white,-1.2+i*.122,-.505,1.06,root,.002);
box(1.35,.30,.02,navy,-.29,.19,1.071);text('ТЕЛЕЦЕНТР',.15,-.29,.14,1.09);text('23 / 12',.10,-.29,-.76,1.05,navy);
for(const y of [.73,.22])dial(1.40,y,.90,.18);for(let i=0;i<11;i++)box(.33,.019,.012,navy,1.40,-.23-i*.052,.84);
text('INVITRO',.12,-.28,-1.1,.835,blue);disc(.037,.015,orange,1.40,-1.03,.85);feet(2.4,-1.37,0);
for(let j=0;j<14;j++)box(.018,1.4,.65,navy,1.778,0,-.28+j*.03,root,.004);
rod([-.32,1.3,-.25],[-1.08,2.1,-.3],.018,chrome);rod([.12,1.3,-.25],[.8,2.0,-.3],.018,chrome);disc(.11,.12,navy,-.1,1.25,-.25);
for(const x of [-1.59,1.6])for(const y of [-1.12,1.12])screw(x,y,.83);await save('RETRO_TV');
// FM radio: perforated grille, tuning scale, handle and telescopic antenna.
root=new T.Group();box(3.2,1.9,.88,blue,0,0,0,root,.2);box(3.06,1.77,.075,white,0,0,.46,root,.18);
disc(.63,.034,navy,-.72,-.02,.52);ring(.65,.025,chrome,-.72,-.02,.55);
for(let y=-12;y<=12;y++)for(let x=-12;x<=12;x++)if(x*x+y*y<144)disc(.012,.008,chrome,-.72+x*.048,-.02+y*.048,.55);
box(1.08,.34,.04,navy,.83,.51,.51);for(let i=0;i<23;i++)box(.009,i%5===0?.12:.06,.01,white,.36+i*.042,.53,.54);box(.018,.22,.013,orange,.9,.5,.55);text('FM  88    108',.061,.83,.38,.55,ice);
dial(.65,-.17,.55,.24);dial(1.24,-.17,.55,.12);text('НОВОГОДНЯЯ ВОЛНА',.073,.85,-.62,.51,dark);
for(let i=0;i<4;i++)box(.17,.08,.05,i===0?orange:chrome,.46+i*.23,.94,.1);
rod([-.95,.98,0],[-.95,1.36,0],.06,chrome);rod([.9,.98,0],[.9,1.36,0],.06,chrome);box(1.91,.13,.18,navy,-.025,1.39,0);
rod([1.13,.97,-.2],[1.65,2.25,-.2],.018,chrome);feet(2.3,-1.0,0);await save('RETRO_RADIO');
// Reel-to-reel: independent rotating spools, tape path, twin VU meters and transport.
root=new T.Group();box(2.7,3.0,.77,blue,0,0,0,root,.17);box(2.51,2.8,.08,chrome,0,0,.42);
for(let i=0;i<2;i++){const x=i===0?-.67:.67;const reel=new T.Group();reel.name='Spin_Reel_'+i;reel.position.set(x,.65,.53);root.add(reel);disc(.57,.075,navy,0,0,0,reel);disc(.55,.022,white,0,0,.055,reel);for(let j=0;j<3;j++){const a=j*2*Math.PI/3;disc(.14,.025,navy,Math.cos(a)*.30,Math.sin(a)*.30,.075,reel)}ring(.54,.018,chrome,0,0,.08,reel);disc(.12,.09,blue,0,0,.09,reel);disc(.035,.11,chrome,0,0,.10,reel)}
for(const [a,b]of [[[ -1.0,.34,.53],[-.75,-.11,.53]],[[-.75,-.11,.53],[.75,-.11,.53]],[[.75,-.11,.53],[1,.34,.53]]])rod(a,b,.012,navy);
for(const x of [-.75,.75])disc(.075,.08,navy,x,-.1,.51);box(.38,.22,.14,navy,0,-.08,.50);
for(const x of [-.55,.55]){box(.80,.40,.04,navy,x,-.55,.49);box(.71,.31,.02,white,x,-.55,.52);for(let j=0;j<11;j++)box(.012,.05,.01,j>7?orange:navy,x-.3+j*.06,-.48,.54);rod([x,-.65,.55],[x+.12,-.46,.55],.006,orange);text('VU',.06,x,-.67,.54,navy)}
for(let j=0;j<6;j++){box(.25,.14,.06,j===0?orange:navy,-.89+j*.35,-1.03,.49);box(.055,.027,.01,white,-.89+j*.35,-1.03,.53)}text('STEREO   /   38 cm/s',.084,0,-1.32,.48,navy);for(const x of [-1.14,1.14])for(const y of [-1.3,1.3])screw(x,y,.48);feet(1.8,-1.56,0);await save('REEL_RECORDER');
// Vinyl: real concentric grooves and separate rotating label.
root=new T.Group();const record=new T.Group();record.name='Spin_Vinyl';root.add(record);disc(1.4,.06,vinyl,0,0,0,record);for(let j=0;j<66;j++)ring(.53+j*.0125,.0027,j%4===0?dark:navy,0,0,.034,record);disc(.49,.067,blue,0,0,.01,record);disc(.085,.07,white,0,0,.018,record);disc(.025,.072,navy,0,0,.02,record);text('СНЕГ КРУЖИТСЯ',.085,0,.18,.052,white,record);text('ВИА ПЛАМЯ',.065,0,-.27,.052,white,record);text('33⅓',.056,0,-.39,.052,white,record);await save('VINYL_RECORD');
// Remote: tactile keycaps, soft enclosure, circular navigation, IR window.
root=new T.Group();box(.91,2.83,.31,white,0,0,0,root,.15);box(.82,2.69,.06,navy,0,0,.17,root,.10);disc(.105,.05,orange,-.23,1.13,.23);ring(.052,.007,white,-.23,1.13,.261);box(.01,.05,.01,white,-.23,1.17,.27);
for(let y=0;y<3;y++)for(let x=0;x<3;x++){box(.17,.16,.042,white,-.25+x*.25,.75-y*.29,.22,root,.03);text(String(y*3+x+1),.086,-.25+x*.25,.72-y*.29,.246,navy)}
ring(.28,.07,blue,0,-.45,.22);disc(.145,.042,white,0,-.45,.22);text('OK',.075,0,-.479,.247,navy);
for(let i=0;i<3;i++)box(.17,.1,.045,[white,blue,orange][i],-.25+i*.25,-1.02,.22);box(.48,.09,.02,ice,0,1.395,0);text('INVITRO',.07,0,-1.24,.22,white);await save('TV_REMOTE');

// Match the pre-existing camera and sign to the same collection materials.
root=new T.Group();box(4.5,.88,.5,white,0,0,0,root,.11);box(4.3,.69,.045,chrome,0,0,.265);box(4.11,.53,.04,dark,0,0,.3);text('ПРЯМОЙ ЭФИР',.32,0,-.12,.333,white);disc(.07,.02,orange,-1.86,0,.335);for(const x of [-2.15,2.15])for(const y of [-.3,.3])screw(x,y,.27);await save('LIVE_LIGHTBOX');
globalThis.ProgressEvent=class{constructor(type,data){Object.assign(this,{type},data)}};
const bytes=await fs.readFile('public/models/BROADCAST_CAMERA.glb');const camera=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
camera.scene.traverse(o=>{if(!o.isMesh)return;const replace=mat=>{if(/graphite/i.test(mat.name))return blue;if(/red/i.test(mat.name))return orange;if(/ivory|enamel/i.test(mat.name))return white;if(/teal/i.test(mat.name))return blue;if(/champagne|gold|aluminium/i.test(mat.name))return chrome;return mat};o.material=Array.isArray(o.material)?o.material.map(replace):replace(o.material)});
const cameraBytes=await new GLTFExporter().parseAsync(camera.scene,{binary:true});await fs.writeFile('public/models-brand/BROADCAST_CAMERA.glb',Buffer.from(cameraBytes));
