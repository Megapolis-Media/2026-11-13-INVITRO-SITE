"""Seamless geometry-based fallback for browsers without WebGL, no doubled layers."""
import runpy,math
from pathlib import Path
v=runpy.run_path(str(Path(__file__).with_name('render-radio-studio.py')))
np=v['np'];pyrender=v['pyrender'];Image=v['Image'];scene=v['scene'];model=v['model'];root=v['ROOT']
nodes={n.name:n for n in scene.mesh_nodes};moving=[]
for name in model.graph.nodes_geometry:
 chain=[];p=name
 while p in model.graph.transforms.parents:p=model.graph.transforms.parents[p];chain.append(p)
 pivot=next((c for c in chain if c.startswith('Reel_') or c.startswith('Vinyl_')),None)
 if pivot:
  world=model.graph[pivot][0];moving.append((nodes[name],world,np.linalg.inv(world)@model.graph[name][0],pivot))
r=pyrender.OffscreenRenderer(700,763);optical=Image.fromarray(v['optical']).resize((700,763),Image.Resampling.LANCZOS);frames=[]
for i in range(48):
 a=i/48*math.tau
 for node,world,local,pivot in moving:
  rot=np.eye(4);c,s=math.cos(a),math.sin(a)
  if pivot.startswith('Reel'):rot[:2,:2]=[[c,s],[-s,c]]
  else:rot[0,0]=c;rot[0,2]=s;rot[2,0]=-s;rot[2,2]=c
  scene.set_pose(node,world@rot@local)
 for node in nodes.values():
  if 'bulbs' in node.name.lower():
   for primitive in node.mesh.primitives:primitive.material.emissiveFactor=np.array([1,.8,.55])*(.45+.4*(math.sin(a)+1))
 color,_=r.render(scene,flags=pyrender.RenderFlags.RGBA)
 frames.append(Image.alpha_composite(Image.fromarray(color),optical))
 if i%12==0:print('Rendered',i,flush=True)
frames[0].save(root/'public/models-brand/RADIO_STUDIO_motion.webp',save_all=True,append_images=frames[1:],duration=83,loop=0,quality=83,method=4)
r.delete();print('Seamless radio fallback saved',flush=True)
