# Tabletop Hobby Game Shop: website

Static site for a board game shop in Chennai. No build step is needed to run it:
open `index.html`, or serve the folder with any static host (for example `python3 -m http.server`).

## Pages
| Page | File |
|---|---|
| Home | `index.html` |
| Shop, with filters for category, players, time, age, complexity and price | `pages/shop.html` |
| Product pages, one per game | `pages/product-<id>.html` |
| Find a Game: 5-question finder, picks by occasion, complexity guide, gifts by budget, FAQ | `pages/recommendations.html` |
| Place your order: order list, delivery choice, customer details | `pages/order.html` |
| Contact & enquiries (pre-fills from `?topic=` and `?product=`) | `pages/contact.html` |
| Bulk orders, game nights, about, guides, guide article | `pages/*.html` |
| 404 and coming soon | `pages/404.html`, `pages/coming-soon.html` |

`pages/product-details.html` redirects old links to a product page.

## How ordering works (front end only)
"Add to order" saves items in the browser (localStorage) and updates the bag count.
The order page calculates delivery (Chennai same-day ₹99, free over ₹1,500; courier ₹149, free over ₹2,500; pickup free)
and shows a confirmation with a reference number. **Forms are not connected to a server.** To receive real
orders and enquiries, point the forms at your backend, a form service or a WhatsApp Business link.

## Editing
- Colours, fonts and spacing: tokens at the top of `assets/css/style.css`.
- Product data for search, the order list and the finder: `assets/js/catalog.js`.
  Product cards and product pages are plain HTML, so price or name changes must be made in both places.
- Phone, WhatsApp and address appear in the header drawer, footer, contact page and enquiry sections.

## Dependencies (CDN)
Archivo from Google Fonts and Bootstrap Icons from jsDelivr.
