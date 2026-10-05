# RACE Service — Customer Website

24/7 roadside assistance, towing and on-demand chauffeur services operated by
**Saiprahallad Services Pvt Ltd**, Bhubaneswar, Odisha.

- Live site: https://raceservice.in
- Helpline: **+91 8249475731** (24/7)

---

## Pages

| File | Purpose |
|---|---|
| `home.html` | Landing page: hero, about, services, how-it-works, coverage, pricing, reviews, FAQ |
| `service.html` | Full service catalogue with coverage areas and trust signals |
| `contact.html` | Contact cards (phone, email, office) plus the FAQ |
| `pricing.html` | Membership plans with benefit breakdowns |

Run locally:

```bash
python tools/server.py          # http://localhost:8085
```

---

## Why the stack looks unusual

This is a static capture of an Elementor/WordPress build, not a WordPress
install. There is no PHP, no database and no admin — every page is plain HTML
served as static files. Two consequences worth knowing before editing:

1. **The `tools/` scripts are one-shot migrations, not runtime code.** They are
   kept for provenance: each one documents exactly what was changed from the
   original capture and why, so a future change can be reasoned about rather
   than guessed at.
2. **Some WordPress plumbing is deliberately left inert.** Inline config blocks
   that pointed at the upstream demo install (`rest_url`, `ajaxurl`,
   `speculationrules`) were stripped because nothing here calls them. The
   remaining references inside `js/` config blobs are harmless and removing them
   would mean editing inline JavaScript for no rendered benefit.

## Asset layout

```
css/     51 stylesheets, local copies. Includes google-Rubik.css / google-Inter.css
         with the woff2 files resolved out of fonts/ so the page renders
         identically offline.
js/      43 scripts, local copies.
fonts/   84 woff2 files backing the two families above.
images/  139 assets. Photography is RACE-specific (race-*.png); icons are
         locally drawn single-colour glyphs (race-icon-*.png).
tools/   migration and QA scripts, plus the local server.
```

### Two CSS overrides exist on purpose

`css/clone-fidelity-fix.css` is injected last on every page. Elementor hides
animated widgets with `.elementor-invisible { visibility: hidden }` and reveals
them from `frontend.min.js`; that script is present but never completes its
init on a static host, so without the override every heading renders invisible.
The trade-off is that entrance animations do not play.

## SEO

Each page carries a researched title and description following
`[service] + [geo] + [differentiator] + [brand]`, with the phone number in the
description for mobile CTR. FAQ answers are phrased as search queries and open
with the answer, which is the format AI Overviews tend to cite.

Target geography: Bhubaneswar localities (Mancheswar, Patia,
Chandrasekharpur, Khandagiri, Old Town) and the NH-16 corridor towards Khordha
and Cuttack.

## Before publishing

- **Testimonials.** The three customer quotes on the homepage come from the
  client brief and carry real names and localities. Confirm written consent
  before this goes public.
- **Structured data.** No `Application/ld+json` is present yet.
  `AutomotiveBusiness` with `offers`, an `OfferCatalog` for the plans and a
  `FAQPage` block would be the next step.
- **Forms.** The contact page renders an empty MetaForm container; it displays
  a plugin placeholder and needs a real endpoint.
- **Phone links.** The helpline is plain text in several places where a
  `tel:` link would convert better.

## Licence

Private repository. © 2026 Saiprahallad Services Pvt Ltd.