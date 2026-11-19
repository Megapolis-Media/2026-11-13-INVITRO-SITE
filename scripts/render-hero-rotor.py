"""Animate the photographic hero plate. All coordinates refer to its 530 × 494.5 half-size."""
from math import sin, cos, pi, sqrt
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import distance_transform_edt

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'public/hero-v74/drum.webp'
OUT = ROOT / 'public/hero-v83/drum-turn.webp'
S = 1.5
W, H = 795, 742
SIZE = W, H
source = Image.open(SRC).convert('RGBA').resize(SIZE, Image.Resampling.LANCZOS)


def xy(points):
    return [(round(x*S), round(y*S)) for x, y in points]


def mask(points):
    m = Image.new('L', SIZE)
    ImageDraw.Draw(m).polygon(xy(points), fill=255)
    return m


def cut(im, m, box):
    layer = im.copy()
    layer.putalpha(Image.fromarray(np.minimum(np.asarray(im.getchannel('A')), np.asarray(m))))
    return layer.crop(tuple(round(x*S) for x in box))


# Lift out the actual grip; the steel post behind the lever remains a fixed support.
grip_shape = [(4,283),(6,274),(12,268),(67,259),(78,261),(85,267),(88,274),
              (88,286),(84,293),(14,301),(7,298)]
grip_box = (2,257,91,303)
grip = cut(source, mask(grip_shape).filter(ImageFilter.GaussianBlur(.5)), grip_box)
old_crank = mask([(1,303),(0,274),(10,265),(71,256),(78,251),(85,210),(85,195),
                  (105,194),(106,211),(96,273),(91,290),(86,299),(15,304)])
old = np.asarray(old_crank)>0
src = np.array(source)
# Rebuild the narrow region behind the old crank from neighbouring photographic samples.
ys, xs = np.mgrid[:H,:W]/S
edge = 151-95*np.sqrt(np.maximum(0,1-((ys-191)/154)**2))
foot = 110-(ys-207)*.28
inside = (xs >= np.minimum(edge,foot)) & old
sample = distance_transform_edt((old | (src[:,:,3]<180)),return_distances=False,return_indices=True)
base = src.copy()
base[old] = 0
base[inside] = src[sample[0][inside],sample[1][inside]]
base = Image.fromarray(base)

# Confine the moving glass and balls to the chamber, behind its snow cap, rims and outlet.
glass_a = mask([(239,70),(303,61),(369,54),(422,52),(452,62),(475,95),(485,135),
                (488,196),(479,250),(458,279),(438,284),(441,261),(434,235),(426,228),
                (449,212),(457,188),(450,174),(429,165),(409,164),(384,171),(360,191),
                (349,211),(356,227),(367,231),(350,247),(337,271),(340,301),(248,316),
                (259,264),(263,205),(259,143),(251,96)])
glass_b = mask([(84,169),(86,139),(95,102),(108,76),(134,57),(153,54),(178,60),
                (193,76),(213,111),(224,155),(226,206),(221,257),(208,293),(193,310),
                (176,261),(164,226),(179,202),(179,178),(163,153),(145,146),(125,149),(112,158)])
glass = Image.fromarray(np.maximum(np.asarray(glass_a),np.asarray(glass_b))).filter(ImageFilter.GaussianBlur(.9))
shells = [(197,215,14),(326,243,15),(304,263,15),(293,184,14),(328,203,15),(294,149,12),(268,282,15),(272,168,12)]
sprites=[]
for x,y,r in shells:
    size=round(2*r*S)
    s=source.crop((round((x-r)*S),round((y-r)*S),round((x-r)*S)+size,round((y-r)*S)+size))
    yy,xx=np.mgrid[:size,:size]
    alpha=np.clip((size/2-.5-np.hypot(xx-(size-1)/2,yy-(size-1)/2))*255,0,255)
    s.putalpha(Image.fromarray(alpha.astype('uint8')))
    sprites.append(s)
raw = np.asarray(source)
ix = np.arange(W); iy = np.arange(H)
weight = np.clip((iy/S-124)/30,0,1)*np.clip((328-iy/S)/18,0,1)
pockets=[(196,66,0),(205,48,.53),(287,64,.35),(313,76,.08),(334,59,.69),
         (360,72,.47),(391,50,.19),(421,66,.81),(455,54,.61),(293,48,.87)]
frames=[]
for index in range(56):
    angle=index/56*2*pi
    frame=base.copy()
    # The photographed bed rises with each sweep; a row of balls rolls off the shelf into the pile.
    dx=(weight*(7*sin(angle)+3*np.sin(2*angle+iy*.027))*S).astype(int)
    dy=(weight*(6*np.sin(angle+iy*.011)+2*np.sin(2*angle-iy*.017))*S).astype(int)
    interior=Image.fromarray(raw[np.clip(iy+dy,0,H-1)[:,None],np.clip(ix[None,:]+dx[:,None],0,W-1)])
    for n,(x,lift,offset) in enumerate(pockets):
        u=(index/56+offset)%1
        height=sin(pi/2*u/.57) if u<.57 else 1-((u-.57)/.43)**2
        sprite=sprites[n%len(sprites)]
        cx=x-13*sin(2*pi*u);cy=184-lift*height+(n%3)*3
        interior.alpha_composite(sprite,(round(cx*S-sprite.width/2),round(cy*S-sprite.height/2)))
    ribs=Image.new('RGBA',SIZE)
    draw=ImageDraw.Draw(ribs)
    for k in range(4):
        phi=angle+k*pi/2
        if cos(phi)<-.06: continue
        y=179+117*sin(phi)
        points=[(88,y+14),(232,y+4),(365,y-6),(490,y-11)]
        draw.line(xy(points),fill=(27,99,125,85),width=round(3*S))
        draw.line(xy([(x,y-1) for x,y in points]),fill=(237,255,255,155),width=round(1.5*S))
    # Three structural spokes on the near end plate visibly follow the axle.
    for k in range(3):
        phi=angle+k*2*pi/3
        p=(151+78*cos(phi),192+131*sin(phi))
        start=(151+22*cos(phi),192+36*sin(phi))
        draw.line(xy([start,p]),fill=(33,104,128,120),width=round(3.2*S))
        draw.line(xy([start,(p[0]-.8,p[1]-1)]),fill=(242,255,255,177),width=round(1.25*S))
    interior.alpha_composite(ribs)
    frame.paste(interior,(0,0),glass)
    # The photographed grip stays parallel to the axle. The arm rotates in the plane of the end cap.
    hx=104-18*sin(angle+.23);hy=195+86*cos(angle+.23)
    arm=Image.new('RGBA',SIZE);d=ImageDraw.Draw(arm)
    for width,color,shift in [(10,(42,63,74,255),0),(7.8,(164,182,188,255),0),(3,(225,236,239,255),-1.7),(1.8,(91,118,131,255),2)]:
        d.line(xy([(94+shift,195),(hx+shift,hy)]), fill=color,width=round(width*S))
    frame.alpha_composite(arm)
    frame.alpha_composite(grip,(round((hx-84)*S),round((hy-21)*S)))
    # Fixed axle cap occludes the moving crank root.
    hub=Image.new('L',SIZE);d=ImageDraw.Draw(hub)
    d.ellipse([*xy([(84,182)])[0],*xy([(100,207)])[0]],fill=255)
    frame.paste(source,(0,0),hub.filter(ImageFilter.GaussianBlur(.6)))
    frames.append(frame)
OUT.parent.mkdir(exist_ok=True)
frames[0].save(OUT,save_all=True,append_images=frames[1:],duration=48,loop=0,quality=83,method=4,minimize_size=True)
mobile=[frame.resize((448,418),Image.Resampling.LANCZOS) for frame in frames[::2]]
mobile[0].save(OUT.with_name('drum-turn-mobile.webp'),save_all=True,append_images=mobile[1:],duration=96,loop=0,quality=76,method=4)
check=Image.open(OUT)
assert check.n_frames==len(frames) and check.info.get('loop')==0
print(f'{check.n_frames} frames, {OUT.stat().st_size:,} bytes')
