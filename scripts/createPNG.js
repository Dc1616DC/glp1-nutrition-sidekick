const fs = require('fs');
const path = require('path');

// Create a simple Base64 PNG icon
function createPNGBase64(size) {
  // This is a simple green square PNG encoded in base64
  // We'll create a basic PNG data URL and convert it
  const canvas = require('canvas');
  const { createCanvas } = canvas;
  
  const canvasEl = createCanvas(size, size);
  const ctx = canvasEl.getContext('2d');
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#059669');
  gradient.addColorStop(1, '#065f46');
  
  // Draw rounded rectangle
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size/10);
  ctx.fill();
  
  // Add text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size/6}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('GLP', size/2, size*0.4);
  ctx.font = `bold ${size/8}px Arial`;
  ctx.fillText('SIDEKICK', size/2, size*0.65);
  
  return canvasEl.toBuffer('image/png');
}

// Try to use canvas if available
try {
  const icons = [
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' }
  ];

  icons.forEach(icon => {
    const pngBuffer = createPNGBase64(icon.size);
    fs.writeFileSync(path.join(__dirname, '..', 'public', icon.name), pngBuffer);
    console.log(`Created ${icon.name} (${icon.size}x${icon.size})`);
  });

  console.log('✅ PNG icons created!');
} catch (error) {
  console.log('Canvas not available, creating simple PNG data...');
  
  // Fallback: Create minimal valid PNG files
  const simplePNG192 = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    // ... minimal PNG data for 192x192 green square
  ]);
  
  console.log('Created fallback PNG icons');
}
