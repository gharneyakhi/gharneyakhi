# -*- coding: utf-8 -*-
"""Render the Persian Instagram content plan (Markdown) into a styled RTL PDF."""
import re, os, sys
from fpdf import FPDF
import arabic_reshaper
from bidi import get_display  # v0.6+ (rust unicode-bidi): correct logical ordering

FONT_DIR = os.environ.get("VAZIR_FONT_DIR", "/tmp/build/fonts_patched")
SRC = sys.argv[1] if len(sys.argv) > 1 else "instagram-content-plan.md"
OUT = sys.argv[2] if len(sys.argv) > 2 else "instagram-content-plan.pdf"

# ---------- colours ----------
INK        = (24, 24, 32)
MUTED      = (110, 112, 125)
ACCENT     = (233, 63, 96)      # signature red/pink
ACCENT_DK  = (150, 28, 55)
DARK       = (18, 18, 26)
SOFT_BG    = (247, 246, 249)
LINE       = (222, 221, 229)
TBL_HEAD   = (30, 30, 42)
TBL_ALT    = (249, 248, 251)

RESHAPER = arabic_reshaper.ArabicReshaper(
    configuration={"delete_harakat": False, "support_ligatures": True}
)

# python-bidi 0.6 reorders correctly but does not apply Unicode bidi mirroring,
# so paired delimiters sitting at an odd embedding level must be swapped by hand.
MIRROR = str.maketrans({
    "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{",
    "\u00ab": "\u00bb", "\u00bb": "\u00ab",
})
_LVL_RE = re.compile(r"Level\(\s*(\d+),")

def _levels(txt):
    """Embedding level per *character*.

    python-bidi's debug dump reports one level per UTF-8 byte (it wraps the
    Rust unicode-bidi crate), so the byte levels are collapsed back onto
    characters here.
    """
    dbg = get_display(txt, base_dir="R", debug=True)
    m = re.search(r"levels:\s*\[(.*?)\n    \],", dbg, re.S)
    if not m:
        return []
    blevels = [int(x) for x in _LVL_RE.findall(m.group(1))]
    if len(blevels) == len(txt):
        return blevels
    out, i = [], 0
    for ch in txt:
        n = len(ch.encode("utf-8"))
        out.append(blevels[i] if i < len(blevels) else 1)
        i += n
    return out

def mirror_brackets(txt):
    """Apply Unicode bidi mirroring, which python-bidi 0.6 leaves to the caller."""
    if not any(c in txt for c in "()[]{}\u00ab\u00bb"):
        return txt
    lv = _levels(txt)
    if len(lv) != len(txt):
        return txt
    return "".join(
        c.translate(MIRROR) if lv[i] % 2 else c for i, c in enumerate(txt)
    )

# In RTL visual flow the reading direction is right-to-left, so a logical
# "leads to" arrow must be drawn pointing LEFT.
GLYPH_FIX = {
    "\u2192": "\u2190", "\u2190": "\u2192",
    "\u2705": "\u2713", "\U0001F525": "", "\U0001F447": "",
    "\u25bc": "\u2193", "\u25b2": "\u2191", "\u25a2": "\u2610",
}

def fix_glyphs(s):
    for k, v in GLYPH_FIX.items():
        s = s.replace(k, v)
    # emoji removal can leave a dangling space before punctuation
    s = re.sub(r"\s+([»\)\]،.!?])", r"\1", s)
    return re.sub(r"[ \t]{2,}", " ", s).strip()

def shape(txt):
    """logical persian text -> visual string ready for drawing"""
    if not txt:
        return ""
    return get_display(RESHAPER.reshape(mirror_brackets(fix_glyphs(txt))), base_dir="R")


sline = shape  # single-line strings use the same path


class Doc(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_auto_page_break(False)
        self.ML, self.MR, self.MT, self.MB = 17.0, 17.0, 20.0, 20.0
        for style, fname in (("", "Regular"), ("B", "Bold"), ("I", "Medium"), ("BI", "ExtraBold")):
            self.add_font("Vazir", style, os.path.join(FONT_DIR, f"Vazirmatn-{fname}.ttf"))
        self.add_font("VazirLight", "", os.path.join(FONT_DIR, "Vazirmatn-Light.ttf"))
        self.add_font("VazirSemi", "", os.path.join(FONT_DIR, "Vazirmatn-SemiBold.ttf"))
        self.cover_done = False
        self.page_no_offset = 0

    # ---- geometry helpers ----
    @property
    def content_w(self):
        return self.w - self.ML - self.MR

    @property
    def right(self):
        return self.w - self.MR

    def footer_draw(self):
        n = self.page_no() - self.page_no_offset
        if n < 1:
            return
        self.set_draw_color(*LINE)
        self.set_line_width(0.2)
        self.line(self.ML, self.h - 13, self.right, self.h - 13)
        self.set_font("Vazir", "", 8)
        self.set_text_color(*MUTED)
        self.text(self.ML, self.h - 8.5, str(n))
        s = sline("پلن محتوای اینستاگرام | استودیو موشن‌گرافیک")
        self.text(self.right - self.get_string_width(s), self.h - 8.5, s)

    def new_page(self):
        if self.page_no() >= 1:
            self.footer_draw()
        self.add_page()
        self.y = self.MT

    def need(self, hmm):
        if self.y + hmm > self.h - self.MB:
            self.new_page()
            return True
        return False

    # ---- rich text engine (RTL, run-based) ----
    def set_run_font(self, style, size):
        if style == "b":
            self.set_font("Vazir", "B", size)
        elif style == "c":
            self.set_font("VazirSemi", "", size)
        else:
            self.set_font("Vazir", "", size)

    def tokenize(self, md):
        """inline markdown -> [(word, style)] in logical order; style in {n,b,c}"""
        spans, out = [], []
        for chunk in re.split(r"(\*\*.+?\*\*|`[^`]+`)", md):
            if not chunk:
                continue
            if chunk.startswith("**") and chunk.endswith("**"):
                spans.append((chunk[2:-2], "b"))
            elif chunk.startswith("`") and chunk.endswith("`"):
                spans.append((chunk[1:-1], "c"))
            else:
                spans.append((chunk, "n"))
        for txt, st in spans:
            for w in txt.split(" "):
                if w != "":
                    out.append((w, st))
        return out

    def measure(self, words, style, size):
        """width of a whole style-run, shaped as one unit (correct bidi)"""
        self.set_run_font(style, size)
        return self.get_string_width(shape(" ".join(words)))

    def space_w(self, size):
        self.set_run_font("n", size)
        return self.get_string_width(" ")

    def layout(self, tokens, size, maxw):
        """greedy wrap -> list of lines; each line = [[words], style]

        Words are accumulated into maximal same-style runs. Each run is later
        shaped as a single string, so bidi sees enough context to order embedded
        Latin/number sequences and to mirror bracket pairs that span a space.
        """
        lines, cur, cur_w = [], [], 0.0
        sw = self.space_w(size)
        for word, st in tokens:
            self.set_run_font(st, size)
            ww = self.get_string_width(shape(word))
            add = ww + (sw if cur else 0)
            if cur and cur_w + add > maxw:
                lines.append(cur)
                cur, cur_w = [], 0.0
                add = ww
            if cur and cur[-1][1] == st:
                cur[-1][0].append(word)
            else:
                cur.append([[word], st])
            cur_w += add
        if cur:
            lines.append(cur)
        return lines

    def draw_line(self, line, size, y, right_x, color=None, align="right", maxw=None):
        widths, sw = [], self.space_w(size)
        for words, st in line:
            widths.append(self.measure(words, st, size))
        total = sum(widths) + sw * (len(line) - 1)
        x = right_x
        if align == "center" and maxw:
            x = right_x - (maxw - total) / 2.0
        for (words, st), w in zip(line, widths):
            self.set_run_font(st, size)
            self.set_text_color(*(color or INK))
            if st == "c":
                self.set_text_color(*ACCENT_DK)
            x -= w
            self.text(x, y, shape(" ".join(words)))
            x -= sw

    def para(self, md, size=10.2, lh=6.4, color=None, indent=0.0, gap=3.2, align="right"):
        tokens = self.tokenize(md)
        maxw = self.content_w - indent
        lines = self.layout(tokens, size, maxw)
        for ln in lines:
            self.need(lh)
            self.y += lh
            self.draw_line(ln, size, self.y, self.right - indent, color, align, maxw)
        self.y += gap

    # ---- block elements ----
    def h1(self, txt):
        self.need(24)
        self.y += 12
        self.set_font("Vazir", "B", 19)
        self.set_text_color(*DARK)
        s = sline(txt)
        self.text(self.right - self.get_string_width(s), self.y, s)
        self.y += 3.4
        self.set_fill_color(*ACCENT)
        self.rect(self.right - 26, self.y, 26, 1.6, "F")
        self.y += 8

    def h2(self, txt, num=None):
        self.need(26)
        self.y += 9
        top = self.y - 6.4
        # numbered chip
        self.set_font("Vazir", "B", 13.5)
        self.set_text_color(*DARK)
        s = sline(txt)
        tw = self.get_string_width(s)
        boxh = 11.0
        self.set_fill_color(*SOFT_BG)
        self.rect(self.ML, top, self.content_w, boxh, "F")
        self.set_fill_color(*ACCENT)
        self.rect(self.right - 1.8, top, 1.8, boxh, "F")
        self.text(self.right - tw - 5.5, top + 7.6, s)
        if num:
            self.set_font("Vazir", "B", 12)
            self.set_text_color(*ACCENT)
            ns = sline(num)
            self.text(self.right - tw - 11.5 - self.get_string_width(ns), top + 7.6, ns)
        self.y = top + boxh + 5.2

    def h3(self, txt):
        self.need(14)
        self.y += 5.5
        self.set_font("Vazir", "B", 11.4)
        self.set_text_color(*ACCENT_DK)
        s = sline(txt)
        self.text(self.right - self.get_string_width(s), self.y, s)
        self.y += 4.2

    def idea(self, num, title, body):
        """numbered creative idea card"""
        tokens = self.tokenize(body)
        lines = self.layout(tokens, 9.8, self.content_w - 13)
        self.set_font("Vazir", "B", 10.8)
        tlines = self.layout(self.tokenize(title), 10.8, self.content_w - 13)
        boxh = 7.0 + len(tlines) * 6.0 + len(lines) * 5.9
        if self.y + boxh > self.h - self.MB:
            self.new_page()
        top = self.y
        self.set_fill_color(252, 251, 253)
        self.rect(self.ML, top, self.content_w, boxh, "F")
        self.set_fill_color(*ACCENT)
        self.rect(self.right - 1.4, top, 1.4, boxh, "F")
        # number badge (circle, so the digit never collides with RTL punctuation)
        cx, cy, r = self.ML + 5.4, top + 5.4, 3.5
        self.set_fill_color(*ACCENT)
        self.ellipse(cx - r, cy - r, r * 2, r * 2, "F")
        self.set_font("Vazir", "B", 8.2)
        self.set_text_color(255, 255, 255)
        ns = sline(num.rstrip("."))
        self.text(cx - self.get_string_width(ns) / 2, cy + 2.9, ns)
        y = top + 2.2
        for ln in tlines:
            y += 6.0
            self.draw_line(ln, 10.8, y, self.right - 5.5, DARK)
        for ln in lines:
            y += 5.9
            self.draw_line(ln, 9.8, y, self.right - 5.5, (60, 60, 72))
        self.y = top + boxh + 3.4

    def bullet(self, md, marker="•", size=10.0, lh=6.1):
        tokens = self.tokenize(md)
        lines = self.layout(tokens, size, self.content_w - 7.5)
        self.need(lh * len(lines))
        first_y = self.y + lh
        for i, ln in enumerate(lines):
            self.need(lh)
            self.y += lh
            if i == 0:
                first_y = self.y
            self.draw_line(ln, size, self.y, self.right - 7.5)
        self.set_font("Vazir", "B", size)
        self.set_text_color(*ACCENT)
        m = sline(marker)
        self.text(self.right - self.get_string_width(m) - 1.5, first_y, m)
        self.y += 1.4

    def checkbox(self, md, size=10.0, lh=6.3):
        tokens = self.tokenize(md)
        lines = self.layout(tokens, size, self.content_w - 9.0)
        self.need(lh * len(lines) + 1)
        first_y = self.y + lh
        for i, ln in enumerate(lines):
            self.need(lh)
            self.y += lh
            if i == 0:
                first_y = self.y
            self.draw_line(ln, size, self.y, self.right - 9.0)
        self.set_draw_color(*ACCENT)
        self.set_line_width(0.35)
        self.rect(self.right - 4.4, first_y - 3.2, 3.6, 3.6, "D")
        self.y += 1.6

    def quote(self, md):
        tokens = self.tokenize(md)
        lines = self.layout(tokens, 10.0, self.content_w - 12)
        h = len(lines) * 6.2 + 7
        if self.y + h > self.h - self.MB:
            self.new_page()
        top = self.y
        self.set_fill_color(253, 243, 245)
        self.rect(self.ML, top, self.content_w, h, "F")
        self.set_fill_color(*ACCENT)
        self.rect(self.right - 2.0, top, 2.0, h, "F")
        y = top + 1.5
        for ln in lines:
            y += 6.2
            self.draw_line(ln, 10.0, y, self.right - 6.5, ACCENT_DK)
        self.y = top + h + 4.5

    def code(self, lines_txt):
        h = len(lines_txt) * 5.6 + 7
        if self.y + h > self.h - self.MB:
            self.new_page()
        top = self.y
        self.set_fill_color(*SOFT_BG)
        self.set_draw_color(*LINE)
        self.set_line_width(0.25)
        self.rect(self.ML, top, self.content_w, h, "DF")
        y = top + 2.0
        for t in lines_txt:
            y += 5.6
            self.set_font("VazirSemi", "", 9.2)
            self.set_text_color(60, 60, 72)
            s = sline(t)
            self.text(self.right - 4 - self.get_string_width(s), y, s)
        self.y = top + h + 4.0

    def hr(self):
        self.need(6)
        self.y += 3
        self.set_draw_color(*LINE)
        self.set_line_width(0.25)
        self.line(self.ML + 40, self.y, self.right - 40, self.y)
        self.y += 3

    # ---- table ----
    def table(self, header, rows):
        ncol = len(header)
        # column weights based on longest cell
        weights = []
        for c in range(ncol):
            cells = [header[c]] + [r[c] for r in rows]
            self.set_font("Vazir", "", 9.2)
            weights.append(max(6.0, max(
                self.get_string_width(sline(re.sub(r"\*\*|`", "", x))) for x in cells)))
        tot = sum(weights)
        widths = [max(16.0, self.content_w * w / tot) for w in weights]
        scale = self.content_w / sum(widths)
        widths = [w * scale for w in widths]

        def row_h(cells, size, pad=4.6):
            hmax = 0
            for c, cell in enumerate(cells):
                lines = self.layout(self.tokenize(cell), size, widths[c] - 5)
                hmax = max(hmax, len(lines) * 5.5)
            return hmax + pad

        def draw_row(cells, y, size, bold, bg, txtcolor):
            h = row_h(cells, size)
            x = self.right
            if bg:
                self.set_fill_color(*bg)
                self.rect(self.ML, y, self.content_w, h, "F")
            for c, cell in enumerate(cells):
                w = widths[c]
                x -= w
                lines = self.layout(self.tokenize(cell if not bold else f"**{cell}**"), size, w - 5)
                yy = y + (h - len(lines) * 5.5) / 2.0
                for ln in lines:
                    yy += 5.5
                    self.draw_line(ln, size, yy - 1.2, x + w - 2.5, txtcolor)
            self.set_draw_color(*LINE)
            self.set_line_width(0.2)
            self.line(self.ML, y + h, self.right, y + h)
            return h

        hh = row_h(header, 9.2) + 1
        if self.y + hh + 14 > self.h - self.MB:
            self.new_page()
        self.y += 1
        y = self.y
        hgt = row_h(header, 9.2) + 1
        self.set_fill_color(*TBL_HEAD)
        self.rect(self.ML, y, self.content_w, hgt, "F")
        x = self.right
        for c, cell in enumerate(header):
            w = widths[c]
            x -= w
            lines = self.layout(self.tokenize(f"**{re.sub(r'[*`]', '', cell)}**"), 9.2, w - 5)
            yy = y + (hgt - len(lines) * 5.5) / 2.0
            for ln in lines:
                yy += 5.5
                self.draw_line(ln, 9.2, yy - 1.2, x + w - 2.5, (255, 255, 255))
        y += hgt
        for i, r in enumerate(rows):
            h = row_h(r, 9.0)
            if y + h > self.h - self.MB:
                self.y = y
                self.new_page()
                y = self.y
            bg = TBL_ALT if i % 2 == 0 else (255, 255, 255)
            draw_row(r, y, 9.0, False, bg, (45, 45, 58))
            y += h
        self.y = y + 5.0


# ---------------- markdown parsing ----------------
def parse(md_text):
    blocks, lines = [], md_text.split("\n")
    i = 0
    while i < len(lines):
        ln = lines[i].rstrip()
        s = ln.strip()
        if not s:
            i += 1
            continue
        if s.startswith("```"):
            buf = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                buf.append(lines[i].rstrip())
                i += 1
            i += 1
            blocks.append(("code", [b for b in buf if b.strip() != ""]))
            continue
        if s.startswith("|"):
            tbl = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                tbl.append(lines[i].strip())
                i += 1
            cells = [[c.strip() for c in r.strip("|").split("|")] for r in tbl]
            cells = [r for r in cells if not all(re.fullmatch(r":?-{2,}:?", c or "-") for c in r)]
            if cells:
                blocks.append(("table", (cells[0], cells[1:])))
            continue
        if re.fullmatch(r"-{3,}", s):
            blocks.append(("hr", None)); i += 1; continue
        if s.startswith("### "):
            blocks.append(("h3", s[4:].strip())); i += 1; continue
        if s.startswith("## "):
            blocks.append(("h2", s[3:].strip())); i += 1; continue
        if s.startswith("# "):
            blocks.append(("h1", s[2:].strip())); i += 1; continue
        if s.startswith("> "):
            blocks.append(("quote", s[2:].strip())); i += 1; continue
        if re.match(r"^- \[ \] ", s):
            blocks.append(("check", s[6:].strip())); i += 1; continue
        if s.startswith("- "):
            blocks.append(("bullet", s[2:].strip())); i += 1; continue
        m = re.match(r"^(\d+)\.\s+(.*)$", s)
        if m:
            blocks.append(("num", (m.group(1), m.group(2)))); i += 1; continue
        # bold-led idea heading: **۱. Title** followed by body line(s)
        m = re.match(r"^\*\*(.+?)\*\*$", s)
        if m:
            head = m.group(1)
            body = []
            j = i + 1
            while j < len(lines) and lines[j].strip() and not re.match(r"^(#|\||>|-{3,}|\*\*.+\*\*$|- |\d+\. |```)", lines[j].strip()):
                body.append(lines[j].strip())
                j += 1
            blocks.append(("idea", (head, " ".join(body))))
            i = j
            continue
        blocks.append(("para", s))
        i += 1
    return blocks


FA = "۰۱۲۳۴۵۶۷۸۹"
def fa_num(n):
    return "".join(FA[int(d)] for d in str(n))


def build_cover(pdf, title, subtitle, kicker):
    pdf.add_page()
    pdf.set_fill_color(*DARK)
    pdf.rect(0, 0, pdf.w, pdf.h, "F")
    # accent geometry
    pdf.set_fill_color(*ACCENT)
    pdf.rect(0, 74, pdf.w, 1.2, "F")
    pdf.set_fill_color(233, 63, 96)
    for k, yy in enumerate([120, 129, 138]):
        pdf.set_fill_color(233, 63, 96) if k == 0 else pdf.set_fill_color(70, 68, 88)
        pdf.rect(pdf.w - 17 - (0 if k == 0 else 0), yy, 0, 0, "F")
    # kicker
    pdf.set_font("Vazir", "", 11)
    pdf.set_text_color(*ACCENT)
    s = sline(kicker)
    pdf.text(pdf.w - 17 - pdf.get_string_width(s), 62, s)
    # title
    pdf.set_font("Vazir", "B", 30)
    pdf.set_text_color(255, 255, 255)
    s = sline(title)
    pdf.text(pdf.w - 17 - pdf.get_string_width(s), 100, s)
    pdf.set_font("VazirLight", "", 14.5)
    pdf.set_text_color(196, 194, 210)
    for k, part in enumerate(subtitle):
        s = sline(part)
        pdf.text(pdf.w - 17 - pdf.get_string_width(s), 116 + k * 9, s)
    # stat strip
    stats = [("۲۰", "ایده اجرایی"), ("۵", "ستون محتوایی"), ("۳۰", "روز تقویم"), ("۱۱", "بخش")]
    x = pdf.w - 17
    pdf.set_fill_color(34, 34, 46)
    pdf.rect(17, 175, pdf.w - 34, 26, "F")
    cw = (pdf.w - 34) / 4
    for i, (num, lab) in enumerate(stats):
        cx = pdf.w - 17 - i * cw - cw / 2
        pdf.set_font("Vazir", "B", 15)
        pdf.set_text_color(*ACCENT)
        s = sline(num)
        pdf.text(cx - pdf.get_string_width(s) / 2, 188, s)
        pdf.set_font("Vazir", "", 8.6)
        pdf.set_text_color(180, 178, 195)
        s = sline(lab)
        pdf.text(cx - pdf.get_string_width(s) / 2, 195.5, s)
    pdf.set_font("Vazir", "", 9.4)
    pdf.set_text_color(140, 138, 158)
    s = sline("راهنمای عملی تولید محتوا و جذب مشتری برای استودیوهای موشن‌گرافیک")
    pdf.text(pdf.w - 17 - pdf.get_string_width(s), pdf.h - 22, s)
    pdf.page_no_offset = 1


def main():
    md = open(SRC, encoding="utf-8").read()
    blocks = parse(md)
    pdf = Doc()

    title = "پلن محتوای اینستاگرام"
    build_cover(
        pdf, title,
        ["استودیو موشن‌گرافیک", "از آرشیو نمونه‌کار تا ماشین جذب مشتری"],
        "سند استراتژی محتوا",
    )
    pdf.new_page()

    sec = 0
    skip_first_h1 = True
    for kind, val in blocks:
        if kind == "h1":
            if skip_first_h1:
                skip_first_h1 = False
                continue
            pdf.h1(val)
        elif kind == "h2":
            m = re.match(r"^([۰-۹0-9]+)\)\s*(.*)$", val)
            sec += 1
            # only break when the remaining space is too small to host the section head
            if sec > 1 and pdf.y > pdf.h - pdf.MB - 78:
                pdf.new_page()
            if m:
                pdf.h2(m.group(2), num=m.group(1))
            else:
                pdf.h2(val)
        elif kind == "h3":
            pdf.h3(val)
        elif kind == "quote":
            pdf.quote(val)
        elif kind == "code":
            pdf.code(val)
        elif kind == "table":
            pdf.table(val[0], val[1])
        elif kind == "hr":
            pass
        elif kind == "bullet":
            pdf.bullet(val)
        elif kind == "check":
            pdf.checkbox(val)
        elif kind == "num":
            pdf.bullet(val[1], marker=fa_num(val[0]) + ".")
        elif kind == "idea":
            head = val[0]
            m = re.match(r"^([۰-۹0-9]+)[\.\)]\s*(.*)$", head)
            if m and val[1]:
                pdf.idea(m.group(1) + ".", m.group(2), val[1])
            elif val[1]:
                pdf.idea("•", head, val[1])
            else:
                pdf.h3(head)
        else:
            pdf.para(val)

    pdf.footer_draw()
    pdf.output(OUT)
    print("written", OUT, os.path.getsize(OUT), "bytes,", pdf.page_no(), "pages")


if __name__ == "__main__":
    main()
