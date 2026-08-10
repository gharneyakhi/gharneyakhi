# Add missing symbol glyphs (arrows, check, box) to Vazirmatn TTFs.
import os
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen

SRC = "/tmp/build/fonts"
DST = "/tmp/build/fonts_patched"
os.makedirs(DST, exist_ok=True)

def poly(pen, pts):
    pen.moveTo(pts[0])
    for p in pts[1:]:
        pen.lineTo(p)
    pen.closePath()

def make(u):
    """return (draw_fn, advance) in 1000-upm space"""
    def left_arrow(pen, s):
        S = lambda x, y: (int(x * s), int(y * s))
        poly(pen, [S(120, 300), S(430, 90), S(430, 240), S(880, 240), S(880, 360),
                   S(430, 360), S(430, 510)])
    def right_arrow(pen, s):
        S = lambda x, y: (int(x * s), int(y * s))
        poly(pen, [S(880, 300), S(570, 510), S(570, 360), S(120, 360), S(120, 240),
                   S(570, 240), S(570, 90)])
    def down_arrow(pen, s):
        S = lambda x, y: (int(x * s), int(y * s))
        poly(pen, [S(500, 40), S(290, 330), S(440, 330), S(440, 700), S(560, 700),
                   S(560, 330), S(710, 330)])
    def check(pen, s):
        S = lambda x, y: (int(x * s), int(y * s))
        poly(pen, [S(120, 350), S(210, 250), S(400, 130), S(830, 620), S(740, 700),
                   S(395, 300)])
    def box(pen, s):
        S = lambda x, y: (int(x * s), int(y * s))
        poly(pen, [S(140, 60), S(860, 60), S(860, 640), S(140, 640)])
        poly(pen, [S(230, 150), S(230, 550), S(770, 550), S(770, 150)])
    return {0x2190: (left_arrow, 1000), 0x2192: (right_arrow, 1000),
            0x2193: (down_arrow, 1000), 0x2713: (check, 1000),
            0x2610: (box, 1000)}[u]

for fn in sorted(os.listdir(SRC)):
    if not fn.endswith(".ttf"):
        continue
    f = TTFont(os.path.join(SRC, fn))
    upm = f["head"].unitsPerEm
    s = upm / 1000.0
    glyf, hmtx = f["glyf"], f["hmtx"]
    order = f.getGlyphOrder()[:]
    added = []
    for u in (0x2190, 0x2192, 0x2193, 0x2713, 0x2610):
        name = "uni%04X" % u
        drawer, adv = make(u)
        pen = TTGlyphPen(None)
        drawer(pen, s)
        glyf[name] = pen.glyph()
        hmtx[name] = (int(adv * s), int(120 * s))
        order.append(name)
        added.append((u, name))
    f.setGlyphOrder(order)
    try:
        f["glyf"].glyphOrder = order
    except Exception:
        pass
    for t in f["cmap"].tables:
        if t.isUnicode():
            for u, name in added:
                t.cmap[u] = name
    f["maxp"].numGlyphs = len(order)
    f.save(os.path.join(DST, fn))
    print("patched", fn)
