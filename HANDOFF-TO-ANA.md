# Handoff notes for Ana — TRI website rebuild

This prototype is a **visual + content spec**, not a WordPress install. Below are the things Houzez/WPML must reproduce (or replace) when porting.

---

## 1. Languages: English + Spanish via WPML

The prototype currently renders both languages on every page using
`<span class="lang-en">…</span><span class="lang-es">…</span>` and a
JS toggle. **This pattern must NOT ship to production.** Instead:

- **EN** = default language, no prefix (e.g. `/about-us/`)
- **ES** = `/es/about-us/` (WPML default language-in-directory mode)
- Each language renders **one** language only, server-side
- Every page needs `<link rel="canonical">` (self) and
  `<link rel="alternate" hreflang="en/es/x-default">` pointing to counterparts —
  WPML handles this automatically once configured

**WPML setup to confirm:**
- Languages: English (default), Spanish
- Language URL format: "Different languages in directories"
- Hide language from URL for default language: YES
- SEO → "Don't duplicate canonical URL between languages": YES

Translation workflow: use ES copy from the prototype's `<span class="lang-es">`
content. Extract by search-replacing the pattern per page.

---

## 2. SEO tags already present — keep them

Each HTML page in the prototype has, before `</head>`:

- `<link rel="canonical">` pointing to the production URL
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
- Twitter Card tags
- JSON-LD `RealEstateAgent` Organization schema (identical on every page)
- JSON-LD `Residence` schema on each property page (name + description + image + url)

In WordPress, **Yoast or Rank Math will regenerate these** based on the post
title/excerpt/featured image. Just make sure the plugin is configured with:

- Organization schema enabled, populated with the TRI details from `index.html`
- OG defaults pointing to brand image + tagline
- Per-property: enable Product/Residence/RealEstateListing schema in Yoast if available,
  or leave Houzez's built-in schema on

---

## 3. Contact forms — 13 forms currently post to WhatsApp via JS

Every `<form data-wa-form>` in the prototype intercepts submit and opens
`wa.me/34659003377` with a prefilled message. Two options in WordPress:

**Option A (recommended):** keep the same pattern.
Install a lightweight script that hooks any form with `data-wa-form` — one
line of config per form. No backend needed, all leads land in Stazio's WhatsApp.

**Option B:** use Contact Form 7 or Gravity Forms with an email handler →
`teneriferesortinvest@gmail.com`. More standard but loses the WhatsApp
immediacy and adds another dashboard to check.

If keeping Option A, the fallback email (for no-JS users) should still be
the mailto link in the footer.

---

## 4. Assets to carry over

- **Fonts:** Fraunces + Archivo Black + EB Garamond + Inter + Caveat
  (all Google Fonts, preload declared in `<head>`)
- **Logo:** `img/logo-dark.png`
- **CSS:** `css/style.css` is the full brand v2 stylesheet (~3,200 lines) —
  can be loaded as-is via `wp_enqueue_style` from the child theme
- **JS:** `js/main.js` handles lang toggle, reel, lightbox, mobile drawer,
  form→WhatsApp. Everything except the lang toggle should carry over
  unchanged. The lang toggle gets deleted — WPML replaces it.

---

## 5. Image optimisation before upload

Photos on `teneriferesortinvest.es` currently average **37 MB per property
page** because they're unoptimised. Target for the new site:

- Resize everything to max 1800px wide
- JPEG quality 82 or WebP equivalent
- Result: ~150 KB per photo vs current 1–2 MB
- Install **ShortPixel** or **EWWW Image Optimizer** so uploads get
  converted + compressed + WebP-served automatically

This is the single biggest Core Web Vitals improvement available.

---

## 6. Plugins to drop

The existing live site runs Elementor + RevSlider + Instagram Feed + WPZoom
social icons + a dozen more. The new theme doesn't need any of them —
the prototype's HTML/CSS replaces all of it. **Drop them during the rebuild.**

Keep: Houzez (properties), WPML (languages), Yoast or Rank Math (SEO),
ShortPixel (images), a backup plugin.
