# Tabletop & Co. — Hobby & Board Games Store

A premium, editorial-styled front-end for an independent hobby and board
games store. Built with semantic HTML5, Bootstrap 5 (grid + utilities only —
no Tailwind), vanilla ES6+ JavaScript, and a from-scratch design system
rather than a default Bootstrap theme.

No build step, no framework, no backend. Open `index.html` in a browser, or
serve the folder with any static file server.

## Quick start

```bash
# from the project root
python3 -m http.server 8080
# then visit http://localhost:8080/
```

Any static host works: Netlify, Vercel, GitHub Pages, S3 + CloudFront, or a
plain nginx/Apache document root. Just upload the whole folder as-is.

## What's inside

| Page | File | Notes |
|---|---|---|
| Home | `index.html` | Immersive split hero, Game of the Week, Shop by Experience, New Arrivals, Find Your Perfect Game, Game Nights |
| Home (Layout 2) | `home-2.html` | An alternate homepage: centered stacked hero with a scrolling category marquee, a vertically-stacked spotlight game, a horizontal "browse by type" filmstrip, a static new-arrivals grid, a combined community/testimonials section, and a closing CTA band |
| Shop | `pages/shop.html` | Filterable, sortable catalog grid with off-canvas mobile filters |
| Product details | `pages/product-details.html` | Gallery, specs, tabs, related games |
| Recommendations | `pages/recommendations.html` | 5-step game finder wizard with match scoring |
| Game Nights | `pages/game-nights.html` | Event timeline, calendar, community gallery, host-an-event CTA |
| Bulk Orders | `pages/bulk-orders.html` | Tiered pricing for schools, clubs, offices |
| About | `pages/about.html` | Story, values, team, testimonials |
| Blog | `pages/blog.html` / `pages/blog-details.html` | Magazine-style articles |
| Contact | `pages/contact.html` | Split contact form + info, validation |
| 404 | `pages/404.html` | Custom not-found page |
| Coming Soon | `pages/coming-soon.html` | Pre-launch page with a working countdown |

Both homepages link to each other from the announcement strip at the very
top, so you can compare them side by side. Every content page carries a
banner section at the top — the full `page-hero` treatment on list-style
pages (Shop, About, Contact, Blog, Game Nights, Bulk Orders,
Recommendations), and a slimmer contextual banner on the two detail pages
(Product Details' `page-banner-compact` trust strip, and Blog Details'
`page-hero` with the article title folded in). The 404 and Coming Soon
pages are deliberately standalone, full-screen experiences with no site
header — their centered headline stands in as the page's one visual
moment, which is the intended UX for both page types.

## Design system

All visual tokens (color, type, radius, spacing, motion) live as CSS custom
properties in `assets/css/style.css`. There is no photography in this build
— every "photo" is an original flat SVG illustration on a gradient panel
(`.ph` classes), one distinct scene per product/section (birds for
Wingspan, habitat tiles for Cascadia, players around a table for the
community sections, and so on) rather than a stock icon-on-a-box, so the
layout, framing and hover states are all production-accurate. Swap them
for real photography by replacing the relevant `.ph-*` element with an
`<img>` — see `documentation/customization-guide.md`. Small functional
icons (search, cart, nav, ratings, meta glyphs) are unrelated to this and
stay as Bootstrap Icons throughout.

- **`assets/css/style.css`** — design tokens + every component (header,
  hero, cards, bento grid, forms, footer, etc.)
- **`assets/css/dark-mode.css`** — the dark theme's re-lit palette,
  activated by `[data-theme="dark"]` on `<html>`, toggled via `main.js`
  and persisted in `localStorage`. It is a deliberate re-light, not an
  inverted filter.
- **`assets/css/rtl.css`** — logical-property safety net for Arabic/Hebrew
  layouts, loaded on every page and scoped entirely to `[dir="rtl"]`.

## JavaScript

- **`assets/js/main.js`** — shared across all pages: theme system, mobile
  off-canvas nav, sticky header, scroll reveals, wishlist/cart demo
  counters, generic form validation, and the coming-soon countdown.
- **`assets/js/shop.js`** — catalog filtering, sorting, and "load more"
  for the Shop page.
- **`assets/js/recommendations.js`** — the 5-step game finder logic and
  match-scoring demo.
- **`assets/js/events.js`** — Game Nights calendar/timeline interactions.

All of it is a front-end demo: filtering, cart counts, wishlists, the
finder, and forms all run client-side with no backend. Forms are marked up
ready to point at Formspree or Netlify Forms — see the customization guide.

## Accessibility

Skip-to-content link, semantic landmarks and heading order, visible focus
rings, 44px minimum touch targets, keyboard-operable navigation and
off-canvas panels, `aria-live`/`aria-pressed` states on interactive
widgets, and `prefers-reduced-motion` support throughout.

## Browser support

Current versions of Chrome, Edge, Firefox, and Safari (desktop + mobile).
Uses CSS custom properties, `:focus-visible`, `IntersectionObserver`, and
CSS logical properties — all broadly supported in evergreen browsers.

## License / credits

Bootstrap 5 and Bootstrap Icons are used under their respective open-source
licenses. Fonts are loaded from Google Fonts. This template's HTML, CSS and
JS are yours to modify and ship.
