// Render the business card SVGs to print-ready PNGs + a 2-page print PDF.
// Target: 85.6 x 54 mm at 350 DPI => 1178 x 743 px
const sharp = require('sharp');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');

const dir = __dirname;
const CARD_W = 1178; // px
const CARD_H = 743;  // px
const DPI = 350;

(async () => {
  const buffers = {};
  for (const name of ['front', 'back']) {
    const buf = await sharp(path.join(dir, `svg/${name}.svg`), { density: 100 })
      .resize({ width: CARD_W, height: CARD_H })
      .withMetadata({ density: DPI })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await fsWrite(path.join(dir, `print/${name}.png`), buf);
    buffers[name] = await sharp(buf).jpeg({ quality: 95 }).toBuffer();
    const meta = await sharp(buf).metadata();
    console.log(`print/${name}.png`, meta.width + 'x' + meta.height, 'px @' + meta.density + 'dpi');
  }

  // combined preview for screen (both sides)
  const gap = 120, pad = 110;
  const scale = 0.55;
  const w = Math.round(CARD_W * scale), h = Math.round(CARD_H * scale);
  const W = pad * 2 + w * 2 + gap;
  const H = pad * 2 + h;
  const [fSm, bSm] = await Promise.all([
    sharp(buffers.front).resize({ width: w, height: h }).png().toBuffer(),
    sharp(buffers.back).resize({ width: w, height: h }).png().toBuffer(),
  ]);
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 230, g: 224, b: 208, alpha: 1 } } })
    .composite([
      { input: fSm, left: pad, top: pad },
      { input: bSm, left: pad + w + gap, top: pad },
    ])
    .jpeg({ quality: 90 })
    .toFile(path.join(dir, 'print/both-sides.jpg'));
  console.log('print/both-sides.jpg', W + 'x' + H);

  // 2-page print PDF, exact card size (85.6 x 54 mm)
  const MM = 72 / 25.4;
  const PW = 85.6 * MM, PH = 54 * MM;
  const pdf = await PDFDocument.create();
  pdf.setTitle('میلوند — کارت ویزیت');
  pdf.setProducer('miyoland-card');
  for (const name of ['front', 'back']) {
    const page = pdf.addPage([PW, PH]);
    const jpg = await pdf.embedJpg(buffers[name]);
    page.drawImage(jpg, { x: 0, y: 0, width: PW, height: PH });
  }
  await fsWrite(path.join(dir, 'print/miyoland-business-card.pdf'), await pdf.save());
  console.log('print/miyoland-business-card.pdf (2 pages, 85.6x54mm)');
})().catch((e) => { console.error(e); process.exit(1); });

function fsWrite(p, data) {
  return require('fs').promises.writeFile(p, data);
}
