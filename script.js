/* ══════════════════════════════════════════════════════════════
   BUILT TO SCALE — content + behaviour. Vanilla JS, no deps.
   Everything you edit lives in the EDIT HERE block.
   ══════════════════════════════════════════════════════════════ */

/* ─────────────────── EDIT HERE ─────────────────── */

/* Client strip. Replace these six placeholders with real names. */
const CLIENTS = ['CoachedByCem','TheSellerSupport','RCGFitness','RioVella','TransitionOnline'];

/* Optional logos in assets/logos/. A non-empty list replaces the names above.
   e.g. [{ file:'acme.svg', name:'Acme' }] */
const CLIENT_LOGOS = [];

/* Deliverable lines, written once and reused across the packages below.
   Edit the wording here and every package that uses it follows. */
const SHORT_FORM = n => `${n} high-retention short-form edits per month — Reels, TikTok and Shorts, fully edited start to finish and delivered platform-ready`;
const LONG_FORM  = '4 fully produced long-form YouTube videos (up to 10 minutes each) — structured for watch time, not just trimmed';
const THUMBNAILS = '4 custom click-optimised thumbnails, designed to match each video';
const FINISHING     = 'Every edit includes dynamic captions, colour grade, audio clean-up and tight pacing';
const FINISHING_LONG = 'Every edit includes captions, colour grade, audio clean-up and tight pacing';

/* The five packages, left to right.
   standard — the price everyone sees.
   partner  — the price shown only in the unlocked Revenue Share view.
   format   — 'short' | 'long' | 'both', drives the filter pills.
   flagship — true renders the black card. Set it on exactly one package. */
const PACKAGES = [
  {
    name: 'Content Engine Max', format: 'both', flagship: false,
    pill: { text: 'Maximum output', style: 'cream' },
    tagline: 'Two posts a day. Every platform, every day.',
    standard: '$3,600', partner: '$3,000', period: '/mo',
    features: [SHORT_FORM(60), LONG_FORM, THUMBNAILS, FINISHING]
  },
  {
    name: 'Full Content Engine', format: 'both', flagship: true,
    pill: { text: 'Most popular', style: 'popular' },
    tagline: 'Post every day. Own short-form and YouTube.',
    standard: '$2,400', partner: '$2,000', period: '/mo',
    features: [SHORT_FORM(30), LONG_FORM, THUMBNAILS, FINISHING]
  },
  {
    name: 'Short-Form Engine', format: 'short', flagship: false, pill: null,
    tagline: 'One post a day, every day, handled.',
    standard: '$1,700', partner: '$1,400', period: '/mo',
    features: [SHORT_FORM(30), FINISHING]
  },
  {
    name: 'Long-Form Engine', format: 'long', flagship: false, pill: null,
    tagline: 'A new long-form video on your channel every week.',
    standard: '$1,100', partner: '$900', period: '/mo',
    features: [LONG_FORM, THUMBNAILS, FINISHING_LONG]
  },
  {
    name: 'Short-Form Ignition', format: 'short', flagship: false,
    pill: { text: 'Starter', style: 'cream' },
    tagline: 'Post every other day. Build the habit.',
    standard: '$1,000', partner: '$800', period: '/mo',
    features: [SHORT_FORM(15), FINISHING]
  }
];

/* IN NUMBERS. Each counts up from 0 when it scrolls into view. Setting a
   value back to null renders the literal placeholder "[X]" and skips the
   count-up. */
const STATS = [
  { value: 500, prefix: '', suffix: '+', label: 'videos delivered' },
  { value: 3,   prefix: '', suffix: '',  label: 'day average turnaround' },
  { value: 50,  prefix: '', suffix: '+', label: 'clients served' }
];

/* SHA-256 of the partner password. This only hides partner pricing from
   casual visitors — it is not security. To change it, see the README. */
const PARTNER_HASH = 'd466882a0b93a8ed957bc4e2547b694b91be57621de42cbaefcdb36347ac90fc';

const HERO_SOURCES = [
  { src: 'assets/video/hero-montage.webm', type: 'video/webm' },
  { src: 'assets/video/hero-montage.mp4',  type: 'video/mp4'  }
];

/* ───────────────── END EDIT HERE ───────────────── */



(() => {
  'use strict';
  document.documentElement.classList.add('js');

  /* Taken from where this file was loaded, so asset paths resolve the same
     from the site root and from /partner/. file:// has no directory index,
     so name index.html explicitly there. */
  const ROOT = new URL('.', document.currentScript?.src || location.href).href;
  const page = p => ROOT + p + (location.protocol === 'file:' ? 'index.html' : '');
  const AT_PARTNER = /\/partner(\/|$)/.test(location.pathname);

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const SMALL = matchMedia('(max-width: 767px)');
  const IO = 'IntersectionObserver' in window;
  const obs = (cb, o) => new IntersectionObserver(cb, o);
  const esc = s => String(s).replace(/[&<>"']/g,
    c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

  /* ── Collapsibles: Included panels + FAQ ── */
  const setOpen = (btn, panel, open, init) => {
    btn.setAttribute('aria-expanded', String(open));
    if (open) {
      if (init) init();
      panel.style.maxHeight = panel.scrollHeight + 'px';
    } else {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      void panel.offsetHeight;                    // reflow so 0 animates
      panel.style.maxHeight = '0px';
    }
  };

  /* One open at a time. items: [{btn, panel, init?}] */
  const accordion = items => items.forEach(it => {
    it.panel.addEventListener('transitionend', e => {   // release the cap when open
      if (e.propertyName === 'max-height' && it.btn.getAttribute('aria-expanded') === 'true')
        it.panel.style.maxHeight = 'none';
    });
    it.btn.addEventListener('click', () => {
      const open = it.btn.getAttribute('aria-expanded') === 'true';
      items.forEach(o => {
        if (o !== it && o.btn.getAttribute('aria-expanded') === 'true') setOpen(o.btn, o.panel, false);
      });
      setOpen(it.btn, it.panel, !open, it.init);
      it.init = null;
    });
  });

  /* ── Arrow-key nav for both segmented controls ── */
  const roving = (box, sel, activate) => {
    const btns = $$(sel, box);
    box.addEventListener('keydown', e => {
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      const n = /ArrowRight|ArrowDown/.test(e.key) ? i + 1
              : /ArrowLeft|ArrowUp/.test(e.key)    ? i - 1
              : e.key === 'Home' ? 0 : e.key === 'End' ? btns.length - 1 : null;
      if (n === null) return;
      e.preventDefault();
      const t = btns[(n + btns.length) % btns.length];
      t.focus();
      activate?.(t);
    });
    return btns;
  };

  /* ── Count-up. Width is locked first, so it never shifts. ── */
  const countTo = (el, to, dur, prefix = '', suffix = '') => {
    if (RM.matches) return;
    el.style.minWidth = el.offsetWidth + 'px';
    const t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / dur, 1);
      // Prefix rides along ($0 → $100); the suffix waits for the end, so a
      // half-counted 243 is never shown as 243+.
      el.textContent = prefix + Math.round(to * (1 - (1 - p) ** 3)) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ══ PACKAGES ══ */
  const renderPackages = () => {
    const grid = $('#packages-grid');
    if (!grid) return;

    grid.innerHTML = PACKAGES.map((p, i) => `
      <article class="pkg${p.flagship ? ' pkg--flagship' : ''}" data-format="${esc(p.format)}" aria-labelledby="pk${i}">
        ${p.pill
          ? `<p class="pkg__pill pkg__pill--${esc(p.pill.style)}">${esc(p.pill.text)}</p>`
          : '<p class="pkg__pill pkg__pill--spacer" aria-hidden="true">&nbsp;</p>'}
        <h3 class="pkg__name" id="pk${i}">${esc(p.name)}</h3>
        <p class="pkg__tagline">${esc(p.tagline)}</p>
        <div class="pkg__price-row">
          <p class="pkg__price"><span class="pkg__was">${esc(p.standard)}</span><span class="pkg__amount" data-when="standard">${esc(p.standard)}</span><span class="pkg__amount" data-when="partner">${esc(p.partner)}</span><span class="pkg__period">${esc(p.period)}</span></p>
          <span class="pkg__rev">Revenue share price</span>
        </div>
        <div class="pkg__rule"></div>
        <p class="pkg__label">What you get</p>
        <ul class="pkg__features">${p.features.map(f => `<li class="pkg__feature">${esc(f)}</li>`).join('')}</ul>
        <div class="pkg__rule pkg__rule--tail"></div>
        <button type="button" class="pkg__toggle" aria-expanded="false" aria-controls="inc${i}">What&rsquo;s included in every package<span class="chev" aria-hidden="true"></span></button>
        <div class="pkg__panel" id="inc${i}" role="region"></div>
      </article>`).join('');

    // Bodies are cloned from the template on first open.
    const tpl = $('#tpl-included');
    accordion($$('.pkg', grid).map(card => {
      const panel = $('.pkg__panel', card);
      return {
        btn: $('.pkg__toggle', card),
        panel,
        init: () => { if (!panel.firstChild && tpl) panel.appendChild(tpl.content.cloneNode(true)); }
      };
    }));

    grid.setAttribute('data-stagger', '');
  };

  const initFilters = () => {
    const box = $('#filters');
    if (!box) return;
    const cards = $$('.pkg'), status = $('#filter-status');

    const apply = btn => {
      const f = btn.dataset.filter;
      $$('.seg__btn', box).forEach(b => {
        const on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      let n = 0;
      cards.forEach(c => {
        const match = f === 'all' || c.dataset.format === f;
        c.classList.toggle('is-dim', !match);
        if (match) n++;
      });
      if (status) status.textContent = `${n} of ${cards.length} packages match ${btn.textContent}.`;
    };

    roving(box, '.seg__btn', apply).forEach(b => b.addEventListener('click', () => apply(b)));
  };

  /* ══ CLIENT MARQUEE ══ */
  const renderClients = () => {
    const host = $('#marquee');
    if (!host) return;
    const items = CLIENT_LOGOS.length
      ? CLIENT_LOGOS.map(l => `<li class="marquee__item"><img class="marquee__logo" src="${ROOT}assets/logos/${esc(l.file)}" alt="${esc(l.name || '')}" width="120" height="28" loading="lazy" decoding="async"></li>`)
      : CLIENTS.map(c => `<li class="marquee__item">${esc(c)}</li>`);

    const still = RM.matches;
    const build = n => {
      const g = items.join('').repeat(n);
      host.innerHTML = `<div class="marquee__track"><ul class="marquee__group">${g}</ul>${
        still ? '' : `<ul class="marquee__group" aria-hidden="true">${g}</ul>`}</div>`;
    };
    build(1);
    host.classList.toggle('is-static', still);
    if (still) return;

    // The loop scrolls one group's width, so a group narrower than the row
    // leaves a gap at the seam. Repeat the list until it covers — measured
    // against the screen too, so maximising the window cannot open one up.
    const one = $('.marquee__group', host).getBoundingClientRect().width;
    const need = Math.ceil(Math.max(host.clientWidth, screen?.width || 0) / Math.max(one, 1));
    if (need > 1) build(need);

    // Hover slows to 25%. Rescaling the duration alone would jump, so the
    // animation's progress is carried across.
    const track = $('.marquee__track', host);
    const speed = mult => {
      const a = track.getAnimations?.()[0];
      if (!a) return;
      const d = a.effect.getTiming().duration, nd = 60000 / mult;
      const p = ((a.currentTime || 0) % d) / d;
      a.effect.updateTiming({ duration: nd });
      a.currentTime = p * nd;
    };
    host.addEventListener('pointerenter', () => speed(0.25));
    host.addEventListener('pointerleave', () => speed(1));
  };

  /* ══ STATS ══ */
  const renderStats = () => {
    const box = $('#stats');
    if (!box) return;
    box.innerHTML = STATS.map(s => {
      const v = s.value == null ? '[X]' : String(s.value);
      return `<div class="stat"><p class="stat__v" data-to="${s.value ?? ''}" data-prefix="${esc(s.prefix || '')}" data-suffix="${esc(s.suffix)}">${esc((s.prefix || '') + v + s.suffix)}</p><p class="stat__l">${esc(s.label)}</p></div>`;
    }).join('');
    box.setAttribute('data-stagger', '');
    if (!IO) return;

    const ob = obs(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      ob.unobserve(e.target);
      const to = e.target.dataset.to;             // '' while the value is [X]
      if (to !== '') countTo(e.target, +to, 900, e.target.dataset.prefix, e.target.dataset.suffix);
    }), { threshold: 0.4 });
    $$('.stat__v', box).forEach(el => ob.observe(el));
  };

  /* ══ STICKY HEADER ══ */
  const initBar = () => {
    const bar = $('#bar'), sentinel = $('#hero-sentinel');
    if (!bar || !IO) return;

    if (sentinel) obs(([e]) => {
      bar.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.top < 0);
    }, { threshold: 0 }).observe(sentinel);

    const links = {};
    $$('[data-nav]', bar).forEach(a => { links[a.dataset.nav] = a; });
    const spy = obs(es => es.forEach(e => {
      const a = links[e.target.id];
      if (!a || !e.isIntersecting) return;
      Object.values(links).forEach(l => l.classList.remove('is-active'));
      a.classList.add('is-active');
    }), { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    Object.keys(links).forEach(id => {
      const s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  };

  /* ══ HERO ══ */
  const initHero = () => {
    const title = $('[data-split]');
    let words = [];
    if (title) {
      const frag = document.createDocumentFragment();
      title.textContent.split(/(\s+)/).forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)) return frag.appendChild(document.createTextNode(p));
        const s = document.createElement('span');
        s.className = 'w';
        s.textContent = p;
        frag.appendChild(s);
      });
      title.textContent = '';
      title.appendChild(frag);
      words = $$('.w', title);
    }

    const eyebrow = $('[data-hero="1"]'), sub = $('[data-hero="2"]');
    if (RM.matches) {
      [...words, eyebrow, sub].forEach(el => el && (el.style.opacity = 1));
    } else {
      const kf = [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }];
      const run = (el, delay) => el?.animate(kf, { duration: 600, delay, easing: 'ease-out', fill: 'forwards' });
      run(eyebrow, 200);
      words.forEach((w, i) => run(w, 200 + i * 60));
      run(sub, 200 + words.length * 60);
    }

    // Parallax on the media layer (video or poster) + cue fade.
    const media = $('#hero-media'), cue = $('#cue');
    const parallax = !RM.matches && !SMALL.matches;
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = scrollY;
        if (parallax && media) media.style.transform = `translate3d(0,${Math.min(y * 0.15, 160)}px,0)`;
        cue?.classList.toggle('is-off', y > 100);
        ticking = false;
      });
    }, { passive: true });
  };

  const initHeroVideo = () => {
    const video = $('#hero-video');
    if (!video) return;
    const conn = navigator.connection;
    if (RM.matches || SMALL.matches || conn?.saveData) return video.remove();

    let settled = false;
    const drop = () => { if (!settled) { settled = true; video.remove(); } };
    const show = () => { if (!settled) { settled = true; clearTimeout(timer); video.classList.add('is-playing'); } };
    const timer = setTimeout(drop, 3000);          // 3s budget, else stay on the poster
    video.addEventListener('playing', show, { once: true });
    video.addEventListener('error', drop, { once: true });

    HERO_SOURCES.forEach(s => {
      const el = document.createElement('source');
      el.src = ROOT + s.src;
      el.type = s.type;
      el.addEventListener('error', () => {
        if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) drop();
      });
      video.appendChild(el);
    });
    Object.assign(video, { muted: true, autoplay: true, preload: 'metadata' });
    video.load();
    video.play?.()?.catch(drop);
  };

  /* ══ QUALITY SCREEN ══ */
  const initQuality = () => {
    const list = $('#qlist');
    if (!list || RM.matches || !IO) return;
    const rows = $$('.qrow', list);
    list.classList.add('is-live');
    rows[0]?.classList.add('is-active');

    // Entries arrive unordered and rows can share the band on a fast scroll,
    // so track the band and pick the row nearest the middle: exactly one
    // active, never a skipped row.
    const inBand = new Set();
    const ob = obs(es => {
      es.forEach(e => e.isIntersecting ? inBand.add(e.target) : inBand.delete(e.target));
      if (!inBand.size) return;                    // between rows: hold the last
      const mid = innerHeight / 2;
      let best = null, dist = Infinity;
      inBand.forEach(r => {
        const b = r.getBoundingClientRect();
        const d = Math.abs((b.top + b.bottom) / 2 - mid);
        if (d < dist) { dist = d; best = r; }
      });
      rows.forEach(r => r.classList.toggle('is-active', r === best));
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    rows.forEach(r => ob.observe(r));
  };

  /* ══ GUARANTEE ══ */
  const initGuarantee = () => {
    const card = $('#gcard');
    if (!card) return;
    const num = $('[data-count]', card);

    if (IO) {
      const ob = obs(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        ob.unobserve(e.target);
        card.classList.add('is-in');
        if (num) countTo(num, +num.dataset.count, 600, num.dataset.prefix);
      }), { threshold: 0.3 });
      ob.observe(card);
    } else {
      card.classList.add('is-in');
    }

    if (RM.matches) return;
    card.addEventListener('pointermove', e => {
      if (innerWidth < 900 || e.pointerType !== 'mouse') return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(1000px) rotateY(${(x * 4).toFixed(2)}deg) rotateX(${(-y * 4).toFixed(2)}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  };

  /* ══ COMPARISON TABS ══ */
  const initTabs = () => {
    const box = $('#cmp-tabs');
    if (!box) return;
    const panels = $$('.cmp__panel');
    const select = btn => $$('[role="tab"]', box).forEach((b, i) => {
      const on = b === btn;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      panels[i].classList.toggle('is-on', on);
    });
    roving(box, '[role="tab"]', select).forEach(b => b.addEventListener('click', () => select(b)));
  };

  /* ══ REVEALS — children stagger 80ms apart ══ */
  const initReveal = () => {
    const groups = $$('[data-stagger]');
    groups.forEach(g => [...g.children].forEach((c, i) => {
      c.classList.add('rv');
      c.style.setProperty('--d', i);
    }));
    if (RM.matches || !IO) return $$('.rv').forEach(el => el.classList.add('is-in'));

    const ob = obs(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      ob.unobserve(e.target);
      [...e.target.children].forEach((c, i) => {
        c.classList.add('is-in');
        // Drop the classes once landed — same end state, nothing moves, but
        // the card is free again for its own hover/filter transitions.
        setTimeout(() => c.classList.remove('rv', 'is-in'), 560 + i * 80);
      });
    }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
    groups.forEach(g => ob.observe(g));
  };

  /* ══ PACKAGE ROW — arrows, drag, keys ══ */
  const initRow = () => {
    const row = $('#packages-grid');
    if (!row) return;
    const wide = matchMedia('(min-width: 1024px)');
    const step = () => ($('.pkg', row)?.offsetWidth || 380) + 24;
    const by = d => row.scrollBy({ left: d * step(), behavior: RM.matches ? 'auto' : 'smooth' });

    $$('.rnav').forEach(b => b.addEventListener('click', () => by(+b.dataset.dir)));
    row.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); by(d); }
    });
    row.addEventListener('scroll', () => {
      row.classList.toggle('is-scrolled', row.scrollLeft > 8);
      $$('.rnav').forEach(b => {
        const fwd = +b.dataset.dir > 0;
        b.disabled = fwd ? row.scrollLeft >= row.scrollWidth - row.clientWidth - 2 : row.scrollLeft <= 2;
      });
    }, { passive: true });

    let down = false, x0 = 0, l0 = 0, moved = 0;
    row.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || !wide.matches) return;
      down = true; moved = 0; x0 = e.clientX; l0 = row.scrollLeft;
      row.style.scrollSnapType = 'none';                 // snap fights a drag
      row.classList.add('is-drag');
    });
    addEventListener('pointermove', e => {
      if (!down) return;
      moved = Math.abs(e.clientX - x0);
      row.scrollLeft = l0 - (e.clientX - x0);
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false; row.style.scrollSnapType = ''; row.classList.remove('is-drag');
    });
    // Swallow the click that ends a drag so it cannot open a panel.
    row.addEventListener('click', e => { if (moved > 5) { e.preventDefault(); e.stopPropagation(); } }, true);

    // Open on the flagship, with the card before it peeking. scroll-padding
    // puts the same 80px peek on every snap point, so this is a snap point.
    const i = PACKAGES.findIndex(p => p.flagship);
    if (wide.matches && i > 0) row.scrollLeft = i * step() - 80;
    row.dispatchEvent(new Event('scroll'));
  };

  /* ══ PARTNER MODE ══ */
  const BASE_TITLE = document.title;
  const setMode = m => {
    document.documentElement.dataset.mode = m;
    document.title = BASE_TITLE + (m === 'partner' ? ' — Partner pricing' : '');
    try {
      if (m === 'partner') sessionStorage.btsPartner = '1'; else delete sessionStorage.btsPartner;
    } catch (e) {}                                       // private mode blocks it
  };

  const initPartner = () => {
    const modal = $('#pw-modal'), input = $('#pw-input'), err = $('#pw-err');
    if (!modal) return;
    let last = null;
    const open = () => {
      last = document.activeElement;
      modal.hidden = false; err.textContent = ''; input.value = '';
      input.focus();
    };
    const close = () => { modal.hidden = true; last?.focus(); };

    $$('#rs-link, #rs-link-foot').forEach(b => b.addEventListener('click', () => {
      if (document.documentElement.dataset.mode !== 'partner') return open();
      setMode('standard');
      location.href = page('');                          // back up to the root page
    }));

    modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
    modal.addEventListener('keydown', e => {
      if (e.key === 'Escape') return close();
      if (e.key !== 'Tab') return;
      const f = $$('input, button', modal), a = f[0], z = f[f.length - 1];
      if (e.shiftKey ? document.activeElement === a : document.activeElement === z) {
        e.preventDefault(); (e.shiftKey ? z : a).focus();
      }
    });

    $('#pw-form').addEventListener('submit', async e => {
      e.preventDefault();
      const v = input.value.trim().toLowerCase().replace(/\s+/g, '');
      let hex;
      try {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v));
        hex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (_) {
        err.textContent = 'Needs a secure page — open over https or localhost.';
        return;
      }
      if (hex === PARTNER_HASH) {
        setMode('partner');
        location.href = page('partner/') + '#packages';  // partner mode is a page
      } else {
        err.textContent = "That's not it — check with Ned.";
        input.value = ''; input.focus();
        input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake');
      }
    });

    if (document.documentElement.dataset.mode === 'partner') setMode('partner');
    else if (AT_PARTNER) open();                         // right page, not unlocked
  };

  /* ══ IN-PAGE LINKS ══ */
  const initScroll = () => document.addEventListener('click', e => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a) return;
    const t = document.getElementById(a.getAttribute('href').slice(1));
    if (!t) return;
    e.preventDefault();
    scrollTo({ top: t.getBoundingClientRect().top + scrollY - 72, behavior: RM.matches ? 'auto' : 'smooth' });
    t.setAttribute('tabindex', '-1');
    t.focus({ preventScroll: true });
  });

  renderPackages();
  renderClients();
  renderStats();
  initFilters();
  initBar();
  initHero();
  initHeroVideo();
  initQuality();
  initGuarantee();
  initTabs();
  initRow();
  initPartner();
  accordion($$('.acc__item').map(it => ({ btn: $('.acc__btn', it), panel: $('.acc__panel', it) })));
  initReveal();
  initScroll();

  RM.addEventListener?.('change', renderClients);
})();
