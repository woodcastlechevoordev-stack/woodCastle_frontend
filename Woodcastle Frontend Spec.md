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
- **Main header row**: logo (center or left), primary nav with category **mega-menu dropdown** — showing Woodcastle's actual 11 main categories (Sofa & Sofa Sets, Chairs, Tables, Dining Furniture, Bedroom Furniture, Living Room Furniture, Storage Furniture, Office Furniture, Outdoor Furniture, Kids Furniture, Home Décor & Accessories), each expanding to its subcategories on hover/tap (matching GearO's dropdown-with-thumbnails style), search icon, and an "Enquire Now" quick-access icon/button in place of GearO's wishlist/cart icons
- Mobile: hamburger menu opening a full-screen/off-canvas nav, same category structure collapsed into an accordion

### 3.2 Homepage Section Order

1. **Hero carousel** — multi-slide banner (product/category imagery, headline, short line, one CTA button linking to a category); one slide anchors on the brand positioning itself — "44 Years of Legacy · Kerala's Best Furniture" — rather than only product imagery
2. **Category grid** — image tile per category (5–6 tiles), matching GearO's "Browse Categories" banner grid; links to `/category/[slug]`
3. **Featured products grid** — "Our Picks For You" equivalent (e.g. "Featured Furniture"): product cards in a 4-column desktop grid, pulling `isActive` products, most recent or manually curated
4. **Large lookbook-style banner** — one big lifestyle image with 1-2 product callouts overlaid, linking to product detail pages
5. **Offers strip** — active items from `/api/offers`, styled as a banner row (replaces GearO's discount-badge pattern, since per-product sale pricing isn't in Phase 1 scope)
6. **Signature collections** — numbered list + hover-image tiles (GearO's "Discover Our Signature Interior Collections" pattern), linking to categories
7. **Testimonials** — simple curated quote cards (customer name, short quote); since there's no review/rating system in scope, this is **static content hardcoded in the frontend**, not admin-editable and not backed by a new database model — avoids adding a review/testimonial-management feature that wasn't requested
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
- No wishlist heart icon, no compare icon, no discount badge (since per-product sale pricing isn't modeled yet)

### 3.5 Product Detail Page (`/product/[slug]`)

- Left: image gallery with thumbnail strip (GearO's "Product Thumbnails" layout) — main image + clickable thumbnails, matching the reference's gallery pattern
- Right: product name, price, short description, key details (material/dimensions if provided), then the **enquiry form** in place of GearO's Add to Cart / quantity selector / Buy It Now block
- Below the fold: full description, then a "You May Also Like" row (related products from the same category) — reusing GearO's related-products pattern, sourced from the same `categoryId`

### 3.6 Blog Pages

- `/blog`: grid layout matching GearO's "Blog Grid" — image, category tag, date, author, title, excerpt
- `/blog/[slug]`: single-column article layout with a large cover image header

### 3.7 Footer

- Top row: brand stat row (see 3.2.10 / 3.8)
- Multi-column footer: **Information** (About, Blog, Store Location if applicable), **Customer Services** (Contact Us, Terms & Conditions), and a **contact block** (phone, email/WhatsApp)
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



## 4. Site Structure & Pages

### Public Pages

| Route | Purpose | SEO Notes |
|---|---|---|
| `/` | Home — see section 3.2 for full section order | Primary keyword target ("wood furniture [city/region]"); JSON-LD `Organization` schema |
| `/category/[slug]` | Category listing — see section 3.3 | Dynamic `metaTitle`/`metaDescription` from backend; JSON-LD `BreadcrumbList` |
| `/product/[slug]` | Product detail — see section 3.5 | JSON-LD `Product` schema (name, image, description, price); this is the money page for SEO |
| `/about` | About Us — 44-year brand history, Thrissur Chevoor origin story, 100% teak wood commitment (see 3.8) | Long-form content block (SEO value) |
| `/contact` | Contact Us — address, phone, map embed, contact form | JSON-LD `LocalBusiness` schema if there's a physical store |
| `/blog` | Blog listing — see section 3.6 | Paginated, `metaTitle`/`metaDescription` per listing |
| `/blog/[slug]` | Blog post — see section 3.6 | JSON-LD `Article` schema |
| `/offers` | Active offers/promotions page | Pulls from `/api/offers` |
| `/terms-and-conditions` | Terms & Conditions | Static content page |

### Admin Panel

| Route | Purpose |
|---|---|
| `/admin/login` | Username + password, then TOTP code screen if 2FA enabled |
| `/admin/2fa-setup` | QR code display + confirmation, for enabling Google Authenticator |
| `/admin` | Dashboard — recent enquiries count, quick links |
| `/admin/products` | Product list, search/filter, **Edit and Delete action per row** (Delete opens a confirmation dialog before calling the DELETE endpoint) |
| `/admin/products/new`, `/admin/products/[id]/edit` | Product form: name, description, price, category, images (drag-drop upload to Cloudinary), SEO fields (metaTitle/metaDescription) |
| `/admin/categories` | Category list + create/edit modal — **includes image upload** (same drag-and-drop, direct-to-Cloudinary signed upload widget as the product form, not a paste-a-URL field), plus name, parent category selector, and SEO fields. **Delete action per row** with confirmation — deleting a category with products or subcategories attached should warn the admin and block the delete until those are reassigned or removed |
| `/admin/products/import` | Bulk import — upload the .xlsx template, review a preview of changes/errors, confirm |
| `/admin/blog` | Blog post list, **Edit and Delete action per row** |
| `/admin/blog/new`, `/admin/blog/[id]/edit` | Rich text editor (e.g. Tiptap) for post content, cover image upload, SEO fields |
| `/admin/offers` | Offers list + create/edit (banner image, discount text, active window) |
| `/admin/enquiries` | Enquiry inbox — filterable by status (new/contacted/closed), click to view full details and mark status |
| `/admin/settings` | Change password, enable/disable 2FA |

**Domain note:** this lives at `yourdomain.com/admin` — since it's the same Next.js app, this is just a route group (`app/admin/`) with its own layout, separate from the public site's layout, protected by a middleware check on the admin JWT cookie.

---

## 5. SEO Implementation Checklist

- Use Next.js `generateMetadata()` per route, populated from the backend's `metaTitle`/`metaDescription` fields
- `sitemap.xml` — generate dynamically via `app/sitemap.ts`, pulling all product/category/blog slugs from the backend at build/revalidate time
- `robots.txt` — allow all public routes, disallow `/admin/*`
- Canonical URLs on every page
- JSON-LD structured data: `Organization` (home), `Product` (product pages), `BreadcrumbList` (category/product), `Article` (blog posts), `LocalBusiness` (contact, if applicable)
- Open Graph + Twitter Card meta tags on every page, using product/blog images where relevant
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
- **Product form image upload:** drag-and-drop multi-image upload with reordering (first image = primary listing image), progress indicators, upload directly to Cloudinary from the browser (signed upload) to avoid routing large files through your own server
- **Blog editor:** Tiptap or similar rich text editor, with a live SEO preview showing how the metaTitle/metaDescription will look in a Google search result snippet
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
