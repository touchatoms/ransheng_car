# 冉升车行 Static Used-Car Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pure static Chinese used-car dealership website for 冉升车行, backed by `data/cars.json`, with list filtering, detail pages, fake sample inventory, many sample images, and Cloudflare Pages compatibility.

**Architecture:** Use one static HTML entry point and query-parameter routing. Keep business logic in browser JavaScript, with pure helper functions exported for Node tests. Store all vehicle data in JSON and all images under `assets/cars/<car-id>/`.

**Tech Stack:** HTML, CSS, vanilla JavaScript, JSON, Node built-in test runner for helper tests, optional local static server for browser verification.

---

## File Structure

- Create `index.html`: static shell, SEO metadata, root app container, and script/style links.
- Create `styles.css`: full responsive styling for home, vehicle list, detail gallery, company, and contact sections.
- Create `app.js`: routing, JSON loading, rendering, filters, sorting, gallery behavior, and exported helper functions for tests.
- Create `data/cars.json`: fake inventory for 冉升车行.
- Create `assets/cars/<car-id>/*.svg`: fake vehicle images that behave like real image assets.
- Create `assets/contact/wechat-qr.svg`: fake WeChat QR placeholder image.
- Create `tests/app.test.mjs`: Node tests for vehicle filtering, sorting, price formatting, and route parsing.
- Create `README.md`: maintenance guide for non-technical updates and Cloudflare Pages deployment.

## Task 1: Project Shell and Test Harness

**Files:**
- Create: `index.html`
- Create: `app.js`
- Create: `tests/app.test.mjs`

- [ ] **Step 1: Write the failing helper tests**

Create `tests/app.test.mjs` with:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPrice,
  parseRoute,
  filterCars,
  sortCars
} from '../app.js';

const cars = [
  {
    id: 'a',
    brand: '丰田',
    type: '轿车',
    price: 128000,
    year: 2021,
    mileage: 3.8,
    fuel: '汽油',
    transmission: '自动',
    featured: true
  },
  {
    id: 'b',
    brand: '比亚迪',
    type: 'SUV',
    price: 96000,
    year: 2023,
    mileage: 1.2,
    fuel: '纯电',
    transmission: '自动',
    featured: false
  }
];

test('formatPrice renders RMB in 万元 units', () => {
  assert.equal(formatPrice(128000), '12.80万');
});

test('parseRoute returns default home route', () => {
  assert.deepEqual(parseRoute('https://example.com/index.html'), {
    page: 'home',
    id: ''
  });
});

test('parseRoute reads page and id query params', () => {
  assert.deepEqual(parseRoute('https://example.com/index.html?page=car&id=a'), {
    page: 'car',
    id: 'a'
  });
});

test('filterCars filters by brand, type, price, mileage, fuel, and transmission', () => {
  const result = filterCars(cars, {
    brand: '比亚迪',
    type: 'SUV',
    price: '5-10',
    mileage: '0-3',
    fuel: '纯电',
    transmission: '自动'
  });

  assert.deepEqual(result.map((car) => car.id), ['b']);
});

test('sortCars sorts by newest year without mutating input', () => {
  const result = sortCars(cars, 'year-desc');

  assert.deepEqual(result.map((car) => car.id), ['b', 'a']);
  assert.deepEqual(cars.map((car) => car.id), ['a', 'b']);
});
```

- [ ] **Step 2: Run tests and verify they fail because `app.js` does not exist**

Run:

```bash
node --test tests/app.test.mjs
```

Expected: FAIL with a module-not-found error for `../app.js`.

- [ ] **Step 3: Create the minimal HTML shell**

Create `index.html` with:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>冉升车行 | 本地精选二手车</title>
    <meta name="description" content="冉升车行提供本地精选二手车、预约看车、车辆咨询与过户协助。">
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div id="app" class="app-shell">
      <noscript>请启用 JavaScript 查看冉升车行车辆列表。</noscript>
    </div>
    <script type="module" src="app.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Create helper-only `app.js` implementation**

Create `app.js` with:

```js
export function formatPrice(price) {
  return `${(price / 10000).toFixed(2)}万`;
}

export function parseRoute(url) {
  const parsed = new URL(url);
  return {
    page: parsed.searchParams.get('page') || 'home',
    id: parsed.searchParams.get('id') || ''
  };
}

function inRange(value, range) {
  if (!range || range === 'all') return true;
  const [min, max] = range.split('-').map(Number);
  const numeric = Number(value);
  if (Number.isNaN(max)) return numeric >= min;
  return numeric >= min && numeric <= max;
}

export function filterCars(cars, filters) {
  return cars.filter((car) => {
    return (!filters.brand || filters.brand === 'all' || car.brand === filters.brand)
      && (!filters.type || filters.type === 'all' || car.type === filters.type)
      && inRange(car.price / 10000, filters.price)
      && inRange(car.mileage, filters.mileage)
      && (!filters.fuel || filters.fuel === 'all' || car.fuel === filters.fuel)
      && (!filters.transmission || filters.transmission === 'all' || car.transmission === filters.transmission);
  });
}

export function sortCars(cars, sortKey) {
  const sorted = [...cars];
  const sorters = {
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'mileage-asc': (a, b) => a.mileage - b.mileage,
    'year-desc': (a, b) => b.year - a.year,
    newest: (a, b) => (b.listedAt || '').localeCompare(a.listedAt || '')
  };
  return sorted.sort(sorters[sortKey] || sorters.newest);
}

if (typeof document !== 'undefined') {
  document.getElementById('app').innerHTML = '<main class="loading">冉升车行车辆加载中...</main>';
}
```

- [ ] **Step 5: Run tests and verify helpers pass**

Run:

```bash
node --test tests/app.test.mjs
```

Expected: PASS for all helper tests.

## Task 2: Fake Inventory and Image Assets

**Files:**
- Create: `data/cars.json`
- Create: `assets/cars/*/*.svg`
- Create: `assets/contact/wechat-qr.svg`
- Modify: `tests/app.test.mjs`

- [ ] **Step 1: Add a failing data integrity test**

Append to `tests/app.test.mjs`:

```js
import { readFile } from 'node:fs/promises';

test('cars.json contains usable sample inventory', async () => {
  const raw = await readFile(new URL('../data/cars.json', import.meta.url), 'utf8');
  const inventory = JSON.parse(raw);

  assert.ok(inventory.length >= 6);
  for (const car of inventory) {
    assert.ok(car.id);
    assert.ok(car.name);
    assert.ok(car.coverImage);
    assert.ok(car.images.length >= 4);
    assert.ok(car.price > 0);
  }
});
```

- [ ] **Step 2: Run tests and verify they fail because `data/cars.json` is missing**

Run:

```bash
node --test tests/app.test.mjs
```

Expected: FAIL with file-not-found for `data/cars.json`.

- [ ] **Step 3: Create sample inventory**

Create `data/cars.json` with six fake vehicles for 冉升车行. Each object must include the fields from the design spec and at least four image paths.

- [ ] **Step 4: Create fake image assets**

For each car id in `data/cars.json`, create:

```text
assets/cars/<car-id>/cover.svg
assets/cars/<car-id>/exterior-1.svg
assets/cars/<car-id>/interior-1.svg
assets/cars/<car-id>/detail-1.svg
```

Each SVG should be a simple generated car-themed placeholder with different colors and text labels so the gallery can be tested without real photos.

- [ ] **Step 5: Create WeChat QR sample asset**

Create `assets/contact/wechat-qr.svg` as a fake QR-style placeholder labeled `冉升车行 微信咨询`.

- [ ] **Step 6: Run tests and verify inventory passes**

Run:

```bash
node --test tests/app.test.mjs
```

Expected: PASS for all tests.

## Task 3: Page Rendering and Routing

**Files:**
- Modify: `app.js`
- Modify: `tests/app.test.mjs`

- [ ] **Step 1: Add failing render utility tests**

Append tests for `getUniqueValues`, `getCarById`, and `getFeaturedCars`:

```js
import {
  getCarById,
  getFeaturedCars,
  getUniqueValues
} from '../app.js';

test('getUniqueValues returns sorted unique values', () => {
  assert.deepEqual(getUniqueValues(cars, 'brand'), ['丰田', '比亚迪']);
});

test('getCarById returns matching car or null', () => {
  assert.equal(getCarById(cars, 'a').id, 'a');
  assert.equal(getCarById(cars, 'missing'), null);
});

test('getFeaturedCars returns featured cars with limit', () => {
  assert.deepEqual(getFeaturedCars(cars, 1).map((car) => car.id), ['a']);
});
```

- [ ] **Step 2: Run tests and verify missing exports fail**

Run:

```bash
node --test tests/app.test.mjs
```

Expected: FAIL because the new helper exports are missing.

- [ ] **Step 3: Implement render helpers and full browser bootstrap**

Update `app.js` to:

- Export `getUniqueValues`, `getCarById`, and `getFeaturedCars`.
- Load `data/cars.json`.
- Render header and footer on every page.
- Render home, list, detail, about, contact, and not-found states.
- Bind filter and sort controls on the list page.
- Bind gallery thumbnail clicks on the detail page.
- Use query parameter links for navigation.

- [ ] **Step 4: Run tests and verify helper coverage passes**

Run:

```bash
node --test tests/app.test.mjs
```

Expected: PASS for all tests.

## Task 4: Production Styling

**Files:**
- Create: `styles.css`

- [ ] **Step 1: Create responsive layout styles**

Create `styles.css` with:

- Global typography and layout variables.
- Header navigation.
- Home hero with inventory signals visible in the first viewport.
- Filter bar and vehicle grid.
- Vehicle cards with fixed image ratios and strong price display.
- Detail gallery with stable main image and thumbnail strip.
- Company and contact sections.
- Mobile sticky contact actions.
- Mobile breakpoints at approximately `760px`.

- [ ] **Step 2: Run tests to ensure JavaScript behavior still passes**

Run:

```bash
node --test tests/app.test.mjs
```

Expected: PASS for all tests.

## Task 5: Maintenance and Deployment Docs

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create maintenance guide**

Create `README.md` documenting:

- How to open the site locally.
- How to edit `data/cars.json`.
- Required car fields.
- How to add images under `assets/cars/<car-id>/`.
- How to deploy on Cloudflare Pages with no build command.
- How to replace fake WeChat/contact data.

- [ ] **Step 2: Run tests after docs change**

Run:

```bash
node --test tests/app.test.mjs
```

Expected: PASS for all tests.

## Task 6: Browser Verification

**Files:**
- No code files expected unless verification finds defects.

- [ ] **Step 1: Start a local static server**

Run:

```bash
python3 -m http.server 4173
```

Expected: Server listens on `http://localhost:4173`.

- [ ] **Step 2: Open and verify pages**

Open:

```text
http://localhost:4173/
http://localhost:4173/index.html?page=cars
http://localhost:4173/index.html?page=car&id=<real-car-id>
http://localhost:4173/index.html?page=about
http://localhost:4173/index.html?page=contact
```

Verify:

- Home renders vehicles from JSON.
- Filters change the visible vehicle cards.
- Sort changes card order.
- Detail page gallery swaps images.
- Missing detail id shows a not-found state.
- Mobile viewport does not overlap text or controls.

- [ ] **Step 3: Stop the local static server**

Stop the server process after verification.

## Task 7: Final Verification and Handoff

**Files:**
- Inspect all changed files.

- [ ] **Step 1: Run final automated tests**

Run:

```bash
node --test tests/app.test.mjs
```

Expected: PASS for all tests.

- [ ] **Step 2: Check project files**

Run:

```bash
find . -maxdepth 3 -type f | sort
```

Expected: Shows the static site files, docs, tests, data, and assets.

- [ ] **Step 3: Note git status**

Run:

```bash
git status --short
```

Expected in current workspace: may fail with `not a git repository`. If git is initialized later, use this command to inspect changes before commit.

- [ ] **Step 4: Report outcome**

Report:

- Files created.
- Verification commands and results.
- Local preview URL.
- Any remaining deployment step the user must do, such as creating a GitHub repository and connecting Cloudflare Pages.
