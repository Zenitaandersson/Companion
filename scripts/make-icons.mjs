// Generates the PWA icons without any image dependency.
// Draws a warm cream rounded square with a dark amber "C" ring and a small sun dot.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'public', 'icons');
mkdirSync(OUT, { recursive: true });

const CREAM = [0xfb, 0xf6, 0xee];
const AMBER = [0x8a, 0x5a, 0x14];
const SAND = [0xf1, 0xe4, 0xcc];

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function png(size, paint) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = paint(x, y, size);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function makePainter({ transparentCorners }) {
  return (x, y, size) => {
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.22;
    // Rounded-square mask
    const dx = Math.max(Math.abs(x - cx) - (cx - radius), 0);
    const dy = Math.max(Math.abs(y - cy) - (cy - radius), 0);
    const outside = Math.hypot(dx, dy) > radius;
    if (outside) return transparentCorners ? [0, 0, 0, 0] : [...CREAM, 255];

    const d = Math.hypot(x - cx, y - cy) / size;
    // Amber ring open on the right ("C")
    const angle = Math.atan2(y - cy, x - cx);
    const inRing = d > 0.24 && d < 0.34 && Math.abs(angle) > 0.65;
    if (inRing) return [...AMBER, 255];
    // Small warm sun dot inside
    if (d < 0.09) return [...AMBER, 255];
    // Soft sand halo behind
    if (d < 0.4) return [...SAND, 255];
    return [...CREAM, 255];
  };
}

writeFileSync(join(OUT, 'icon-192.png'), png(192, makePainter({ transparentCorners: false })));
writeFileSync(join(OUT, 'icon-512.png'), png(512, makePainter({ transparentCorners: false })));
writeFileSync(join(OUT, 'apple-touch-icon.png'), png(180, makePainter({ transparentCorners: false })));
console.log('icons written to', OUT);
