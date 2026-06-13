const CONTACT = {
  phone: '138-0000-8888',
  wechat: 'RanShengCar',
  address: '江苏省苏州市相城区二手车市场示例店铺 A18',
  hours: '周一至周日 09:00-19:00',
  mapUrl: 'https://map.baidu.com/'
};

const FILTER_DEFAULTS = {
  brand: 'all',
  type: 'all',
  price: 'all',
  mileage: 'all',
  fuel: 'all',
  transmission: 'all'
};

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

export function getUniqueValues(cars, key) {
  const seen = new Set();
  const values = [];
  for (const car of cars) {
    if (car[key] && !seen.has(car[key])) {
      seen.add(car[key]);
      values.push(car[key]);
    }
  }
  return values;
}

export function getCarById(cars, id) {
  return cars.find((car) => car.id === id) || null;
}

export function getFeaturedCars(cars, limit = 3) {
  return cars.filter((car) => car.featured).slice(0, limit);
}

function escapeHTML(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function link(page, extra = '') {
  if (page === 'home') return 'index.html';
  return `index.html?page=${page}${extra}`;
}

function renderHeader(page) {
  const items = [
    ['home', '首页'],
    ['cars', '车辆列表'],
    ['about', '公司介绍'],
    ['contact', '联系方式']
  ];
  const nav = items.map(([key, label]) => {
    const href = link(key);
    const active = page === key || (page === 'car' && key === 'cars') ? ' is-active' : '';
    return `<a class="nav-link${active}" href="${href}">${label}</a>`;
  }).join('');

  return `
    <header class="site-header">
      <a class="brand" href="index.html" aria-label="冉升车行首页">
        <span class="brand-mark">冉</span>
        <span><strong>冉升车行</strong><small>本地精选二手车</small></span>
      </a>
      <nav class="site-nav" aria-label="主导航">${nav}</nav>
      <a class="header-phone" href="tel:${CONTACT.phone.replaceAll('-', '')}">${CONTACT.phone}</a>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div>
        <strong>冉升车行</strong>
        <p>精选车源、预约看车、协助过户。车辆信息以到店实车为准。</p>
      </div>
      <div class="footer-contact">
        <span>电话：${CONTACT.phone}</span>
        <span>微信：${CONTACT.wechat}</span>
        <span>${CONTACT.address}</span>
      </div>
    </footer>
  `;
}

function renderCarCard(car) {
  const tags = car.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join('');
  return `
    <article class="car-card">
      <a class="car-image-link" href="${link('car', `&id=${encodeURIComponent(car.id)}`)}">
        <img src="${escapeHTML(car.coverImage)}" alt="${escapeHTML(car.name)}">
      </a>
      <div class="car-card-body">
        <a class="car-title" href="${link('car', `&id=${encodeURIComponent(car.id)}`)}">${escapeHTML(car.name)}</a>
        <p class="car-meta">${car.year}年 / ${car.mileage}万公里 / ${escapeHTML(car.location)} / ${escapeHTML(car.fuel)} / ${escapeHTML(car.transmission)}</p>
        <div class="tag-row">${tags}</div>
        <div class="price-row">
          <strong>${formatPrice(car.price)}</strong>
          ${car.originalPrice ? `<del>${formatPrice(car.originalPrice)}</del>` : ''}
        </div>
      </div>
    </article>
  `;
}

function renderHome(cars) {
  const featured = getFeaturedCars(cars, 3);
  const newest = sortCars(cars, 'newest').slice(0, 3);
  const minPrice = Math.min(...cars.map((car) => car.price));

  return `
    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">冉升车行 · 本地现车</p>
          <h1>精选二手车，到店看实车更放心</h1>
          <p>按预算、品牌、里程快速筛选，电话或微信预约看车。所有示例车辆可替换为真实库存。</p>
          <div class="hero-actions">
            <a class="button primary" href="${link('cars')}">查看全部车源</a>
            <a class="button ghost" href="${link('contact')}">联系看车</a>
          </div>
        </div>
        <div class="hero-panel">
          <span>当前车源</span>
          <strong>${cars.length} 台</strong>
          <span>最低价格</span>
          <strong>${formatPrice(minPrice)}</strong>
          <span>咨询电话</span>
          <strong>${CONTACT.phone}</strong>
        </div>
      </section>

      <section class="quick-filters">
        <a href="${link('cars', '&price=0-8')}">8万以内</a>
        <a href="${link('cars', '&price=8-15')}">8-15万</a>
        <a href="${link('cars', '&type=SUV')}">SUV</a>
        <a href="${link('cars', `&fuel=${encodeURIComponent('插电混动')}`)}">新能源</a>
      </section>

      <section class="section">
        <div class="section-head">
          <p class="eyebrow">推荐车源</p>
          <h2>近期主推</h2>
          <a href="${link('cars')}">全部车辆</a>
        </div>
        <div class="car-grid">${featured.map(renderCarCard).join('')}</div>
      </section>

      <section class="section split-band">
        <div>
          <p class="eyebrow">到店服务</p>
          <h2>看车、检测、过户一起安排</h2>
          <p>冉升车行适合小团队维护：改 JSON 就能上新车辆，图片放到对应文件夹即可。</p>
        </div>
        <div class="service-list">
          <span>车况说明</span>
          <span>预约看车</span>
          <span>过户协助</span>
          <span>售后沟通</span>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <p class="eyebrow">新车到店</p>
          <h2>最新上架</h2>
        </div>
        <div class="car-grid">${newest.map(renderCarCard).join('')}</div>
      </section>
    </main>
  `;
}

function option(value, label, selected) {
  return `<option value="${escapeHTML(value)}"${value === selected ? ' selected' : ''}>${escapeHTML(label)}</option>`;
}

function getFilterState(url) {
  const params = new URL(url).searchParams;
  return {
    brand: params.get('brand') || FILTER_DEFAULTS.brand,
    type: params.get('type') || FILTER_DEFAULTS.type,
    price: params.get('price') || FILTER_DEFAULTS.price,
    mileage: params.get('mileage') || FILTER_DEFAULTS.mileage,
    fuel: params.get('fuel') || FILTER_DEFAULTS.fuel,
    transmission: params.get('transmission') || FILTER_DEFAULTS.transmission,
    sort: params.get('sort') || 'newest'
  };
}

function renderSelect(name, label, values, selected) {
  const choices = [option('all', `全部${label}`, selected)]
    .concat(values.map((value) => option(value, value, selected)));
  return `
    <label>
      <span>${label}</span>
      <select name="${name}">${choices.join('')}</select>
    </label>
  `;
}

function renderCarsPage(cars, currentUrl) {
  const state = getFilterState(currentUrl);
  const filtered = sortCars(filterCars(cars, state), state.sort);

  return `
    <main class="page-wrap">
      <section class="list-title">
        <p class="eyebrow">车辆列表</p>
        <h1>冉升车行在售车源</h1>
        <p>共 ${filtered.length} 台符合条件，可点击车辆查看详情和更多图片。</p>
      </section>
      <form class="filter-panel" id="filterForm">
        ${renderSelect('brand', '品牌', getUniqueValues(cars, 'brand'), state.brand)}
        ${renderSelect('type', '车型', getUniqueValues(cars, 'type'), state.type)}
        <label><span>价格</span><select name="price">
          ${option('all', '全部价格', state.price)}
          ${option('0-8', '8万以内', state.price)}
          ${option('8-15', '8-15万', state.price)}
          ${option('15-25', '15-25万', state.price)}
          ${option('25-', '25万以上', state.price)}
        </select></label>
        <label><span>里程</span><select name="mileage">
          ${option('all', '全部里程', state.mileage)}
          ${option('0-3', '3万公里内', state.mileage)}
          ${option('3-6', '3-6万公里', state.mileage)}
          ${option('6-', '6万公里以上', state.mileage)}
        </select></label>
        ${renderSelect('fuel', '能源', getUniqueValues(cars, 'fuel'), state.fuel)}
        ${renderSelect('transmission', '变速箱', getUniqueValues(cars, 'transmission'), state.transmission)}
        <label><span>排序</span><select name="sort">
          ${option('newest', '最新上架', state.sort)}
          ${option('price-asc', '价格最低', state.sort)}
          ${option('price-desc', '价格最高', state.sort)}
          ${option('mileage-asc', '里程最低', state.sort)}
          ${option('year-desc', '年份最新', state.sort)}
        </select></label>
        <a class="reset-link" href="${link('cars')}">重置</a>
      </form>
      ${filtered.length
        ? `<div class="car-grid list-grid">${filtered.map(renderCarCard).join('')}</div>`
        : '<div class="empty-state">没有符合条件的车辆，换个筛选条件试试。</div>'}
    </main>
  `;
}

function renderSpecTable(specs) {
  return Object.entries(specs).map(([key, value]) => `
    <div class="spec-item">
      <span>${escapeHTML(key)}</span>
      <strong>${escapeHTML(value)}</strong>
    </div>
  `).join('');
}

function renderDetailPage(cars, id) {
  const car = getCarById(cars, id);
  if (!car) {
    return `
      <main class="page-wrap">
        <section class="empty-state">
          <h1>没有找到这台车</h1>
          <p>车辆可能已下架，返回车辆列表查看其他车源。</p>
          <a class="button primary" href="${link('cars')}">返回车辆列表</a>
        </section>
      </main>
    `;
  }

  const thumbs = car.images.map((image, index) => `
    <button class="thumb${index === 0 ? ' is-active' : ''}" type="button" data-image="${escapeHTML(image)}">
      <img src="${escapeHTML(image)}" alt="${escapeHTML(car.name)} 图 ${index + 1}">
    </button>
  `).join('');
  const tags = car.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join('');
  const features = car.features.map((feature) => `<li>${escapeHTML(feature)}</li>`).join('');

  return `
    <main class="page-wrap detail-page">
      <section class="detail-layout">
        <div class="gallery">
          <img id="mainImage" class="main-image" src="${escapeHTML(car.images[0])}" alt="${escapeHTML(car.name)}">
          <div class="thumb-row">${thumbs}</div>
        </div>
        <aside class="detail-summary">
          <p class="eyebrow">${escapeHTML(car.brand)} · ${escapeHTML(car.series)}</p>
          <h1>${escapeHTML(car.name)}</h1>
          <div class="detail-price">${formatPrice(car.price)} ${car.originalPrice ? `<del>${formatPrice(car.originalPrice)}</del>` : ''}</div>
          <div class="tag-row">${tags}</div>
          <div class="key-facts">
            <span><strong>${car.year}</strong> 年</span>
            <span><strong>${car.mileage}</strong> 万公里</span>
            <span><strong>${escapeHTML(car.fuel)}</strong></span>
            <span><strong>${escapeHTML(car.transmission)}</strong></span>
          </div>
          <p>${escapeHTML(car.description)}</p>
          <div class="contact-box">
            <a class="button primary" href="tel:${CONTACT.phone.replaceAll('-', '')}">电话咨询</a>
            <a class="button ghost" href="${link('contact')}">微信看车</a>
          </div>
        </aside>
      </section>
      <section class="section">
        <div class="section-head">
          <p class="eyebrow">车辆亮点</p>
          <h2>车况与服务</h2>
        </div>
        <ul class="feature-list">${features}</ul>
      </section>
      <section class="section">
        <div class="section-head">
          <p class="eyebrow">车辆参数</p>
          <h2>基础信息</h2>
        </div>
        <div class="spec-grid">${renderSpecTable(car.specs)}</div>
      </section>
    </main>
  `;
}

function renderAbout() {
  return `
    <main class="page-wrap">
      <section class="content-hero">
        <p class="eyebrow">公司介绍</p>
        <h1>冉升车行，专注本地精选二手车</h1>
        <p>我们以真实车况、清楚报价和预约看车为核心，帮助客户更高效地找到合适车辆。</p>
      </section>
      <section class="process-grid">
        <article><span>01</span><h3>选车咨询</h3><p>按预算、用途、品牌推荐合适车源。</p></article>
        <article><span>02</span><h3>预约看车</h3><p>提前确认车辆状态，减少空跑。</p></article>
        <article><span>03</span><h3>车况说明</h3><p>支持客户自行或第三方检测。</p></article>
        <article><span>04</span><h3>手续协助</h3><p>协助合同、过户和后续沟通。</p></article>
      </section>
    </main>
  `;
}

function renderContact() {
  return `
    <main class="page-wrap contact-layout">
      <section class="content-hero">
        <p class="eyebrow">联系方式</p>
        <h1>预约到店看车</h1>
        <p>建议先电话或微信确认车辆状态，再安排到店看车。</p>
      </section>
      <section class="contact-grid">
        <div class="contact-card">
          <h2>冉升车行</h2>
          <p><strong>电话：</strong><a href="tel:${CONTACT.phone.replaceAll('-', '')}">${CONTACT.phone}</a></p>
          <p><strong>微信：</strong>${CONTACT.wechat}</p>
          <p><strong>地址：</strong>${CONTACT.address}</p>
          <p><strong>营业时间：</strong>${CONTACT.hours}</p>
          <a class="button primary" href="${CONTACT.mapUrl}" target="_blank" rel="noreferrer">打开地图</a>
        </div>
        <div class="qr-card">
          <img src="assets/contact/wechat-qr.svg" alt="冉升车行微信二维码">
          <p>扫码或搜索微信号咨询车辆</p>
        </div>
      </section>
    </main>
  `;
}

function renderApp(cars) {
  const route = parseRoute(window.location.href);
  const pages = {
    home: () => renderHome(cars),
    cars: () => renderCarsPage(cars, window.location.href),
    car: () => renderDetailPage(cars, route.id),
    about: renderAbout,
    contact: renderContact
  };
  const content = (pages[route.page] || pages.home)();
  document.getElementById('app').innerHTML = `${renderHeader(route.page)}${content}${renderFooter()}${renderMobileActions()}`;
  bindInteractions();
}

function renderMobileActions() {
  return `
    <div class="mobile-actions">
      <a href="tel:${CONTACT.phone.replaceAll('-', '')}">电话咨询</a>
      <a href="${link('contact')}">微信看车</a>
    </div>
  `;
}

function bindInteractions() {
  const filterForm = document.getElementById('filterForm');
  if (filterForm) {
    filterForm.addEventListener('change', () => {
      const params = new URLSearchParams({ page: 'cars' });
      for (const [key, value] of new FormData(filterForm).entries()) {
        if (value && value !== 'all' && !(key === 'sort' && value === 'newest')) {
          params.set(key, value);
        }
      }
      window.location.href = `index.html?${params.toString()}`;
    });
  }

  const mainImage = document.getElementById('mainImage');
  document.querySelectorAll('.thumb').forEach((button) => {
    button.addEventListener('click', () => {
      if (!mainImage) return;
      mainImage.src = button.dataset.image;
      document.querySelectorAll('.thumb').forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');
    });
  });
}

async function boot() {
  const app = document.getElementById('app');
  try {
    app.innerHTML = '<main class="loading">冉升车行车辆加载中...</main>';
    const response = await fetch('data/cars.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const cars = await response.json();
    renderApp(cars);
  } catch (error) {
    app.innerHTML = `
      <main class="page-wrap">
        <section class="empty-state">
          <h1>车辆数据加载失败</h1>
          <p>请确认 data/cars.json 存在并且格式正确。</p>
        </section>
      </main>
    `;
    console.error(error);
  }
}

if (typeof document !== 'undefined') {
  boot();
}
