# Ornate oval gold mirror frame, rendered with a transparent glass hole. Run: python3 frame.py OUT.png WIDTH SAMPLES
import bpy, math, sys
from mathutils import Vector
out, W, SAMP = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
A, B = 0.54, 0.86            # glass half width and height (photo ratio 540:860)
def ell(t, s=1.0, d=0.0):
    # point at angle t on the ellipse grown outward by d along the normal
    x, y = A * s * math.cos(t), B * s * math.sin(t)
    nx, ny = B * math.cos(t), A * math.sin(t); l = math.hypot(nx, ny)
    return Vector((x + nx / l * d, y + ny / l * d, 0)), math.atan2(ny, nx)

gold = bpy.data.materials.new('gold'); gold.use_nodes = True
nt = gold.node_tree; bsdf = nt.nodes['Principled BSDF']
bsdf.inputs['Metallic'].default_value = 1.0; bsdf.inputs['Roughness'].default_value = 0.26
ao = nt.nodes.new('ShaderNodeAmbientOcclusion'); ao.inputs['Distance'].default_value = 0.04
mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'
mix.inputs[6].default_value = (0.22, 0.12, 0.05, 1); mix.inputs[7].default_value = (0.80, 0.58, 0.33, 1)
nt.links.new(ao.outputs['AO'], mix.inputs[0]); nt.links.new(mix.outputs[2], bsdf.inputs['Base Color'])
rough = nt.nodes.new('ShaderNodeMapRange'); rough.inputs[3].default_value = 0.5; rough.inputs[4].default_value = 0.22
nt.links.new(ao.outputs['AO'], rough.inputs[0]); nt.links.new(rough.outputs[0], bsdf.inputs['Roughness'])

def curve_obj(name, pts, radius, rad_list=None, cyclic=False, res=6):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for i, p in enumerate(pts):
        sp.points[i].co = (p[0], p[1], p[2] if len(p) > 2 else 0, 1)
        if rad_list: sp.points[i].radius = rad_list[i]
    sp.use_cyclic_u = cyclic
    cu.bevel_depth = radius; cu.bevel_resolution = res; cu.use_fill_caps = True
    ob = bpy.data.objects.new(name, cu); sc.collection.objects.link(ob); ob.data.materials.append(gold)
    return ob

N = 260
def ring(name, d, r, z, flat=1.0):
    ob = curve_obj(name, [tuple(ell(2 * math.pi * i / N, 1, d)[0])[:2] + (z,) for i in range(N)], r, cyclic=True)
    ob.scale.z = flat; return ob
# the band, inside to out: bead row, a thin lip, a wide cove, a fat rounded rail, a narrow step
ring('lip', 0.012, 0.010, 0.010)
ring('cove', 0.055, 0.036, -0.010, 0.45)
ring('rail', 0.105, 0.030, 0.020)
ring('step', 0.150, 0.013, 0.004)
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=12, ring_count=8)
bead = bpy.context.object; bead.data.materials.append(gold)
M = 150
for i in range(M):
    p, a = ell(2 * math.pi * i / M, 1, 0.028)
    o = bead.copy(); o.data = bead.data; sc.collection.objects.link(o)
    o.location = (p.x, p.y, 0.024); o.scale = (0.0085, 0.0085, 0.007)
bpy.data.objects.remove(bead)

def vine(t0, t1, d, curl_dir, size=1.0, out=1):
    """A scroll whose stem runs along the band from t0 to t1, then curls outward into a spiral."""
    pts, rad = [], []
    n = 28
    for i in range(n):
        t = t0 + (t1 - t0) * i / (n - 1)
        p, a = ell(t, 1, d + 0.03 * math.sin(math.pi * i / (n - 1)) * out)
        pts.append((p.x, p.y, 0.05)); rad.append(1.0 - 0.15 * i / n)
    p_end, a_end = ell(t1, 1, d)
    tang = Vector((-math.sin(a_end), math.cos(a_end), 0)) * (1 if t1 > t0 else -1)
    nrm = Vector((math.cos(a_end), math.sin(a_end), 0)) * out
    r0 = 0.055 * size; turns = 1.5
    c = p_end + nrm * r0          # the curl's centre sits outside the band
    m = 46
    for i in range(1, m):
        v = i / (m - 1); th = v * turns * 2 * math.pi
        r = r0 * math.exp(-0.36 * th)
        dirv = (-nrm) * math.cos(th) + tang * math.sin(th)
        q = c + dirv * r
        pts.append((q.x, q.y, 0.05 + 0.012 * v)); rad.append(0.85 - 0.6 * v)
    ob = curve_obj('vine', pts, 0.019 * size, rad)
    ob.scale.z = 0.7
    return ob

def leaf(t, d, ang_extra, length, width):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=18, ring_count=10)
    lf = bpy.context.object; lf.data.materials.append(gold)
    p, a = ell(t, 1, d); lf.location = (p.x, p.y, 0.05); lf.rotation_euler = (0, 0, a + ang_extra)
    lf.scale = (length, width, 0.012)
    # ribs on the leaf
    bpy.ops.object.modifier_add(type='SIMPLE_DEFORM'); lf.modifiers[-1].deform_method = 'BEND'; lf.modifiers[-1].angle = 0.6; lf.modifiers[-1].deform_axis = 'Z'

# scroll pairs: each pair opens from a leaf and curls outward in both directions
K = 14
for k in range(K):
    tc = 2 * math.pi * (k + 0.5) / K
    if abs(math.sin(tc)) > 0.96: continue
    span = 2 * math.pi / K * 0.42
    vine(tc, tc + span, 0.16, 1)
    vine(tc, tc - span, 0.16, -1)
    leaf(tc, 0.2, 0.0, 0.05, 0.02)
    # small inner curls lying on the rail

def crest(t, size):
    p, a = ell(t, 1, 0.19)
    rot = a - math.pi / 2
    import mathutils
    for i in range(13):
        ang = math.pi * (0.05 + 0.9 * i / 12)
        q = Vector((math.cos(ang), math.sin(ang), 0)); q.rotate(mathutils.Euler((0, 0, rot)))
        curve_obj('rib', [(p.x + q.x * 0.03 * size, p.y + q.y * 0.03 * size, 0.06), (p.x + q.x * 0.17 * size, p.y + q.y * 0.17 * size, 0.08)], 0.012 * size, [0.6, 1.3])
    arc = []
    for i in range(41):
        ang = math.pi * (0.03 + 0.94 * i / 40)
        q = Vector((math.cos(ang), math.sin(ang), 0)); q.rotate(mathutils.Euler((0, 0, rot)))
        wav = 1 + 0.06 * math.cos(ang * 26)
        arc.append((p.x + q.x * 0.18 * size * wav, p.y + q.y * 0.18 * size * wav, 0.08))
    curve_obj('shell', arc, 0.012 * size)
    for sgn in (1, -1):
        vine(t + sgn * 0.08, t + sgn * 0.28, 0.17, sgn, 1.35 * size)
crest(math.pi / 2, 1.0)
crest(-math.pi / 2, 0.75)
# convert curves so the glass hole stays clean, and set up light and camera
for o in list(sc.objects):
    o.select_set(True)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.05, 0.035, 0.05, 1); bg.inputs[1].default_value = 1.0
def light(name, loc, power, size, color=(1, 0.95, 0.88)):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = power; ld.size = size; ld.color = color
    ob = bpy.data.objects.new(name, ld); sc.collection.objects.link(ob); ob.location = loc
    ob.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
light('key', (-1.6, 1.8, 2.2), 170, 1.6)
light('fill', (1.8, -0.6, 1.6), 55, 2.5, (0.95, 0.9, 1.0))
light('top', (0, 0.4, 3.0), 70, 3.0)
light('rimL', (-2.4, -1.5, 0.5), 80, 1.0)
cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'
H = 2 * (B + 0.47); cam.ortho_scale = H
co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); co.location = (0, 0.02, 5); sc.camera = co
sc.render.engine = 'CYCLES'; sc.cycles.samples = SAMP; sc.cycles.use_denoising = True; sc.cycles.device = 'CPU'
sc.render.film_transparent = True
aspect = (A + 0.47) / (B + 0.47)
sc.render.resolution_x = W; sc.render.resolution_y = int(W / aspect); sc.render.resolution_percentage = 100
sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'; sc.view_settings.exposure = -0.35
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
print('frame', sc.render.resolution_x, sc.render.resolution_y, 'glass box', A / (A + 0.47), B / (B + 0.47))
