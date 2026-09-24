# Harrison Heating & Plumbing — ORVIA Web Demonstration

Production-quality fictional trade website demonstration for ORVIA Web.

## Purpose

The public experience demonstrates a strong local trade website. The working Job Desk demonstrates the operational handoff:

Customer fills out website → enquiry appears in business app → business can act on it.

Harrison Heating & Plumbing is fictional. The build deliberately avoids fake registrations, fake review-platform scores, fake registration numbers and any action that could contact a real person.

## Stack

- Semantic HTML5
- Modern CSS
- Minimal vanilla JavaScript
- Browser `sessionStorage` for isolated demonstration records
- Vercel-ready static deployment

No database, payment service or external messaging service is used.

## Local development

From `apps/trade`:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Demo data behaviour

Submitted form data is written to `sessionStorage` under `hhp-demo-enquiries`.

- It exists only in the visitor's browser session.
- It is not emailed or texted.
- It is not submitted to a fictional business.
- Image bytes are not stored. The demo saves only file names and counts for the dashboard display.
- Closing the browser session clears the records automatically.
- The Settings screen provides a manual clear button.

Demo quotes are stored in `sessionStorage` under `hhp-demo-quotes`.

## Environment variables

None are required for this implementation. `.env.example` is included for future integration work.

## Vercel setup

Monorepo target:

- Repository: `ORVIA-Oversight/orvia-web-showcase`
- Root directory: `apps/trade`
- Framework preset: Other / static
- Build command: none
- Output directory: `.`

Custom domain target:

`trade.web.orvia.org.uk`

Configure the domain in Vercel and add the DNS record Vercel requests at the DNS provider for `orvia.org.uk`.

## Supabase

Not required for the public demo. If persistent demo data is added later, use per-session isolation, expiry and server-side controls. Never expose a service-role key client-side.

## Indexing

The site is deliberately `noindex, nofollow`; `robots.txt` disallows crawling because Harrison is fictional.

## Phase 2 refinement

This package includes the Phase 2 showcase refinement requested for the Harrison trade demo. It retains the original working customer-to-Job-Desk flow and adds photographic demonstration imagery, responsive image `srcset`, a custom South Yorkshire diagram, accessible gallery lightbox with previous/next and swipe support, richer postcode demonstration, photo preview/removal in the enquiry form, quote-attachment feedback, mobile Job Desk bottom navigation, and the ORVIA Web workflow differentiator.

See `IMAGE-CREDITS.md` for demonstration image provenance. The images are not presented as Harrison customer projects.
