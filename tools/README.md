# tools

`render_pdf.py` renders `instagram-content-plan.md` into a styled right-to-left PDF.

## Requirements

```bash
pip install fpdf2 arabic-reshaper python-bidi fonttools
npm pack vazirmatn@33.0.3      # Vazirmatn TTFs -> /tmp/fonts
python3 tools/patch_font.py    # adds missing arrow/check/box glyphs
python3 tools/render_pdf.py
```

Notes:
- `patch_font.py` injects `→ ← ↓ ✓ ☐` into Vazirmatn, which ships without them.
- Requires python-bidi **0.6+**; bracket mirroring is applied manually because
  that release reorders text but does not mirror paired delimiters.
