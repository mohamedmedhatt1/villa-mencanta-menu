/**
 * Villa menCanta — Application Controller
 * Premium Bilingual Digital Menu with Dedicated Category Pages & Drawer Navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof VILLA_CATEGORIES === 'undefined' || typeof VILLA_MENU_DATA === 'undefined') {
    console.error('Villa menCanta menu dataset failed to load.');
    return;
  }

  const app = new VillaMenuApp(VILLA_CATEGORIES, VILLA_MENU_DATA);
  window.villaApp = app;
  app.init();
});

class VillaMenuApp {
  constructor(categories, menuData) {
    this.categories = categories;
    this.menuData = menuData;

    // State
    const savedLang = localStorage.getItem('vm_lang');
    this.currentLanguage = (savedLang === 'ar' || savedLang === 'en') ? savedLang : 'en';
    this.currentCategoryId = 'breakfast';
    this.activeSubcategory = 'all';

    // Controllers
    this.navController = null;
    this.searchController = null;

    // DOM References
    this.introCurtain = document.getElementById('branded-intro');
    this.categoryNavTrack = document.getElementById('category-scroll-track');
    this.drawerCategoryList = document.getElementById('drawer-category-list');
    this.categoryPageView = document.getElementById('category-page-view');
    this.categoryHeaderBlock = document.getElementById('category-header-block');
    this.categorySubnav = document.getElementById('category-subnav');
    this.categoryDishesGrid = document.getElementById('category-dishes-grid');
    this.categoryPagination = document.getElementById('category-pagination');
    this.prevBtn = document.getElementById('pagination-prev-btn');
    this.nextBtn = document.getElementById('pagination-next-btn');
    this.prevTitle = document.getElementById('pagination-prev-title');
    this.nextTitle = document.getElementById('pagination-next-title');

    // Modal DOM References
    this.dishModal = document.getElementById('dish-modal');
    this.dishModalBackdrop = document.getElementById('dish-modal-backdrop');
    this.dishModalClose = document.getElementById('dish-modal-close');
    this.dishModalMedia = document.getElementById('dish-modal-media');
    this.dishModalCategory = document.getElementById('dish-modal-category');
    this.dishModalSubdept = document.getElementById('dish-modal-subdept');
    this.dishModalTitle = document.getElementById('dish-modal-title');
    this.dishModalPrice = document.getElementById('dish-modal-price');
    this.dishModalDesc = document.getElementById('dish-modal-desc');

    this.langBtnEn = document.getElementById('lang-btn-en');
    this.langBtnAr = document.getElementById('lang-btn-ar');

    // Bilingual Dictionary for UI
    this.i18n = {
      en: {
        restaurant: 'Restaurant',
        sheikhZayed: 'Sheikh Zayed',
        menuLabel: 'Menu',
        menuCategories: 'Menu Categories',
        selectCategory: 'Select Category',
        locationSheikhZayed: 'Sheikh Zayed, CentrAda Plaza',
        pricesInEGP: 'Prices in EGP',
        categoryCounter: 'Category {0} of {1}',
        dishesCount: '{0} Dishes',
        all: 'All',
        previousCategory: 'Previous Category',
        nextCategory: 'Next Category',
        close: 'Close',
        searchPlaceholder: 'Search dishes, ingredients, drinks...',
        location: 'Location & Hours',
        fullAddress: 'CentrAda Plaza Mall, Juhayna Square, Sheikh Zayed City, Giza Governorate, Egypt',
        getDirections: 'GET DIRECTIONS',
        copyright: '© 2026 Villa menCanta. All rights reserved.',
        seasonal: 'Seasonal'
      },
      ar: {
        restaurant: 'مطعم',
        sheikhZayed: 'الشيخ زايد',
        menuLabel: 'القائمة',
        menuCategories: 'أقسام القائمة',
        selectCategory: 'اختر القسم',
        locationSheikhZayed: 'الشيخ زايد، سنترادا بلازا',
        pricesInEGP: 'الأسعار بالجنيه المصري',
        categoryCounter: 'القسم {0} من {1}',
        dishesCount: '{0} أصناف',
        all: 'الكل',
        previousCategory: 'القسم السابق',
        nextCategory: 'القسم التالي',
        close: 'إغلاق',
        searchPlaceholder: 'ابحث عن الأطباق والمشروبات والمكونات...',
        location: 'الموقع وساعات العمل',
        fullAddress: 'سنترادا بلازا مول، ميدان جهينة، مدينة الشيخ زايد، محافظة الجيزة، مصر',
        getDirections: 'الاتجاهات',
        copyright: '© ٢٠٢٦ فيلا منكانتا. جميع الحقوق محفوظة.',
        seasonal: 'حسب الموسم'
      }
    };
  }

  init() {
    this.handleBrandedIntro();
    this.applyLanguage(this.currentLanguage, false);
    this.setupLanguageSwitchers();

    // Initialize Navigation & Search Controllers
    this.navController = new MenuNavigation(this);
    this.searchController = new MenuSearch(this.menuData, this);

    // Initial Routing based on URL hash or path
    this.setupRouting();

    // Render Initial Views
    this.renderDrawer();
    this.renderCategoryRail();
    this.navigateToCategory(this.currentCategoryId, false);

    // Setup Pagination Click Handlers
    this.setupPaginationHandlers();

    // Setup Dish Lightbox Modal Handlers
    this.setupDishModalHandlers();
  }

  /* ------------------------------------------------------------------------
     1. Branded Intro Curtain
     ------------------------------------------------------------------------ */
  handleBrandedIntro() {
    if (!this.introCurtain) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.introCurtain.classList.add('is-dismissed');
      return;
    }
    setTimeout(() => {
      this.introCurtain.classList.add('is-dismissed');
    }, 650);
  }

  /* ------------------------------------------------------------------------
     2. Bilingual Language Management
     ------------------------------------------------------------------------ */
  setupLanguageSwitchers() {
    if (this.langBtnEn) {
      this.langBtnEn.addEventListener('click', () => {
        if (this.currentLanguage !== 'en') {
          this.setLanguage('en');
        }
      });
    }
    if (this.langBtnAr) {
      this.langBtnAr.addEventListener('click', () => {
        if (this.currentLanguage !== 'ar') {
          this.setLanguage('ar');
        }
      });
    }
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('vm_lang', lang);
    this.applyLanguage(lang, true);
  }

  applyLanguage(lang, reRenderViews = true) {
    const isAr = lang === 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';

    if (isAr) {
      document.body.classList.add('is-rtl');
      if (this.langBtnAr) this.langBtnAr.classList.add('is-active');
      if (this.langBtnEn) this.langBtnEn.classList.remove('is-active');
    } else {
      document.body.classList.remove('is-rtl');
      if (this.langBtnEn) this.langBtnEn.classList.add('is-active');
      if (this.langBtnAr) this.langBtnAr.classList.remove('is-active');
    }

    // Update all static i18n texts in DOM
    const t = this.i18n[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) {
        el.textContent = t[key];
      }
    });

    // Update search input placeholder
    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) {
      searchInput.placeholder = t.searchPlaceholder;
    }

    // Re-render UI components with new language
    if (reRenderViews) {
      this.renderDrawer();
      this.renderCategoryRail();
      this.renderCategoryPage();
    }
  }

  /* ------------------------------------------------------------------------
     3. Client-Side Routing & Browser History
     ------------------------------------------------------------------------ */
  setupRouting() {
    const parseUrlCategory = () => {
      // Check hash first (e.g. #breakfast, #pizza)
      let hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
      if (hash && this.getCategoryById(hash)) {
        return hash;
      }

      // Check query param (e.g. ?category=soup)
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category') || params.get('c');
      if (catParam && this.getCategoryById(catParam.toLowerCase())) {
        return catParam.toLowerCase();
      }

      // Check pathname (e.g. /breakfast)
      const pathPart = window.location.pathname.replace(/^\/|\.html$/g, '').toLowerCase();
      if (pathPart && this.getCategoryById(pathPart)) {
        return pathPart;
      }

      return 'breakfast';
    };

    this.currentCategoryId = parseUrlCategory();

    // Listen to browser Back and Forward navigation
    window.addEventListener('popstate', (e) => {
      const catId = (e.state && e.state.categoryId) ? e.state.categoryId : parseUrlCategory();
      this.navigateToCategory(catId, false);
    });

    window.addEventListener('hashchange', () => {
      const catId = parseUrlCategory();
      if (catId !== this.currentCategoryId) {
        this.navigateToCategory(catId, false);
      }
    });
  }

  getCategoryById(id) {
    if (!id) return null;
    const cleanId = id.toLowerCase().trim();
    return this.categories.find(c => c.id === cleanId) || null;
  }

  navigateToCategory(categoryId, updateHistory = true) {
    const targetCat = this.getCategoryById(categoryId) || this.categories[0];
    this.currentCategoryId = targetCat.id;
    this.activeSubcategory = 'all';

    // If search was open and query existed, restore normal view
    if (this.searchController && this.searchController.isOpen) {
      this.searchController.closeSearch();
    }

    if (updateHistory) {
      const newUrl = '#' + targetCat.id;
      if (window.location.hash !== newUrl) {
        window.history.pushState({ categoryId: targetCat.id }, '', newUrl);
      }
    }

    // Re-render the dedicated category page
    this.renderCategoryPage();

    // Update active highlight in drawer
    if (this.drawerCategoryList) {
      this.drawerCategoryList.querySelectorAll('.drawer-cat-link').forEach(link => {
        if (link.getAttribute('data-category-id') === targetCat.id) {
          link.classList.add('is-active');
        } else {
          link.classList.remove('is-active');
        }
      });
    }

    // Update active highlight in category rail
    if (this.categoryNavTrack) {
      this.categoryNavTrack.querySelectorAll('.category-link').forEach(link => {
        if (link.getAttribute('data-category-id') === targetCat.id) {
          link.classList.add('is-active');
        } else {
          link.classList.remove('is-active');
        }
      });
      if (this.navController) {
        this.navController.scrollActiveRailLinkIntoView(targetCat.id);
      }
    }

    // Gentle scroll to top of category section
    if (this.categoryPageView) {
      const headerOffset = 64;
      const elementPos = this.categoryPageView.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, elementPos - headerOffset),
        behavior: 'smooth'
      });
    }
  }

  /* ------------------------------------------------------------------------
     4. Render Side Navigation Drawer (14 Categories in Spreadsheet Order)
     ------------------------------------------------------------------------ */
  renderDrawer() {
    if (!this.drawerCategoryList) return;
    const isAr = this.currentLanguage === 'ar';

    let html = '';
    this.categories.forEach((cat, index) => {
      const numStr = String(index + 1).padStart(2, '0');
      const name = isAr ? cat.nameAr : cat.nameEn;
      const countLabel = isAr ? `${cat.items.length} صنف` : `${cat.items.length}`;
      const isActive = cat.id === this.currentCategoryId ? 'is-active' : '';

      html += `
        <li class="drawer-category-item" role="listitem">
          <a
            href="#${cat.id}"
            class="drawer-cat-link ${isActive}"
            data-category-id="${cat.id}"
            aria-label="${name}, ${countLabel}"
          >
            <div class="drawer-cat-left">
              <span class="drawer-cat-num">${numStr}</span>
              <span class="drawer-cat-name">${name}</span>
            </div>
            <span class="drawer-cat-count">${countLabel}</span>
          </a>
        </li>
      `;
    });

    this.drawerCategoryList.innerHTML = html;

    // Attach click listeners to drawer links
    this.drawerCategoryList.querySelectorAll('.drawer-cat-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const catId = link.getAttribute('data-category-id');
        if (this.navController) {
          this.navController.closeDrawer();
        }
        this.navigateToCategory(catId);
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. Render Category Quick Rail (Gliding Horizontal Rail)
     ------------------------------------------------------------------------ */
  renderCategoryRail() {
    if (!this.categoryNavTrack) return;
    const isAr = this.currentLanguage === 'ar';

    let html = '';
    this.categories.forEach(cat => {
      const name = isAr ? cat.nameAr : cat.nameEn;
      const isActive = cat.id === this.currentCategoryId ? 'is-active' : '';

      html += `
        <a
          href="#${cat.id}"
          class="category-link ${isActive}"
          data-category-id="${cat.id}"
          role="tab"
          aria-selected="${cat.id === this.currentCategoryId}"
        >
          ${name}
        </a>
      `;
    });

    this.categoryNavTrack.innerHTML = html;

    // Attach click listeners
    this.categoryNavTrack.querySelectorAll('.category-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const catId = link.getAttribute('data-category-id');
        this.navigateToCategory(catId);
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. Render Dedicated Category Page View (Strictly This Category's Dishes)
     ------------------------------------------------------------------------ */
  renderCategoryPage() {
    const cat = this.getCategoryById(this.currentCategoryId) || this.categories[0];
    const isAr = this.currentLanguage === 'ar';
    const t = this.i18n[this.currentLanguage];

    // 1. Render Category Masthead
    const catIndex = this.categories.findIndex(c => c.id === cat.id);
    const numStr = String(catIndex + 1).padStart(2, '0');
    const totalCatsStr = String(this.categories.length).padStart(2, '0');
    const counterText = t.categoryCounter.replace('{0}', numStr).replace('{1}', totalCatsStr);
    const catName = isAr ? cat.nameAr : cat.nameEn;
    const catDesc = isAr ? cat.descriptionAr : cat.descriptionEn;
    const totalDishesText = t.dishesCount.replace('{0}', cat.items.length);

    if (this.categoryHeaderBlock) {
      this.categoryHeaderBlock.innerHTML = `
        <span class="category-counter-badge">${counterText}</span>
        <h2 class="category-main-title">${catName}</h2>
        ${catDesc ? `<p class="category-editorial-desc">${catDesc}</p>` : ''}
        <div style="margin-top: 10px;">
          <span class="category-meta-badge">${totalDishesText}</span>
        </div>
      `;
    }

    // 2. Render Subcategory Tabs (if category has subcategories)
    if (this.categorySubnav) {
      if (cat.subcategories && cat.subcategories.length > 0) {
        this.categorySubnav.style.display = 'flex';
        let subnavHtml = `
          <button type="button" class="subnav-btn ${this.activeSubcategory === 'all' ? 'is-active' : ''}" data-subcat="all">
            <span>${t.all}</span>
            <span class="subnav-count">${cat.items.length}</span>
          </button>
        `;
        cat.subcategories.forEach(sub => {
          const subName = isAr ? sub.nameAr : sub.nameEn;
          const subItemsCount = cat.items.filter(it => it.subcategoryEn === sub.nameEn).length;
          const isActive = this.activeSubcategory === sub.nameEn ? 'is-active' : '';
          subnavHtml += `
            <button type="button" class="subnav-btn ${isActive}" data-subcat="${sub.nameEn}">
              <span>${subName}</span>
              <span class="subnav-count">${subItemsCount}</span>
            </button>
          `;
        });
        this.categorySubnav.innerHTML = subnavHtml;

        // Wire subcategory filter clicks
        this.categorySubnav.querySelectorAll('.subnav-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            this.activeSubcategory = btn.getAttribute('data-subcat');
            this.categorySubnav.querySelectorAll('.subnav-btn').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            this.renderDishesList(cat);
          });
        });
      } else {
        this.categorySubnav.style.display = 'none';
        this.categorySubnav.innerHTML = '';
      }
    }

    // 3. Render Dishes List for this category
    this.renderDishesList(cat);

    // 4. Update Previous / Next Category Navigation
    this.updatePagination(catIndex);
  }

  renderDishesList(cat) {
    if (!this.categoryDishesGrid) return;
    const isAr = this.currentLanguage === 'ar';
    const t = this.i18n[this.currentLanguage];

    // Filter by active subcategory
    let itemsToRender = cat.items;
    if (this.activeSubcategory && this.activeSubcategory !== 'all') {
      itemsToRender = cat.items.filter(it => it.subcategoryEn === this.activeSubcategory);
    }

    let cardsHtml = '';
    itemsToRender.forEach(item => {
      const name = isAr ? item.nameAr : item.nameEn;
      const desc = isAr ? (item.descAr || '') : (item.descEn || '');
      const currency = isAr ? item.currencyAr : item.currencyEn;
      const subDept = isAr ? item.subcategoryAr : item.subcategoryEn;

      const priceDisplay = item.price !== null
        ? `<span class="dish-price-val">${item.price}</span> <span class="dish-price-currency">${currency}</span>`
        : `<span class="dish-price-seasonal">${t.seasonal}</span>`;

      // Food image or original Villa menCanta logo watermark fallback with shimmer and expand hint
      const imgHtml = item.image
        ? `
          <img src="${item.image}" alt="${name}" class="dish-real-img" loading="lazy" decoding="async" onload="this.classList.add('is-loaded')" />
          <span class="dish-expand-hint" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        `
        : `
          <div class="dish-fallback-logo-wrap">
            <img src="${item.fallbackImage || 'assets/brand/logo.png'}" alt="Villa menCanta" class="dish-fallback-logo" loading="lazy" />
            <span class="dish-fallback-brandmark">Villa menCanta</span>
          </div>
          <span class="dish-expand-hint" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        `;

      cardsHtml += `
        <article class="dish-card reveal-item" data-dish-id="${item.id}" role="button" tabindex="0" aria-label="${name}">
          <div class="dish-image-slot">
            ${imgHtml}
          </div>
          <div class="dish-content">
            ${subDept ? `<span class="dish-subdept-badge">${subDept}</span>` : ''}
            <div class="dish-top-row">
              <h3 class="dish-name">${name}</h3>
              <div class="dish-price-wrap">${priceDisplay}</div>
            </div>
            ${desc ? `<p class="dish-description">${desc}</p>` : ''}
          </div>
        </article>
      `;
    });

    this.categoryDishesGrid.innerHTML = cardsHtml;
  }

  /* ------------------------------------------------------------------------
     7. Category Turn-Page Pagination (Previous / Next)
     ------------------------------------------------------------------------ */
  setupPaginationHandlers() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const prevId = this.prevBtn.getAttribute('data-target-id');
        if (prevId) this.navigateToCategory(prevId);
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const nextId = this.nextBtn.getAttribute('data-target-id');
        if (nextId) this.navigateToCategory(nextId);
      });
    }
  }

  updatePagination(catIndex) {
    const isAr = this.currentLanguage === 'ar';
    const total = this.categories.length;

    // Previous Category (sequential with wrap-around)
    const prevIndex = (catIndex - 1 + total) % total;
    const prevCat = this.categories[prevIndex];
    const prevName = isAr ? prevCat.nameAr : prevCat.nameEn;

    // Next Category (sequential with wrap-around)
    const nextIndex = (catIndex + 1) % total;
    const nextCat = this.categories[nextIndex];
    const nextName = isAr ? nextCat.nameAr : nextCat.nameEn;

    if (this.prevBtn && this.prevTitle) {
      this.prevBtn.setAttribute('data-target-id', prevCat.id);
      this.prevBtn.href = '#' + prevCat.id;
      this.prevTitle.textContent = prevName;
    }

    if (this.nextBtn && this.nextTitle) {
      this.nextBtn.setAttribute('data-target-id', nextCat.id);
      this.nextBtn.href = '#' + nextCat.id;
      this.nextTitle.textContent = nextName;
    }
  }

  /* ------------------------------------------------------------------------
     8. Dish Detail Lightbox Modal (Quiet Luxury)
     ------------------------------------------------------------------------ */
  setupDishModalHandlers() {
    if (!this.dishModal) return;

    if (this.dishModalClose) {
      this.dishModalClose.addEventListener('click', () => this.closeDishModal());
    }

    if (this.dishModalBackdrop) {
      this.dishModalBackdrop.addEventListener('click', () => this.closeDishModal());
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.dishModal.classList.contains('is-open')) {
        this.closeDishModal();
      }
    });

    // Delegate clicks on dish cards inside category view or search results
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.dish-card');
      // If inside search results container, don't open modal if user is navigating, but let them open modal if clicked
      if (card && card.dataset.dishId) {
        this.openDishModal(card.dataset.dishId);
      }
    });

    // Keyboard accessibility for cards (Enter or Space to open modal)
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('dish-card')) {
        if (e.target.dataset.dishId) {
          e.preventDefault();
          this.openDishModal(e.target.dataset.dishId);
        }
      }
    });
  }

  openDishModal(dishId) {
    if (!this.dishModal) return;
    const item = this.menuData.find(i => i.id === dishId);
    if (!item) return;

    const isAr = this.currentLanguage === 'ar';
    const t = this.i18n[this.currentLanguage];
    const name = isAr ? item.nameAr : item.nameEn;
    const desc = isAr ? (item.descAr || '') : (item.descEn || '');
    const currency = isAr ? item.currencyAr : item.currencyEn;
    const catName = isAr ? item.categoryAr : item.categoryEn;
    const subDept = isAr ? (item.subcategoryAr || '') : (item.subcategoryEn || '');

    if (this.dishModalCategory) this.dishModalCategory.textContent = catName;
    if (this.dishModalSubdept) {
      this.dishModalSubdept.textContent = subDept;
      this.dishModalSubdept.style.display = subDept ? 'inline-block' : 'none';
    }
    if (this.dishModalTitle) this.dishModalTitle.textContent = name;
    if (this.dishModalDesc) {
      this.dishModalDesc.textContent = desc;
      this.dishModalDesc.style.display = desc ? 'block' : 'none';
    }
    if (this.dishModalPrice) {
      this.dishModalPrice.innerHTML = item.price !== null
        ? `<span class="dish-price-val">${item.price}</span> <span class="dish-price-currency">${currency}</span>`
        : `<span class="dish-price-seasonal">${t.seasonal}</span>`;
    }

    if (this.dishModalMedia) {
      if (item.image) {
        this.dishModalMedia.innerHTML = `<img src="${item.image}" alt="${name}" class="dish-modal-img" decoding="async" />`;
      } else {
        this.dishModalMedia.innerHTML = `
          <div class="dish-fallback-logo-wrap" style="height: 100%;">
            <img src="${item.fallbackImage || 'assets/brand/logo.png'}" alt="Villa menCanta" class="dish-fallback-logo" />
            <span class="dish-fallback-brandmark">Villa menCanta</span>
          </div>
        `;
      }
    }

    this.dishModal.classList.add('is-open');
    this.dishModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  closeDishModal() {
    if (!this.dishModal) return;
    this.dishModal.classList.remove('is-open');
    this.dishModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VillaMenuApp;
}

