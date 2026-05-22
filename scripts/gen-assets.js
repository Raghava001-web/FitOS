// Creates minimal valid PNG files for icon and splash
// Uses pure Node.js — no external dependencies
const fs = require("fs");
const zlib = require("zlib");

function createPNG(width, height, r, g, b, outputPath) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk("IHDR", ihdrData);

  // IDAT chunk — raw pixel data
  const rowSize = 1 + width * 3; // filter byte + RGB
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    raw[offset] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 3;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
    }
  }
  const compressed = zlib.deflateSync(raw);
  const idat = makeChunk("IDAT", compressed);

  // IEND chunk
  const iend = makeChunk("IEND", Buffer.alloc(0));

  const png = Buffer.concat([signature, ihdr, idat, iend]);
  fs.writeFileSync(outputPath, png);
  console.log(`Created ${outputPath} (${width}x${height}, ${png.length} bytes)`);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([typeB, data]);
  const crc = Buffer.alloc(4);
  crc.writeInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeB, data, crc]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) | 0;
}

// Dark navy #09111f = RGB(9, 17, 31)
createPNG(1024, 1024, 9, 17, 31, "assets/icon.png");
createPNG(1284, 2778, 9, 17, 31, "assets/splash.png");
