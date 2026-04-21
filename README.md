# TRI — Static Website Preview

Working prototype of the main TRI site.

- **Design**: Olivia Harper structural pattern + Brand v2 tokens (cream paper, ink, warm brown; Fraunces / Archivo Black / EB Garamond / Inter / Caveat)
- **Build target**: static HTML/CSS/JS on GitHub Pages for rapid iteration
- **Migration target**: once design locked, we port to WordPress / Elementor child theme

## Preview locally

Open `index.html` directly in Safari/Chrome:
```
open "/Users/tinomachristi/Desktop/TRI/CLAUDE/website-rebuild/03_build/static-preview/index.html"
```

OR run a tiny Python server (works better with web fonts + CORS):
```
cd "/Users/tinomachristi/Desktop/TRI/CLAUDE/website-rebuild/03_build/static-preview"
python3 -m http.server 8000
# then open http://localhost:8000
```

## What's in this prototype

Sections built on the home page:
1. **Nav** — logo left, menu + language toggle + contact CTA
2. **Hero** — three stacked Archivo Black keywords (`Rooted. Crafted. Considered.`) + editorial headline + sub + scroll cue
3. **Approach** — short philosophy statement + hammer line
4. **Properties grid** — 3 placeholder property cards (same hero image for now)
5. **Projects section** — Villa Arizona + Villa Bali flagship cards
6. **About** — Stazio portrait + founder story + two-generations hammer line
7. **Contact** — CTA with WhatsApp + email buttons (dark ink background)
8. **Footer** — 4-column with nav, contact, social, legal

## What's NOT yet built (roadmap)

- [ ] Properties listing page (`/properties`) with filter UI
- [ ] Individual property detail template (`/properties/[slug]`)
- [ ] Projects page (`/projects`)
- [ ] About page (`/about`)
- [ ] Contact page (`/contact`)
- [ ] Video hero swap (Villa Bali drone, needs compression to ~20MB)
- [ ] German + Italian language strings
- [ ] Real property photos per card
- [ ] WhatsApp pre-filled messages per property
- [ ] Sticky nav scroll behaviour refinement
- [ ] Mobile nav hamburger drawer
- [ ] AVIF/WebP versions of images
- [ ] Favicons, og:image, schema.org JSON-LD

## How to iterate

1. Tino opens the preview on phone / desktop
2. Tino sends feedback ("hero keywords are wrong, make them X", "too much white space", "swap the approach and properties order")
3. Claude edits `index.html` / `style.css` / `js/main.js` in place
4. Tino refreshes, repeats

Same loop that built Villa Arizona.

## Deploy to GitHub Pages (when ready)

```
cd /Users/tinomachristi/Desktop/TRI/CLAUDE/website-rebuild/03_build/static-preview
git init
git add .
git commit -m "Initial prototype — home page, Olivia Harper structure + Brand v2 tokens"
# create empty repo on GitHub first, e.g. teneriferesortinvest/tri-website
git remote add origin https://github.com/teneriferesortinvest/tri-website.git
git branch -M main
git push -u origin main
# then enable Pages in repo Settings → Pages → source = main branch, /(root)
```

Public URL will be `https://teneriferesortinvest.github.io/tri-website/`.
