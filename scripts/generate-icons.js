const fs = require('fs');
const { createCanvas } = require('canvas');

// Function to create a simple icon
function createIcon(size, text = 'SS') {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#7c3aed'); // Purple
  gradient.addColorStop(1, '#3b82f6'); // Blue
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, size / 2);
  
  return canvas.toBuffer('image/png');
}

// Generate icons
const icons = [
  { size: 192, filename: 'icon-192x192.png' },
  { size: 512, filename: 'icon-512x512.png' },
  { size: 180, filename: 'apple-touch-icon.png' },
  { size: 32, filename: 'favicon-32x32.png' },
  { size: 16, filename: 'favicon-16x16.png' }
];

// Ensure public directory exists
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Generate each icon
icons.forEach(icon => {
  const buffer = createIcon(icon.size);
  fs.writeFileSync(`public/${icon.filename}`, buffer);
  console.log(`Generated ${icon.filename}`);
});

// Create a simple SVG icon for Safari pinned tab
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="16" height="16" fill="url(#grad)" rx="2"/>
  <text x="8" y="11" font-family="Arial" font-size="10" font-weight="bold" text-anchor="middle" fill="white">SS</text>
</svg>`;

fs.writeFileSync('public/safari-pinned-tab.svg', svgIcon);
console.log('Generated safari-pinned-tab.svg');

// Create a simple favicon.ico (just copy the 32x32 PNG for now)
const favicon32 = fs.readFileSync('public/favicon-32x32.png');
fs.writeFileSync('public/favicon.ico', favicon32);
console.log('Generated favicon.ico');

// Create og-image.png (1200x630 for social media)
const ogCanvas = createCanvas(1200, 630);
const ogCtx = ogCanvas.getContext('2d');

// Background gradient
const ogGradient = ogCtx.createLinearGradient(0, 0, 1200, 630);
ogGradient.addColorStop(0, '#7c3aed'); // Purple
ogGradient.addColorStop(1, '#3b82f6'); // Blue

ogCtx.fillStyle = ogGradient;
ogCtx.fillRect(0, 0, 1200, 630);

// App name
ogCtx.fillStyle = 'white';
ogCtx.font = 'bold 80px Arial';
ogCtx.textAlign = 'center';
ogCtx.textBaseline = 'middle';
ogCtx.fillText('SplitSave', 600, 250);

// Tagline
ogCtx.font = '40px Arial';
ogCtx.fillText('Collaborative Finance App for Couples & Partners', 600, 350);

// Icon
ogCtx.font = 'bold 120px Arial';
ogCtx.fillText('💰', 600, 500);

const ogBuffer = ogCanvas.toBuffer('image/png');
fs.writeFileSync('public/og-image.png', ogBuffer);
console.log('Generated og-image.png');

console.log('All PWA icons generated successfully!');
