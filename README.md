# Built To Scale — DFY Video Editing pricing page

A single-page, static pricing site. No frameworks, no build step, no npm
dependencies. Open `index.html` in a browser and it works.

```
index.html      structure + all long-form copy (quality, comparison, FAQ)
styles.css      brand tokens + all page styles
script.js       editable data (packages, clients, stats) + behaviour  (~19 KB)
vercel.json     static hosting config
assets/
  video/        hero-montage.mp4 · hero-montage.webm · hero-poster.jpg
  logos/        optional client logos
  fonts/        OverusedGrotesk-VF.woff2  ← you supply this
  og-image.jpg  1200×630 link-preview image
```

## 1. The font — the one thing to add first

The page is set in **Overused Grotesk**, which is not a Google font, so it
has to be self-hosted. Drop the variable woff2 into `assets/fonts/` named
exactly:

```
assets/fonts/OverusedGrotesk-VF.woff2
```

The `@font-face` at the top of `styles.css` is already pointing at it and
picks it up with no other change. Until the file is there the page renders
in a metric-matched system fallback — it will look correct but generic, and
the browser console will log one 404.

If your copy of the font is a static set rather than a variable file, add
one `@font-face` per weight (400/500/600/700) with the same
`font-family: 'Overused Grotesk'` and the matching `font-weight`.

## 2. Changing prices and copy

Everything you will realistically want to edit is in the **`EDIT HERE`**
block at the top of `script.js`.

**Packages** — the `PACKAGES` array. Cards render left to right in order.

```js
{
  name: 'Full Content Engine',
  format: 'both',                                   // drives the filter pills
  flagship: true,                                   // black card instead of white
  pill: { text: 'Everything', style: 'flagship' },  // or null
  tagline: 'Post every day. Own short-form and YouTube.',
  price: '$2,000',
  period: '/mo',
  features: [ 'line one', 'line two' ]
}
```

- `format` is `'short'`, `'long'` or `'both'` and decides which filter pills
  keep the card at full opacity. Get this wrong and the filters lie.
- `flagship: true` makes the card black. Only set it on one card.
- `pill.style` is `'flagship'` (warm-white on translucent) or `'popular'`
  (warm-white on red). `pill: null` for none.
- The grid is 2×2 from 768px up and one column below.

**The "In numbers" stats** — the `STATS` array.

```js
{ value: null, suffix: '+', label: 'videos delivered' }
```

`value: null` renders the literal placeholder `[X]` and skips the count-up.
Put a real number in and it counts from 0 over 900ms when it scrolls into
view. **All three are currently `null` — replace them.**

**Client names** — the `CLIENTS` array (see §4).

**Everything else** — the five quality-screen points, the revision and
guarantee copy, the four comparison tabs and all six FAQ answers live
directly in `index.html`. Search for the text and edit in place. The
Included panel inside each card is the `<template id="tpl-included">` at
the bottom of `index.html` — edit it once and all four cards follow.

## 3. Replacing the hero video

Put your raw clips in a folder and list them in a `clips.txt`:

```
file 'clip1.mp4'
file 'clip2.mp4'
```

Then, from the project root:

```bash
# 1 — concatenate, strip audio, normalise to 1920×1080 @ 30fps, web-optimise
ffmpeg -f concat -safe 0 -i clips.txt -an -vf "scale=1920:-2,fps=30" \
  -c:v libx264 -crf 26 -preset slow -movflags +faststart \
  assets/video/hero-montage.mp4

# 2 — WebM version (smaller, served first)
ffmpeg -i assets/video/hero-montage.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 34 \
  assets/video/hero-montage.webm

# 3 — poster frame, grabbed at 2 seconds
ffmpeg -i assets/video/hero-montage.mp4 -ss 00:00:02 -frames:v 1 -q:v 2 \
  assets/video/hero-poster.jpg

# 4 — link-preview image, cropped from the poster
ffmpeg -i assets/video/hero-poster.jpg \
  -vf "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630" \
  -q:v 3 assets/og-image.jpg
```

Targets: **20–35 seconds**, **no audio track**, **MP4 under 8 MB**. Over
12 MB and slow connections time out before it plays — re-encode at a higher
`-crf` (try 28, then 30). Keep the poster **under 200 KB**.

The page never breaks without the video: the poster is the hero's
background layer and the `<video>` only fades in once it is actually
playing. Video is skipped entirely on screens under 768px, under
`prefers-reduced-motion`, on `saveData` connections, and if it has not
started within 3 seconds.

## 4. Adding client logos

**Text names (default):** edit `CLIENTS` in `script.js`.

```js
const CLIENTS = ['Acme', 'Nova', 'Kestrel', 'Orbit', 'Vantage', 'Halo'];
```

**Image logos:** drop SVG or PNG files into `assets/logos/`, then list them
in `CLIENT_LOGOS`. A non-empty `CLIENT_LOGOS` replaces the text names.

```js
const CLIENT_LOGOS = [
  { file: 'acme.svg', name: 'Acme' },
  { file: 'nova.png', name: 'Nova' }
];
```

Logos render at a uniform 28px height, greyscale, 70% opacity. Supply them
dark-on-transparent — they sit on warm-white. Six to ten reads best.

## 5. Deploying

**Vercel — two commands:**

```bash
npm i -g vercel      # once
vercel --prod
```

Accept the defaults (no framework, no build command, output = project root).

**Netlify — drag and drop:** open <https://app.netlify.com/drop> and drag
the project folder onto the page.

**Local preview:**

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

## 6. Attaching a custom domain

**Vercel:** Project → Settings → Domains → add e.g.
`editing.yourdomain.com`, then at your registrar add the record Vercel
shows (a `CNAME` to `cname.vercel-dns.com` for a subdomain, or the `A`
record for a root domain). HTTPS is automatic.

**Netlify:** Site configuration → Domain management → Add domain, same
registrar step.

Once you have a domain, make the two social-preview tags absolute so link
previews render in iMessage and Slack:

```html
<meta property="og:image" content="https://editing.yourdomain.com/assets/og-image.jpg">
<meta name="twitter:image" content="https://editing.yourdomain.com/assets/og-image.jpg">
```

## Design and behaviour notes

- **Tokens** are at the top of `styles.css`: `--warm-white #FFFCF2`
  (background throughout), `--black #020402`, `--red #C1121F`,
  `--grey #626868`, `--cream #F2E8CF`, plus `--surface #FFFFFF` for cards
  and inactive pills. Every pairing in use clears WCAG AA; if you change a
  token, re-check it.
- **Two contrast-driven deviations from the spec** are commented in place:
  the quality-screen numbers use dimmed `--black` (which renders as a warm
  grey) because `--grey` at the row dim lands at 2.1:1, and inactive rows
  sit at 60% rather than 55% because below that the row text drops under
  4.5:1 on cream. Both are marked in `styles.css`.
- **Motion** all respects `prefers-reduced-motion`: no video, no parallax,
  no word stagger, no counters, no marquee movement, and the quality rows
  render fully visible with red numbers.
- Sticky header appears once you pass 80% of the hero. In-page links scroll
  with a 72px offset so the header never covers a heading.
- The page is `noindex, nofollow` on purpose — it is sent as a private link.
- There is deliberately no button and no form. The closing section tells the
  reader to reply to the message the link came in.
