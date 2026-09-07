/* ══════════════════════════════════════════════════════════════
   BUILT TO SCALE — page content + behaviour
   Everything you are likely to change lives in the EDIT HERE block.
   ══════════════════════════════════════════════════════════════ */

/* ─────────────────── EDIT HERE ─────────────────── */

/* Client strip. Plain text names, shown in Anton uppercase.
   Replace these six placeholders with real client names. */
const CLIENTS = [
  'Client One',
  'Client Two',
  'Client Three',
  'Client Four',
  'Client Five',
  'Client Six'
];

/* Optional: drop SVG/PNG logos into assets/logos/ and list them here.
   If this array has any entries it REPLACES the text names above.
   Example: [{ file: 'acme.svg', name: 'Acme' }, { file: 'nova.png', name: 'Nova' }] */
const CLIENT_LOGOS = [];

/* The three lines shown under INCLUDED on every card. */
const INCLUDED = [
  { label: 'Five-point quality screen', text: 'every video is checked before delivery', href: '#quality' },
  { label: 'One revision round',        text: 'preference changes, made once, by you',  href: '#guarantee' },
  { label: '14-day guarantee',          text: 'late means edited free plus $100 to you', href: '#guarantee' }
];

/* The four packages, rendered left to right.
   pill: null, or { text: '…', style: 'flagship' | 'popular' }
   flagship: true renders the card on charcoal instead of white. */
const PACKAGES = [
  {
    name: 'Full Content Engine',
    tagline: 'Post every day. Own short-form and YouTube.',
    price: '$2,000',
    period: '/mo',
    flagship: true,
    pill: { text: 'Everything', style: 'flagship' },
    features: [
      '30 high-retention short-form edits per month — Reels, TikTok and Shorts, fully edited start to finish and delivered platform-ready',
      '4 fully produced long-form YouTube videos (up to 10 minutes each) — structured for watch time, not just trimmed',
      '4 custom click-optimised thumbnails, designed to match each video',
      'Every edit includes dynamic captions, colour grade, audio clean-up and tight pacing'
    ]
  },
  {
    name: 'Short-Form Engine',
    tagline: 'One post a day, every day, handled.',
    price: '$1,400',
    period: '/mo',
    flagship: false,
    pill: { text: 'Most popular', style: 'popular' },
    features: [
      '30 high-retention short-form edits per month — Reels, TikTok and Shorts, fully edited start to finish and delivered platform-ready',
      'Every edit includes dynamic captions, colour grade, audio clean-up and tight pacing'
    ]
  },
  {
    name: 'Long-Form Engine',
    tagline: 'A new long-form video on your channel every week.',
    price: '$900',
    period: '/mo',
    flagship: false,
    pill: null,
    features: [
      '4 fully produced long-form YouTube videos (up to 10 minutes each) — structured for watch time, not just trimmed',
      '4 custom click-optimised thumbnails, designed to match each video',
      'Every edit includes captions, colour grade, audio clean-up and tight pacing'
    ]
  },
  {
    name: 'Short-Form Ignition',
    tagline: 'Post every other day. Build the habit.',
    price: '$800',
    period: '/mo',
    flagship: false,
    pill: null,
    features: [
      '15 high-retention short-form edits per month — Reels, TikTok and Shorts, fully edited start to finish and delivered platform-ready',
      'Every edit includes dynamic captions, colour grade, audio clean-up and tight pacing'
    ]
  }
];

/* Hero video. Files live in assets/video/. See README for the ffmpeg commands. */
const HERO_SOURCES = [
  { src: 'assets/video/hero-montage.webm', type: 'video/webm' },
  { src: 'assets/video/hero-montage.mp4',  type: 'video/mp4'  }
];

/* ───────────────── END EDIT HERE ───────────────── */


(function () {
  'use strict';

  document.documentElement.classList.add('js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isSmallScreen = window.matchMedia('(max-width: 767px)');

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /* ── Packages ───────────────────────────────────────────── */
  function renderPackages() {
    const grid = document.getElementById('packages-grid');
    if (!grid) return;

    grid.innerHTML = PACKAGES.map((pkg, i) => {
      const id = 'pkg-' + i;
      // Cards without a pill get an invisible one so names and prices stay
      // on the same baseline across a row (hidden entirely when stacked).
      const pill = pkg.pill
        ? `<p class="pkg__pill pkg__pill--${esc(pkg.pill.style)}">${esc(pkg.pill.text)}</p>`
        : '<p class="pkg__pill pkg__pill--spacer" aria-hidden="true">&nbsp;</p>';

      const features = pkg.features
        .map((f) => `<li class="pkg__feature">${esc(f)}</li>`)
        .join('');

      const included = INCLUDED
        .map((inc) => `<a class="pkg__inc" href="${esc(inc.href)}"><strong>${esc(inc.label)}</strong> — ${esc(inc.text)}</a>`)
        .join('');

      return `
      <article class="pkg${pkg.flagship ? ' pkg--flagship' : ''} reveal" aria-labelledby="${id}-name">
        ${pill}
        <h3 class="pkg__name" id="${id}-name">${esc(pkg.name)}</h3>
        <p class="pkg__tagline">${esc(pkg.tagline)}</p>

        <div class="pkg__price-row">
          <p class="pkg__price">
            <span class="pkg__amount">${esc(pkg.price)}</span>
            <span class="pkg__period">${esc(pkg.period)}</span>
          </p>
          <span class="pkg__rev">Revenue share</span>
        </div>

        <div class="pkg__rule" role="presentation"></div>

        <p class="pkg__label">What you get</p>
        <ul class="pkg__features">${features}</ul>

        <div class="pkg__rule pkg__rule--tail" role="presentation"></div>

        <p class="pkg__label">Included</p>
        <div class="pkg__included">${included}</div>
      </article>`;
    }).join('');
  }

  /* ── Client marquee ─────────────────────────────────────── */
  function renderClients() {
    const host = document.getElementById('clients-marquee');
    if (!host) return;

    const useLogos = CLIENT_LOGOS.length > 0;
    const items = useLogos
      ? CLIENT_LOGOS.map((l) =>
          `<li class="marquee__item"><img class="marquee__logo" src="assets/logos/${esc(l.file)}" alt="${esc(l.name || '')}" width="120" height="28" loading="lazy" decoding="async"></li>`)
      : CLIENTS.map((c) => `<li class="marquee__item">${esc(c)}</li>`);

    const group = items.join('');
    const still = prefersReducedMotion.matches;

    host.innerHTML = `
      <div class="marquee__track">
        <ul class="marquee__group">${group}</ul>
        ${still ? '' : `<ul class="marquee__group" aria-hidden="true">${group}</ul>`}
      </div>`;

    host.classList.toggle('is-static', still);
  }

  /* ── Hero video ─────────────────────────────────────────── */
  function initHeroVideo() {
    const video = document.getElementById('hero-video');
    if (!video) return;

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = !!(conn && conn.saveData);

    // Poster only: reduced motion, small screens, or a data-saver connection.
    if (prefersReducedMotion.matches || isSmallScreen.matches || saveData) {
      video.remove();
      return;
    }

    let settled = false;
    const drop = () => {
      if (settled) return;
      settled = true;
      video.remove(); // the poster stays — it is the .hero__media background
    };
    const show = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      video.classList.add('is-playing');
    };

    // 3s budget: if it has not started by then, we stay on the poster.
    const timer = setTimeout(drop, 3000);

    video.addEventListener('playing', show, { once: true });
    video.addEventListener('error', drop, { once: true });

    HERO_SOURCES.forEach((s) => {
      const source = document.createElement('source');
      source.src = s.src;
      source.type = s.type;
      source.addEventListener('error', () => {
        // Only give up once every source has failed.
        if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) drop();
      });
      video.appendChild(source);
    });

    video.muted = true;
    video.autoplay = true;
    video.preload = 'metadata';
    video.load();

    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') attempt.catch(drop);
  }

  /* ── Scroll reveal ──────────────────────────────────────── */
  function initReveal() {
    const targets = document.querySelectorAll('.reveal');

    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach((el) => observer.observe(el));
  }

  /* ── In-page links ──────────────────────────────────────── */
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const id = link.getAttribute('href').slice(1);
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
        block: 'start'
      });
      // Keep keyboard focus in step with the scroll.
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

  renderPackages();
  renderClients();
  initHeroVideo();
  initReveal();
  initSmoothScroll();

  // Re-render the strip if the user flips their motion preference mid-session.
  if (typeof prefersReducedMotion.addEventListener === 'function') {
    prefersReducedMotion.addEventListener('change', renderClients);
  }
})();
