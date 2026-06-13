const CONTACT = {
  phone: '18753716666',
  wechat: '18753716666',
  address: '济宁市高新区南营村327国道申科集团-往西20米路南-冉升车行',
  hours: '周一至周日 09:00-21:00',
  baiduMapUrl: 'https://j.map.baidu.com/a7/eCqM',
  amapUrl: 'https://surl.amap.com/6TO06zsU95E'
};

export function formatPrice(price) {
  return `${(price / 10000).toFixed(2)}万`;
}

export function parseRoute(url) {
  const parsed = new URL(url);
  return {
    page: parsed.searchParams.get('page') || 'cars',
    id: parsed.searchParams.get('id') || ''
  };
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

export function getCarById(cars, id) {
  return cars.find((car) => car.id === id) || null;
}

export function getCarsForList(cars) {
  return sortCars(cars, 'newest');
}

export function getGalleryImages(car) {
  return [car.coverImage, ...(car.images || [])].filter((image, index, images) => {
    return image && images.indexOf(image) === index;
  });
}

export function clampZoomScale(scale) {
  return Math.min(2.5, Math.max(0.8, scale));
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
  if (page === 'cars') return `index.html${extra}`;
  return `index.html?page=${page}${extra}`;
}

function renderHeader(page) {
  const items = [
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
      <a class="brand" href="index.html" aria-label="冉升车行车辆列表">
        <img class="brand-logo" src="assets/logo.png" alt="冉升车行 logo">
        <span>
          <strong>冉升车行</strong>
          <small>济宁本地精选二手车</small>
        </span>
      </a>
      <nav class="site-nav" aria-label="主导航">${nav}</nav>
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

function renderCarsPage(cars) {
  const visibleCars = getCarsForList(cars);

  return `
    <main class="page-wrap">
      <section class="list-title">
        <p class="eyebrow">车辆列表</p>
        <h1>冉升车行在售车源</h1>
        <p>共 ${visibleCars.length} 台在售车辆，可点击车辆查看详情和更多图片。</p>
      </section>
      <div class="car-grid list-grid">${visibleCars.map(renderCarCard).join('')}</div>
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

  const galleryImages = getGalleryImages(car);
  const bottomImages = galleryImages.slice(1).map((image, index) => `
    <button class="detail-photo" type="button" data-photo-trigger data-photo-src="${escapeHTML(image)}" data-photo-alt="${escapeHTML(car.name)} 图 ${index + 2}">
      <img src="${escapeHTML(image)}" alt="${escapeHTML(car.name)} 图 ${index + 2}">
      <figcaption>实拍图 ${index + 2}</figcaption>
    </button>
  `).join('');
  const tags = car.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join('');
  const features = car.features.map((feature) => `<li>${escapeHTML(feature)}</li>`).join('');

  return `
    <main class="page-wrap detail-page">
      <section class="detail-layout">
        <div class="gallery">
          <button class="main-image-wrap" type="button" data-photo-trigger data-photo-src="${escapeHTML(galleryImages[0])}" data-photo-alt="${escapeHTML(car.name)}">
            <img id="mainImage" class="main-image" src="${escapeHTML(galleryImages[0])}" alt="${escapeHTML(car.name)}">
          </button>
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
      ${bottomImages ? `
      <section class="section detail-photo-section">
        <div class="section-head">
          <div>
            <p class="eyebrow">车辆图片</p>
            <h2>更多实拍图片</h2>
          </div>
        </div>
        <div class="detail-photo-stack">${bottomImages}</div>
      </section>` : ''}
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
      <div class="photo-viewer" id="photoViewer" aria-hidden="true">
        <div class="photo-viewer-backdrop" data-photo-close></div>
        <div class="photo-viewer-panel" role="dialog" aria-modal="true" aria-label="车辆图片全屏预览">
          <div class="photo-viewer-toolbar">
            <button class="viewer-btn" type="button" data-photo-zoom-out>缩小</button>
            <button class="viewer-btn" type="button" data-photo-zoom-reset>重置</button>
            <button class="viewer-btn" type="button" data-photo-zoom-in>放大</button>
            <button class="viewer-btn viewer-close" type="button" data-photo-close>关闭</button>
          </div>
          <div class="photo-viewer-stage">
            <img class="photo-viewer-image" id="photoViewerImage" alt="">
          </div>
        </div>
      </div>
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
          <div class="map-actions">
            <a class="button primary" href="${CONTACT.baiduMapUrl}" target="_blank" rel="noreferrer">百度地图</a>
            <a class="button ghost" href="${CONTACT.amapUrl}" target="_blank" rel="noreferrer">高德地图</a>
          </div>
        </div>
        <div class="qr-card">
          <img src="assets/contact/wechat-qr.jpg" alt="冉升车行微信二维码">
          <p>扫码或搜索微信号咨询车辆</p>
        </div>
      </section>
    </main>
  `;
}

function renderApp(cars) {
  const route = parseRoute(window.location.href);
  const pages = {
    cars: () => renderCarsPage(cars),
    car: () => renderDetailPage(cars, route.id),
    about: renderAbout,
    contact: renderContact
  };
  const content = (pages[route.page] || pages.cars)();
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
  const viewer = document.getElementById('photoViewer');
  const viewerImage = document.getElementById('photoViewerImage');
  if (!viewer || !viewerImage) return;

  let scale = 1;
  const setScale = (nextScale) => {
    scale = clampZoomScale(nextScale);
    viewerImage.style.transform = `scale(${scale})`;
  };
  const openViewer = (src, alt) => {
    viewer.classList.add('is-open');
    viewer.setAttribute('aria-hidden', 'false');
    viewerImage.src = src;
    viewerImage.alt = alt || '';
    setScale(1);
    document.body.classList.add('is-photo-viewer-open');
  };
  const closeViewer = () => {
    viewer.classList.remove('is-open');
    viewer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-photo-viewer-open');
  };

  document.querySelectorAll('[data-photo-trigger]').forEach((button) => {
    button.addEventListener('click', () => {
      openViewer(button.dataset.photoSrc, button.dataset.photoAlt);
    });
  });

  viewer.querySelectorAll('[data-photo-close]').forEach((button) => {
    button.addEventListener('click', closeViewer);
  });
  viewer.querySelector('[data-photo-zoom-in]')?.addEventListener('click', () => setScale(scale + 0.2));
  viewer.querySelector('[data-photo-zoom-out]')?.addEventListener('click', () => setScale(scale - 0.2));
  viewer.querySelector('[data-photo-zoom-reset]')?.addEventListener('click', () => setScale(1));

  viewer.addEventListener('click', (event) => {
    if (event.target.matches('[data-photo-close]')) {
      closeViewer();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeViewer();
    }
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
