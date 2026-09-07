# Built To Scale — DFY Video Editing pricing page

A single-page, static pricing site. No frameworks, no build step, no npm
dependencies. Open `index.html` in a browser and it works.

```
index.html          structure + all long-form copy (quality, comparison, FAQ)
partner/index.html  generated copy of index.html — see below, do not hand-edit
.githooks/          pre-commit hook that keeps that copy in step
styles.css          brand tokens + all page styles
script.js           editable data (packages, clients, stats) + behaviour
.nojekyll           tells GitHub Pages to serve the files as-is
assets/
  video/            hero-montage.mp4 · hero-montage.webm · hero-poster.jpg
  logos/            optional client logos
  fonts/            OverusedGrotesk-VF.woff2  ← you supply this
  og-image.jpg      1200×630 link-preview image
```

Every path in the site is relative (`./styles.css`, `../assets/…`), so it
works from a project page at `username.github.io/repo-name/` as well as from
a custom domain or a local folder.

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
  format: 'both',            // filter pills: 'short' | 'long' | 'both'
  flagship: true,            // the black card — set this on exactly one
  pill: { text: 'Most popular', style: 'popular' },   // or null
  tagline: 'Post every day. Own short-form and YouTube.',
  standard: '$2,400',        // the price everyone sees
  partner:  '$2,000',        // shown only in the unlocked Revenue Share view
  period: '/mo',
  features: [ SHORT_FORM(30), LONG_FORM, THUMBNAILS, FINISHING ]
}
```

- `format` decides which filter pills keep the card at full opacity. Get this
  wrong and the filters lie.
- `pill.style` is `'popular'` (warm-white on red) or `'cream'` (black on
  cream). `pill: null` for none.
- `features` uses the shared deliverable lines defined just above the array
  (`SHORT_FORM(n)`, `LONG_FORM`, `THUMBNAILS`, `FINISHING`,
  `FINISHING_LONG`). Edit the wording once there and every package that uses
  it follows. Write a literal string instead if one package needs its own.
- Above 1024px the five cards are a horizontal snap row that bleeds off the
  right edge; below that they stack. The row opens on the flagship with the
  card before it peeking.

**The "In numbers" stats** — the `STATS` array.

```js
{ value: null, suffix: '+', label: 'videos delivered' }
```

`value: null` renders the literal placeholder `[X]` and skips the count-up.
Put a real number in and it counts from 0 over 900ms when it scrolls into
view. **All three are currently `null` — replace them.**

**Client names** — the `CLIENTS` array (see §5).

**Everything else** — the five quality-screen points, the revision and
guarantee copy, the four comparison tabs and all six FAQ answers live
directly in `index.html`. Search for the text and edit in place. The
Included panel inside each card is the `<template id="tpl-included">` at
the bottom of `index.html` — edit it once and all four cards follow.

## 3. The partner password

The **Revenue Share** link in the header (and in the footer) opens a password
box. The right password switches the page into partner mode: every price
gains the standard price struck through beside the partner price, a small
`REVENUE SHARE PRICE` label appears on each card, and three bits of copy
change. Nothing else moves.

The password is currently **`builttoscalepartnership2026`**. Input is
trimmed, lowercased and stripped of spaces before checking, so
`Built To Scale Partnership 2026` works too.

### This is not security

The check happens **in the browser**. `script.js` holds a SHA-256 hash of
the password, not the password itself, so the phrase is not sitting in plain
sight — but anyone who can open developer tools can read the code, skip the
check, and set partner mode themselves. Treat it as a lock on a cupboard,
not a safe: it stops a casual visitor or a forwarded link from showing
partner rates. If partner pricing must be genuinely protected, it needs a
server that does not send those prices to the browser at all.

Partner mode lasts for the browser session (`sessionStorage`), survives a
refresh, and ends when the tab closes or the visitor clicks
**Partner pricing ✓** in the header.

### Changing the password

Generate the SHA-256 of the new phrase — lowercase, no spaces — and replace
`PARTNER_HASH` in `script.js`:

```bash
# macOS
echo -n "yournewphrase2027" | shasum -a 256

# Linux
echo -n "yournewphrase2027" | sha256sum
```

Use `echo -n`, not `echo` — a trailing newline produces a different hash and
the password will never match.

### The /partner/ page

`partner/index.html` is a **generated copy** of `index.html` — identical
except that its six `./` paths point one level up to `../`. GitHub Pages
cannot rewrite URLs, so partner mode needs a real page at that address.

**Edit `index.html`, never `partner/index.html`.**

A pre-commit hook keeps the copy in step for you, so in normal use you can
forget it exists. **Turn it on once per clone** — Git does not ship hook
settings with a repository:

```bash
git config core.hooksPath .githooks
```

From then on, any commit that includes `index.html` regenerates
`partner/index.html` from the staged version and adds it to the same
commit. It prints one line when it fires and stays silent otherwise.

If you ever need to do it by hand — or you edited `index.html` through
GitHub's web editor, which never runs a local hook:

```bash
sed 's|"\./|"../|g' index.html > partner/index.html
```

To check the two are in step, this should print the six path lines and
nothing else:

```bash
diff index.html partner/index.html
```

Visiting `/partner/` without unlocking shows the page in **standard** mode
with the password box open. The address is not the key; the password is.
Unlocking navigates you to `/partner/`, and the header link navigates back
to `/`.

### What a public repo exposes

Making the repository public is fine — there are no API keys or tokens in
it. Two things are worth knowing:

- The **partner prices are in `script.js` in plain text**, as `partner:
  '$2,000'` and so on. Anyone who opens the repo, or the deployed
  `script.js`, reads them without needing the password. The same is true of
  any static site: the browser has to be sent the numbers to display them.
- The **hash is only as strong as the phrase**. A short, guessable phrase
  falls to a dictionary attack in seconds, so `PARTNER_HASH` does not
  meaningfully protect the password either.

The gate keeps partner rates out of the way of a casual visitor or a
forwarded link. It is not a control, and nothing behind it should be
anything you would mind a stranger seeing.

## 4. Replacing the hero video

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

## 5. Adding client logos

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

## 6. Deploying to GitHub Pages

Push the repository to GitHub, then:

1. Repository → **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*.
3. Pick the branch and the **/ (root)** folder, then **Save**.

The site appears at `https://<username>.github.io/<repo-name>/` within a
minute or two. Every push to that branch redeploys it.

There is no build step. `.nojekyll` tells Pages to serve the files exactly
as they are rather than running them through Jekyll.

**Local preview** — from the project folder:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

Use a server rather than double-clicking `index.html`: over `file://` the
browser will not serve `partner/` as a directory, so the partner link
misbehaves. Everything else works either way.

## 7. Attaching a custom domain

Repository → Settings → Pages → **Custom domain**. Enter e.g.
`editing.yourdomain.com` and save; GitHub writes a `CNAME` file into the
repository. At your registrar add a `CNAME` record pointing that subdomain
at `<username>.github.io`. For a root domain, add GitHub's four `A` records
instead. Tick **Enforce HTTPS** once the certificate is issued (usually
within the hour).

Nothing in the site needs changing — the paths are relative, so it works at
`/repo-name/` and at the root of a domain alike.

Once you have a domain, make the two social-preview tags absolute so link
previews render in iMessage and Slack. Edit them in `index.html`, then
regenerate `partner/index.html`:

```html
<meta property="og:image" content="https://editing.yourdomain.com/assets/og-image.jpg">
<meta name="twitter:image" content="https://editing.yourdomain.com/assets/og-image.jpg">
```

## Design and behaviour notes

- **Tokens** are at the top of `styles.css`: `--warm-white #FFFCF2`
  (background throughout), `--black #020402`, `--red #C1121F`,
  `--grey #626868`, `--cream #F2E8CF`, plus `--surface #FFFFFF` for cards
  and inactive pills and `--red-on-black #ED5140` for small red text on the
  flagship card (brand red is only 3.3:1 there). Every pairing in use clears
  WCAG AA; if you change a token, re-check it.
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
- The page carries `<meta name="robots" content="noindex, nofollow">`, so
  search engines skip it even though the site is publicly reachable. That
  was right when the link was sent privately. If you now want it to show up
  in search, delete that tag from `index.html` and regenerate
  `partner/index.html`. Leaving it is harmless — the link still works for
  anyone you send it to.
- There is deliberately no button and no form. The closing section tells the
  reader to reply to the message the link came in.
