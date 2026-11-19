"""Build the compact portable radio seen in public/brand/new-year-kv-source.png.
Original editable geometry reconstructed from the image, not extracted KV layers.
Reference: body at pixels [963..1225, 871..1048] in the 2048x1143 approved KV.
Negative Y is front. The left side is visible, exactly as in the KV.
Reproduce: blender -b --factory-startup -P scripts/3d/build-kv-pocket-radio-v76.py -- --png /tmp/kv76.png --blend docs/assets/kv-pocket-radio-v76.blend --glb docs/assets/kv-pocket-radio-v76.glb
Web: magick /tmp/kv76.png -trim +repage -resize 838x -bordercolor none -border 6 -define webp:method=6 -quality 94 public/hero-v76/kv-pocket-radio.webp
"""
import sys, argparse, math
from pathlib import Path
from math import sin,cos,pi,exp,sqrt,radians
import bpy
from mathutils import Vector, noise

arg=argparse.ArgumentParser()
arg.add_argument('--png',default='/tmp/kv76.png');arg.add_argument('--proof',action='store_true')
arg.add_argument('--blend');arg.add_argument('--glb')
opt=arg.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=.1
def material(name,color,metal=0,rough=.25,coat=.2):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    for key,val in [('Base Color',(*color,1)),('Metallic',metal),('Roughness',rough),('Coat Weight',coat),('Coat Roughness',.16)]:p.inputs[key].default_value=val
    return m
white=material('Porcelain • pearl white enamel',(.85,.83,.93),.11,.25,.48)
steel=material('Blue silver • high polished case and handle',(.72,.79,.88),.99,.115,.20)
edge=material('Blue gunmetal • dark machined groove',(.033,.057,.109),.90,.25,.14)
meshBlack=material('Felt • deep acoustic shadow',(.0055,.007,.015),.03,.87,.0)
hole=material('Bore • shadow cast by pressed steel',(.045,.053,.087),.52,.37,.1)
knob=material('Turned aluminium • radial finish',(.67,.72,.79),.93,.29,.15)
orange=material('Fired amber • second face colour',(1,.155,.005),.13,.24,.72)
rubber=material('Rubber feet • blue grey',(.014,.029,.045),.06,.56,0)
snow=material('Corn snow • icy white',(.87,.93,1),0,.74,0)
nt=snow.node_tree;n=nt.nodes;l=nt.links;pr=n.get('Principled BSDF');pr.inputs['Subsurface Weight'].default_value=.055;pr.inputs['Subsurface Scale'].default_value=.07
co=n.new('ShaderNodeTexCoord');ns=n.new('ShaderNodeTexNoise');ns.inputs['Scale'].default_value=120;ns.inputs['Detail'].default_value=2.9;l.new(co.outputs['Object'],ns.inputs['Vector']);bm=n.new('ShaderNodeBump');bm.inputs['Strength'].default_value=.31;bm.inputs['Distance'].default_value=.012;l.new(ns.outputs['Fac'],bm.inputs['Height']);l.new(bm.outputs['Normal'],pr.inputs['Normal'])
def obj(name,verts,faces,mats,smooth=False,ids=None):
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update()
    o=bpy.data.objects.new(name,me);scene.collection.objects.link(o)
    for m in (mats if isinstance(mats,tuple) else (mats,)):me.materials.append(m)
    for i,p in enumerate(me.polygons):
        p.use_smooth=smooth
        if ids:p.material_index=ids[i]
    return o
def rr(w,h,r,N=10,xc=0,zc=0):
    pts=[];r=min(r,w/2,h/2)
    for x,z,base in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,pi/2),(-w/2+r,-h/2+r,pi),(w/2-r,-h/2+r,3*pi/2)]:
        for j in range(N+1):
            t=base+pi*j/(2*N);pts.append((xc+x+r*cos(t),zc+z+r*sin(t)))
    return pts
def section(pts,y):return [(x,y,z) for x,z in pts]
def roundloft(name,parts,m,cx=0,cz=0):
    rings=[section(rr(w,h,r,12,cx,cz),y) for y,w,h,r in parts];lv=len(rings[0])
    vs=sum(rings,[]);fs=[tuple(range(lv))]
    for k in range(len(rings)-1):
        for i in range(lv):
            j=(i+1)%lv;a=k*lv;fs.append((a+i,a+i+lv,a+j+lv,a+j))
    fs.append(tuple(reversed(range((len(rings)-1)*lv,len(rings)*lv))))
    o=obj(name,vs,fs,m,True);o.data.polygons[0].use_smooth=False;o.data.polygons[-1].use_smooth=False;return o
base_z=1.20
# A deep, bright chrome back with radii tightening into the white enamel front wrap.
roundloft('01  •  deep-drawn silver rear shell',[
    (-.45,4.26,2.15,.20),(-.36,4.346,2.219,.226),(-.28,4.358,2.226,.231),
    (.37,4.348,2.22,.232),(.48,4.334,2.205,.225),(.55,4.3,2.17,.217),(.605,4.229,2.099,.201),
    (.631,4.13,2.00,.182),(.638,4.04,1.92,.164)],steel,cz=base_z)
roundloft('02  •  fine seam between stampings',[
    (-.381,4.342,2.214,.224),(-.375,4.35,2.221,.228),(-.362,4.349,2.221,.227),(-.355,4.342,2.215,.225)],edge,cz=base_z)
# The front is genuinely perforated. The one-piece white face surrounds an
# inset with 21 x 18 short bores; the black mesh lies behind, not printed on it.
nx=21;nz=18;pitchx=.109;pitchz=.098;gx=-.790;gz=1.182;gw=nx*pitchx;gh=nz*pitchz
# Vary the thickness of the front liner as it turns around the cabinet.
N=10
rings=[
    section(rr(4.348,2.221,.225,N,0,base_z),-.371),
    section(rr(4.353,2.223,.225,N,0,base_z),-.489),
    section(rr(4.341,2.213,.223,N,0,base_z),-.540),
    section(rr(4.298,2.171,.207,N,0,base_z),-.584),
    section(rr(4.227,2.101,.188,N,0,base_z),-.609),
    section(rr(4.176,2.05,.17,N,0,base_z),-.6125),
    section(rr(gw,gh,.0007,N,gx,gz),-.6125)]
nc=len(rings[0]);vs=sum(rings,[]);fs=[]
for k in range(len(rings)-1):
    for i in range(nc):
        j=(i+1)%nc;a=k*nc;fs.append((a+i,a+j,a+nc+j,a+nc+i))
front=obj('03  •  white porcelain wrap / open speaker aperture',vs,fs,white,True)
for q in list(front.data.polygons)[-nc:]:q.use_smooth=False
# Shared seams between cells. Components lie in the XZ plane, +Z up,
# and front-facing normals point -Y. Inside walls change material by depth.
gv=[];gf=[];gi=[];lookup={}
def vi(x,y,z):
    key=tuple(round(v,7) for v in (x,y,z))
    if key not in lookup:lookup[key]=len(gv);gv.append((x,y,z))
    return lookup[key]
def addf(indices,ma):
    idx=list(dict.fromkeys(indices))
    if len(idx)>2:gf.append(tuple(idx));gi.append(ma)
for col in range(nx):
    for row in range(nz):
        x=gx+(col-(nx-1)/2)*pitchx;z=gz+(row-(nz-1)/2)*pitchz
        def rect(w,h,r,y):
            return [vi(px,y,pz) for px,pz in rr(w,h,r,2,x,z)]
        out=rect(pitchx,pitchz,0,-.6125)
        # Moulded, subtly rounded top left and bottom right of the grille.
        if (row==nz-1 and col==0) or (row==0 and col==nx-1):
            addf(out,0);continue
        rrings=[out,rect(.077,.074,.016,-.6125),rect(.070,.067,.013,-.6063),rect(.065,.062,.011,-.5950),rect(.065,.062,.011,-.566)]
        for k in range(4):
            for j in range(len(out)):
                a=rrings[k];b=rrings[k+1];h=(j+1)%len(out)
                addf([a[j],a[h],b[h],b[j]],[0,0,1,1][k])
obj('04  •  steel grille / machined square micro-perforations',gv,gf,(white,hole),False,gi)
roundloft('05  •  acoustic cloth, recessed behind the physical grille',[(-.557,gw+.03,gh+.035,.01),(-.540,gw+.04,gh+.04,.01)],meshBlack,gx,gz)
# Slightly bevelled rear service door and resting pads.
roundloft('06  •  pressed back cover',[(.631,3.99,1.86,.16),(.644,4.05,1.91,.18),(.660,4.008,1.87,.175),(.666,3.97,1.83,.17)],white,cz=base_z)
def solid(name,loc,size,m,r):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);ob=bpy.context.object;ob.name=name;ob.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);ob.data.materials.append(m)
    b=ob.modifiers.new('Pressed corner radius','BEVEL');b.width=r;b.segments=5
    b=ob.modifiers.new('Planar cast normals','WEIGHTED_NORMAL');return ob
for xx in (-1.56,1.56):
    for yy in (-.27,.36):
        solid('07 • recessed foot / silver mount',(xx,yy,.100),(.48,.33,.13),steel,.065)
        solid('07 • rubber heel',(xx,yy,.046),(.39,.29,.064),rubber,.032)
# Rectangular chrome strap, like the very visible U in the reference. Its oval-
# rectangular cross section has flatter broad faces than an extruded round rod.
hc=-.20;hw=1.366;hr=.153;zfeet=2.299;zt=2.928;hy=.045
path=[]
def sample(x,z,theta):path.append((x+hc,z,theta))
sample(-hw,zfeet,pi/2);sample(-hw,zt-hr,pi/2)
for j in range(1,19):
    th=pi-pi*.5*j/18;sample(-hw+hr+hr*cos(th),zt-hr+hr*sin(th),th-pi/2)
sample(hw-hr,zt,0)
for j in range(1,19):
    th=pi*.5-pi*.5*j/18;sample(hw-hr+hr*cos(th),zt-hr+hr*sin(th),th-pi/2)
sample(hw,zfeet,-pi/2)
cross=rr(.166,.270,.066,7)
hv=[];hf=[]
for x,z,th in path:
    no=(-sin(th),cos(th))
    for s,t in cross:hv.append((x+s*no[0],hy+t,z+s*no[1]))
nn=len(cross)
for k in range(len(path)-1):
    for i in range(nn):
        j=(i+1)%nn;a=k*nn;hf.append((a+i,a+i+nn,a+j+nn,a+j))
hf.append(tuple(range(nn)));hf.append(tuple(reversed(range((len(path)-1)*nn,len(path)*nn))))
handle=obj('08  •  high rectangular rolled chrome carry strap',hv,hf,steel,True)
for xx in (hc-hw,hc+hw):
    solid('09 • ferrule / handle seat',(xx,hy,2.306),(.238,.316,.064),edge,.032)
    solid('09 • handle seat / silver shoulder',(xx,hy,2.327),(.204,.295,.042),steel,.02)
# Dial is a turned, shallow radial cone with a dark polished rim and a single
# raised amber index at noon. No second large knob, scale or faux lettering.
def turning(name,x,z,pr,m,N=104,annular=False):
    vv=[];ff=[]
    for y,rad in pr:
        for j in range(N):
            th=2*pi*j/N;vv.append((x+rad*cos(th),y,z+rad*sin(th)))
    for k in range(len(pr)-1):
        for j in range(N):
            i=k*N+j;jj=k*N+(j+1)%N;ff.append((i,i+N,jj+N,jj))
    if annular:
        for j in range(N):
            h=(j+1)%N;lo=(len(pr)-1)*N;ff.append((lo+j,j,h,lo+h))
    else:
        ff.append(tuple(range(N)));ff.append(tuple(reversed(range((len(pr)-1)*N,len(pr)*N))))
    o=obj(name,vv,ff,m,True)
    if not annular:o.data.polygons[-1].use_smooth=False;o.data.polygons[-2].use_smooth=False
    return o
kx,kz=1.237,1.373
turning('10  •  tuning well / dark blue gasket',kx,kz,[(-.645,.514),(-.636,.568),(-.622,.586),(-.609,.558),(-.609,.494),(-.638,.494)],edge,annular=True)
turning('11  •  chrome tuning bezel',kx,kz,[(-.710,.528),(-.705,.554),(-.689,.568),(-.678,.575),(-.657,.578),(-.641,.567),(-.633,.542),(-.633,.512),(-.701,.512)],steel,annular=True)
turning('12  •  shadow line inside the bezel',kx,kz,[(-.727,.498),(-.718,.523),(-.698,.533),(-.681,.505),(-.691,.482),(-.707,.487)],edge,annular=True)
face=turning('13  •  spun aluminium dial / shallow conical face',kx,kz,[(-.760,.004),(-.753,.04),(-.736,.17),(-.711,.354),(-.692,.464),(-.696,.488),(-.707,.5),(-.714,.509),(-.713,.517),(-.702,.522),(-.684,.507)],knob)
# Radially brushed aluminium changes with rotation just as a turned dial does.
# Explicit radial tangent + fine lathe striations; the glTF still has metallic base.
nt=knob.node_tree;n=nt.nodes;l=nt.links;b=n.get('Principled BSDF');(b.inputs.get('Anisotropic IOR Level') or b.inputs.get('Anisotropic IOR Strength') or b.inputs.get('Anisotropic')).default_value=.85
te=n.new('ShaderNodeTexCoord');sub=n.new('ShaderNodeVectorMath');sub.operation='SUBTRACT';sub.inputs[1].default_value=(kx,-.730,kz);l.new(te.outputs['Object'],sub.inputs[0]);normal=n.new('ShaderNodeVectorMath');normal.operation='CROSS_PRODUCT';normal.inputs[1].default_value=(0,-1,0);l.new(sub.outputs['Vector'],normal.inputs[0]);l.new(normal.outputs['Vector'],b.inputs['Tangent'])
# Small warm pointer, with squared but eased chrome-television-era industrial corners.
ptr=solid('14  •  orange index at twelve',(kx+.008,-.747,kz+.226),(.105,.061,.435),orange,.045);ptr.rotation_euler.x=radians(-7.0)
bx,bz=1.679,.461
turning('15  •  power button / white recessed seat',bx,bz,[(-.624,.131),(-.619,.148),(-.607,.136)],white,64)
turning('16  •  small amber power button',bx,bz,[(-.673,.014),(-.672,.082),(-.667,.105),(-.657,.116),(-.643,.119),(-.625,.114)],orange,72)
# A few low, irregular wind-blown patches only on the top; nothing on the front
# or on the floor. They are meshed patches with small-scale texture, not spheres.
def snowpatch(name,xx,yy,ax,ay,height,seed):
    vb=[];fb=[];ring=112;steps=14
    def n(x,y,f):return noise.noise_vector(Vector((13.7+x*f+seed,3.5+y*f,seed)),noise_basis='PERLIN_ORIGINAL').x
    for frac in [1.02]+[j/steps for j in range(steps,0,-1)]:
        for j in range(ring):
            th=2*pi*j/ring
            x=cos(th)*ax;y=sin(th)*ay
            wob=1+.13*n(x,y,3.7)+.055*sin(5*th+seed)+.05*sin(9*th-seed)
            x=x*wob*min(1,frac);y=y*wob*min(1,frac)
            lip=max(0,1-min(1,frac)**3)**.53
            mound=(.62+.56*exp(-((x+.17)/(.49*ax))**2-((y-.04)/(.77*ay))**2)+.43*n(x,y,5.8)+.13*n(x,y,21))*height
            zz=2.309+mound*lip+.0042*n(x,y,31)
            if frac>1:zz=2.286
            vb.append((xx+x,yy+y,zz))
    for k in range(steps):
        for j in range(ring):
            q=(j+1)%ring;a=k*ring;fb.append((a+j,a+q,a+q+ring,a+j+ring))
    bot=len(vb);vb.append((xx,yy,2.285));top=len(vb);vb.append((xx,yy,2.309+height*.84))
    for j in range(ring):
        q=(j+1)%ring;fb.append((q,j,bot));fb.append((steps*ring+j,steps*ring+q,top))
    return obj(name,vb,fb,snow,True)
snowpatch('17a • fresh dusting beneath handle',-.33,-.207,.68,.175,.085,3)
snowpatch('17b • snow on left shoulder',-1.69,.14,.291,.221,.097,8)
snowpatch('17c • back right snow',1.51,.192,.38,.165,.09,15)
# The entire object is fitted against the KV image with one affine transform
# (slightly wider case and shallower vertical silhouette) before camera or lighting.
for ob in scene.objects:
    if ob.type=='MESH':
        from mathutils import Matrix
        ob.matrix_world=Matrix.Diagonal((1.054,1.065,.956,1.0)) @ ob.matrix_world
def camlight(name,position,target,w,h,power,color):
    bpy.ops.object.light_add(type='AREA',location=position);o=bpy.context.object;o.name=name;o.data.shape='RECTANGLE';o.data.size=w;o.data.size_y=h;o.data.energy=power;o.data.color=color;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
# Camera match: front left shows the deep chrome side; top edges rise to the right.
tar=Vector((0,0,1.42));bpy.ops.object.camera_add(location=(-6.20,-15.6,5.65));cam=bpy.context.object;cam.name='KV • optical foreground camera';cam.rotation_euler=(tar-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=4.94;scene.camera=cam
# A filmed chrome surface needs real breaks in the white cyc reflected in the
# sidewall. Horizon bands are environmental, never painted onto the object.
world=bpy.data.worlds.new('High winter studio / reflection horizon');scene.world=world;world.use_nodes=True
n=world.node_tree.nodes;l=world.node_tree.links;w=n.get('Background');tex=n.new('ShaderNodeTexCoord');sep=n.new('ShaderNodeSeparateXYZ');l.new(tex.outputs['Normal'],sep.inputs[0]);mp=n.new('ShaderNodeMapRange');mp.inputs['From Min'].default_value=-1;mp.inputs['From Max'].default_value=1;l.new(sep.outputs['Z'],mp.inputs[0]);r=n.new('ShaderNodeValToRGB');cr=r.color_ramp;cr.interpolation='EASE';cr.elements[0].color=(.29,.43,.64,1);cr.elements[1].color=(.7,.81,1,1)
for pos,c in [(.12,(.73,.77,.85)),(.27,(.34,.43,.55)),(.37,(.029,.063,.142)),(.43,(.012,.022,.06)),(.484,(.018,.037,.08)),(.497,(.60,.74,.91)),(.545,(.81,.87,1)),(.64,(.55,.72,.91)),(.72,(.18,.32,.54)),(.777,(.025,.056,.13)),(.82,(.079,.112,.22)),(.91,(.50,.59,.82))]:
    e=cr.elements.new(pos);e.color=(*c,1)
l.new(mp.outputs[0],r.inputs[0]);l.new(r.outputs[0],w.inputs[0]);w.inputs['Strength'].default_value=.68
# A reflected studio panel supplies actual horizontal contrast on the chrome flank;
# otherwise an ortho camera sees a uniform environment in a planar seam. It
# cannot be seen by camera rays, creates no floor shadow, and is excluded from GLB.
flagmat=bpy.data.materials.new('Studio • silver return flag');flagmat.use_nodes=True
nt=flagmat.node_tree;n=nt.nodes;l=nt.links;n.clear();oc=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');tc=n.new('ShaderNodeTexCoord');se=n.new('ShaderNodeSeparateXYZ');l.new(tc.outputs['Generated'],se.inputs[0]);rc=n.new('ShaderNodeValToRGB');rc.color_ramp.elements[0].color=(.035,.09,.19,1);rc.color_ramp.elements[1].color=(.44,.60,.84,1)
for pos,col in [(.14,(.045,.105,.22)),(.205,(.099,.214,.39)),(.263,(.22,.33,.55)),(.285,(.8,.85,.99)),(.40,(.84,.89,.99)),(.417,(.09,.16,.31)),(.52,(.075,.148,.29)),(.62,(.15,.34,.55)),(.666,(.64,.83,1))]:
    el=rc.color_ramp.elements.new(pos);el.color=(*col,1)
l.new(se.outputs['Z'],rc.inputs[0]);l.new(rc.outputs[0],em.inputs[0]);em.inputs[1].default_value=.94;l.new(em.outputs[0],oc.inputs[0])
flag=obj('Lighting reflection flag — excluded from asset',[(-10,4.0,-1.5),(-1.9,4.0,-1.5),(-1.9,4.0,2.5),(-10,4.0,2.5)],[(0,1,2,3)],flagmat)
flag.visible_camera=False;flag.visible_diffuse=False;flag.visible_shadow=False;flag.visible_transmission=False;flag.visible_volume_scatter=False
# White sky bounce redirects the dark horizon off the broad, flat chrome top.
whitecard=bpy.data.materials.new('Studio • high white sky');whitecard.use_nodes=True
nt=whitecard.node_tree;nt.nodes.clear();em=nt.nodes.new('ShaderNodeEmission');em.inputs[0].default_value=(.82,.88,1.,1.);em.inputs[1].default_value=1.78;oc=nt.nodes.new('ShaderNodeOutputMaterial');nt.links.new(em.outputs[0],oc.inputs[0])
skyflag=obj('Lighting upper bounce — excluded from asset',[(-2.1,3.7,2.63),(6.3,3.7,2.63),(6.3,3.7,5.6),(-2.1,3.7,5.6)],[(0,1,2,3)],whitecard)
skyflag.visible_camera=False;skyflag.visible_diffuse=False;skyflag.visible_shadow=False;skyflag.visible_transmission=False;skyflag.visible_volume_scatter=False
camlight('Key • high camera left',(-4,-5.5,7.3),(0,0,1.1),4.8,2.3,590,(.83,.93,1))
camlight('Large soft frontal bounce',(3.8,-5.,3.1),(.1,0,1.25),3.,3.7,145,(.88,.88,1))
camlight('Practical strip for left side',(-5.8,2.3,1.65),(0,0,1.1),.48,3.65,162,(.44,.72,1))
camlight('Silver lip • rear top',(1.4,2.8,5.5),(0,0,1),4.3,.75,495,(.73,.84,1))
camlight('Front polished metal rectangle',(-.5,-3.4,4.8),(.1,0,1.25),2.7,.19,85,(1,.9,.82))
camlight('Bottom white sweep',(-.8,-2.3,-1.75),(0,0,.55),3.9,.8,98,(.61,.73,.98))
scene.render.engine='CYCLES';scene.cycles.samples=54 if opt.proof else 208;scene.cycles.use_adaptive_sampling=True;scene.cycles.adaptive_threshold=.026 if opt.proof else .009;scene.cycles.use_denoising=False;scene.cycles.max_bounces=5
scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.resolution_x=1060;scene.render.resolution_y=799;scene.render.resolution_percentage=48 if opt.proof else 100
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=.0;scene.render.filepath=str(Path(opt.png).resolve())
if opt.glb:
    bpy.ops.object.select_all(action='DESELECT')
    for ob in scene.objects:
        if ob.type=='MESH' and ob not in (flag,skyflag):ob.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(Path(opt.glb).resolve()),export_format='GLB',use_selection=True,export_apply=True,export_extras=False,export_animations=False,export_cameras=False,export_lights=False)
if opt.blend:
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.object.select_all(action='DESELECT');scene.camera.select_set(True);bpy.context.view_layer.objects.active=scene.camera
    bpy.ops.wm.save_as_mainfile(filepath=str(Path(opt.blend).resolve()),compress=True)
bpy.ops.render.render(write_still=True)
