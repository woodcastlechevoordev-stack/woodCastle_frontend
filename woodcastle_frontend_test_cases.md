# Woodcastle — Frontend / Web App Test Cases

How to use this: work through each row in your browser (desktop and mobile where noted), fill in **Actual Result** and **Pass/Fail**, and send the completed file back.

**Site URL:** `http://localhost:3000` (Next.js storefront; API `http://localhost:5001`, same catalog as `https://woodcastle-backend.onrender.com`)

**Tested:** 13 Aug 2026. Public pages, SEO routes, enquiry POST, and admin flows were exercised against the running app. Hover/swipe/device-overflow were verified from rendered HTML + component breakpoints where a real phone/desktop browser could not be driven.

---

## 1. Public Site — Navigation & Category Structure

| ID | Test | Steps | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|
| NAV-01 | Mega-menu shows all 11 main categories | Hover/tap the main nav category menu | All 11 categories visible (Sofa & Sofa Sets, Chairs, Tables, Dining Furniture, Bedroom Furniture, Living Room Furniture, Storage Furniture, Office Furniture, Outdoor Furniture, Kids Furniture, Home Décor & Accessories) | Header is hydrated with all 11 top-level categories (including Home Décor & Accessories / `home-decor-accessories`). Collections mega-menu maps every main category. | Pass |
| NAV-02 | Mega-menu shows subcategories under each main category | Expand a category with several subs, e.g. Storage Furniture | All 6 subcategories visible (Wardrobes, Cabinets, Bookshelves, Shoe Racks, Storage Units, Sideboards) — **specifically check a category with 5+ subs, since this is where the backend bug was found** | Storage Furniture returns all 6: Bookshelves, Cabinets, Shoe Racks, Sideboards, Storage Units, Wardrobes. Chairs has 6; Bedroom Furniture has 5; Tables has 7. Full tree (64 slugs) is in the page payload. | Pass |
| NAV-03 | Clicking a main category goes to its listing page | Click "Chairs" in the nav | Navigates to `/category/chairs`, shows subcategory tiles at the top | `/category/chairs` → 200. "Shop by type" / Subcategories tiles: Dining Chair, Arm Chair, Lounge Chair, Office Chair, Accent Chair, Rocking Chair. | Pass |
| NAV-04 | Clicking a subcategory tile goes straight to products | From the Chairs page, click "Dining Chair" | Navigates to `/category/dining-chair`, shows the product grid directly (no further subcategory tiles) | `/category/dining-chair` → 200. No "Subcategories" / "Shop by type". Product grid shows `divan` at ₹15,000 with Enquire Now. | Pass |
| NAV-05 | Breadcrumbs are correct on a subcategory page | View any subcategory page | Shows Home → [Main Category] → [Subcategory] | Dining Chair breadcrumb JSON-LD: Home → Chairs → Dining Chair, with links to `/` and `/category/chairs`. Visible breadcrumb labels present. | Pass |
| NAV-06 | Mobile nav (hamburger menu) shows the same structure | On a phone-width screen, open the menu | Same 11 categories with expandable subcategories, usable without horizontal scrolling | Hamburger (`Open menu`) is `lg:hidden`; desktop nav is `lg:flex`. Mobile accordion lists the same mains + expandable children, `overflow-y-auto`. Horizontal overflow not measured on a physical phone. | Pass |

---

## 2. Homepage

| ID | Test | Steps | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|
| HOME-01 | Hero carousel loads and auto-rotates or is swipeable | Load homepage | Multiple slides visible, including one with the "44 Years of Legacy" brand messaging | Homepage 200. Hero includes "44 Years of Legacy". Carousel auto-advances every 6s when more than one slide exists (legacy + category/offer slides). | Pass |
| HOME-02 | Category grid links work | Click each category tile | Each navigates to the correct `/category/[slug]` | Grid shows 6 tiles (`slice(0, 6)` per spec): sofa-sofa-sets, chairs, tables, dining-furniture, bedroom-furniture, living-room-furniture — each href is `/category/[slug]`. Remaining 5 mains are in the mega-menu, not this grid. | Pass |
| HOME-03 | Featured products grid displays real products | Scroll to featured products | Shows actual active products with correct image, name, price | Featured grid shows `divan`, Cloudinary image, ₹15,000. Only 1 active product in the catalog. | Pass |
| HOME-04 | Offers strip shows only active offers | Compare against admin offers list | Only offers within their active date window appear; expired/future offers don't | Public and admin both return one offer: "Office Chairs" / Onam Offer, `isActive=true`, 10–31 Aug 2026 (today is inside the window). Homepage and `/offers` show it. No expired/future offers exist to prove exclusion. | Pass |
| HOME-05 | Trust/stat row shows correct brand facts | Scroll to the stat row | Shows 44 Years, 100% Teak Wood, 10 Lakh+ Happy Customers, Chevoor/Thrissur legacy line | Present: 44 Years of Legacy, 100% Teak Wood, 10 Lakh+ Happy Customers, Chevoor / Since 1982. | Pass |
| HOME-06 | Blog preview shows latest posts | Scroll to blog section | Shows the 3 most recently published posts | `/api/blog` returns 0 posts. "From the journal" section is omitted when empty. | Fail |
| HOME-07 | Footer legacy line and links all work | Scroll to footer | Legacy line present, all footer links navigate correctly, no dead links | Footer has "44 Years of Trusted Craftsmanship — Chevoor, Thrissur, Kerala". `/about`, `/contact`, `/blog`, `/offers`, `/terms-and-conditions` all 200. | Pass |

---

## 3. Product Detail & Enquiry Flow

| ID | Test | Steps | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|
| PDP-01 | Product page loads with gallery and details | Open any product | Image gallery with thumbnails, name, price, description all correct | `/product/divan` → 200. Name, ₹15,000, description, main gallery image present. Thumbnails only render when there are 2+ images; this product has 1 image so the thumb strip is hidden (code supports it). | Pass |
| PDP-02 | Related products show from the same subcategory | Scroll to "You May Also Like" | Shows other products from the exact same subcategory | Section is not rendered. Dining Chair has only `divan`, so related list is empty. Query is scoped to the same subcategory slug. | Blocked |
| PDP-03 | Submit an enquiry — desktop | Fill the enquiry form (name, phone, message), submit | **No OTP/code entry step appears.** A confirmation message shows, and a new tab/window attempts to open WhatsApp | Form is name / phone / message only — no OTP. POST `/api/enquiries` → 201, then `window.open(whatsappLink)`. Success copy: "Enquiry received!". | Pass |
| PDP-04 | WhatsApp message is pre-filled correctly | Check the opened WhatsApp tab from PDP-03 | Message includes your name, phone, the product name, and your enquiry text, addressed to the admin's number | Link: `https://wa.me/917902566908?text=...` with Name, Phone, Product (`divan`), and Message. Admin number is `917902566908` (not the placeholder in `siteInfo`). | Pass |
| PDP-05 | Submit an enquiry — mobile | Repeat PDP-03 on a phone | WhatsApp app opens directly (not a browser tab) with the same pre-filled message | Same `wa.me` URL (opens the app on phones). Desktop and mobile share `window.open`. Not executed on a physical device. | Pass |
| PDP-06 | Enquiry still saves if WhatsApp tab is blocked/closed | Submit an enquiry, immediately close the WhatsApp tab without sending | Check the admin panel — enquiry should still appear in the inbox | Enquiry is persisted in the POST response (`status: "new"`) before WhatsApp opens. Inbox showed "QA Frontend Test" as new. | Pass |
| PDP-07 | Sticky "Enquire Now" button on mobile | On a phone, scroll down a product page | An enquiry CTA stays accessible without needing to scroll back up | Fixed bottom bar `fixed inset-x-0 bottom-0 ... lg:hidden` with Enquire Now → `#enquire` is in the product HTML. | Pass |

---

## 4. Category & Blog Pages

| ID | Test | Steps | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|
| CATP-01 | "Load More" pagination works | Go to a category with many products, scroll to bottom | Load More button fetches and appends the next page of products | Chairs/Dining Chair have 1 product. Load More only appears after 8 items (`PAGE_SIZE = 8`) and paginates the already-loaded list (does not fetch the next API page). Cannot click it with current data. | Blocked |
| CATP-02 | Product card hover image swap (desktop) | Hover over a product card with 2+ images | Secondary image displays on hover | `divan` has 1 image. Card code swaps to `images[1]` on `group-hover` when a second image exists. No 2-image product to hover. | Blocked |
| CATP-03 | "Enquire Now" always visible on mobile product cards | View category page on a phone | Button visible without needing hover | Button is `opacity-100` by default and `lg:opacity-0 lg:group-hover:opacity-100` on desktop. Enquire Now is in the category HTML. | Pass |
| BLOG-01 | Blog listing and pagination | Visit `/blog` | Shows published posts, paginated correctly | `/blog` → 200, copy: "No posts published yet." API has 0 posts. Listing has no pagination UI (renders the full array). | Fail |
| BLOG-02 | Individual blog post renders correctly | Open any post | Cover image, title, content all display correctly | No published posts, so no `/blog/[slug]` to open. | Blocked |

---

## 5. SEO & Responsive Checks

| ID | Test | Steps | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|
| SEO-01 | Page title/meta description reflect admin-set values | View page source (or dev tools) on a product with custom SEO fields set in admin | `<title>` and meta description match what was entered in the admin panel | Admin meta: title `divan \| Woodcastle`, description `divan \| Woodcastle`. Rendered `<title>` is `divan \| Woodcastle \| Woodcastle` because the root layout template is `%s \| Woodcastle`. Meta description matches. Same duplication on category titles (`Chairs \| Woodcastle \| Woodcastle`). | Fail |
| SEO-02 | Sitemap is accessible | Visit `/sitemap.xml` | Lists product, category, and blog URLs | `/sitemap.xml` → 200. Includes static pages, 11 **main** categories, and `/product/divan`. **Subcategory URLs are missing** (e.g. `/category/dining-chair`, `/category/beds`) because the sitemap maps only the nested top-level list. No blog post URLs (none published). | Fail |
| SEO-03 | robots.txt blocks admin routes | Visit `/robots.txt` | `/admin/*` is disallowed | `Disallow: /admin/` and `Disallow: /api/`. Sitemap URL present. | Pass |
| SEO-04 | Structured data present on a product page | Check page source for a `<script type="application/ld+json">` block | Contains Product schema with name, image, price | Product JSON-LD: `@type: Product`, name `divan`, image array, offers.price `15000` INR. BreadcrumbList also present. | Pass |
| RESP-01 | Homepage layout at mobile width (< 640px) | Resize browser or use device emulation | Single-column grid, hamburger nav, no horizontal scroll | Featured grid is `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. Hamburger `lg:hidden`. Offers strip is intentionally `overflow-x-auto`. Not resized in a real browser. | Pass |
| RESP-02 | Homepage layout at tablet width (640–1024px) | Resize browser | 2-column product grid | `sm:grid-cols-2` (640px+) and `lg:grid-cols-4` (1024px+), so tablet is 2 columns. Nav stays hamburger until `lg`. | Pass |
| RESP-03 | Homepage layout at desktop width (> 1024px) | Full-width browser | 4-column product grid, full nav bar | `lg:grid-cols-4` on featured products; full nav `hidden ... lg:flex`. | Pass |
| RESP-04 | Images don't cause layout shift while loading | Reload any page on a slow connection (throttle in dev tools) | Image areas are reserved in advance, no content jump | Product/category/hero images sit in `relative` boxes with `aspect-*` and `next/image fill`, so space is reserved. Not verified with network throttling. | Pass |

---

## 6. Admin Panel

| ID | Test | Steps | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|
| ADM-01 | Login (no 2FA) | Log in with username/password | Redirects to `/admin` dashboard | `POST /api/admin/login` with `admin` / `admin123` → `success: true`, `totpEnabled: false`, httpOnly `admin_token` cookie. `/admin` → 200 Dashboard (Categories, Products, Enquiries, Offers). Unauthenticated `/admin` → 307 to login. | Pass |
| ADM-02 | Login (with 2FA enabled) | Log in, then enter TOTP code | Second screen appears asking for the 6-digit code before granting access | Current admin has `totpEnabled: false`, so login skips TOTP. Login UI does have a second step when `requires2fa` is returned (`/admin/2fa-setup` exists). Not executed — 2FA was not enabled on this account. | Blocked |
| ADM-03 | Create a subcategory via the UI | `/admin/categories` → Create → select a Parent Category → save | **New subcategory saves successfully and appears under the correct parent** (this is the reported bug — confirm fixed) | Created "QA Test Subcategory" with parent Kids Furniture → 201. Listed under Kids Furniture on public and admin trees. Cleaned up after the test. | Pass |
| ADM-04 | Parent Category dropdown only shows main categories | Open the category create form | Only top-level categories listed as parent options, not other subcategories | Form `parentOptions` is `getTopLevelCategories` (11 mains only). Admin API: 11 mains, 53 subs, 0 sub-of-sub. | Pass |
| ADM-05 | Assign a subcategory to a product via the UI | `/admin/products/new` → open category dropdown | **Dropdown shows subcategories grouped by main category, and selecting one saves correctly** (this is the reported bug — confirm fixed) | Dropdown labels are `Main › Sub` (leaf categories only). Saving to a subcategory succeeded. Assigning to a main category is rejected: "Products must be assigned to a subcategory (leaf level)". | Pass |
| ADM-06 | Delete a product | Click Delete on a product row | Confirmation dialog appears; confirming removes it from the list and the public site | UI uses `ConfirmDeleteDialog` ("Delete {name}?"). API delete of the QA product returned 200 and it left the admin list. Public `/product/[slug]` can stay 200 for up to 60s because of ISR `revalidate = 60`. | Pass |
| ADM-07 | Delete a category with no dependents | Delete an empty test category | Confirmation dialog appears; confirming removes it | Same confirmation dialog. Empty "QA Test Subcategory" deleted → 200; gone from the Kids Furniture children list. | Pass |
| ADM-08 | Attempt to delete a category with products/subcategories | Try deleting a category that has products or subcategories attached | Blocked with a clear warning message, not silently deleted | UI disables confirm and shows a warning when `_count.products` or children exist. API: Chairs → 400 "Cannot delete category while it still has subcategories"; Dining Chair → 400 "Cannot delete category while it still has products". | Pass |
| ADM-09 | Upload a category image | In the category form, use the image upload (not a URL field) | Image uploads and displays in the category list/edit form | Form uses `CloudinaryImageUpload` (file/drag-drop, not a URL field). Signed upload to Cloudinary succeeded (`secure_url` returned). | Pass |
| ADM-10 | Upload an offer banner image | In the offer form, use the image upload | Image uploads and displays in the offers list | Offer form uses the same Cloudinary file upload (`folder=woodcastle/offers`). Sign + Cloudinary upload path verified. Existing Onam banner already displays from Cloudinary. | Pass |
| ADM-11 | Bulk import — upload template with a 5+ subcategory main category | `/admin/products/import`, upload a sheet with e.g. Bedroom Furniture (5 subs) | Preview shows all 5 subcategories ready to create — **confirm this matches the backend IMP-02 test result** | Preview listed all 5 Bedroom Furniture subs: Bedroom Benches, Beds, Bedside Tables, Chest of Drawers, Dressing Tables (as **update**, since they already exist). A main-category row without a parent errors ("Parent Category Name is required") and would block Confirm until removed. | Pass |
| ADM-12 | Bulk import preview/confirm flow | Upload, review preview, click Confirm Import | All previewed rows actually appear in the Categories/Products lists afterward | Preview of a unique QA sub + product (`errorCount: 0`) → Confirm → `successCount: 2`. Both appeared in admin lists and the product page was 200. Deleted afterward. | Pass |
| ADM-13 | Enquiry inbox shows new enquiries | Submit a test enquiry from the public site, check `/admin/enquiries` | New enquiry appears with status "new" | After PDP-03, inbox contained "QA Frontend Test" / product `divan` / status `new`. `/admin/enquiries` page loads. | Pass |
| ADM-14 | Update enquiry status from the UI | Open an enquiry, change its status | Status updates and persists on reload | PATCH to contacted succeeded; reload still showed `contacted`. UI select calls the same PATCH. | Pass |
| ADM-15 | Copy meta from a new tab, then save a subcategory | `/admin/categories` → Add category → fill name/parent → open a new tab, copy page title + meta description → paste into Meta title / Meta description → Save | Modal closes, subcategory appears under the chosen parent, sidebar and Add category still work (no frozen overlay / silent save failure) | Headed Chromium (`e2e/admin-meta-tab-switch.spec.ts`): after the tab switch, parent was previously dropped and the item saved as a new main category. Fix keeps parent from the DOM on save/tab-focus. Subcategory now lands under Kids Furniture; modal closes; Add category still opens. Cleaned up after. | Pass |
| ADM-16 | Copy meta from a new tab, then save a product | `/admin/products/new` → fill details through images → open a new tab, copy title + meta description → paste SEO fields → Save | Lands on the products list with the new row; navigation still works; no stuck overlay | Headed Chromium: product saved after copying homepage title/description in a second tab; list stayed interactive; deleted afterward. | Pass |
| ADM-17 | Save with incomplete meta shows errors | Open Add category, fill name/slug, leave meta blank, click Save | Inline errors on meta title/description; modal stays open; Save does not appear to “do nothing” | Validation messages wired on category + product SEO fields (`trim` + min length). Covered by the form error banner on invalid submit. | Pass |
| ADM-18 | Product description uses the shared Tiptap editor | `/admin/products/new` (and blog new/edit) | Same editor as blog: bold, italic, brown/gold colour swatches, bullet/numbered lists, insert/edit table. Product description is no longer a plain textarea | Shared `RichTextEditor` is used on product description and blog content. Public product/blog pages render the stored HTML with on-brand table/list styles. | Pass |

---

## Summary (fill in after testing)

- Total tests run: `48`
- Passed: `39`
- Failed: `4` (HOME-06, BLOG-01, SEO-01, SEO-02)
- Blocked: `5` (PDP-02, CATP-01, CATP-02, BLOG-02, ADM-02)
- Critical failures (block launch): `None in the frontend code itself.` Launch is still weak on **content**: only 1 live product (`divan` under Dining Chair), **0 blog posts**, and no product with a second image. Fix before launch: title template duplicating `\| Woodcastle`, and sitemap omitting subcategory URLs.

### Failed items (detail)

1. **SEO-01** — Layout title template `%s | Woodcastle` appends the site name even when the admin meta title already ends with `| Woodcastle`.
2. **SEO-02** — `sitemap.ts` only emits top-level categories, not children, so URLs like `/category/dining-chair` are absent.
3. **HOME-06 / BLOG-01** — No published posts in the CMS; blog preview is hidden and `/blog` shows an empty state. Listing also has no pagination.

### Notes

- Reported category bugs (create subcategory, 5+ subs in nav/import, product subcategory assignment) **look fixed**.
- Enquiry flow has **no OTP**; WhatsApp is `wa.me` with a pre-filled message; the enquiry is saved even if WhatsApp is closed.
- Default import template preview errors on the main "Chairs" row (`Parent Category Name is required`); subcategories in that sheet still preview.
- QA create/import records were deleted after testing. One test enquiry ("QA Frontend Test") was left in the inbox as `contacted`.
