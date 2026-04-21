/* =======================================================
   TRI — Main site prototype
   Language toggle + hero reel carousel
   ======================================================= */

/* ---------- language toggle ---------- */
(() => {
  const root = document.documentElement;
  const STORAGE_KEY = 'tri_site_lang';

  const saved = localStorage.getItem(STORAGE_KEY);
  const browserLang = (navigator.language || 'en').slice(0, 2);
  const supported = ['en', 'es', 'de', 'it'];
  const initial = saved || (supported.includes(browserLang) ? browserLang : 'en');
  setLang(initial);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  function setLang(lang) {
    if (!supported.includes(lang)) lang = 'en';
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });
  }
})();

/* ---------- forms → WhatsApp (no backend yet) ----------
   Any <form data-wa-form> intercepts submit, builds a message with
   the field values + document.title for context, opens wa.me.
*/
(() => {
  const WA_NUMBER = '34659003377';
  document.querySelectorAll('form[data-wa-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name    = (fd.get('name')    || '').toString().trim();
      const email   = (fd.get('email')   || '').toString().trim();
      const phone   = (fd.get('phone')   || '').toString().trim();
      const message = (fd.get('message') || '').toString().trim();

      // Page context: property name from <title> ("Villa Bali — Tenerife Resort Invest" → "Villa Bali")
      const title = (document.title || '').split('—')[0].trim();
      const isPropertyPage = /property-/.test(location.pathname);

      const lines = [];
      lines.push(`Hola Stazio, soy ${name || '...'}.`);
      if (isPropertyPage && title) {
        lines.push(`Me interesa: ${title}.`);
      }
      if (message) {
        lines.push('');
        lines.push(message);
      }
      lines.push('');
      lines.push(`Contacto: ${email}${phone ? ' · ' + phone : ''}`);

      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
      window.open(url, '_blank', 'noopener');
    });
  });
})();

/* ---------- hero IG-reel carousel ----------
   Lazy: videos stay preload="none" until the <details> panel is open.
   Only the active video is preloaded; advancing swaps preload between old/new.
*/
(() => {
  const reel = document.getElementById('heroReel');
  if (!reel) return;
  const panel = reel.closest('details'); // hero__right is the <details> wrapping the reel
  const videos = Array.from(reel.querySelectorAll('.reel-video'));
  const bars   = Array.from(reel.querySelectorAll('.reel-progress__bar'));
  const next   = document.getElementById('reelNext');
  const PAUSE_MS = 1000;
  let current = 0;
  let wired = false;

  if (next) next.addEventListener('click', () => { if (isOpen()) advance(); });
  if (panel) {
    panel.addEventListener('toggle', () => {
      if (isOpen()) startReel();
      else stopReel();
    });
    // If the panel is already open on desktop (default), start now.
    if (isOpen()) startReel();
  }

  function isOpen() { return !panel || panel.open; }

  function startReel() {
    const v = videos[current];
    if (!v) return;
    v.preload = 'auto';
    v.classList.add('is-active');
    if (bars[current]) bars[current].classList.add('is-active');
    v.play().catch(() => { /* autoplay might be blocked; user can tap */ });
    wireVideoEnd(v);
  }

  function stopReel() {
    videos.forEach((v, i) => {
      v.pause();
      v.currentTime = 0;
      v.preload = 'none';
      v.classList.remove('is-active');
      if (bars[i]) {
        bars[i].classList.remove('is-active', 'is-done');
        bars[i].style.setProperty('--reel-progress', 0);
      }
    });
    current = 0;
  }

  function wireVideoEnd(v) {
    if (v.dataset.wired) return;
    v.dataset.wired = '1';
    v.addEventListener('ended', onEnded);
    v.addEventListener('timeupdate', updateProgress);
  }

  function updateProgress() {
    const v = videos[current];
    if (!v || !v.duration) return;
    const pct = v.currentTime / v.duration;
    if (bars[current]) bars[current].style.setProperty('--reel-progress', pct);
  }

  function onEnded() {
    if (bars[current]) {
      bars[current].classList.add('is-done');
      bars[current].classList.remove('is-active');
    }
    setTimeout(() => { if (isOpen()) advance(); }, PAUSE_MS);
  }

  function advance() {
    const prev = current;
    current = (current + 1) % videos.length;

    // Retire previous
    const pv = videos[prev];
    pv.classList.remove('is-active');
    pv.pause();
    pv.currentTime = 0;
    pv.preload = 'none';
    if (bars[prev]) {
      bars[prev].classList.remove('is-active', 'is-done');
      bars[prev].style.setProperty('--reel-progress', 0);
    }

    // Activate next
    const nv = videos[current];
    nv.preload = 'auto';
    nv.classList.add('is-active');
    if (bars[current]) bars[current].classList.add('is-active');
    nv.play().catch(() => {});
    wireVideoEnd(nv);
  }
})();

/* ---------- photo lightbox with prev/next arrows ----------
   Collects every .pdp-photos__item img and .prop-gallery__item (bg image)
   into a list, opens a fullscreen overlay with chevrons + keyboard nav.
*/
(() => {
  // Build photo list from either layout
  const imgItems = Array.from(document.querySelectorAll('.pdp-photos__item img'));
  const bgItems  = Array.from(document.querySelectorAll('.prop-gallery__item'));
  const photos = [];
  imgItems.forEach((img, i) => photos.push({ src: img.currentSrc || img.src, trigger: img }));
  bgItems.forEach((el) => {
    const m = /url\(["']?(.+?)["']?\)/.exec(el.style.backgroundImage || '');
    if (m) photos.push({ src: m[1], trigger: el });
  });
  if (!photos.length) return;

  // Build overlay once
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <div class="lightbox__stage">
      <button class="lightbox__close" aria-label="Close" type="button">×</button>
      <button class="lightbox__btn lightbox__btn--prev" aria-label="Previous photo" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <img class="lightbox__img" alt="" />
      <button class="lightbox__btn lightbox__btn--next" aria-label="Next photo" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
      <p class="lightbox__counter"></p>
    </div>
  `;
  document.body.appendChild(lb);

  const img = lb.querySelector('.lightbox__img');
  const counter = lb.querySelector('.lightbox__counter');
  const btnPrev = lb.querySelector('.lightbox__btn--prev');
  const btnNext = lb.querySelector('.lightbox__btn--next');
  const btnClose = lb.querySelector('.lightbox__close');
  let idx = 0;

  function show(i) {
    idx = (i + photos.length) % photos.length;
    img.classList.remove('is-visible');
    requestAnimationFrame(() => {
      img.src = photos[idx].src;
      counter.textContent = `${idx + 1} / ${photos.length}`;
      img.onload = () => img.classList.add('is-visible');
    });
  }
  function open(i) {
    show(i);
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  photos.forEach((p, i) => {
    p.trigger.addEventListener('click', (e) => { e.preventDefault(); open(i); });
  });
  btnPrev.addEventListener('click', () => show(idx - 1));
  btnNext.addEventListener('click', () => show(idx + 1));
  btnClose.addEventListener('click', close);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
})();

/* ---------- mobile hamburger toggle ---------- */
(() => {
  const btn = document.getElementById('navHamburger');
  const nav = document.querySelector('.nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('nav--open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  // Close when clicking a menu link
  nav.querySelectorAll('.nav__menu a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('nav--open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));
})();

/* Native <details> now handles reel open/close — legacy mobile-reel-toggle JS removed. */

/* ---------- mobile filter toggle ---------- */
(() => {
  const btn = document.getElementById('propFiltersToggle');
  const filters = document.getElementById('propFilters');
  if (!btn || !filters) return;
  btn.addEventListener('click', () => {
    const open = filters.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

/* ---------- hero scroll button: smooth scroll, no hash in URL ---------- */
(() => {
  const link = document.getElementById('heroScroll');
  if (!link) return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById('properties');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

/* ---------- strip hash on page load so refresh lands at the top ---------- */
if (window.location.hash) {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

/* ---------- mobile: move the hero reel panel to the bottom of the page ---------- */
(() => {
  const reelWrap = document.querySelector('.hero__right');
  const footer   = document.querySelector('.footer');
  const heroInner = document.querySelector('.hero__inner');
  if (!reelWrap || !footer || !heroInner) return;
  const mql = matchMedia('(max-width: 860px)');
  function place() {
    if (mql.matches) {
      // Move reel to just before the footer if not already there
      if (reelWrap.parentElement !== footer.parentElement || reelWrap.nextElementSibling !== footer) {
        footer.parentElement.insertBefore(reelWrap, footer);
      }
      // Start closed on mobile (user taps to expand, like the other panels)
      reelWrap.open = false;
    } else {
      // Desktop: restore reel inside the hero split layout + keep it open
      if (reelWrap.parentElement !== heroInner) {
        heroInner.appendChild(reelWrap);
      }
      reelWrap.open = true;
    }
  }
  place();
  mql.addEventListener ? mql.addEventListener('change', place) : mql.addListener(place);
})();
