# Customization Guide

## 1. Brand colors, type, and radius

Every visual token lives at the top of `assets/css/style.css` under `:root`.
Change a value once and it updates everywhere:

```css
--color-accent: #DD5B27;      /* primary amber accent */
--color-secondary: #1F6F5C;   /* muted jade secondary */
--color-bg: #F4EEE0;          /* warm cream surface (light theme) */
--color-ink-panel: #17151B;   /* near-black panel, used in both themes */
```

Dark theme equivalents live in `assets/css/dark-mode.css` inside
`[data-theme="dark"]{ ... }` — it's a deliberate re-light (brighter amber,
cooler jade, warmer near-black) rather than an inverted filter, so update
both files together when you change the accent hue.

Typefaces:

```css
--font-display: 'Bricolage Grotesque', 'Inter', sans-serif; /* headlines */
--font-body: 'Inter', -apple-system, sans-serif;             /* body copy */
--font-mono: 'IBM Plex Mono', monospace;                     /* stats, prices, badges */
```

To swap a typeface, change the Google Fonts `@import` at the top of
`style.css` and update the matching `--font-*` variable.

Radius scale: `--radius-sm` (chips, inputs), `--radius-md` (cards),
`--radius-lg` (hero frames, panels), `--radius-pill` (buttons, badges).

## 2. Replacing placeholder artwork with real photography

This build ships with no photography — every "photo" is an original flat
illustration (`class="ph ph-<name>"`: a gradient panel plus an inline SVG
scene, e.g. birds for Wingspan, habitat tiles for Cascadia, a table of
players for the community sections) rather than a stock icon or a real
product photo. Real box photography of named games is under the
publisher's copyright, so it's deliberately left out of a template; these
illustrations exist so you can see the exact framing, aspect ratio, and
hover treatment before you drop in licensed or your own photography.

To replace one:

1. Find the element, e.g. `<div class="ph ph-wingspan">...inline svg...</div>`
2. Replace the whole thing with an `<img>` of the same aspect ratio:
   ```html
   <img src="../assets/images/wingspan.webp" alt="Wingspan board game box and components" loading="lazy">
   ```
3. Remove the matching `.ph-wingspan{ background: ... }` rule from
   `style.css` once every instance of it is replaced.
4. Export images as WebP, sized to roughly 2x their largest display size,
   and always include descriptive `alt` text (skip `alt=""` only for
   purely decorative images already marked `aria-hidden="true"`).

All small functional icons elsewhere (search, cart, hamburger, nav arrows,
rating stars, player/age/time glyphs next to product facts) are left as
Bootstrap Icons — those are interface icons, not photography, and swapping
them for images would work against usability and load time.

## 3. Products, prices, and currency

Product cards carry their data as `data-*` attributes so `shop.js` can
filter/sort them without a backend:

```html
<article class="game-card" data-product
  data-category="strategy" data-players="2-4" data-age="10+"
  data-time="60-120" data-difficulty="medium" data-price="2499"
  data-rating="4.8" data-featured="1" data-added="20250901">
```

Update the visible price text *and* `data-price` (a plain number, no
currency symbol) together, or sorting/filtering will use stale values.
Currency symbol is hard-coded as `₹` in the markup — find-and-replace it if
you're localizing to another market.

## 4. Connecting the forms

Every form is marked `data-validate` for the client-side checks in
`main.js` (required fields, email format, phone format). No backend is
wired up. To go live:

- **Formspree** — set the form's `action` to your endpoint URL and
  `method="POST"`, keep the existing `name` attributes on each field.
- **Netlify Forms** — add `data-netlify="true"` and a hidden
  `<input type="hidden" name="form-name" value="contact">` matching the
  form's purpose, then deploy on Netlify.

Forms currently used: contact (`pages/contact.html`), bulk quote request
(`pages/bulk-orders.html`), newsletter signup (footer, every page, and
`pages/coming-soon.html`).

## 5. RTL (Arabic / Hebrew)

Set `dir="rtl"` and an appropriate `lang` (e.g. `lang="ar"` or `lang="he"`)
on the `<html>` element of any page you're localizing. `assets/css/rtl.css`
is already linked on every page and only activates under `[dir="rtl"]`, so
no other markup changes are required. Most spacing already uses logical
properties (`margin-inline`, `padding-inline`, `inset-inline`) in
`style.css`, so `rtl.css` only needs to patch the handful of rules that
reference a physical direction, plus icon mirroring (arrows, chevrons).

## 6. Adding a new shop category or blog post

- **Category**: duplicate one `.exp-tile` block in the "Shop by Experience"
  section of `index.html`, and add a matching `<option>` to the category
  filter in `pages/shop.html`.
- **Blog post**: duplicate one article card in `pages/blog.html` and one
  full article layout in `pages/blog-details.html`; update the JSON-LD
  `Article` block in `blog-details.html` to match the new post's title,
  author, and date.

## 7. Performance notes

- Bootstrap and Bootstrap Icons load from jsDelivr's CDN; self-host them if
  you need to work offline or meet a stricter CSP.
- All non-critical images should use `loading="lazy"` (already applied to
  the placeholder pattern's real-image replacements described above).
- `main.js`, `shop.js`, `recommendations.js`, and `events.js` are all
  placed just before `</body>`, so they parse and execute after the page
  content — keep new script tags at the bottom too (or add `defer` if you
  move them into `<head>`).
