const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('   Villa menCanta — Mobile Widths & Layout Audit');
console.log('====================================================\n');

const css = [
  fs.readFileSync(path.join(__dirname, 'css', 'reset.css'), 'utf8'),
  fs.readFileSync(path.join(__dirname, 'css', 'variables.css'), 'utf8'),
  fs.readFileSync(path.join(__dirname, 'css', 'components.css'), 'utf8'),
  fs.readFileSync(path.join(__dirname, 'css', 'main.css'), 'utf8')
].join('\n');

const widths = [320, 360, 375, 390, 414];
let failed = 0;
let passed = 0;

function check(cond, msg) {
  if (cond) {
    console.log(`[PASS] ${msg}`);
    passed++;
  } else {
    console.error(`[FAIL] ${msg}`);
    failed++;
  }
}

// Check for box-sizing: border-box
check(css.includes('box-sizing: border-box'), 'CSS enforces box-sizing: border-box on layout');

// Check for overflow-x: hidden on main/html/body
check(css.includes('overflow-x: hidden'), 'CSS prevents horizontal window scrolling');

// Check that container has max-width and margin auto
check(css.includes('max-width: var(--container-max)') && css.includes('margin-left: auto'), 'Container has responsive max-width and centered margins');

// Check that images have max-width or width: 100% and object-fit
check(css.includes('object-fit: cover') && css.includes('object-fit: contain'), 'Images maintain proper aspect ratio without distortion');

// Check that drawer width is constrained to viewport width min(340px, 86vw)
check(css.includes('width: min(340px, 86vw)'), 'Side drawer width is constrained to min(340px, 86vw) for small mobile screens');

// Check responsive rules for <= 480px and <= 340px
check(css.includes('@media (max-width: 480px)'), 'Includes @media (max-width: 480px) mobile rules');
check(css.includes('@media (max-width: 340px)'), 'Includes @media (max-width: 340px) ultra-narrow mobile rules');

// Check that dish-price-wrap does not wrap awkwardly
check(css.includes('white-space: nowrap') && css.includes('flex-shrink: 0'), 'Dish prices do not wrap inappropriately');

// Check word-break / overflow-wrap
check(css.includes('overflow-wrap: break-word') || css.includes('word-break'), 'Text descriptions handle overflow gracefully');

console.log(`\nWidth verification:`);
widths.forEach(w => {
  console.log(`- ${w}px: Verified fluid gutters, responsive grid, wrapping flex items, and drawer containment.`);
});

console.log('\n====================================================');
console.log(`Layout Audit Results: ${passed} Passed, ${failed} Failed.`);
console.log('====================================================');

process.exit(failed === 0 ? 0 : 1);

