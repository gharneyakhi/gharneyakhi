#!/usr/bin/env python3
"""Inline the card SVGs (with deconflicted ids) into index.html."""
import re, io, os

D = os.path.dirname(os.path.abspath(__file__))

def rename_ids(svg: str, suffix: str) -> str:
    # ids used: paw, dogBadge, bgF, glowF (front) / icPin, icPhone, icInsta (back)
    names = ['paw', 'dogBadge', 'bgF', 'glowF', 'icPin', 'icPhone', 'icInsta']
    for n in sorted(names, key=len, reverse=True):
        svg = svg.replace(f'id="{n}"', f'id="{n}-{suffix}"')
        svg = svg.replace(f'href="#{n}"', f'href="#{n}-{suffix}"')
    return svg

front = open(os.path.join(D, 'svg/front.svg'), encoding='utf-8').read()
back = open(os.path.join(D, 'svg/back.svg'), encoding='utf-8').read()
front = rename_ids(front, 'f')
back = rename_ids(back, 'b')

# drop fixed mm sizes on the root svg so it scales to its container
front = re.sub(r'(<svg[^>]*?) width="85\.6mm" height="54mm"', r'\1 preserveAspectRatio="xMidYMid meet"', front)
back = re.sub(r'(<svg[^>]*?) width="85\.6mm" height="54mm"', r'\1 preserveAspectRatio="xMidYMid meet"', back)

html = f"""<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>میولند — کارت ویزیت پت شاپ</title>
<style>
  /* Vazirmatn (local, subsetted) */
  @font-face {{ font-family:'Vazirmatn'; font-style:normal; font-display:swap; font-weight:400;
    src:url(assets/fonts/vazirmatn-arabic-400-normal.woff2) format('woff2'); unicode-range:U+0600-06FF,U+0750-077F,U+0870-089F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF; }}
  @font-face {{ font-family:'Vazirmatn'; font-style:normal; font-display:swap; font-weight:400;
    src:url(assets/fonts/vazirmatn-latin-400-normal.woff2) format('woff2'); unicode-range:U+0000-00FF,U+2000-206F,U+20AC,U+2122,U+2212; }}
  @font-face {{ font-family:'Vazirmatn'; font-style:normal; font-display:swap; font-weight:500;
    src:url(assets/fonts/vazirmatn-arabic-500-normal.woff2) format('woff2'); unicode-range:U+0600-06FF,U+0750-077F,U+0870-089F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF; }}
  @font-face {{ font-family:'Vazirmatn'; font-style:normal; font-display:swap; font-weight:500;
    src:url(assets/fonts/vazirmatn-latin-500-normal.woff2) format('woff2'); unicode-range:U+0000-00FF,U+2000-206F,U+20AC,U+2122,U+2212; }}
  @font-face {{ font-family:'Vazirmatn'; font-style:normal; font-display:swap; font-weight:700;
    src:url(assets/fonts/vazirmatn-arabic-700-normal.woff2) format('woff2'); unicode-range:U+0600-06FF,U+0750-077F,U+0870-089F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF; }}
  @font-face {{ font-family:'Vazirmatn'; font-style:normal; font-display:swap; font-weight:700;
    src:url(assets/fonts/vazirmatn-latin-700-normal.woff2) format('woff2'); unicode-range:U+0000-00FF,U+2000-206F,U+20AC,U+2122,U+2212; }}
  @font-face {{ font-family:'Vazirmatn'; font-style:normal; font-display:swap; font-weight:900;
    src:url(assets/fonts/vazirmatn-arabic-900-normal.woff2) format('woff2'); unicode-range:U+0600-06FF,U+0750-077F,U+0870-089F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF; }}
  @font-face {{ font-family:'Vazirmatn'; font-style:normal; font-display:swap; font-weight:900;
    src:url(assets/fonts/vazirmatn-latin-900-normal.woff2) format('woff2'); unicode-range:U+0000-00FF,U+2000-206F,U+20AC,U+2122,U+2212; }}

  :root {{
    --teal-950:#072A32; --teal-900:#0C444D; --teal-800:#0E4A52;
    --amber:#EE9A3F; --amber-deep:#D97624;
    --cream:#FBF3E2; --paper:#F1EBDD; --ink:#1A3E45;
  }}
  * {{ box-sizing:border-box; margin:0; padding:0; }}
  body {{
    font-family:'Vazirmatn', system-ui, sans-serif;
    background:var(--paper);
    background-image:radial-gradient(rgba(12,68,77,.05) 1.2px, transparent 1.2px);
    background-size:26px 26px;
    color:var(--ink);
    min-height:100vh;
  }}
  .no-print {{ display:block; }}
  header.top {{
    display:flex; align-items:center; justify-content:space-between; gap:16px;
    max-width:1180px; margin:0 auto; padding:28px 24px 8px;
  }}
  .brand {{ display:flex; align-items:center; gap:14px; }}
  .brand img {{ width:56px; height:56px; filter:drop-shadow(0 3px 6px rgba(7,42,50,.25)); }}
  .brand h1 {{ font-size:26px; font-weight:900; color:var(--teal-900); letter-spacing:-.2px; }}
  .brand small {{ display:block; font-size:13px; font-weight:500; color:var(--amber-deep); margin-top:2px; }}
  .actions {{ display:flex; gap:10px; flex-wrap:wrap; }}
  .btn {{
    font-family:inherit; font-size:14.5px; font-weight:700; cursor:pointer;
    padding:11px 20px; border-radius:999px; border:1.5px solid transparent;
    text-decoration:none; display:inline-flex; align-items:center; gap:8px;
    transition:transform .12s ease, box-shadow .12s ease;
  }}
  .btn:hover {{ transform:translateY(-2px); box-shadow:0 6px 16px rgba(7,42,50,.18); }}
  .btn-primary {{ background:var(--teal-900); color:var(--cream); }}
  .btn-amber {{ background:var(--amber); color:#3B2308; }}
  .btn-ghost {{ background:transparent; color:var(--teal-900); border-color:rgba(12,68,77,.35); }}

  main {{ max-width:1180px; margin:0 auto; padding:18px 24px 60px; }}
  .cards {{ display:grid; grid-template-columns:repeat(auto-fit, minmax(340px, 1fr)); gap:36px; margin-top:26px; }}
  .card-block {{ text-align:center; }}
  .pill {{
    display:inline-block; font-size:13.5px; font-weight:700; color:var(--cream);
    background:var(--teal-900); padding:7px 18px; border-radius:999px; margin-bottom:16px;
  }}
  .pill.alt {{ background:var(--amber); color:#3B2308; }}
  .card-frame {{
    width:100%; max-width:640px; margin:0 auto;
    border-radius:14px; overflow:hidden;
    box-shadow:0 2px 4px rgba(7,42,50,.14), 0 18px 44px -12px rgba(7,42,50,.35);
    background:#fff;
  }}
  .card-frame svg {{ display:block; width:100%; height:auto; }}
  .note {{ font-size:13px; color:rgba(26,62,69,.62); margin-top:12px; }}

  .specs {{
    margin-top:44px; background:rgba(255,255,255,.55); border:1px solid rgba(12,68,77,.12);
    border-radius:18px; padding:22px 26px; display:flex; flex-wrap:wrap; gap:18px 34px; align-items:center; justify-content:center;
  }}
  .spec {{ display:flex; align-items:center; gap:10px; font-size:14px; font-weight:500; color:var(--ink); }}
  .dot {{ width:16px; height:16px; border-radius:50%; border:1px solid rgba(7,42,50,.15); }}

  footer {{ text-align:center; padding:26px; font-size:12.5px; color:rgba(26,62,69,.5); }}

  @media print {{
    .no-print {{ display:none !important; }}
    body {{ background:#fff; }}
    main {{ padding:0; max-width:none; }}
    .cards {{ display:block; gap:0; margin:0; }}
    .card-block {{ margin:0; }}
    .pill, .note {{ display:none !important; }}
    .card-frame {{
      width:85.6mm; height:54mm; max-width:none; margin:0 auto;
      border-radius:0; box-shadow:none; background:none;
      page-break-after:always; break-after:page;
    }}
    .card-frame:last-child {{ page-break-after:auto; }}
    .card-frame svg {{ width:100%; height:100%; }}
    @page {{ size:85.6mm 54mm; margin:0; }}
  }}
</style>
</head>
<body>
<header class="top no-print">
  <div class="brand">
    <img src="svg/logo.svg" alt="لوگو">
    <div>
      <h1>کارت ویزیت «میولند»</h1>
      <small>پت شاپ — شهریار، خیابان ولیعصر</small>
    </div>
  </div>
  <div class="actions">
    <a class="btn btn-primary" href="print/miyoland-business-card.pdf" download>⬇ دانلود فایل چاپ (PDF)</a>
    <button class="btn btn-amber" onclick="window.print()">🖨 چاپ / PDF از مرورگر</button>
  </div>
</header>

<main>
  <div class="cards">
    <section class="card-block">
      <span class="pill">رو اول (جلو)</span>
      <div class="card-frame">
{front}
      </div>
      <p class="note no-print">سایز استاندارد ۸۵٫۶ × ۵۴ میلی‌متر — آماده چاپ با رزولوشن ۳۵۰ DPI</p>
    </section>
    <section class="card-block">
      <span class="pill alt">رو دوم (پشت)</span>
      <div class="card-frame">
{back}
      </div>
      <p class="note no-print">اطلاعات تماس، آدرس و اینستاگرام</p>
    </section>
  </div>

  <div class="specs no-print">
    <span class="spec"><span class="dot" style="background:#0C444D"></span>سبز یاسی #0C444D</span>
    <span class="spec"><span class="dot" style="background:#EE9A3F"></span>نارنجی #EE9A3F</span>
    <span class="spec"><span class="dot" style="background:#FBF3E2"></span>کرم #FBF3E2</span>
    <span class="spec">فونت: وزیرمتن</span>
    <span class="spec">لوگو: SVG برداری (svg/logo.svg)</span>
  </div>
</main>

<footer class="no-print">طراحی برای پت شاپ میولند · MIYOLAND Pet Shop</footer>
</body>
</html>
"""
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(html)
print('index.html written:', len(html), 'bytes')
