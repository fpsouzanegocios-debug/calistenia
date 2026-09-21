const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crcBuf]);
}

function createPNG(size, isMaskable = false) {
  const width = size;
  const height = size;
  const rawData = Buffer.alloc(height * (1 + width * 4));

  const cx = width / 2;
  const cy = height / 2;
  const rCircle = isMaskable ? width * 0.48 : width * 0.44;

  // Colors:
  // Primary brand Rose: #D3455B -> [211, 69, 91]
  // Accent brand Coral: #E85A71 -> [232, 90, 113]
  // White: #FFFFFF -> [255, 255, 255]

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= rCircle) {
        // Inside circular badge
        // Draw graceful calisthenics / lotus emblem in center
        const relX = (x - cx) / (size * 0.28);
        const relY = (y - cy) / (size * 0.28);

        // Core shape: Lotus/Flame/Calisthenics figure
        const inHead = (Math.sqrt(relX * relX + (relY + 0.55) * (relY + 0.55)) < 0.22);
        const inTorso = (Math.abs(relX) < (0.28 - relY * 0.15) && relY > -0.3 && relY < 0.5);
        const inPetalL = (relX > -0.9 && relX < -0.15 && Math.abs(relY - (relX * 0.4)) < 0.2);
        const inPetalR = (relX > 0.15 && relX < 0.9 && Math.abs(relY + (relX * 0.4)) < 0.2);
        const inBase = (relY >= 0.35 && relY <= 0.6 && Math.abs(relX) < (0.6 - (relY - 0.35) * 0.5));

        if (inHead || inTorso || inPetalL || inPetalR || inBase) {
          // White emblem
          rawData[offset++] = 255;
          rawData[offset++] = 255;
          rawData[offset++] = 255;
          rawData[offset++] = 255;
        } else {
          // Gradient rose background
          const t = y / height;
          const red = Math.round(211 + (232 - 211) * t);
          const green = Math.round(69 + (80 - 69) * t);
          const blue = Math.round(91 + (113 - 91) * t);
          rawData[offset++] = red;
          rawData[offset++] = green;
          rawData[offset++] = blue;
          rawData[offset++] = 255;
        }
      } else {
        // Outside circle
        if (isMaskable) {
          // Maskable icon must fill the full canvas
          rawData[offset++] = 211;
          rawData[offset++] = 69;
          rawData[offset++] = 91;
          rawData[offset++] = 255;
        } else {
          // Transparent
          rawData[offset++] = 0;
          rawData[offset++] = 0;
          rawData[offset++] = 0;
          rawData[offset++] = 0;
        }
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit depth
  ihdr[9] = 6; // color type 6: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const idat = zlib.deflateSync(rawData);
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', idat);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach(size => {
  const png = createPNG(size, false);
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
  console.log(`Generated icon-${size}.png`);
});

// Generate maskable 512
const maskablePng = createPNG(512, true);
fs.writeFileSync(path.join(outDir, 'icon-maskable.png'), maskablePng);
console.log('Generated icon-maskable.png');

// Also write an SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="roseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#D3455B" />
      <stop offset="100%" stop-color="#E85A71" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#roseGrad)"/>
  <circle cx="256" cy="180" r="44" fill="#FFFFFF"/>
  <path d="M210 240 C210 230 302 230 302 240 L286 350 C286 360 226 360 226 350 Z" fill="#FFFFFF"/>
  <path d="M140 260 C180 230 220 260 220 300 C170 300 130 290 140 260 Z" fill="#FFFFFF"/>
  <path d="M372 260 C332 230 292 260 292 300 C342 300 382 290 372 260 Z" fill="#FFFFFF"/>
  <path d="M170 360 C210 390 302 390 342 360 C322 410 190 410 170 360 Z" fill="#FFFFFF"/>
</svg>`;
fs.writeFileSync(path.join(outDir, 'icon.svg'), svgContent);
console.log('Generated icon.svg');
