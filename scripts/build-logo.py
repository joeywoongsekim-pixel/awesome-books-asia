#!/usr/bin/env python3
"""Draw public/brand/logo.svg — the horizontal Awesome Books Asia lockup.

    npx next build            # the font has to exist first (see below)
    pip install fonttools brotli uharfbuzz
    python3 scripts/build-logo.py

The wordmark is set in Righteous and converted to outlines, so the file
carries no font dependency: it reads the same in a browser, in a deck, at
a printer, and on a machine that has never heard of Righteous. That is
the whole point of having a file as well as components/BrandLogo.tsx —
the component needs the webfont and the stylesheet; the file needs
nothing.

Which means this is a generator rather than a hand-drawn asset: run it
again if the wordmark, the font or the lockup proportions ever change,
and the file follows the component instead of drifting from it.

The font it reads is next/font's subset of Righteous, which appears under
.next/static/media after a build. Righteous is under the SIL Open Font
License 1.1, which permits outlines in a logo.
"""

import glob
import os
import sys

import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'brand', 'logo.svg')
TEXT = 'Awesome Books Asia'

# The lockup, on the symbol's own 100-unit grid. These are the figures in
# components/BrandLogo.tsx, so the file and the component are one logo.
SYM = 100.0            # the symbol is 100 x 100
GAP = 0.24 * SYM       # space between symbol and wordmark
FSIZE = 0.58 * SYM     # wordmark size
TRACK = 0.005 * FSIZE  # 0.005em letter-spacing, between glyphs only

LAPIS, PAPER, GOLD, NIGHT = '#2340B5', '#F0EEE9', '#C9A23A', '#111317'


def find_righteous() -> TTFont:
    """The subset that carries the wordmark, out of a build's font files."""
    for path in sorted(glob.glob(os.path.join(ROOT, '.next/static/media/*.woff2'))):
        try:
            font = TTFont(path, lazy=True)
        except Exception:
            continue
        if font['name'].getDebugName(1) != 'Righteous':
            continue
        cmap = font.getBestCmap()
        if all(ord(c) in cmap for c in TEXT):
            print(f'font: {os.path.relpath(path, ROOT)}')
            return TTFont(path)
    sys.exit('No Righteous subset covering the wordmark under .next — run `npx next build` first.')


font = find_righteous()
upem = font['head'].unitsPerEm
glyphs = font.getGlyphSet()
order = font.getGlyphOrder()
scale = FSIZE / upem

# HarfBuzz shapes it, so the kerning is the font's own rather than a guess.
# It reads ttf and not woff2 — handed the woff2 it silently returns .notdef
# for every character, which looks like a successful run drawing an empty
# logo. Hence the round trip through a decompressed copy, and the assert.
ttf = os.path.join(ROOT, '.next', 'righteous-tmp.ttf')
font.flavor = None
font.save(ttf)
hb_font = hb.Font(hb.Face(hb.Blob.from_file_path(ttf)))
os.remove(ttf)

buf = hb.Buffer()
buf.add_str(TEXT)
buf.guess_segment_properties()
hb.shape(hb_font, buf)
names = [order[i.codepoint] for i in buf.glyph_infos]
assert '.notdef' not in names, f'unshaped characters in the wordmark: {names}'

pen_x = 0.0
paths: list[str] = []
x0 = y0 = float('inf')
x1 = y1 = float('-inf')

for n, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
    name = order[info.codepoint]
    x = pen_x + pos.x_offset * scale
    y = pos.y_offset * scale
    # The y axis flips: up is positive in a font, down is positive in SVG.
    sp = SVGPathPen(glyphs, ntos=lambda v: f'{v:.2f}')
    glyphs[name].draw(TransformPen(sp, Transform(scale, 0, 0, -scale, x, y)))
    d = sp.getCommands()
    if d:  # a space draws nothing
        paths.append(d)
        bp = BoundsPen(glyphs)
        glyphs[name].draw(bp)
        if bp.bounds:
            a, b, c, e = bp.bounds
            x0, y0 = min(x0, x + a * scale), min(y0, y - e * scale)
            x1, y1 = max(x1, x + c * scale), max(y1, y - b * scale)
    pen_x += pos.x_advance * scale
    if n < len(buf.glyph_infos) - 1:
        pen_x += TRACK

assert paths, 'no outlines came back'

# The wordmark's ink — not its advance box, whose side bearings would read
# as a wider gap than the one asked for — begins one gap after the symbol,
# and is centred on the symbol's centre line. Centring the ink rather than
# the font's line box is what makes the two read as one block: nothing in
# "Awesome Books Asia" descends, so the font's descent is empty air that
# would push the words up.
dx, dy = SYM + GAP - x0, SYM / 2 - (y0 + y1) / 2
width = round(SYM + GAP + (x1 - x0), 2)
body = '\n'.join(f'    <path d="{d}"/>' for d in paths)

with open(OUT, 'w') as fh:
    fh.write(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:g} 100" width="{width:g}" height="100" role="img" aria-label="{TEXT}">
  <title>{TEXT}</title>
  <!--
    Awesome Books Asia — horizontal lockup, for light backgrounds.
    Drawn by scripts/build-logo.py; edit that and run it again.

    The symbol is the brand guide's 100x100 grid: a 라피스 square with
    corner radius 23, two 페이퍼 brackets of stroke 8.5 with arms 27 long
    from the vertices at (28,28) and (72,72), and the 커서 골드 cursor
    7x26 standing at the centre.

    The wordmark is Righteous (SIL Open Font License 1.1) as outlines, so
    this file needs no font installed anywhere. Set at 0.58 of the
    symbol's height, one quarter of it away, letter-spaced 0.005em and
    centred on the symbol's centre line — the figures the header uses.

    Clear space: half the symbol's height, empty, on every side.
    Smallest usable width 180px; below that use brand/symbol-small.svg.
  -->
  <rect width="100" height="100" rx="23" fill="{LAPIS}"/>
  <g stroke="{PAPER}" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M55 28H28v27"/>
    <path d="M45 72h27V45"/>
  </g>
  <rect x="46.5" y="37" width="7" height="26" rx="3.5" fill="{GOLD}"/>
  <g fill="{NIGHT}" transform="translate({dx:.2f} {dy:.2f})">
{body}
  </g>
</svg>
''')

print(f'{len(buf.glyph_infos)} glyphs, {len(paths)} outlines')
print(f'wrote {os.path.relpath(OUT, ROOT)} — viewBox 0 0 {width:g} 100')
