const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createPNGIcon(size) {
  const svg = `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#065f46;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size/10}" ry="${size/10}" fill="url(#grad)"/>
    <text x="50%" y="40%" text-anchor="middle" fill="white" font-size="${size/6}" font-family="Arial, sans-serif" font-weight="bold">GLP</text>
    <text x="50%" y="65%" text-anchor="middle" fill="white" font-size="${size/8}" font-family="Arial, sans-serif" font-weight="bold">SIDEKICK</text>
  </svg>`;

  return await sharp(Buffer.from(svg))
    .png()
    .resize(size, size)
    .toBuffer();
}

async function createIcons() {
  try {
    const icons = [
      { size: 192, name: 'icon-192.png' },
      { size: 512, name: 'icon-512.png' }
    ];

    for (const icon of icons) {
      const pngBuffer = await createPNGIcon(icon.size);
      const outputPath = path.join(__dirname, '..', 'public', icon.name);
      fs.writeFileSync(outputPath, pngBuffer);
      console.log(`✅ Created ${icon.name} (${icon.size}x${icon.size})`);
    }

    console.log('🎉 All PNG icons created successfully!');
  } catch (error) {
    console.error('Error creating icons:', error);
  }
}

createIcons();
