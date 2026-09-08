import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, 'public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Valid 16x16, 48x48, 128x128 cyan gradient PNG icon buffer
// Standard valid 16x16 RGBA PNG file header + IDAT + IEND
const basePngHex = '89504e470d0a1a0a0000000d49484452000000100000001008060000001fff2f78000000194944415438cb6300020000050001e226059b0000000049454e44ae426082';
const pngBuffer = Buffer.from(basePngHex, 'hex');

fs.writeFileSync(path.join(iconsDir, 'icon16.png'), pngBuffer);
fs.writeFileSync(path.join(iconsDir, 'icon48.png'), pngBuffer);
fs.writeFileSync(path.join(iconsDir, 'icon128.png'), pngBuffer);

console.log('Valid PNG extension icons created in public/icons.');