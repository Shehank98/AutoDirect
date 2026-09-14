/* DirectAuto Import — shared frontend logic (vanilla JS, no build step). */
(function () {
  'use strict';

  const DA = (window.DA = window.DA || {});

  /* ---------------- API helper ---------------- */
  async function authHeader() {
    try {
      if (window.firebase && firebase.auth && firebase.auth().currentUser) {
        const token = await firebase.auth().currentUser.getIdToken();
        return { Authorization: 'Bearer ' + token };
      }
    } catch (e) { /* not signed in */ }
    return {};
  }

  async function request(method, url, body) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, await authHeader());
    const opts = { method, headers };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    let data = null;
    try { data = await res.json(); } catch (e) { /* no body */ }
    if (!res.ok) throw new Error((data && data.error) || ('Request failed (' + res.status + ')'));
    return data;
  }

  DA.api = {
    get: (u) => request('GET', u),
    post: (u, b) => request('POST', u, b),
    put: (u, b) => request('PUT', u, b),
    del: (u) => request('DELETE', u),
  };

  /* ---------------- Formatting helpers ---------------- */
  DA.money = function (v) {
    if (v === null || v === undefined || v === '') return 'Price on request';
    const n = Number(v);
    if (!isFinite(n) || n <= 0) return 'Price on request';
    return 'Rs. ' + n.toLocaleString('en-LK', { maximumFractionDigits: 0 });
  };
  DA.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  };
  DA.firstImage = function (v) {
    const imgs = Array.isArray(v.images) ? v.images : [];
    return imgs.length ? imgs[0] : '/assets/images/no-image.jpg';
  };
  DA.vehicleTitle = function (v) {
    return [v.year, v.manufacturer_name, v.model_name].filter(Boolean).join(' ') || 'Vehicle';
  };
  DA.qs = function (name) {
    return new URLSearchParams(location.search).get(name);
  };

  /* ---------------- Vehicle card ---------------- */
  DA.vehicleCard = function (v) {
    const url = '/our-stock/' + encodeURIComponent(v.seo_url);
    return (
      '<div class="col-md-4 col-sm-6">' +
      '<div class="featured-car-list">' +
      '  <div class="featured-car-img"><a href="' + url + '">' +
      '    <img src="' + DA.esc(DA.firstImage(v)) + '" class="img-responsive" alt="' + DA.esc(DA.vehicleTitle(v)) + '" onerror="this.src=\'/assets/images/no-image.jpg\'">' +
      '  </a>' +
      (v.is_featured ? '<span class="featured-tag" style="position:absolute;top:10px;left:10px;background:#f76b1c;color:#fff;padding:3px 10px;border-radius:3px;font-size:12px;">Featured</span>' : '') +
      '  </div>' +
      '  <div class="featured-car-content">' +
      '    <h5><a href="' + url + '">' + DA.esc(DA.vehicleTitle(v)) + '</a></h5>' +
      '    <div class="price_info"><p class="featured-price">' + DA.money(v.price) + '</p></div>' +
      '    <ul class="car-info-list" style="list-style:none;padding:0;margin:8px 0;font-size:13px;color:#777;">' +
      '      <li style="display:inline-block;margin-right:12px;"><i class="fa fa-tachometer"></i> ' + DA.esc(v.mileage || '—') + ' km</li>' +
      '      <li style="display:inline-block;margin-right:12px;"><i class="fa fa-cog"></i> ' + DA.esc(v.transmission || '—') + '</li>' +
      '      <li style="display:inline-block;"><i class="fa fa-tint"></i> ' + DA.esc(v.fuel_type || '—') + '</li>' +
      '    </ul>' +
      '    <a href="' + url + '" class="btn btn-sm">View Details <i class="fa fa-angle-right"></i></a>' +
      '  </div>' +
      '</div></div>'
    );
  };

  /* ---------------- Compare (localStorage) ---------------- */
  DA.compare = {
    key: 'da_compare',
    list() { try { return JSON.parse(localStorage.getItem(this.key) || '[]'); } catch (e) { return []; } },
    save(a) { try { localStorage.setItem(this.key, JSON.stringify(a)); } catch (e) {} this.updateBadge(); },
    toggle(id) { id = Number(id); const a = this.list(); const i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); this.save(a); return a.indexOf(id) >= 0; },
    updateBadge() {
      const n = this.list().length;
      const badge = document.getElementById('compare-badge');
      const count = document.getElementById('compare_item_count');
      if (count) count.textContent = n;
      if (badge) badge.style.display = n ? '' : 'none';
    },
  };

  /* ---------------- Auth (Firebase, lazy) ---------------- */
  DA.logout = function () {
    if (window.firebase && firebase.auth) {
      firebase.auth().signOut().then(() => { location.href = '/'; });
    } else { location.href = '/'; }
  };

  DA.onAuthChange = function (cb) {
    if (window.firebase && firebase.auth) firebase.auth().onAuthStateChanged(cb);
    else cb(null);
  };

  function renderAuthUI(user) {
    const loginBtn = document.getElementById('header-login-btn');
    const userMenu = document.getElementById('user-login-menu');
    const nameLabel = document.getElementById('user-name-label');
    if (user) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (userMenu) userMenu.style.display = '';
      if (nameLabel) nameLabel.textContent = user.displayName || (user.email || '').split('@')[0];
    } else {
      if (loginBtn) loginBtn.style.display = '';
      if (userMenu) userMenu.style.display = 'none';
    }
  }

  /* ---------------- Partials + page init ---------------- */
  async function injectPartials() {
    const jobs = [];
    const h = document.getElementById('site-header');
    const f = document.getElementById('site-footer');
    if (h) jobs.push(fetch('/partials/header.html').then((r) => r.text()).then((t) => (h.innerHTML = t)));
    if (f) jobs.push(fetch('/partials/footer.html').then((r) => r.text()).then((t) => (f.innerHTML = t)));
    await Promise.all(jobs);
  }

  function highlightNav() {
    const path = location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('#header-nav li a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href === path || (href !== '/' && path.indexOf(href) === 0)) a.parentElement.classList.add('active');
    });
  }

  async function loadBrandsAndCategories() {
    try {
      const brands = await DA.api.get('/api/manufacturers');
      const wrap = document.getElementById('popular_brands');
      if (wrap) wrap.innerHTML = brands.map((b) =>
        '<div><a href="/our-stock?manufacturer=' + b.id + '">' +
        (b.image
          ? '<img src="' + DA.esc(b.image) + '" class="img-responsive" alt="' + DA.esc(b.name) + '">'
          : '<span class="brand-name" style="display:inline-block;padding:14px 8px;font-weight:700;color:#555;">' + DA.esc(b.name) + '</span>') +
        '</a></div>').join('');

      const featured = brands.filter((b) => b.is_featured);
      const cats = document.getElementById('footer-top-categories');
      if (cats) cats.innerHTML = (featured.length ? featured : brands).slice(0, 8)
        .map((b) => '<li><a href="/our-stock?manufacturer=' + b.id + '">' + DA.esc(b.name) + '</a></li>').join('');
    } catch (e) { /* API not ready */ }
  }

  function wireNewsletter() {
    const form = document.getElementById('newsletter');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('newsletter_submit_msg');
      const btn = document.getElementById('newsletter_submit');
      const name = (document.getElementById('newsletter_name') || {}).value || '';
      const email = (document.getElementById('newsletter_email') || {}).value || '';
      if (btn) { btn.disabled = true; btn.innerHTML = 'Please wait...'; }
      try {
        const r = await DA.api.post('/api/newsletter', { name, email });
        if (msg) msg.innerHTML = '<span class="text-success">' + DA.esc(r.message) + '</span>';
        form.reset();
      } catch (err) {
        if (msg) msg.innerHTML = '<span class="text-danger">' + DA.esc(err.message) + '</span>';
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = 'Subscribe <span class="angle_arrow"><i class="fa fa-angle-right"></i></span>'; }
      }
    });
  }

  // Initialise Firebase from server-provided public config (auth pages call this).
  DA.initFirebase = async function () {
    if (window.__daFirebaseInit) return window.__daFirebaseInit;
    window.__daFirebaseInit = (async () => {
      const cfg = await DA.api.get('/api/config');
      if (!cfg.firebase || !cfg.firebase.apiKey) throw new Error('Firebase is not configured yet.');
      if (!window.firebase) throw new Error('Firebase SDK not loaded on this page.');
      if (!firebase.apps.length) firebase.initializeApp(cfg.firebase);
      return firebase;
    })();
    return window.__daFirebaseInit;
  };

  document.addEventListener('DOMContentLoaded', async () => {
    const yr = document.getElementById('footer-year');
    if (yr) yr.textContent = new Date().getFullYear();
    await injectPartials();
    highlightNav();
    DA.compare.updateBadge();
    loadBrandsAndCategories();
    wireNewsletter();
    // Reflect auth state in the header if Firebase happens to be loaded on this page.
    DA.onAuthChange(renderAuthUI);
    if (typeof DA.pageInit === 'function') { try { await DA.pageInit(); } catch (e) { console.error(e); } }
  });
})();
