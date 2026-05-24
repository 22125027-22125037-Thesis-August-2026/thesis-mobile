const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SVG_SOURCE = path.join(__dirname, '../src/assets/logo/logo-icon.svg');

const ANDROID_BASE = path.join(__dirname, '../android/app/src/main/res');
const IOS_BASE = path.join(__dirname, '../ios/ThesisApp/Images.xcassets/AppIcon.appiconset');

const androidSizes = [
  { folder: 'mipmap-mdpi',    size: 48 },
  { folder: 'mipmap-hdpi',    size: 72 },
  { folder: 'mipmap-xhdpi',   size: 96 },
  { folder: 'mipmap-xxhdpi',  size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

const iosSizes = [
  { filename: 'Icon-40.png',   size: 40 },
  { filename: 'Icon-58.png',   size: 58 },
  { filename: 'Icon-60.png',   size: 60 },
  { filename: 'Icon-80.png',   size: 80 },
  { filename: 'Icon-87.png',   size: 87 },
  { filename: 'Icon-120.png',  size: 120 },
  { filename: 'Icon-180.png',  size: 180 },
  { filename: 'Icon-1024.png', size: 1024 },
];

const svgBuffer = fs.readFileSync(SVG_SOURCE);

async function generateAndroid() {
  for (const { folder, size } of androidSizes) {
    const dir = path.join(ANDROID_BASE, folder);
    await sharp(svgBuffer).resize(size, size).png().toFile(path.join(dir, 'ic_launcher.png'));
    await sharp(svgBuffer).resize(size, size).png().toFile(path.join(dir, 'ic_launcher_round.png'));
    console.log(`Android ${folder}: ${size}x${size} done`);
  }
}

async function generateIos() {
  for (const { filename, size } of iosSizes) {
    await sharp(svgBuffer).resize(size, size).png().toFile(path.join(IOS_BASE, filename));
    console.log(`iOS ${filename}: ${size}x${size} done`);
  }
}

(async () => {
  console.log('Generating icons from', SVG_SOURCE);
  await generateAndroid();
  await generateIos();
  console.log('All icons generated successfully!');
})();
