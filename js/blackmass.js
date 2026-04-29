/* Black Mass hero — sticky-pinned stage controller.
   - The .bm-stage stays pinned in viewport while the user scrolls
   - 5 invisible .bm-trigger blocks drive which phrase is active
   - Active beat is determined by which trigger is most-visible
   - Background never moves; phrases crossfade
*/
(function () {
  'use strict';

  if (typeof window === 'undefined') return;

  const hero = document.querySelector('.bm-hero');
  const phrases = document.querySelectorAll('.bm-phrase');
  const dots = document.querySelectorAll('.bm-dot');
  const triggers = document.querySelectorAll('.bm-trigger');
  if (!hero || !phrases.length || !triggers.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setActiveBeat(beat) {
    phrases.forEach(p => {
      p.classList.toggle('is-active', parseInt(p.dataset.beat, 10) === beat);
    });
    dots.forEach(d => {
      d.classList.toggle('is-active', parseInt(d.dataset.beat, 10) === beat);
    });
  }

  if ('IntersectionObserver' in window) {
    // Use a viewport center band so the active beat changes when a trigger
    // crosses the middle of the screen — feels more swipe-like than threshold-based.
    const io = new IntersectionObserver((entries) => {
      // pick the trigger with the largest intersection ratio in this batch
      let best = null;
      entries.forEach(e => {
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      });
      if (best && best.isIntersecting) {
        const beat = parseInt(best.target.dataset.beat, 10);
        if (!Number.isNaN(beat)) setActiveBeat(beat);
      }
    }, {
      // a thin band centred on the viewport — only the trigger crossing the
      // middle ~25% counts as "active"
      rootMargin: '-37.5% 0px -37.5% 0px',
      threshold: [0, 0.5, 1]
    });
    triggers.forEach(t => io.observe(t));
  } else {
    // legacy fallback — leave first beat visible
    setActiveBeat(1);
  }

  // hide the "Scroll" hint once the user scrolls past beat 1
  let scrolled = false;
  function onScroll() {
    if (scrolled) return;
    if (window.scrollY > 80) {
      hero.classList.add('has-scrolled');
      scrolled = true;
      window.removeEventListener('scroll', onScroll);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // sync the in-stage EN/ES toggle with the existing site lang-toggle
  const stageLangButtons = document.querySelectorAll('.bm-stage__lang button[data-lang]');
  stageLangButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const lang = this.getAttribute('data-lang');
      const target = document.querySelector('.lang-toggle .lang-btn[data-lang="' + lang + '"]');
      if (target) target.click();
      stageLangButtons.forEach(b => b.setAttribute('aria-pressed', b === this ? 'true' : 'false'));
    });
  });
  const initialLang =
    document.documentElement.classList.contains('lang-es') ? 'es' :
    document.documentElement.classList.contains('lang-en') ? 'en' :
    (localStorage.getItem('tri-lang') || 'en');
  stageLangButtons.forEach(b => {
    b.setAttribute('aria-pressed', b.getAttribute('data-lang') === initialLang ? 'true' : 'false');
  });
})();
