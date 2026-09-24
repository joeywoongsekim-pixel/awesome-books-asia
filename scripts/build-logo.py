#!/usr/bin/env python3
"""Draw the Awesome Books Asia logo files into public/brand/.

    npx next build            # the font has to exist first (see below)
    pip install fonttools brotli uharfbuzz
    python3 scripts/build-logo.py

The wordmark is set in Righteous and converted to outlines, so every file
carries no font dependency: it reads the same in a browser, in a deck, at
a printer, and on a machine that has never heard of Righteous. That is
the whole point of having files as well as components/BrandLogo.tsx —
the component needs the webfont and the stylesheet; the files need
nothing.

Which means this is a generator rather than a set of hand-drawn assets:
run it again if the wordmark, the font or the lockup proportions ever
change, and the files follow the component instead of drifting from it.

What it writes, and why each exists:

    logo.svg                  horizontal, dark wordmark — light pages
    logo-reverse.svg          horizontal, paper wordmark — dark covers
    logo-stacked.svg          symbol over wordmark — a narrow column,
                              a back cover, anywhere wider than tall
                              does not fit
    logo-stacked-reverse.svg  the same, for a dark ground
    logo-mono-dark.svg        every part in one ink — foil, emboss, a
                              single-colour press, a cover printed in
                              two colours where the logo is not one
    logo-mono-light.svg       the same, reversed out

The symbol on its own is already in this folder as symbol.svg and
symbol-small.svg, and is the right thing on a spine.

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
BRAND = os.path.join(ROOT, 'public', 'brand')
TEXT = 'Awesome Books Asia'

# The lockup, on the symbol's own 100-unit grid. These are the figures in
# components/BrandLogo.tsx, so the files and the component are one logo.
SYM = 100.0            # the symbol is 100 x 100
GAP = 0.24 * SYM       # space between symbol and wordmark, side by side
FSIZE = 0.58 * SYM     # wordmark size, side by side
TRACK_EM = 0.005       # letter-spacing, between glyphs only

# Stacked, the wordmark cannot stay at 0.58 or the block becomes six times
# wider than it is tall, which is the shape the horizontal one already is.
# Sized so the words run about two and a half symbols wide.
STACK_FSIZE = 0.265 * SYM
STACK_GAP = 0.20 * SYM

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
        if all(ord(c) in font.getBestCmap() for c in TEXT):
            print(f'font: {os.path.relpath(path, ROOT)}')
            return TTFont(path)
    sys.exit('No Righteous subset covering the wordmark under .next — run `npx next build` first.')


font = find_righteous()
glyphs = font.getGlyphSet()
order = font.getGlyphOrder()
upem = font['head'].unitsPerEm

# HarfBuzz shapes it, so the kerning is the font's own rather than a guess.
# It reads ttf and not woff2 — handed the woff2 it silently returns .notdef
# for every character, which looks like a successful run drawing an empty
# logo. Hence the round trip through a decompressed copy, and the assert.
_ttf = os.path.join(ROOT, '.next', 'righteous-tmp.ttf')
font.flavor = None
font.save(_ttf)
hb_font = hb.Font(hb.Face(hb.Blob.from_file_path(_ttf)))
os.remove(_ttf)

_buf = hb.Buffer()
_buf.add_str(TEXT)
_buf.guess_segment_properties()
hb.shape(hb_font, _buf)
assert '.notdef' not in [order[i.codepoint] for i in _buf.glyph_infos], 'unshaped characters'


def wordmark(size: float):
    """Outlines for the words at `size`, plus the box their ink fills."""
    scale = size / upem
    track = TRACK_EM * size
    pen_x = 0.0
    paths: list[str] = []
    x0 = y0 = float('inf')
    x1 = y1 = float('-inf')
    for n, (info, pos) in enumerate(zip(_buf.glyph_infos, _buf.glyph_positions)):
        name = order[info.codepoint]
        x, y = pen_x + pos.x_offset * scale, pos.y_offset * scale
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
        if n < len(_buf.glyph_infos) - 1:
            pen_x += track
    assert paths, 'no outlines came back'
    return paths, (x0, y0, x1, y1)


def symbol(cloth: str, rule: str, cursor: str, at: str = '') -> str:
    """The mark itself: cloth square, two brackets, the cursor between."""
    g = f' transform="{at}"' if at else ''
    return (
        f'  <g{g}>\n'
        f'    <rect width="100" height="100" rx="23" fill="{cloth}"/>\n'
        f'    <g stroke="{rule}" stroke-width="8.5" stroke-linecap="round" '
        f'stroke-linejoin="round" fill="none">\n'
        f'      <path d="M55 28H28v27"/>\n'
        f'      <path d="M45 72h27V45"/>\n'
        f'    </g>\n'
        f'    <rect x="46.5" y="37" width="7" height="26" rx="3.5" fill="{cursor}"/>\n'
        f'  </g>'
    )


NOTE = """  <!--
    Awesome Books Asia — {what}.
    Drawn by scripts/build-logo.py; edit that and run it again.

    The symbol is the brand guide's 100x100 grid: a lapis square with
    corner radius 23, two paper brackets of stroke 8.5 with arms 27 long
    from the vertices at (28,28) and (72,72), and the gold cursor 7x26
    standing at the centre.

    The wordmark is Righteous (SIL Open Font License 1.1) as outlines, so
    this file needs no font installed anywhere.

    Clear space: half the symbol's height, empty, on every side.
    Smallest usable width {least}. Below that use brand/symbol-small.svg.
  -->"""


def write(name: str, w: float, h: float, what: str, least: str, body: str) -> None:
    path = os.path.join(BRAND, name)
    with open(path, 'w') as fh:
        fh.write(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:g} {h:g}" '
            f'width="{w:g}" height="{h:g}" role="img" aria-label="{TEXT}">\n'
            f'  <title>{TEXT}</title>\n'
            + NOTE.format(what=what, least=least) + '\n'
            + body + '\n</svg>\n'
        )
    print(f'  {name:26} {w:7.1f} x {h:5.1f}')


def horizontal(name: str, cloth: str, rule: str, cursor: str, ink: str, what: str) -> None:
    """Symbol, then the words beside it, their ink centred on its centre.

    Centred by ink rather than by the font's line box: nothing in
    "Awesome Books Asia" descends, so the font's descent is empty air
    that would push the words up."""
    paths, (x0, y0, x1, y1) = wordmark(FSIZE)
    dx, dy = SYM + GAP - x0, SYM / 2 - (y0 + y1) / 2
    w = round(SYM + GAP + (x1 - x0), 2)
    glyph_body = '\n'.join(f'    <path d="{d}"/>' for d in paths)
    body = (
        symbol(cloth, rule, cursor) + '\n'
        f'  <g fill="{ink}" transform="translate({dx:.2f} {dy:.2f})">\n{glyph_body}\n  </g>'
    )
    write(name, w, 100, what, '180px', body)


def stacked(name: str, cloth: str, rule: str, cursor: str, ink: str, what: str) -> None:
    """Symbol above, words centred beneath it."""
    paths, (x0, y0, x1, y1) = wordmark(STACK_FSIZE)
    text_w, text_h = x1 - x0, y1 - y0
    w = round(max(text_w, SYM), 2)
    h = round(SYM + STACK_GAP + text_h, 2)
    dx = (w - text_w) / 2 - x0
    dy = SYM + STACK_GAP - y0
    glyph_body = '\n'.join(f'    <path d="{d}"/>' for d in paths)
    body = (
        symbol(cloth, rule, cursor, at=f'translate({(w - SYM) / 2:.2f} 0)') + '\n'
        f'  <g fill="{ink}" transform="translate({dx:.2f} {dy:.2f})">\n{glyph_body}\n  </g>'
    )
    write(name, w, h, what, '120px', body)


print('writing:')
# On a page, or a pale cover.
horizontal('logo.svg', LAPIS, PAPER, GOLD, NIGHT, 'horizontal lockup, for light backgrounds')
stacked('logo-stacked.svg', LAPIS, PAPER, GOLD, NIGHT, 'stacked lockup, for light backgrounds')

# On a dark or coloured cover: the words turn to paper, the square keeps
# its colour so the mark is still the mark.
horizontal('logo-reverse.svg', LAPIS, PAPER, GOLD, PAPER, 'horizontal lockup, for dark backgrounds')
stacked('logo-stacked-reverse.svg', LAPIS, PAPER, GOLD, PAPER, 'stacked lockup, for dark backgrounds')

# One ink: foil, emboss, or a cover printed in two colours where the logo
# is not one of them. The cursor is cut out of the square rather than
# coloured, because with no second colour it cannot be gold.
horizontal('logo-mono-dark.svg', NIGHT, PAPER, PAPER, NIGHT, 'single ink, dark on light')
stacked('logo-mono-dark-stacked.svg', NIGHT, PAPER, PAPER, NIGHT, 'single ink, dark on light')
horizontal('logo-mono-light.svg', PAPER, NIGHT, NIGHT, PAPER, 'single ink, light on dark')
stacked('logo-mono-light-stacked.svg', PAPER, NIGHT, NIGHT, PAPER, 'single ink, light on dark')
