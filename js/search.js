/**
 * Villa menCanta — Search Experience
 * Minimal, integrated bilingual search across dishes, ingredients & categories.
 */

class MenuSearch {
  constructor(menuData, app) {
    this.menuData = menuData || [];
    this.app = app;

    // DOM Elements
    this.triggerBtn = document.getElementById('search-trigger-btn');
    this.searchPanel = document.getElementById('header-search-panel');
    this.searchInput = document.getElementById('menu-search-input');
    this.clearBtn = document.getElementById('search-clear-btn');
    this.closeBtn = document.getElementById('search-close-btn');
    this.resultsContainer = document.getElementById('search-results-container');
    this.categoryPageView = document.getElementById('category-page-view');

    this.isOpen = false;
    this.currentQuery = '';

    this.init();
  }

  init() {
    if (!this.triggerBtn || !this.searchInput) return;

    // Toggle Search Panel
    this.triggerBtn.addEventListener('click', () => {
      this.toggleSearch();
    });

    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.closeSearch();
      });
    }

    // Input changes
    this.searchInput.addEventListener('input', (e) => {
      this.handleInput(e.target.value);
    });

    // Clear button
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        this.clearQuery();
        this.searchInput.focus();
      });
    }

    // Keyboard shortcuts: Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeSearch();
      }
    });

    // Prevent enter key submitting
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.searchInput.blur();
      }
    });
  }

  toggleSearch() {
    if (this.isOpen) {
      this.closeSearch();
    } else {
      this.openSearch();
    }
  }

  openSearch() {
    this.isOpen = true;
    if (this.searchPanel) {
      this.searchPanel.classList.add('is-open');
      this.searchPanel.setAttribute('aria-hidden', 'false');
    }
    this.triggerBtn.setAttribute('aria-expanded', 'true');

    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.focus();
      }
    }, 120);
  }

  closeSearch() {
    this.isOpen = false;
    if (this.searchPanel) {
      this.searchPanel.classList.remove('is-open');
      this.searchPanel.setAttribute('aria-hidden', 'true');
    }
    this.triggerBtn.setAttribute('aria-expanded', 'false');
    this.clearQuery();
  }

  clearQuery() {
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    this.currentQuery = '';
    if (this.clearBtn) {
      this.clearBtn.classList.remove('is-visible');
    }
    this.restoreNormalView();
  }

  handleInput(val) {
    const query = (val || '').trim();
    this.currentQuery = query;

    if (this.clearBtn) {
      if (query.length > 0) {
        this.clearBtn.classList.add('is-visible');
      } else {
        this.clearBtn.classList.remove('is-visible');
      }
    }

    if (query.length === 0) {
      this.restoreNormalView();
      return;
    }

    this.performSearch(query);
  }

  performSearch(query) {
    const isAr = this.app.currentLanguage === 'ar';
    const qLower = query.toLowerCase();

    // Search across dish name (EN & AR), description (EN & AR), category (EN & AR), subcategory
    const results = this.menuData.filter(item => {
      const matchNameEn = (item.nameEn || '').toLowerCase().includes(qLower);
      const matchNameAr = (item.nameAr || '').includes(query);
      const matchDescEn = (item.descEn || '').toLowerCase().includes(qLower);
      const matchDescAr = (item.descAr || '').includes(query);
      const matchCatEn = (item.categoryEn || '').toLowerCase().includes(qLower);
      const matchCatAr = (item.categoryAr || '').includes(query);
      const matchSubEn = (item.subcategoryEn || '').toLowerCase().includes(qLower);
      const matchSubAr = (item.subcategoryAr || '').includes(query);

      return matchNameEn || matchNameAr || matchDescEn || matchDescAr || matchCatEn || matchCatAr || matchSubEn || matchSubAr;
    });

    this.renderSearchResults(results, query);
  }

  renderSearchResults(results, query) {
    if (!this.resultsContainer) return;

    const isAr = this.app.currentLanguage === 'ar';
    if (this.categoryPageView) {
      this.categoryPageView.style.display = 'none';
    }
    this.resultsContainer.style.display = 'block';

    const countText = isAr
      ? `تم العثور على ${results.length} صنف`
      : `${results.length} ${results.length === 1 ? 'dish' : 'dishes'} found`;

    const titleText = isAr
      ? `نتائج البحث عن "${query}"`
      : `Search Results for "${query}"`;

    if (results.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="search-results-header">
          <h2 class="search-results-title">${titleText}</h2>
          <span class="search-results-count">${countText}</span>
          <p class="search-empty-msg" style="margin-top: 24px; color: var(--color-ink-secondary); font-size: var(--text-sm);">
            ${isAr ? 'لم يتم العثور على أطباق مطابقة للبحث.' : 'No dishes found matching your query.'}
          </p>
        </div>
      `;
      return;
    }

    let cardsHtml = '';
    results.forEach(item => {
      const name = isAr ? item.nameAr : item.nameEn;
      const desc = isAr ? (item.descAr || '') : (item.descEn || '');
      const catName = isAr ? item.categoryAr : item.categoryEn;
      const currency = isAr ? item.currencyAr : item.currencyEn;
      const priceDisplay = item.price !== null
        ? `<span class="dish-price-val">${item.price}</span> <span class="dish-price-currency">${currency}</span>`
        : `<span class="dish-price-seasonal">${isAr ? 'حسب الموسم' : 'Seasonal'}</span>`;

      const imgHtml = item.image
        ? `
          <img src="${item.image}" alt="${name}" class="dish-real-img" loading="lazy" onload="this.classList.add('is-loaded')" />
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
        <article class="dish-card search-result-card" data-dish-id="${item.id}" data-category-id="${item.categoryId}" role="button" tabindex="0" aria-label="${name}, ${catName}">
          <div class="dish-image-slot">
            ${imgHtml}
          </div>
          <div class="dish-content">
            <span class="dish-subdept-badge">${catName}</span>
            <div class="dish-top-row">
              <h3 class="dish-name">${name}</h3>
              <div class="dish-price-wrap">${priceDisplay}</div>
            </div>
            ${desc ? `<p class="dish-description">${desc}</p>` : ''}
          </div>
        </article>
      `;
    });

    this.resultsContainer.innerHTML = `
      <div class="search-results-header">
        <h2 class="search-results-title">${titleText}</h2>
        <span class="search-results-count">${countText}</span>
      </div>
      <div class="search-results-grid">
        ${cardsHtml}
      </div>
    `;

    // Clicking a search result navigates to its category page
    const cards = this.resultsContainer.querySelectorAll('.search-result-card');
    cards.forEach(card => {
      const clickHandler = () => {
        const catId = card.getAttribute('data-category-id');
        this.closeSearch();
        this.app.navigateToCategory(catId);
      };
      card.addEventListener('click', clickHandler);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          clickHandler();
        }
      });
    });
  }

  restoreNormalView() {
    if (this.resultsContainer) {
      this.resultsContainer.style.display = 'none';
      this.resultsContainer.innerHTML = '';
    }
    if (this.categoryPageView) {
      this.categoryPageView.style.display = 'block';
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MenuSearch;
}

