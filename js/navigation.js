/**
 * Villa menCanta — Navigation & Drawer Controller
 * Handles hamburger menu, side navigation drawer, category quick rail, and sticky header.
 */

class MenuNavigation {
  constructor(app) {
    this.app = app;

    // DOM Elements
    this.header = document.getElementById('site-header');
    this.hamburgerBtn = document.getElementById('hamburger-btn');
    this.drawer = document.getElementById('nav-drawer');
    this.backdrop = document.getElementById('drawer-backdrop');
    this.drawerCloseBtn = document.getElementById('drawer-close-btn');
    this.drawerCategoryList = document.getElementById('drawer-category-list');
    this.categoryNav = document.getElementById('category-nav');
    this.scrollTrack = document.getElementById('category-scroll-track');
    this.maskLeft = document.getElementById('category-mask-left');
    this.maskRight = document.getElementById('category-mask-right');

    this.isDrawerOpen = false;

    this.init();
  }

  init() {
    this.setupHeaderScroll();
    this.setupCategoryRailMasks();
    this.bindDrawerEvents();
  }

  /* ------------------------------------------------------------------------
     1. Sticky Header Elevation on Scroll
     ------------------------------------------------------------------------ */
  setupHeaderScroll() {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (this.header) {
        if (currentY > 15) {
          this.header.classList.add('is-scrolled');
        } else {
          this.header.classList.remove('is-scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ------------------------------------------------------------------------
     2. Category Rail Edge Masks
     ------------------------------------------------------------------------ */
  setupCategoryRailMasks() {
    if (!this.scrollTrack) return;

    const updateMasks = () => {
      const isRTL = document.documentElement.dir === 'rtl';
      const maxScroll = this.scrollTrack.scrollWidth - this.scrollTrack.clientWidth;
      const currentScroll = Math.abs(this.scrollTrack.scrollLeft);

      if (this.maskLeft) {
        this.maskLeft.style.opacity = currentScroll > 6 ? '1' : '0';
      }
      if (this.maskRight) {
        this.maskRight.style.opacity = currentScroll < maxScroll - 6 ? '1' : '0';
      }
    };

    this.scrollTrack.addEventListener('scroll', updateMasks, { passive: true });
    window.addEventListener('resize', updateMasks, { passive: true });
    setTimeout(updateMasks, 100);
  }

  /* ------------------------------------------------------------------------
     3. Drawer Events (Hamburger, Backdrop, Close Button, Escape Key)
     ------------------------------------------------------------------------ */
  bindDrawerEvents() {
    // Hamburger Button Toggle
    if (this.hamburgerBtn) {
      this.hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDrawer();
      });
    }

    // Close Button Click
    if (this.drawerCloseBtn) {
      this.drawerCloseBtn.addEventListener('click', () => {
        this.closeDrawer();
      });
    }

    // Backdrop Click (Close when clicking outside)
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => {
        this.closeDrawer();
      });
    }

    // Keyboard Accessibility: Escape key closes drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isDrawerOpen) {
        this.closeDrawer();
      }
    });
  }

  openDrawer() {
    this.isDrawerOpen = true;
    if (this.drawer) {
      this.drawer.classList.add('is-open');
      this.drawer.setAttribute('aria-hidden', 'false');
    }
    if (this.backdrop) {
      this.backdrop.classList.add('is-open');
      this.backdrop.setAttribute('aria-hidden', 'false');
    }
    if (this.hamburgerBtn) {
      this.hamburgerBtn.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  closeDrawer() {
    this.isDrawerOpen = false;
    if (this.drawer) {
      this.drawer.classList.remove('is-open');
      this.drawer.setAttribute('aria-hidden', 'true');
    }
    if (this.backdrop) {
      this.backdrop.classList.remove('is-open');
      this.backdrop.setAttribute('aria-hidden', 'true');
    }
    if (this.hamburgerBtn) {
      this.hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  toggleDrawer() {
    if (this.isDrawerOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  /* ------------------------------------------------------------------------
     4. Scroll Active Category Link Into View on Horizontal Rail
     ------------------------------------------------------------------------ */
  scrollActiveRailLinkIntoView(catId) {
    if (!this.scrollTrack) return;
    const activeLink = this.scrollTrack.querySelector(`[data-category-id="${catId}"]`);
    if (activeLink) {
      const trackRect = this.scrollTrack.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const isRTL = document.documentElement.dir === 'rtl';

      const offsetLeft = linkRect.left - trackRect.left;
      const targetScroll = this.scrollTrack.scrollLeft + offsetLeft - (trackRect.width / 2) + (linkRect.width / 2);

      if (typeof this.scrollTrack.scrollTo === 'function') {
        this.scrollTrack.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        });
      } else {
        this.scrollTrack.scrollLeft = targetScroll;
      }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MenuNavigation;
}

