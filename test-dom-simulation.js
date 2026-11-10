const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('   Villa menCanta — Client Logic & DOM Simulation');
console.log('====================================================\n');

// Lightweight DOM mock for testing VillaMenuApp in Node
class MockClassList {
  constructor() { this.classes = new Set(); }
  add(c) { this.classes.add(c); }
  remove(c) { this.classes.delete(c); }
  contains(c) { return this.classes.has(c); }
  toggle(c) { if (this.contains(c)) this.remove(c); else this.add(c); }
  toString() { return [...this.classes].join(' '); }
}

class MockElement {
  constructor(tagName = 'div', id = '', className = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.classList = new MockClassList();
    if (className) className.split(' ').forEach(c => c && this.classList.add(c));
    this.attributes = {};
    this.children = [];
    this._innerHTML = '';
    this.style = {};
    this.eventListeners = {};
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] || null; }
  addEventListener(event, handler) {
    this.eventListeners[event] = this.eventListeners[event] || [];
    this.eventListeners[event].push(handler);
  }
  dispatchEvent(event) {
    const list = this.eventListeners[event.type || event] || [];
    list.forEach(fn => fn(event));
  }
  click() {
    this.dispatchEvent({ type: 'click', preventDefault: () => {}, stopPropagation: () => {} });
  }
  get innerHTML() { return this._innerHTML; }
  set innerHTML(val) {
    this._innerHTML = val;
    // Basic mock parser for child elements with data attributes or classes
    this.children = [];
    const classMatches = [...val.matchAll(/class=\"([^\"]+)\"[^>]*data-category-id=\"([^\"]+)\"/g)];
    classMatches.forEach(m => {
      const el = new MockElement('a', '', m[1]);
      el.setAttribute('data-category-id', m[2]);
      this.children.push(el);
    });
    const subnavMatches = [...val.matchAll(/class=\"([^\"]+)\"[^>]*data-subcat=\"([^\"]+)\"/g)];
    subnavMatches.forEach(m => {
      const el = new MockElement('button', '', m[1]);
      el.setAttribute('data-subcat', m[2]);
      this.children.push(el);
    });
    const cardMatches = [...val.matchAll(/class=\"([^\"]*dish-card[^\"]*)\"/g)];
    cardMatches.forEach(m => {
      const el = new MockElement('article', '', m[1]);
      this.children.push(el);
    });
  }
  querySelector(sel) {
    return this.querySelectorAll(sel)[0] || null;
  }
  querySelectorAll(sel) {
    const found = [];
    if (sel.startsWith('.')) {
      const cls = sel.slice(1);
      this.children.forEach(c => {
        if (c.classList.contains(cls)) found.push(c);
      });
    } else if (sel.includes('data-category-id')) {
      const match = sel.match(/data-category-id="([^"]+)"/);
      if (match) {
        const id = match[1];
        this.children.forEach(c => {
          if (c.getAttribute('data-category-id') === id) found.push(c);
        });
      }
    } else if (sel.includes('data-subcat')) {
      this.children.forEach(c => {
        if (c.getAttribute('data-subcat')) found.push(c);
      });
    }
    return found;
  }
  getBoundingClientRect() {
    return { top: 100, left: 10, width: 300, height: 40 };
  }
}

// Setup global mock DOM
const elementsById = {
  'site-header': new MockElement('header', 'site-header'),
  'hamburger-btn': new MockElement('button', 'hamburger-btn'),
  'nav-drawer': new MockElement('aside', 'nav-drawer'),
  'drawer-backdrop': new MockElement('div', 'drawer-backdrop'),
  'drawer-close-btn': new MockElement('button', 'drawer-close-btn'),
  'drawer-category-list': new MockElement('ul', 'drawer-category-list'),
  'category-nav': new MockElement('nav', 'category-nav'),
  'category-scroll-track': new MockElement('div', 'category-scroll-track'),
  'category-page-view': new MockElement('section', 'category-page-view'),
  'category-header-block': new MockElement('div', 'category-header-block'),
  'category-subnav': new MockElement('div', 'category-subnav'),
  'category-dishes-grid': new MockElement('div', 'category-dishes-grid'),
  'category-pagination': new MockElement('nav', 'category-pagination'),
  'pagination-prev-btn': new MockElement('a', 'pagination-prev-btn'),
  'pagination-next-btn': new MockElement('a', 'pagination-next-btn'),
  'pagination-prev-title': new MockElement('span', 'pagination-prev-title'),
  'pagination-next-title': new MockElement('span', 'pagination-next-title'),
  'lang-btn-en': new MockElement('button', 'lang-btn-en'),
  'lang-btn-ar': new MockElement('button', 'lang-btn-ar'),
  'search-trigger-btn': new MockElement('button', 'search-trigger-btn'),
  'header-search-panel': new MockElement('div', 'header-search-panel'),
  'menu-search-input': new MockElement('input', 'menu-search-input'),
  'search-clear-btn': new MockElement('button', 'search-clear-btn'),
  'search-close-btn': new MockElement('button', 'search-close-btn'),
  'search-results-container': new MockElement('section', 'search-results-container'),
  'branded-intro': new MockElement('aside', 'branded-intro')
};

global.document = {
  documentElement: { lang: 'en', dir: 'ltr' },
  body: new MockElement('body'),
  getElementById: (id) => elementsById[id] || null,
  querySelectorAll: (sel) => [],
  addEventListener: () => {}
};
global.window = {
  location: { hash: '#breakfast', search: '', pathname: '/' },
  history: { pushState: () => {} },
  addEventListener: () => {},
  scrollTo: () => {},
  pageYOffset: 0,
  matchMedia: () => ({ matches: false })
};
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); }
};

// Load dataset and classes
const { VILLA_CATEGORIES, VILLA_MENU_DATA } = require('./js/menu-data.js');
global.VILLA_CATEGORIES = VILLA_CATEGORIES;
global.VILLA_MENU_DATA = VILLA_MENU_DATA;

const MenuNavigation = require('./js/navigation.js');
const MenuSearch = require('./js/search.js');
const VillaMenuApp = require('./js/app.js');

global.MenuNavigation = MenuNavigation;
global.MenuSearch = MenuSearch;
global.VillaMenuApp = VillaMenuApp;

const app = new VillaMenuApp(VILLA_CATEGORIES, VILLA_MENU_DATA);
app.init();

let domPassed = 0;
let domFailed = 0;
function test(cond, desc) {
  if (cond) {
    console.log(`[PASS] ${desc}`);
    domPassed++;
  } else {
    console.error(`[FAIL] ${desc}`);
    domFailed++;
  }
}

// 1. Initial State
test(app.currentLanguage === 'en', 'Initial language is English (default)');
test(app.currentCategoryId === 'breakfast', 'Initial category is Breakfast');
test(elementsById['category-dishes-grid'].children.length === 13, `Breakfast page displays exactly 13 dishes (got: ${elementsById['category-dishes-grid'].children.length})`);
test(elementsById['drawer-category-list'].children.length === 14, `Drawer lists exactly 14 categories (got: ${elementsById['drawer-category-list'].children.length})`);
test(elementsById['category-scroll-track'].children.length === 14, `Category rail lists exactly 14 categories (got: ${elementsById['category-scroll-track'].children.length})`);

// 2. Navigation to Pasta
app.navigateToCategory('pasta');
test(app.currentCategoryId === 'pasta', 'Navigated to Pasta category');
test(elementsById['category-dishes-grid'].children.length === 9, `Pasta page displays exactly 9 dishes (got: ${elementsById['category-dishes-grid'].children.length})`);

// 3. Navigation to Beverages & Subcategory Filtering
app.navigateToCategory('beverages');
test(app.currentCategoryId === 'beverages', 'Navigated to Beverages category');
test(elementsById['category-dishes-grid'].children.length === 53, `Beverages page displays all 53 drinks by default (got: ${elementsById['category-dishes-grid'].children.length})`);

// Filter Beverages to 'Smoothies'
app.activeSubcategory = 'Smoothies';
app.renderDishesList(app.getCategoryById('beverages'));
test(elementsById['category-dishes-grid'].children.length === 3, `Smoothies subcategory displays exactly 3 drinks (got: ${elementsById['category-dishes-grid'].children.length})`);

// 4. Switch Language to Arabic
app.setLanguage('ar');
test(document.documentElement.lang === 'ar', 'document.documentElement.lang set to "ar"');
test(document.documentElement.dir === 'rtl', 'document.documentElement.dir set to "rtl"');
test(document.body.classList.contains('is-rtl'), 'body has class "is-rtl"');
test(localStorage.getItem('vm_lang') === 'ar', 'Language preference persisted to localStorage');

// Verify Arabic dish rendering
app.navigateToCategory('soup');
test(app.currentCategoryId === 'soup', 'Navigated to Soup in Arabic');
test(elementsById['category-dishes-grid'].innerHTML.includes('شوربة الدجاج الكريمية'), 'Renders Arabic dish name "شوربة الدجاج الكريمية"');
test(elementsById['category-dishes-grid'].innerHTML.includes('شوربة الماشروم'), 'Renders Arabic dish name "شوربة الماشروم"');
test(elementsById['category-dishes-grid'].innerHTML.includes('شوربة السي فود'), 'Renders Arabic dish name "شوربة السي فود"');
test(elementsById['category-dishes-grid'].children.length === 3, 'Soup category has exactly 3 dishes');

// 5. Drawer Open & Close Interaction
test(!app.navController.isDrawerOpen, 'Drawer starts closed');
app.navController.openDrawer();
test(app.navController.isDrawerOpen, 'Drawer opens via openDrawer()');
test(elementsById['nav-drawer'].classList.contains('is-open'), 'nav-drawer element receives "is-open" class');
test(elementsById['drawer-backdrop'].classList.contains('is-open'), 'drawer-backdrop receives "is-open" class');

app.navController.closeDrawer();
test(!app.navController.isDrawerOpen, 'Drawer closes via closeDrawer()');
test(!elementsById['nav-drawer'].classList.contains('is-open'), 'nav-drawer removes "is-open" class');

// 6. Search across languages
app.searchController.handleInput('burger');
test(elementsById['search-results-container'].innerHTML.includes('classic burger') || elementsById['search-results-container'].innerHTML.includes('برجر كلاسيكي'), 'Search finds burger dishes');
app.searchController.clearQuery();
test(elementsById['search-results-container'].style.display === 'none', 'Clearing search restores category page view');

console.log('\n====================================================');
console.log(`DOM Test Results: ${domPassed} Passed, ${domFailed} Failed.`);
console.log('====================================================');

process.exit(domFailed === 0 ? 0 : 1);
