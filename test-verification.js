const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('====================================================');
console.log('   Villa menCanta — Verification & Test Suite');
console.log('====================================================\n');

let failedTests = 0;
let passedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    failedTests++;
  }
}

// 1. Verify Dataset
const { VILLA_CATEGORIES, VILLA_MENU_DATA } = require('./js/menu-data.js');

assert(Array.isArray(VILLA_CATEGORIES), 'VILLA_CATEGORIES is an array');
assert(VILLA_CATEGORIES.length === 14, `VILLA_CATEGORIES has exactly 14 categories (actual: ${VILLA_CATEGORIES.length})`);
assert(Array.isArray(VILLA_MENU_DATA), 'VILLA_MENU_DATA is an array');
assert(VILLA_MENU_DATA.length === 144, `VILLA_MENU_DATA has exactly 144 items (actual: ${VILLA_MENU_DATA.length})`);

// Verify exact category order
const expectedOrder = [
  'breakfast',
  'soup',
  'salad',
  'appetizers',
  'sandwiches',
  'main-course-chicken',
  'main-course-meat',
  'main-course-seafood',
  'pasta',
  'pizza',
  'panozo',
  'beverages',
  'dessert',
  'shisha'
];

VILLA_CATEGORIES.forEach((cat, idx) => {
  assert(cat.id === expectedOrder[idx], `Category #${idx + 1} order matches spreadsheet: ${cat.id} === ${expectedOrder[idx]}`);
  assert(cat.nameEn && cat.nameAr, `Category ${cat.id} has both English ("${cat.nameEn}") and Arabic ("${cat.nameAr}") names`);
});

// Verify items integrity
let missingNames = 0;
let invalidPrices = 0;
VILLA_MENU_DATA.forEach(item => {
  if (!item.nameEn || !item.nameAr) missingNames++;
  if (item.price !== null && (typeof item.price !== 'number' || isNaN(item.price))) invalidPrices++;
});
assert(missingNames === 0, `All 144 items have English and Arabic names (missing: ${missingNames})`);
assert(invalidPrices === 0, `All prices are valid numbers or null (invalid: ${invalidPrices})`);

// 2. Verify Assets
const logoPath = path.join(__dirname, 'assets', 'brand', 'logo.png');
assert(fs.existsSync(logoPath), `Original logo exists at ${logoPath}`);
const logoStats = fs.statSync(logoPath);
assert(logoStats.size > 10000, `Logo file has valid size (${logoStats.size} bytes)`);

// Verify extracted menu images
const menuAssetsDir = path.join(__dirname, 'assets', 'menu');
assert(fs.existsSync(menuAssetsDir), `Menu assets directory exists`);
const menuImages = fs.readdirSync(menuAssetsDir);
assert(menuImages.length >= 80, `Menu assets directory contains authentic extracted images (count: ${menuImages.length})`);

let loadedImgCount = 0;
let fallbackImgCount = 0;
let brokenImgLinks = 0;

VILLA_MENU_DATA.forEach(item => {
  if (item.image) {
    loadedImgCount++;
    const fullPath = path.join(__dirname, item.image);
    if (!fs.existsSync(fullPath)) brokenImgLinks++;
  } else {
    fallbackImgCount++;
  }
});

assert(loadedImgCount === 114, `Exactly 114 dishes have authentic loaded images (actual: ${loadedImgCount})`);
assert(fallbackImgCount === 30, `Exactly 30 dishes use authentic logo fallback (actual: ${fallbackImgCount})`);
assert(brokenImgLinks === 0, `Zero broken image links across the entire menu`);

// 3. Verify HTML structure & Key Components
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
assert(html.includes('id="hamburger-btn"'), 'Header contains hamburger button');
assert(html.includes('id="nav-drawer"'), 'Contains side navigation drawer');
assert(html.includes('id="drawer-backdrop"'), 'Contains drawer backdrop');
assert(html.includes('id="lang-btn-en"') && html.includes('id="lang-btn-ar"'), 'Contains bilingual language switcher EN | العربية');
assert(html.includes('id="category-nav"'), 'Contains category rail');
assert(html.includes('id="category-page-view"'), 'Contains dedicated category page view');
assert(html.includes('id="category-pagination"'), 'Contains category pagination navigation');
assert(html.includes('id="site-footer"'), 'Contains site footer');
assert(html.includes('instagram.com/villa_mencanta'), 'Contains verified Instagram link');
assert(html.includes('facebook.com/VillamenCanta'), 'Contains verified Facebook link');
assert(html.includes('tiktok.com/@villa_mencanta'), 'Contains TikTok link');
assert(html.includes('CentrAda Plaza Mall, Juhayna Square'), 'Contains verified restaurant address');

// 4. Verify CSS & Variables
const cssVars = fs.readFileSync(path.join(__dirname, 'css', 'variables.css'), 'utf8');
assert(cssVars.includes('#412103'), 'Primary color #412103 defined in CSS variables');
assert(cssVars.includes('Times NR MT Pro'), 'Times NR MT Pro defined as main font');

const cssComponents = fs.readFileSync(path.join(__dirname, 'css', 'components.css'), 'utf8');
assert(cssComponents.includes('.nav-drawer'), 'CSS defines .nav-drawer styles');
assert(cssComponents.includes('html[dir="rtl"]'), 'CSS defines RTL / Arabic rules');
assert(cssComponents.includes('.dish-fallback-logo-wrap'), 'CSS defines fallback logo presentation');

// 5. Verify Server responses
const server = require('./server.js');

function testUrl(pathname) {
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:3000${pathname}`, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        resolve({ status: res.statusCode, length: data.length, type: res.headers['content-type'] });
      });
    }).on('error', err => {
      resolve({ status: 500, error: err.message });
    });
  });
}

(async () => {
  // Give server 500ms to bind
  await new Promise(r => setTimeout(r, 600));

  const rootRes = await testUrl('/');
  assert(rootRes.status === 200, `GET / returned 200 OK (${rootRes.length} bytes)`);

  const categoryRouteRes = await testUrl('/breakfast');
  assert(categoryRouteRes.status === 200, `GET /breakfast (SPA category route) returned 200 OK`);

  const pastaRouteRes = await testUrl('/pasta');
  assert(pastaRouteRes.status === 200, `GET /pasta (SPA category route) returned 200 OK`);

  const logoRes = await testUrl('/assets/brand/logo.png');
  assert(logoRes.status === 200 && logoRes.type.includes('image/png'), `GET /assets/brand/logo.png returned 200 OK (image/png)`);

  const cssRes = await testUrl('/css/components.css');
  assert(cssRes.status === 200 && cssRes.type.includes('text/css'), `GET /css/components.css returned 200 OK (text/css)`);

  const jsRes = await testUrl('/js/app.js');
  assert(jsRes.status === 200 && jsRes.type.includes('javascript'), `GET /js/app.js returned 200 OK (javascript)`);

  console.log('\n====================================================');
  console.log(`Results: ${passedTests} Passed, ${failedTests} Failed.`);
  console.log('====================================================');

  process.exit(failedTests === 0 ? 0 : 1);
})();

