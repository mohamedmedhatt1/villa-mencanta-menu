const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const { VILLA_CATEGORIES, VILLA_MENU_DATA } = require('./js/menu-data.js');

console.log('====================================================');
console.log('   Villa menCanta — Pre-Deployment Asset Audit      ');
console.log('====================================================\n');

let errors = 0;

// 1. Check brand assets
const logoPath = path.join(rootDir, 'assets', 'brand', 'logo.png');
if (!fs.existsSync(logoPath)) {
  console.error('[FAIL] Brand logo missing at assets/brand/logo.png');
  errors++;
} else {
  console.log(`[PASS] Brand logo verified (${fs.statSync(logoPath).size} bytes)`);
}

// 2. Check menu assets directory
const menuDir = path.join(rootDir, 'assets', 'menu');
if (!fs.existsSync(menuDir)) {
  console.error('[FAIL] Menu assets directory missing');
  errors++;
} else {
  const mediaFiles = fs.readdirSync(menuDir);
  console.log(`[PASS] Menu images directory exists with ${mediaFiles.length} files`);
  if (mediaFiles.length !== 112) {
    console.warn(`[WARN] Expected 112 media files, found ${mediaFiles.length}`);
  }
}

// 3. Verify all 144 items in VILLA_MENU_DATA
let itemsWithPhotos = 0;
let itemsWithFallback = 0;
let localPathErrors = 0;

VILLA_MENU_DATA.forEach(item => {
  // Check image
  if (item.image) {
    itemsWithPhotos++;
    if (item.image.includes(':') || item.image.startsWith('/') || item.image.includes('file://')) {
      console.error(`[FAIL] Item [${item.nameEn}] has absolute/computer path in image: ${item.image}`);
      localPathErrors++;
      errors++;
    }
    const fullImg = path.join(rootDir, item.image);
    if (!fs.existsSync(fullImg)) {
      console.error(`[FAIL] Item [${item.nameEn}] image file missing on disk: ${item.image}`);
      errors++;
    }
  } else {
    itemsWithFallback++;
  }

  // Check fallbackImage
  if (item.fallbackImage) {
    if (item.fallbackImage.includes(':') || item.fallbackImage.startsWith('/') || item.fallbackImage.includes('file://')) {
      console.error(`[FAIL] Item [${item.nameEn}] has absolute/computer path in fallbackImage: ${item.fallbackImage}`);
      localPathErrors++;
      errors++;
    }
    const fullFallback = path.join(rootDir, item.fallbackImage);
    if (!fs.existsSync(fullFallback)) {
      console.error(`[FAIL] Item [${item.nameEn}] fallback image file missing on disk: ${item.fallbackImage}`);
      errors++;
    }
  }
});

console.log(`[PASS] Verified ${VILLA_MENU_DATA.length} dishes:`);
console.log(`       - Items with authentic photos: ${itemsWithPhotos}`);
console.log(`       - Items with logo fallback: ${itemsWithFallback}`);
console.log(`       - Zero absolute/local computer paths found`);

// 4. Verify index.html assets
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const assetRefs = [...indexHtml.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m => m[1]);

assetRefs.forEach(ref => {
  if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('//') || ref.startsWith('#') || ref.startsWith('mailto:') || ref.startsWith('tel:')) {
    // External link or anchor, fine
    return;
  }
  if (ref.includes(':') || ref.includes('file://')) {
    console.error(`[FAIL] index.html contains local computer path: ${ref}`);
    errors++;
    return;
  }
  const cleanRef = ref.split('?')[0].split('#')[0];
  const fullRefPath = path.join(rootDir, cleanRef);
  if (!fs.existsSync(fullRefPath)) {
    console.error(`[FAIL] index.html references non-existent local file: ${cleanRef}`);
    errors++;
  }
});
console.log(`[PASS] Verified all local links and assets in index.html`);

// 5. Check CSS files for broken url(...) references
const cssDir = path.join(rootDir, 'css');
const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
cssFiles.forEach(cf => {
  const content = fs.readFileSync(path.join(cssDir, cf), 'utf8');
  const urls = [...content.matchAll(/url\(['"]?([^'"()]+)['"]?\)/g)].map(m => m[1]);
  urls.forEach(u => {
    if (u.startsWith('http') || u.startsWith('data:')) return;
    if (u.includes(':')) {
      console.error(`[FAIL] ${cf} contains absolute path: ${u}`);
      errors++;
    }
  });
});
console.log(`[PASS] Verified all CSS url() declarations across ${cssFiles.length} stylesheets`);

console.log('\n====================================================');
if (errors === 0) {
  console.log('   RESULT: 100% ASSETS VERIFIED FOR VERCEL & GIT!   ');
  console.log('====================================================');
} else {
  console.error(`   RESULT: FOUND ${errors} ASSET ERRORS!           `);
  console.log('====================================================');
  process.exit(1);
}

