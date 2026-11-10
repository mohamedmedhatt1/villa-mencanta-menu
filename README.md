# Villa menCanta — Digital Restaurant Menu

Official high-end digital restaurant menu for **Villa menCanta** (Sheikh Zayed, CentrAda Plaza Mall, Juhayna Square, Giza, Egypt).

Designed and engineered with an editorial, quiet-luxury visual direction inspired by Mediterranean villa architecture, warm earthen palettes (`#412103`), and refined serif typography (`Times NR MT Pro`).

---

## 🌟 Key Features

- **14 Dedicated Category Pages**: Each category has its own dedicated page and URL route (`#breakfast`, `#soup`, `#salad`, `#appetizers`, `#sandwiches`, `#main-course-chicken`, `#main-course-meat`, `#main-course-seafood`, `#pasta`, `#pizza`, `#panozo`, `#beverages`, `#dessert`, `#shisha`).
- **Official Menu Data**: 144 items extracted directly from the official Google Sheets source with 100% price accuracy in Egyptian Pounds (EGP).
- **114 Authentic Food Photos**: High-resolution photography extracted from the official menu source. Dishes genuinely lacking photos (e.g. shisha, soft drinks) display an embossed Villa menCanta brandmark fallback card.
- **Dish Lightbox Modal**: Tapping any dish card opens an editorial modal with full-resolution food photography, dish description, pricing, and category metadata.
- **Progressive Shimmer Loading**: Skeleton loading states in warm travertine tones (`#F5EFEB` to `#EFE7DE`) prevent layout shifts during image rendering.
- **Bilingual Experience (EN & AR)**:
  - English default (LTR).
  - Instant Arabic mode (RTL) with Arabic serif typography without page reload.
  - Selected language persists via `localStorage`.
- **Elegant Hamburger Drawer**: Full-height slide-over drawer listing all 14 categories in exact spreadsheet order with active state indicators and smooth backdrop dismissal.
- **Live Search**: Instant real-time filtering across English and Arabic dish names, ingredients, and categories.
- **Zero Runtime Dependencies**: Built with pure Vanilla JavaScript, modern semantic HTML5, and CSS3.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Pure Vanilla JavaScript (ES6+), HTML5, CSS3
- **CSS Architecture**: CSS Custom Properties (`css/variables.css`), Modern Reset (`css/reset.css`), Components (`css/components.css`), Global Layout (`css/main.css`)
- **Typography**: Times NR MT Pro, Cormorant Garamond, Amiri (Arabic), Plus Jakarta Sans
- **Brand Colors**: Primary Walnut Ink `#412103`, Warm Ivory `#FAF7F2`, Limestone `#F5EFEB`, Terracotta `#8E4D26`
- **Server (Local)**: Node.js built-in `http` module (`server.js`) with SPA route fallback
- **Hosting / Edge**: Configured for Vercel static deployment via [`vercel.json`](./vercel.json)

---

## 📁 Project Structure

```text
villa-mencanta-menu/
├── assets/
│   ├── brand/
│   │   ├── logo.png               # Official Villa menCanta logo
│   │   └── logo-master.png        # Master brandmark vector/raster
│   └── menu/
│       ├── image1.jpg ...         # 112 extracted authentic food photos
│       └── image114.png
├── css/
│   ├── variables.css              # Design tokens, brand colors, fluid typography
│   ├── reset.css                  # Modern CSS reset & box-sizing
│   ├── components.css             # Drawer, cards, modal, shimmer, header, footer
│   └── main.css                   # Global utilities & media queries
├── js/
│   ├── menu-data.js               # Official bilingual menu dataset (144 items)
│   ├── navigation.js              # Drawer controller & category rail
│   ├── search.js                  # Real-time search controller
│   └── app.js                     # SPA router, i18n, modal, DOM orchestration
├── index.html                     # Semantic HTML5 entry point
├── server.js                      # Local development server with SPA routing
├── vercel.json                    # Vercel deployment configuration & SPA rewrites
├── package.json                   # Project metadata & npm scripts
├── .gitignore                     # Git ignore rules for sensitive & build files
├── .gitattributes                 # Cross-platform line-ending rules
├── test-verification.js           # Menu dataset & component test suite
├── test-dom-simulation.js         # Client-side router & DOM test suite
├── test-responsive-audit.js       # Responsive mobile viewport test suite
└── verify-deployment-assets.js    # Pre-deployment asset & path integrity audit
```

---

## 🚀 Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18.0.0 or higher
- npm (bundled with Node.js)

### Installation & Running

1. Clone or navigate to the project directory:
   ```bash
   cd villa-mencanta-menu
   ```

2. Start the local development server:
   ```bash
   npm start
   ```
   *Alternatively, run directly with Node:*
   ```bash
   node server.js
   ```

3. Open your browser and navigate to:
   ```text
   http://127.0.0.1:3000/
   ```

---

## 🧪 Verification & Automated Tests

Run the full pre-deployment automated test suite:

```bash
npm test
```

This runs 4 automated verification suites:
1. **`test-verification.js`**: Validates 14 categories, 144 dishes, prices, 114 photos, 30 fallbacks, 0 broken links, server routes.
2. **`test-dom-simulation.js`**: Validates SPA navigation, drawer interactions, search filtering, and Arabic RTL switching.
3. **`test-responsive-audit.js`**: Validates layout containment across mobile widths (320px, 360px, 375px, 390px, 414px).
4. **`verify-deployment-assets.js`**: Validates asset paths, ensures no absolute local paths exist, and verifies relative link integrity.

---

## 🌐 Deploying to Vercel

The project is pre-configured with [`vercel.json`](./vercel.json) for zero-config Vercel deployment.

### Option A: Deploy via GitHub (Recommended)

1. Push this project to your GitHub repository (see [GitHub Instructions](#-pushing-to-github) below).
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
3. Import your `villa-mencanta-menu` repository.
4. Keep the default settings:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./`
   - **Build Command**: *Leave blank or `npm run build`*
   - **Output Directory**: *Leave blank (serves root static files)*
5. Click **Deploy**. Vercel will deploy the site globally across its Edge Network.

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```
2. In the project root, run:
   ```bash
   vercel
   ```
3. For production deployment:
   ```bash
   vercel --prod
   ```

---

## 📦 Pushing to GitHub

When you are ready to publish the project to GitHub:

1. Initialize git in the project root:
   ```bash
   git init
   ```

2. Add all tracked project files:
   ```bash
   git add .
   ```

3. Commit the verified project:
   ```bash
   git commit -m "feat: complete Villa menCanta bilingual digital menu website"
   ```

4. Create a new repository on GitHub (e.g. `villa-mencanta-menu`).

5. Link your local repository to GitHub and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/villa-mencanta-menu.git
   git push -u origin main
   ```

---

## 📍 Restaurant Information

- **Name**: Villa menCanta
- **Location**: CentrAda Plaza Mall, Juhayna Square, Sheikh Zayed City, Giza Governorate, Egypt
- **Instagram**: [@villa_mencanta](https://www.instagram.com/villa_mencanta)
- **Facebook**: [VillamenCanta](https://www.facebook.com/VillamenCanta)
- **TikTok**: [@villa_mencanta](https://www.tiktok.com/@villa_mencanta)
- **Directions**: [Apple Maps / Google Maps Location](https://maps.apple.com/place?map=explore&address=%D8%B4%D8%A7%D8%B1%D8%B9+%D8%B9%D8%A8%D8%AF+%D8%A7%D9%84%D9%85%D9%86%D8%B9%D9%85+%D8%B1%D9%8A%D8%A7%D8%B6%2C+%D8%A7%D9%84%D8%B3%D8%A7%D8%AF%D8%B3+%D9%85%D9%86+%D8%A3%D9%83%D8%AA%D9%88%D8%A8%D8%B1%2C+%D8%A7%D9%84%D8%AC%D9%8A%D8%B2%D8%A9%2C+%D9%85%D8%B5%D8%B1&coordinate=29.999728%2C30.973817&name=Villa%2520MenCanta)

