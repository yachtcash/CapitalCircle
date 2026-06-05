// Generate favicon.ico, app icons, apple-touch-icon, and Open Graph image
// from the master SVGs in public/branding/. Run with: npm run icons

import sharp from "sharp";
import pngToIco from "png-to-ico";
import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const ICON_SRC = resolve(ROOT, "public/branding/icon-master.svg");
const OG_SRC = resolve(ROOT, "public/branding/og-master.svg");
const APP_DIR = resolve(ROOT, "src/app");
const PUBLIC_DIR = resolve(ROOT, "public");

async function ensure(dir) {
  await mkdir(dir, { recursive: true });
}

async function rasterize(svgBuffer, size) {
  return sharp(svgBuffer, { density: 600 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  await ensure(APP_DIR);
  await ensure(PUBLIC_DIR);

  const iconSvg = await readFile(ICON_SRC);
  const ogSvg = await readFile(OG_SRC);

  // ---- favicon.ico (multi-resolution 16 / 32 / 48) ----
  const icoSizes = [16, 32, 48];
  const icoPngBuffers = await Promise.all(icoSizes.map((s) => rasterize(iconSvg, s)));
  const icoBuffer = await pngToIco(icoPngBuffers);
  await writeFile(resolve(APP_DIR, "favicon.ico"), icoBuffer);
  console.log("✓ src/app/favicon.ico (16, 32, 48)");

  // ---- Next.js app icon.svg (vector, auto-detected) ----
  await copyFile(ICON_SRC, resolve(APP_DIR, "icon.svg"));
  console.log("✓ src/app/icon.svg");

  // ---- apple-touch-icon (180x180) ----
  await writeFile(resolve(APP_DIR, "apple-icon.png"), await rasterize(iconSvg, 180));
  console.log("✓ src/app/apple-icon.png (180×180)");

  // ---- Open Graph image (1200×630) ----
  const ogBuffer = await sharp(ogSvg, { density: 384 })
    .resize(1200, 630)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(resolve(APP_DIR, "opengraph-image.png"), ogBuffer);
  console.log("✓ src/app/opengraph-image.png (1200×630)");

  // ---- Twitter image (1200×600, same composition) ----
  const twitterBuffer = await sharp(ogSvg, { density: 384 })
    .resize(1200, 600)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(resolve(APP_DIR, "twitter-image.png"), twitterBuffer);
  console.log("✓ src/app/twitter-image.png (1200×600)");

  // ---- Bonus: large PNG copy in public/branding for future use ----
  await ensure(resolve(PUBLIC_DIR, "branding"));
  await writeFile(resolve(PUBLIC_DIR, "branding/icon-512.png"), await rasterize(iconSvg, 512));
  await writeFile(resolve(PUBLIC_DIR, "branding/icon-1024.png"), await rasterize(iconSvg, 1024));
  console.log("✓ public/branding/icon-512.png, icon-1024.png");

  console.log("\nAll icons generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
