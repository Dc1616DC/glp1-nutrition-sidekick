// Simple script to create PNG icons for PWA
const fs = require('fs');
const path = require('path');

// Create a simple colored SVG icon
function createSVGIcon(size) {
  const canvas = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
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
  
  return canvas;
}

// Create icon files with exact dimensions
const icons = [
  { size: 192, name: 'icon-192.svg' },
  { size: 512, name: 'icon-512.svg' }
];

icons.forEach(icon => {
  const svgContent = createSVGIcon(icon.size);
  fs.writeFileSync(path.join(__dirname, '..', 'public', icon.name), svgContent);
  console.log(`Created ${icon.name} (${icon.size}x${icon.size})`);
});

console.log('✅ SVG icons created with exact dimensions!');
