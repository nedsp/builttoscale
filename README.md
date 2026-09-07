# Built To Scale — DFY Video Editing pricing page

A single-page, static pricing site. No frameworks, no build step, no npm
dependencies. Open `index.html` in a browser and it works.

```
index.html      structure + meta
styles.css      design system + all page styles
script.js       ALL editable copy (packages, clients) + behaviour
vercel.json     static hosting config
assets/
  video/        hero-montage.mp4 · hero-montage.webm · hero-poster.jpg
  logos/        optional client logos
  fonts/        empty — Anton + Inter Tight load from Google Fonts
  og-image.jpg  1200×630 link-preview image
```

## 1. Changing prices and copy

Everything you will realistically want to edit is inside the
**`EDIT HERE`** block at the top of `script.js`. Nothing in `index.html`
needs to change.

**Prices, package names, features** — the `PACKAGES` array. Cards render
left to right in array order.

```js
{
  name: 'Full Content Engine',
  tagline: 'Post every day. Own short-form and YouTube.',
  price: '$2,000',
  period: '/mo',
  flagship: true,                                   // charcoal card instead of white
  pill: { text: 'Everything', style: 'flagship' },  // or null for no pill
  features: [ 'line one', 'line two' ]
}
```

- `flagship: true` makes the card charcoal with off-white text. Only set it
  on one card — the design depends on a single dark card.
- `pill.style` is either `'flagship'` (red text on graphite) or
  `'popular'` (white text on red). Set `pill: null` for no pill.
- To add or remove a package, add or remove an object. The grid handles
  1–4 cards; with 5+ you should widen the `1200px` breakpoint rule for
  `.pkg-grid` in `styles.css`.

**The three INCLUDED lines** shared by every card — the `INCLUDED` array.
Each entry's `href` is the section it scrolls to (`#quality`, `#guarantee`).

**Client names** — the `CLIENTS` array (see §3).

Copy in the quality screen, guarantee, process and closing sections lives
directly in `index.html` — search for the text and edit it in place.

## 2. Replacing the hero video

Put your raw clips in a folder and list them in a `clips.txt`:

```
file 'clip1.mp4'
file 'clip2.mp4'
file 'clip3.mp4'
```

Then run, from the project root:

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
```

Targets: **20–35 seconds**, **no audio track**, **MP4 under 8 MB**. Over
12 MB and mobile visitors on a slow connection will time out before it
plays — re-encode with a higher `-crf` (try 28, then 30).

Poster: keep it **under 200 KB**. If step 3 gives you a bigger file, add
`-vf scale=1920:-2` and raise `-q:v` to 4.

Also regenerate the link-preview image after swapping the poster:

```bash
ffmpeg -i assets/video/hero-poster.jpg \
  -vf "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630" \
  -q:v 3 assets/og-image.jpg
```

The page never breaks if the video is missing: `.hero__media` shows
`hero-poster.jpg` as a background, and the `<video>` only fades in once it
is actually playing. Video is also skipped entirely on screens under
768px, under `prefers-reduced-motion`, on `saveData` connections, and if
it has not started within 3 seconds.

## 3. Adding client logos

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
light-on-transparent — they sit on charcoal. Six to ten reads best.

## 4. Deploying

**Vercel — two commands:**

```bash
npm i -g vercel      # once
vercel --prod
```

Accept the defaults (no framework, no build command, output = the project
root). `vercel.json` handles clean URLs and caching.

**Netlify — drag and drop:** open <https://app.netlify.com/drop> and drag
the whole project folder onto the page. Nothing to configure. (Netlify
ignores `vercel.json`; if you want the same caching there, add a `_headers`
file — optional, the site is fine without it.)

**Local preview:**

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly with `file://` also works.

## 5. Attaching a custom domain

**Vercel:** Project → Settings → Domains → add e.g.
`editing.yourdomain.com`, then at your registrar add the DNS record Vercel
shows you (a `CNAME` to `cname.vercel-dns.com` for a subdomain, or the `A`
record it gives you for a root domain). HTTPS is issued automatically,
usually within a minute.

**Netlify:** Site configuration → Domain management → Add domain, then the
same registrar step with the record Netlify shows.

Once you have a domain, consider making the two social-preview tags in
`index.html` absolute so link previews render in iMessage and Slack:

```html
<meta property="og:image" content="https://editing.yourdomain.com/assets/og-image.jpg">
<meta name="twitter:image" content="https://editing.yourdomain.com/assets/og-image.jpg">
```

## Refreshing the font preload URLs (rare)

`index.html` preloads the two latin `.woff2` files directly — that is what
keeps the hero from reflowing when Anton swaps in (measured CLS: 0). The
URLs are versioned by Google. If they ever go stale nothing breaks; the
page just loads the fonts a beat later. To refresh them:

```bash
curl -s -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36" \
  "https://fonts.googleapis.com/css2?family=Anton&family=Inter+Tight:wght@400;500;600&display=swap" \
  | grep -B4 "U+0000-00FF" | grep -o "https://fonts.gstatic.com[^)]*"
```

Paste the two URLs it prints into the two `<link rel="preload" as="font">`
tags near the top of `index.html`. Keep `crossorigin` on both.

## Notes

- The page is `noindex, nofollow` on purpose — it is sent as a private link.
- There is deliberately no button and no form. The closing section tells
  the reader to reply to the message the link came in.
- Colours, type scale and spacing are CSS custom properties at the top of
  `styles.css`. `--red-on-dark` and `--red-deep` are AA-contrast variants
  of the brand red used for small text on dark and for the guarantee card
  — change `--red` and they should be re-checked against WCAG AA.
