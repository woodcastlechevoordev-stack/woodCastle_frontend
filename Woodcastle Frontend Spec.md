# Woodcastle — Frontend & Admin Panel Specification (Phase 1)

This document specifies the **Next.js website** and **admin panel** for Woodcastle, a wood furniture shop, built on top of `woodcastle-backend-spec.md`. Color/typography direction stays premium white/brown/gold (originally referenced from woodenstreet.com). **Page layout and section structure now follow the GearO template** (gearo-html.vercel.app) — its header, homepage section flow, product card, product detail, and footer patterns — adapted to Woodcastle's actual Phase 1 feature set.

**Important scope note:** GearO is a full ecommerce theme with cart, wishlist, compare, and checkout. None of those are in Woodcastle's Phase 1 scope (enquiry-based catalog, no cart/checkout — that's Phase 2 billing). Everywhere GearO uses "Add to Cart," Woodcastle uses **"Enquire Now"** instead, opening the existing enquiry form. Wishlist, Compare, and Cart icons/drawers are **not** included — only the layout structure is adopted, not the commerce functionality.

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR/SSG for SEO, image optimization, file-based routing |
| Styling | Tailwind CSS | Fast to build a consistent design system, easy responsive utilities |
| Fonts | Playfair Display (headings) + Inter (body) via `next/font` | Serif headings read as premium/furniture-brand; Inter keeps body text clean and highly legible |
| Forms | React Hook Form + Zod | Enquiry form validation, admin forms |
| Data fetching | Native `fetch` with Next.js caching (`revalidate`), or TanStack Query for admin panel client-side calls | SSG/ISR for public pages, real-time refetching for admin |
| Images | `next/image` pointed at Cloudinary URLs | Automatic responsive image sizing/lazy loading |
| Admin auth state | HTTP-only cookie storing JWT | Safer than localStorage for admin sessions |
| Deployment | Vercel (frontend) — separate from backend hosting | Free tier comfortably covers Phase 1 traffic |

---

## 2. Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-cream` | `#FAF7F2` | Page background |
| `--color-white` | `#FFFFFF` | Cards, section backgrounds |
| `--color-brown-dark` | `#3C2A1E` | Headings, primary text, footer background |
| `--color-brown-mid` | `#6B4226` | Secondary text, borders, icons |
| `--color-brown-light` | `#C9AE94` | Subtle dividers, hover backgrounds |
| `--color-gold` | `#C9A227` | CTAs, price highlights, active states, accents |
| `--color-gold-light` | `#E8D9A8` | Badge backgrounds, offer tags |

**Principle:** cream/white dominates (70%), brown carries text and structure (25%), gold is a deliberate accent only — buttons, prices, hover states, section dividers (5%). Gold should never be a large background fill; it reads premium only when used sparingly, like real gold leaf detailing.

### Typography

- **Headings (H1–H3):** Playfair Display, brown-dark, generous letter-spacing on eyebrow labels (e.g. "OUR COLLECTIONS")
- **Body:** Inter, brown-mid at 16-18px base, 1.6 line-height
- **Prices/CTAs:** Inter Semibold, gold or brown-dark depending on context

### Component Style Notes

- Buttons: solid brown-dark with gold text on hover-invert, or gold outline on cream backgrounds — avoid pure black/white contrast, keep it warm
- Cards: soft shadow (not harsh), 1px brown-light border, generous padding — avoid sharp corners; use 8-12px radius for a refined (not playful) feel
- Section dividers: thin gold rule or brown-light rule, never a hard black line

---

## 3. Page Layout Patterns (structure adapted from GearO)

This section maps GearO's layout structure onto Woodcastle's existing pages/features — no new functionality, only the arrangement of sections.

### 3.1 Header

- Slim **top utility bar**: left — a short trust line (e.g. "Handcrafted Wood Furniture Since [year]"); right — About / Contact / Store Location links (only if applicable)
- **Main header row**: logo (center or left), primary nav with category **mega-menu dropdown** — showing Woodcastle's actual 11 main categories (Sofa & Sofa Sets, Chairs, Tables, Dining Furniture, Bedroom Furniture, Living Room Furniture, Storage Furniture, Office Furniture, Outdoor Furniture, Kids Furniture, Home Décor & Accessories), each expanding to its subcategories on hover/tap (matching GearO's dropdown-with-thumbnails style), **search icon** (see 3.1a), and an "Enquire Now" quick-access icon/button in place of GearO's wishlist/cart icons
- Mobile: hamburger menu opening a full-screen/off-canvas nav, same category structure collapsed into an accordion

### 3.1a Site Search & Category Filter

- Clicking the header search icon opens a search overlay/bar (full-width dropdown on desktop, full-screen on mobile) with: a **text input** (product name search) and a **category filter dropdown** (main categories, or subcategories for more precision) — both optional, either can be used alone
- **Live suggestions as the user types:** debounce the text input (~300ms after the last keystroke, don't fire on every character), then call `GET /api/products?search=<query>&limit=5` and show the results in a dropdown directly under the input — each suggestion shows the product's thumbnail, name, and price, and is clickable straight to `/product/[slug]`. Also match the query against the already-loaded category list (client-side, no extra API call needed — the mega-menu's category tree is already in memory) and show up to 3 matching category/subcategory names above or below the product suggestions, each linking straight to that category page
- End the suggestions dropdown with a **"View all results for '<query>'"** link/row that submits the full search (same as pressing Enter), for when the customer wants more than the 5 quick suggestions
- No results while typing → show a plain "No matches yet" state in the dropdown rather than an empty box, so it doesn't look broken
- Suggestions dropdown closes on selecting a result, pressing Escape, or clicking outside it
- Submitting navigates to `/search?q=<query>&category=<slug>`, which calls `GET /api/products?search=<query>&category=<slug>&page=&limit=` and renders results using the same product grid/card component as category pages, with the same "Load More" pagination
- If only a category is selected with no text query, this behaves the same as visiting that category's page directly — no need for a separate code path
- Empty results (on the full results page, not the suggestions dropdown) show a clear "No products found" state with a suggestion to browse categories instead, not a blank page
- On the results page, both the search input and category filter stay visible/editable so the customer can refine without going back to the homepage

### 3.2 Homepage Section Order

1. **Hero carousel** — multi-slide banner (product/category imagery, headline, short line, one CTA button linking to a category); one slide anchors on the brand positioning itself — "44 Years of Legacy · Kerala's Best Furniture" — rather than only product imagery
2. **Category grid** — image tile per category (5–6 tiles), matching GearO's "Browse Categories" banner grid; links to `/category/[slug]`
3. **Featured products grid** — "Our Picks For You" equivalent (e.g. "Featured Furniture"): product cards in a 4-column desktop grid, pulling `isActive` products, most recent or manually curated
4. **Large lookbook-style banner** — one big lifestyle image with 1-2 product callouts overlaid, linking to product detail pages
5. **Offers strip** — active items from `/api/offers`, styled as a banner row (replaces GearO's discount-badge pattern, since per-product sale pricing isn't in Phase 1 scope)
6. **Signature collections** — numbered list + hover-image tiles (GearO's "Discover Our Signature Interior Collections" pattern), linking to categories
7. **Testimonials/Reviews** — pulls from `GET /api/reviews` (no `productId`, so general/site-wide reviews only), shown as quote cards with customer name, star rating, and review text (plus their photo if one was uploaded). Admin-managed via `/admin/reviews` — see section 4's admin routes table. Only reviews the admin has marked Active appear here. Alongside this, a small **"As Seen on Google"** widget pulls from `GET /api/google-reviews` (backend spec section 5d) — shows the overall star rating, review count, and up to 5 real Google reviews, with the required Google logo/attribution and a link out to the actual Maps listing. These two review sources stay visually distinct (e.g. the Google widget in its own bordered card) rather than mixed into one list, since they come from different places and one links off-site.
8. **Blog preview** — 3 most recent posts, card layout (image, category tag, date, title, excerpt, "Read More"), matching GearO's "News Insight" section
9. **Instagram-style gallery strip** — a simple image row using existing product images (view product on click), no separate Instagram integration
10. **Trust/stat row** (footer-adjacent) — the actual brand credibility stats from section 3.8: **44 Years of Legacy · 100% Teak Wood · 10 Lakh+ Happy Customers · Chevoor, Thrissur Since [founding year]** — shown as large numbers with short labels, not generic service icons

### 3.3 Category Listing Page (`/category/[slug]`)

- Since Woodcastle's catalog is two-level (11 main categories, each with several subcategories — see the category taxonomy in the backend spec), a main category page (e.g. `/category/chairs`) shows a subcategory tile grid at the top (Dining Chair, Arm Chair, Lounge Chair, etc.) before the product grid, so users can narrow down; a subcategory page (e.g. `/category/dining-chair`) goes straight to the product grid, since it's already the leaf level
- Breadcrumb row (Home → Chairs → Dining Chair)
- Optional left sidebar or top filter bar (price range) — filtering is client-side/query-param based against the existing `/api/categories/:slug/products` endpoint, no new backend filtering logic required for Phase 1 unless the client wants server-side filters
- Product grid (same card component as homepage), with "Load More" pagination button (GearO pattern) rather than numbered pages — cleaner on mobile

### 3.4 Product Card Component

Matches GearO's card structure minus commerce actions:

- Primary image, with a secondary image swap on hover (if a product has 2+ images)
- Category label (small, above product name)
- Product name
- Price
- **"Enquire Now"** button (appears on hover on desktop, always visible on mobile) — replaces "Add to Cart"
- **Share icon** — small icon button in a corner of the card (e.g. top-right, over the image), separate from "Enquire Now"; see 3.4a for behavior
- No wishlist heart icon, no compare icon, no discount badge (since per-product sale pricing isn't modeled yet)

### 3.4a Share Button Behavior (product card + product detail page)

One share button appears on every product card and on the product detail page (near the price/enquiry area). Behavior:

- **On mobile** (where the Web Share API is available): tapping it calls `navigator.share({ title, text, url })` with the product name and page URL — this opens the device's native share sheet, letting the customer pick WhatsApp, Instagram, SMS, etc. directly. No custom UI needed here beyond the button itself.
- **On desktop** (where `navigator.share` usually isn't available): tapping it opens a small dropdown/popover with two options: **"Share on WhatsApp"** (opens a `wa.me` link pre-filled with the product name and URL, same click-to-chat pattern as the enquiry flow) and **"Copy Link"** (copies the product URL to the clipboard, with a brief "Link copied" confirmation toast).
- Feature-detect `navigator.share` to decide which behavior to use — don't hardcode by screen width, since availability varies by browser, not just device size.
- The image showing up correctly when a copied link is pasted into WhatsApp (or shared via the native sheet) depends entirely on the product page's Open Graph image tag being set correctly — see section 5's SEO checklist. The share button itself doesn't attach an image; the link preview does that automatically once `og:image` is right.

### 3.5 Product Detail Page (`/product/[slug]`)

- Left: image gallery with thumbnail strip (GearO's "Product Thumbnails" layout) — main image + clickable thumbnails, matching the reference's gallery pattern
- Right: product name, price, short description, key details (material/dimensions if provided), **Share button** (see 3.4a) placed near the price, then the **enquiry form** in place of GearO's Add to Cart / quantity selector / Buy It Now block
- Below the fold: full description, then a **Reviews section** if any exist for this product (`GET /api/reviews?productId=<id>` — star rating, customer name, text, photo if present; hide the section entirely if there are none, rather than showing an empty state), then a "You May Also Like" row (related products from the same category) — reusing GearO's related-products pattern, sourced from the same `categoryId`

### 3.6 Blog Pages

- `/blog`: grid layout matching GearO's "Blog Grid" — image, category tag, date, author, title, excerpt
- `/blog/[slug]`: single-column article layout with a large cover image header

### 3.7 Footer

- Top row: brand stat row (see 3.2.10 / 3.8)
- Multi-column footer: **Information** (About, Blog, Store Location if applicable), **Customer Services** (Contact Us, Terms & Conditions), and a **contact block** (phone +91 9074119382, email woodcastlechevoor@gmail.com — see 3.8a)
- Short legacy line above the copyright row, e.g. "44 Years of Trusted Craftsmanship — Chevoor, Thrissur, Kerala"
- Newsletter signup bar is **optional** — only include if the client wants an email list; not in original requirements, so flagged here rather than assumed
- Social icons row
- Copyright line
- No payment-method icon row (no payments in Phase 1)

---

### 3.8 Brand Content & Messaging

Actual brand facts to use across the site (replacing placeholder copy anywhere it appears in this spec):

- **44 years of experience**
- **100% teak wood**
- **10 lakh+ happy customers**
- Positioned as **Kerala's best furniture** (brand tagline/positioning)
- **One of the first furniture shops in Thrissur, Chevoor**

**Where these appear:**

- **Hero carousel (3.2.1):** headline built around the "44 years of experience" / "Kerala's best furniture" positioning, e.g. a tagline slide alongside the product-focused slides
- **Trust/feature icon row (3.2.10):** replace the generic 4 value props with these actual stats as a stat strip — e.g. "44 Years of Legacy," "100% Teak Wood," "10 Lakh+ Happy Customers," "Since [founding year], Chevoor, Thrissur" — shown as large numbers/short labels rather than icons, since these are credibility stats, not service features
- **About page (`/about`):** full brand story — the Thrissur Chevoor origin as "one of the first furniture shops" in the area, the 44-year history, and the 100% teak wood material commitment as a dedicated content block (good long-form SEO content, matching WoodenStreet's material/craft storytelling approach)
- **Footer:** short one-line version of the legacy stat (e.g. "44 Years of Trusted Craftsmanship — Thrissur, Kerala") above the copyright line

**Where this content lives:** these are static brand facts, not admin-managed dynamic data (they won't change often). They can live in the existing `StaticPage` model (`about` key) for the About page's long-form version, with the short stat-strip versions hardcoded in the homepage/footer components — no new backend model needed. If the client wants to edit these stat numbers from the admin panel later without a code change, that's a small addition to the existing `pages` module (adding a `home-highlights` key), not a new feature.

### 3.8a Actual Contact Details

- **Google Maps location:** https://maps.app.goo.gl/5v3tCVPo1BKsiqkYA — use this as the "Get Directions" link on the Contact page (either a direct link/button, or embedded as a Google Maps iframe using this same location)
- **Email:** woodcastlechevoor@gmail.com
- **Phone:** +91 9074119382

**Where these appear:**
- **Contact page (`/contact`):** phone (tap-to-call on mobile via `tel:+919074119382`), email (mailto: link), and the embedded map/directions link
- **Footer contact block:** phone and email, alongside the legacy line from 3.8
- **Header top utility bar (3.1):** consider adding the phone number here too, since a furniture shop's customers often prefer to call directly rather than fill a form
- **JSON-LD `LocalBusiness` schema (contact page):** `telephone`, `email`, and address — since a real physical location now exists, this schema is no longer optional/conditional (as it was phrased in section 4's table), it should be implemented
- **WhatsApp:** confirm with the client whether `+91 9074119382` is the same number that should be used as `WHATSAPP_ADMIN_NUMBER` in the backend, or if enquiries should route to a different number — worth checking before hardcoding this number into the enquiry flow's `wa.me` links



## 4. Site Structure & Pages

### Public Pages

| Route | Purpose | SEO Notes |
|---|---|---|
| `/` | Home — see section 3.2 for full section order | Primary keyword target ("wood furniture [city/region]"); JSON-LD `Organization` schema |
| `/category/[slug]` | Category listing — see section 3.3 | Dynamic `metaTitle`/`metaDescription` from backend; JSON-LD `BreadcrumbList` |
| `/product/[slug]` | Product detail — see section 3.5 | JSON-LD `Product` schema (name, image, description, price); this is the money page for SEO |
| `/about` | About Us — 44-year brand history, Thrissur Chevoor origin story, 100% teak wood commitment (see 3.8) | Long-form content block (SEO value) |
| `/contact` | Contact Us — real address/map, phone, email (see 3.8a), contact form | JSON-LD `LocalBusiness` schema |
| `/blog` | Blog listing — see section 3.6 | Paginated, `metaTitle`/`metaDescription` per listing |
| `/blog/[slug]` | Blog post — see section 3.6 | JSON-LD `Article` schema |
| `/offers` | Active offers/promotions page | Pulls from `/api/offers` |
| `/search` | Search results — see 3.1a | `?q=` and `?category=` query params drive the results; noindex via meta tag is worth considering here to avoid thin/duplicate search-result pages competing with real category pages in Google |
| `/terms-and-conditions` | Terms & Conditions | Static content page |

### Admin Panel

| Route | Purpose |
|---|---|
| `/admin/login` | Username + password, then TOTP code screen if 2FA enabled |
| `/admin/2fa-setup` | QR code display + confirmation, for enabling Google Authenticator |
| `/admin` | Dashboard — recent enquiries count, quick links |
| `/admin/products` | Product list — **search box** (matches name/description via `GET /api/admin/products?search=`) plus a **category filter dropdown** (subcategories, grouped by main category same as the product form), **Edit and Delete action per row** (Delete opens a confirmation dialog before calling the DELETE endpoint) |
| `/admin/products/new`, `/admin/products/[id]/edit` | Product form: name, **description — rich text editor (same Tiptap component as the blog editor), supporting bold, italic, text color, bullet/numbered lists, and tables**, price, **category selector — must list SUBCATEGORIES ONLY (leaf level), grouped by main category using `<optgroup>` or similar** (e.g. "Chairs" group header, with "Dining Chair," "Arm Chair," etc. selectable underneath) — sourced by fetching `GET /api/admin/categories` (the nested tree) and flattening every main category's `children` array into this grouped list; selecting one sets the product's `categoryId` to that subcategory's `id`, never a main category's `id`. Images (drag-drop upload to Cloudinary), SEO fields (metaTitle/metaDescription) |
| `/admin/categories` | Category list — **search box** (`GET /api/admin/categories?search=`, matches name at either level) — plus create/edit modal — **includes image upload** (same drag-and-drop, direct-to-Cloudinary signed upload widget as the product form, not a paste-a-URL field), plus name, **Parent Category dropdown — sourced by fetching `GET /api/admin/categories` and showing only TOP-LEVEL categories (`parentId: null`) plus a "None (top-level category)" option at the top**; selecting a value sets `parentId` on save, selecting "None" sends `parentId: null`. Also includes SEO fields. **Delete action per row** with confirmation — deleting a category with products or subcategories attached should warn the admin and block the delete until those are reassigned or removed |
| `/admin/products/import` | Bulk import — upload the .xlsx template, review a preview of changes/errors, confirm |
| `/admin/blog` | Blog post list — **search box** (`GET /api/admin/blog?search=`, matches title) plus a **Published/Draft filter**, **Edit and Delete action per row** |
| `/admin/blog/new`, `/admin/blog/[id]/edit` | Rich text editor (e.g. Tiptap) for post content, cover image upload, SEO fields |
| `/admin/offers` | Offers list — **search box** (`GET /api/admin/offers?search=`, matches title) plus an **Active/Inactive filter** — create/edit (banner image, discount text, active window) |
| `/admin/enquiries` | Enquiry inbox — **search box** (`GET /api/admin/enquiries?search=`, matches customer name/phone/product name) plus **filterable by status** (new/contacted/closed), click to view full details and mark status |
| `/admin/pages` | Site content editor — list of editable pages (About, Terms & Conditions, Contact), each opening a simple form (title + rich text content using the same Tiptap component) that calls `PATCH /api/admin/pages/:key`. This is the missing screen that makes the backend's long-standing `StaticPage` support actually usable — until now there was no admin UI for it |
| `/admin/reviews` | Review list — **search box** (`GET /api/admin/reviews?search=`, matches customer name/text) plus a **product filter** (to see reviews tied to one product) and an **Active/Inactive toggle per row** to control what's publicly visible, **Edit and Delete action per row** |
| `/admin/reviews/new`, `/admin/reviews/[id]/edit` | Review form: customer name, star rating (1-5 selector), review text, optional customer photo upload (same shared upload component as elsewhere), optional product selector (a review can be general/site-wide or tied to a specific product — leave blank for general), Active toggle |
| `/admin/settings` | Change password, enable/disable 2FA |

**Domain note:** this lives at `yourdomain.com/admin` — since it's the same Next.js app, this is just a route group (`app/admin/`) with its own layout, separate from the public site's layout, protected by a middleware check on the admin JWT cookie.

---

## 5. SEO Implementation Checklist

- Use Next.js `generateMetadata()` per route, populated from the backend's `metaTitle`/`metaDescription` fields. **The admin-entered `metaTitle` is already the complete page title** (e.g. "Oakwood 6-Seater Dining Table | Woodcastle") — set it directly as `title` in `generateMetadata()`. Do **not** also define a root-layout title `template` (e.g. `template: '%s | Woodcastle'`) that appends the site name again, or titles double up (e.g. "divan | Woodcastle | Woodcastle"). If a product/category/blog post has no `metaTitle` set, fall back to `"{name} | Woodcastle"` constructed in code — but only as a fallback for the blank case, never layered on top of an existing value.
- `sitemap.xml` — generate dynamically via `app/sitemap.ts`, pulling **every** product, **every** category at both levels (main categories *and* subcategories — a subcategory like `/category/dining-chair` is a real indexable page and must be included, not just the 11 main category URLs), and every published blog post slug from the backend at build/revalidate time
- `robots.txt` — allow all public routes, disallow `/admin/*`
- Canonical URLs on every page
- JSON-LD structured data: `Organization` (home), `Product` (product pages), `BreadcrumbList` (category/product), `Article` (blog posts), `LocalBusiness` (contact page — see 3.8a for the real phone/email/address to use)
- Open Graph + Twitter Card meta tags on every page. **Product pages specifically need `openGraph.images` set to the product's primary image** (absolute URL, ideally the image at a size close to 1200×630 or Cloudinary-transformed to that ratio) — this is what makes the image actually appear when a product link is pasted into WhatsApp, or shared anywhere else that generates a link preview. A missing or relative-path `og:image` is the most common reason a shared link shows no image.
- Semantic HTML: one `<h1>` per page, proper heading hierarchy, `alt` text on every product image (pull from product name)
- Core Web Vitals: `next/image` for automatic lazy-loading and responsive sizing; avoid layout shift by always specifying image dimensions
- Static generation (`generateStaticParams`) for product/category/blog pages with ISR (`revalidate: 3600` or similar) so pages are fast *and* stay current as the admin adds products

---

## 6. Responsive Behavior

| Breakpoint | Target | Key changes |
|---|---|---|
| `< 640px` (mobile) | Phones | Single-column product grid, hamburger nav (off-canvas, GearO-style), sticky "Enquire Now" button on product pages, stacked hero |
| `640–1024px` (tablet) | Tablets | 2-column product grid, condensed nav |
| `> 1024px` (desktop) | Desktop | 4-column product grid (matching GearO's density), full nav bar with mega-menu, side-by-side product gallery + enquiry form |

Mobile-first Tailwind classes throughout (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`). Enquiry form must be fully usable on mobile without zooming — inputs sized appropriately, no reliance on hover states for any interaction the user needs to complete (the "Enquire Now" button is always visible on mobile product cards, not hover-revealed).

---

## 7. Enquiry Form → WhatsApp Flow (Frontend Side)

No OTP step in Phase 1 — matches the backend's simplified flow:

1. User fills the enquiry form on `/product/[slug]` (name, phone, message) → `POST /api/enquiries`
2. Backend responds with `{ enquiry, whatsappLink }`
3. Frontend immediately opens `whatsappLink` in a new tab (`window.open(whatsappLink, '_blank')`) — this launches WhatsApp (web or the installed app, whichever the device resolves `wa.me` to) with a message pre-filled: customer name, phone, product, and their enquiry text. The customer just needs to tap **Send** inside WhatsApp — the message itself is already written for them.
4. Simultaneously, show an on-page confirmation ("Enquiry received! We've opened WhatsApp for you — just hit send to reach our team.") so the flow feels complete even if the customer's browser blocks the new tab or they don't have WhatsApp installed on that device
5. No account/session is created for the customer — the enquiry is saved on the backend regardless of whether they complete the WhatsApp step

**Mobile note:** on phones, `wa.me` links open the WhatsApp app directly if installed; on desktop, they open WhatsApp Web (or prompt to install the desktop app if neither is set up). Test both paths — desktop users without WhatsApp Web logged in are the one case where this can feel like a dead end, worth having the confirmation message also show the admin's phone number as a fallback for them to text/call directly.

---

## 8. Admin Panel — Key UI Details

- **Login:** clean centered card, brown/gold branding consistent with public site (this is still Woodcastle's admin, worth feeling like the same product, not a generic dashboard template)
- **Image upload component (shared across product, category, and offer forms):** a single reusable drag-and-drop component implementing the exact flow in backend spec section 5b — (1) call `POST /api/admin/upload/signature` to get a signed upload token, (2) upload the file directly from the browser to Cloudinary's API using that token, (3) receive back a `secure_url`, (4) save that URL into the form's `images`/`imageUrl`/`bannerImage` field. Build this component once, reuse it everywhere images are needed — don't reimplement per form. Multi-image forms (products) support reordering, with the first image treated as primary; single-image forms (categories, offers) just need the one upload slot. Show progress during upload and the resulting image as soon as it's available.
- **Rich text editor (shared across the blog editor and the product description field):** Tiptap, with a toolbar exposing bold, italic, text color (a small palette matching the brown/gold theme, not a full color picker — keeps content on-brand), bullet and numbered lists, and table insertion/editing. Build one editor component, reuse it in both places — don't fork it per form. The blog editor additionally shows a live SEO preview of how the metaTitle/metaDescription will look in a Google search result snippet.
- **Rendering rich text on the public site:** product and blog pages render the stored HTML via `dangerouslySetInnerHTML` (React's normal way to render trusted HTML) — since the backend sanitizes this content on the way out (backend spec section 5a2), the frontend doesn't need to sanitize again, but should still style the rendered output (tables, lists, colored text) to match the site's typography rather than showing raw browser-default table/list styling
- **Duplicate product name detection:** on the product create form (and edit, if the name or category changes), once both a name is typed and a subcategory is selected, debounce and call `GET /api/admin/products/check-duplicate-name?name=&categoryId=` (backend spec section 5a3). If `isDuplicate: true`, show a confirmation dialog: *"A product named '[name]' already exists in [subcategory]. Suggested name: '[suggestedName]'."* with **Confirm** and **Keep My Name** buttons. Tapping **Confirm** overwrites the name field with `suggestedName` and the slug field (if visible/editable) with `suggestedSlug`; **Keep My Name** just closes the dialog and leaves the admin's typed name untouched — they can still save it, but should see a brief inline note that this may need a unique name to save successfully, since the backend enforces slug uniqueness regardless of what the frontend suggested.
- **Enquiry inbox:** table view with status badges (new = gold, contacted = brown, closed = grey), click-through to detail view showing full enquiry + linked product (no WhatsApp delivery status shown, since sending happens on the customer's own device and isn't something the backend can confirm)
- **Offers:** title, description, discount text, and a **banner image upload** — same drag-and-drop, direct-to-Cloudinary signed upload widget used on the product form (not a paste-a-URL field), plus a start/end date picker so offers can be scheduled and auto-expire without the admin manually deactivating them
- **Delete actions:** every list view (products, categories, blog, offers) needs a Delete action that opens a confirmation modal ("Delete [item name]? This can't be undone.") before calling the DELETE endpoint — never delete on a single click. Category deletes specifically need a backend check: block or warn if the category still has products or subcategories attached, rather than silently orphaning them.
- **Bulk import:** an "Import from Sheet" button on `/admin/products` opens `/admin/products/import` — a drag-and-drop upload zone for the `.xlsx` template, a "Download Template" link for first-time users, then a preview table (rows to create in gold, rows to update in brown, error rows in red with the specific message) before a final "Confirm Import" button; matches the same brown/gold visual language as the rest of the admin panel, not a generic file-upload widget

---

## 9. What This Spec Deliberately Leaves Open

- Actual visual mockups/Figma — this document defines the system (colors, structure, components) an AI coding tool or designer can build from, but no pixel-level mockups exist yet. Worth building a couple of key page mockups (home, product page) before full build, to confirm the direction with the client early.
- Cart/checkout UI (Phase 2, once billing is scoped) — deliberately excluded even though the layout reference (GearO) includes it
- Wishlist/Compare functionality — present in the GearO reference's layout but not adopted, since neither is in the original requirements
- Furniture customisation UI (Phase 2)
- Animations (Phase 3) — Phase 1 should ship with clean, minimal transitions only (hover states, simple fades), not the animated experience planned for Phase 3
- Newsletter signup — mentioned as optional in section 3.7, not part of original requirements; confirm with client before building
- Multi-language support (not mentioned in requirements — flag if the client wants this later, since it affects the content model)
