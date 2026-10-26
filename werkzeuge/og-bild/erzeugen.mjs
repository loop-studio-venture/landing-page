// Generates the share preview image and the derived icons of the landing page.
//
//   npm --prefix werkzeuge/og-bild install      (once; sharp is the only dependency)
//   node werkzeuge/og-bild/erzeugen.mjs         (from any directory)
//
// Writes, relative to the repo root: bilder/og-lupi.png (or bilder/og-lupi.jpg when the PNG is
// over the size limit), icon-512.png, icon-192.png, favicon.ico. Every pixel comes from the
// approved files in bilder/lupi/ and bilder/logo/; nothing is drawn, cropped or recoloured.
// All layout rules are asserted BEFORE the first file is written, so a bad constant exits 1
// and leaves the working tree untouched.

import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const at = (p) => join(ROOT, p);

// ---- Layout constants (the composition rules of the card) ----
const CANVAS_W = 1200;
const CANVAS_H = 630;
const GROUND = '#FAF7F1';                  // design system bg.paper, the landing's --papier
const LUPI_FILE = 'bilder/lupi/lupi.webp'; // lupi_00_kanon, 900x900, figure 820 px tall
const LUPI_SIZE = 560;                     // the whole 900x900 canvas, scaled uniformly
const LUPI_X = 320;
const LUPI_Y = 35;
const WORDMARK_FILE = 'bilder/logo/loop-studio-dunkel.png';
const WORDMARK_W = 230;
const WORDMARK_X = 942;                    // centred in the right band x 915-1200
const SQUARE_X0 = 285;                     // centre square 630x630 that WhatsApp & co. crop to
const SQUARE_X1 = 915;
const SQUARE_MARGIN = 30;                  // Lupi's canvas stays at least this far inside it
const MAX_BYTES = 307200;                  // 300 KB
const ICON_SOURCE = 'bilder/logo/favicon-512.png';
const ICON_SOURCE_SIZE = 512;
const ICO_SIZES = [16, 32, 48];

// ---- Output files ----
const OUT_OG_PNG = 'bilder/og-lupi.png';
const OUT_OG_JPG = 'bilder/og-lupi.jpg';

function fail(msg) {
  console.error(`erzeugen: ${msg}`);
  process.exit(1);
}

// PNG dimensions from the IHDR, independent of sharp.
function pngSize(buf) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 24 || !buf.subarray(0, 8).equals(sig)) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

// ---- 1. Assert the layout and the sources (nothing is written yet) ----
if (LUPI_X < SQUARE_X0 + SQUARE_MARGIN || LUPI_X + LUPI_SIZE > SQUARE_X1 - SQUARE_MARGIN) {
  fail(`Lupi box x ${LUPI_X}-${LUPI_X + LUPI_SIZE} must lie inside the centre square x ${SQUARE_X0}-${SQUARE_X1} with a margin of ${SQUARE_MARGIN} px`);
}
if (LUPI_Y < SQUARE_MARGIN || LUPI_Y + LUPI_SIZE > CANVAS_H - SQUARE_MARGIN) {
  fail(`Lupi box y ${LUPI_Y}-${LUPI_Y + LUPI_SIZE} must lie inside the canvas (height ${CANVAS_H}) with a margin of ${SQUARE_MARGIN} px`);
}
if (WORDMARK_X + WORDMARK_W > CANVAS_W || (WORDMARK_X < SQUARE_X1 && WORDMARK_X + WORDMARK_W > SQUARE_X0)) {
  fail(`wordmark box x ${WORDMARK_X}-${WORDMARK_X + WORDMARK_W} must lie outside the centre square x ${SQUARE_X0}-${SQUARE_X1} and inside the canvas`);
}

const lupiMeta = await sharp(at(LUPI_FILE)).metadata();
if (lupiMeta.width !== 900 || lupiMeta.height !== 900) {
  fail(`${LUPI_FILE} must be 900x900 (the web_900 norm), found ${lupiMeta.width}x${lupiMeta.height}`);
}
const iconBytes = readFileSync(at(ICON_SOURCE));
const iconDim = pngSize(iconBytes);
if (!iconDim || iconDim.w !== ICON_SOURCE_SIZE || iconDim.h !== ICON_SOURCE_SIZE) {
  fail(`${ICON_SOURCE} must be a ${ICON_SOURCE_SIZE}x${ICON_SOURCE_SIZE} PNG, found ${iconDim ? `${iconDim.w}x${iconDim.h}` : 'no PNG header'}`);
}

// ---- 2. Compose the card ----
const lupi = await sharp(at(LUPI_FILE)).resize(LUPI_SIZE, LUPI_SIZE, { fit: 'fill' }).png().toBuffer();
const wordmark = await sharp(at(WORDMARK_FILE)).resize({ width: WORDMARK_W }).png().toBuffer();
const wmMeta = await sharp(wordmark).metadata();
const wordmarkY = Math.round((CANVAS_H - wmMeta.height) / 2);

const card = sharp({ create: { width: CANVAS_W, height: CANVAS_H, channels: 3, background: GROUND } })
  .composite([
    { input: lupi, left: LUPI_X, top: LUPI_Y },
    { input: wordmark, left: WORDMARK_X, top: wordmarkY },
  ]);

const files = []; // { path, bytes, format, w, h }

const png = await card.clone().png({ palette: true, colours: 256, dither: 1.0, compressionLevel: 9, effort: 10 }).toBuffer();
if (png.length <= MAX_BYTES) {
  files.push({ path: OUT_OG_PNG, bytes: png, format: 'png', w: CANVAS_W, h: CANVAS_H });
} else {
  const jpg = await card.clone().jpeg({ quality: 88, chromaSubsampling: '4:4:4', mozjpeg: false }).toBuffer();
  console.log(`erzeugen: palette PNG is ${png.length} bytes (limit ${MAX_BYTES}), falling back to JPEG`);
  if (jpg.length > MAX_BYTES) {
    fail(`neither the palette PNG (${png.length} bytes) nor the JPEG (${jpg.length} bytes) is within ${MAX_BYTES} bytes`);
  }
  files.push({ path: OUT_OG_JPG, bytes: jpg, format: 'jpeg', w: CANVAS_W, h: CANVAS_H });
}

// ---- 3. Icons ----
const resizeIcon = (size) =>
  sharp(iconBytes).resize(size, size).png({ compressionLevel: 9, effort: 10 }).toBuffer();

files.push({ path: 'icon-512.png', bytes: iconBytes, format: 'png', w: 512, h: 512 });
files.push({ path: 'icon-192.png', bytes: await resizeIcon(192), format: 'png', w: 192, h: 192 });

// ICO container: ICONDIR (6 bytes), one 16-byte entry per frame, then the PNG blobs.
const frames = [];
for (const s of ICO_SIZES) frames.push({ s, data: await resizeIcon(s) });
const head = Buffer.alloc(6 + 16 * frames.length);
head.writeUInt16LE(0, 0); // reserved
head.writeUInt16LE(1, 2); // type: icon
head.writeUInt16LE(frames.length, 4);
let offset = head.length;
frames.forEach((f, i) => {
  const e = 6 + 16 * i;
  head.writeUInt8(f.s, e);      // width
  head.writeUInt8(f.s, e + 1);  // height
  head.writeUInt8(0, e + 2);    // palette colours
  head.writeUInt8(0, e + 3);    // reserved
  head.writeUInt16LE(1, e + 4); // colour planes
  head.writeUInt16LE(32, e + 6);// bits per pixel
  head.writeUInt32LE(f.data.length, e + 8);
  head.writeUInt32LE(offset, e + 12);
  offset += f.data.length;
});
const ico = Buffer.concat([head, ...frames.map((f) => f.data)]);
files.push({ path: 'favicon.ico', bytes: ico, format: `ico (${ICO_SIZES.join('/')} px PNG frames)`, w: 48, h: 48 });

// ---- 4. Write ----
for (const f of files) writeFileSync(at(f.path), f.bytes);
// Only one card file may exist: drop the sibling of the other format.
const sibling = files[0].path === OUT_OG_PNG ? OUT_OG_JPG : OUT_OG_PNG;
if (existsSync(at(sibling))) rmSync(at(sibling));

for (const f of files) {
  console.log(`${relative(process.cwd(), at(f.path)) || f.path}: ${f.format}, ${f.w}x${f.h}, ${f.bytes.length} bytes`);
}
