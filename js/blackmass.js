/* Black Mass hero — beat reveal + lang toggle sync.
   IntersectionObserver fires on every entry (does not unobserve), so the
   beats re-animate when the user scrolls back up. */
(function () {
  'use strict';

  if (typeof window === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const beats = document.querySelectorAll('.bm-beat');
  if (!beats.length) return;

  if (reduceMotion) {
    beats.forEach(b => b.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          // re-arm so re-entry retriggers the animation
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.35 });
    beats.forEach(b => io.observe(b));
  } else {
    // legacy fallback
    beats.forEach(b => b.classList.add('is-visible'));
  }

  // smooth-scroll for the CTA arrow (browsers honour scroll-behavior: smooth
  // via CSS too, but we set it explicitly here so it works even when global
  // CSS doesn't enable it).
  const ctaLink = document.querySelector('.bm-cta__link');
  if (ctaLink) {
    ctaLink.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  }

  // Sync the in-hero EN/ES toggle with the existing site lang-toggle so
  // toggling either updates both. The existing site stores lang in
  // localStorage under key 'tri-lang' and toggles classes lang-en / lang-es
  // on <html> via main script — we just trigger a click on the matching
  // existing button when present, or fall back to setting the class.
  const heroLangButtons = document.querySelectorAll('.bm-hero__lang button[data-lang]');
  heroLangButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const lang = this.getAttribute('data-lang');
      const target = document.querySelector('.lang-toggle .lang-btn[data-lang="' + lang + '"]');
      if (target) {
        target.click();
      } else {
        // fallback — set class directly
        document.documentElement.classList.remove('lang-en', 'lang-es');
        document.documentElement.classList.add('lang-' + lang);
      }
      heroLangButtons.forEach(b => b.setAttribute('aria-pressed', b === this ? 'true' : 'false'));
    });
  });

  // Reflect the site's current lang on load (so the in-hero buttons match).
  const initialLang =
    document.documentElement.classList.contains('lang-es') ? 'es' :
    document.documentElement.classList.contains('lang-en') ? 'en' :
    (localStorage.getItem('tri-lang') || 'en');
  heroLangButtons.forEach(b => {
    b.setAttribute('aria-pressed', b.getAttribute('data-lang') === initialLang ? 'true' : 'false');
  });
})();
