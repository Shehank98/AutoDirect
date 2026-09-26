AutoDirect imports Japanese auction cars into Sri Lanka. The brand should feel like a **trusted auction insider**: precise like an inspection sheet, warm like a local showroom. Every screen answers "what exactly am I buying, and what happens next?"

## Content fundamentals

- **Voice:** plain, candid, specific. Speak as "we" to "you". Prefer numbers to adjectives: "30–45 days from LC to delivery", "100% refundable deposit", not "fast" or "hassle-free".
- **Casing:** sentence case for headings, buttons and nav ("Request a quote", "Our stock"). UPPERCASE only via the `label` style.
- **Buttons are verbs:** "Place proxy bid", "Show 6 vehicles", "Get a valuation". State counts in the button when you know them.
- **Terms:** keep trade terms (LC, FOB, CIF, B/L, chassis code, auction grade) and link to the Glossary the first time on a page.
- **Money:** `LKR 14.85M` in cards (`AD.format.lkr`), `LKR 14,850,000` on detail pages; auction bids in yen `¥1,340,000` with "≈ LKR" beside them.
- **Errors say how to fix:** "Use a Sri Lankan mobile, e.g. 077 123 4567."
- No emoji. No exclamation marks outside success confirmations.

## Visual foundations

**Colour.** Three brand colours, each with one job:
- `brand` (harbour green) — the AutoDirect colour: primary buttons, links, active nav, selected chips, best-value marks.
- `accent` (hanko vermilion) — *auction only*: bid buttons, live pulses, countdowns, the grade seal, damage codes. If it isn't about bidding, it isn't vermilion. Errors use `danger`, never `accent`.
- `highlight` (lot-tag yellow) — lot numbers, "New arrival", the compare counter and selected compare state; text on it is always `ink-on-highlight`.
- Grounds: `surface-100` page, `surface-200` cards, `surface-300` wells and tinted sections, `surface-inverse` for the footer, compare tray, loan result and admin sidebar (near-black in both themes; text `ink-inverse`).
- Text: `ink`, and `ink-muted` for secondary copy (≥5.7:1 on `surface-100`/`surface-200` in both themes). Hairlines `line`; control borders `line-strong` (≥3:1).
- Status colours (`success`, `warning`, `danger`, `info`) always travel with a word and an icon — use `StatusBadge`.
- Two themes: **Daylight** (warm auction-paper `surface-100`) and **Night Auction** (graphite). Brand and accent lighten at night and take dark `on-brand` / `on-accent` text.

**Type.** Three families:
- `display` — Bricolage Grotesque, for `display-xl` (home headline only), `display-l` page titles, prices and grade numerals.
- `sans` — Instrument Sans for all UI and reading text (`heading-1…3`, `body-l`, `body`, `body-s`, `label`).
- `mono` — JetBrains Mono for anything a buyer might copy or compare: chassis codes, refs, lot numbers, countdowns, bid amounts.

**Space & shape.** 4px base (`space-1` … `space-8`). Cards and panels use `radius-l` (18px), controls `radius-m` (10px), badges `radius-s`, chips and grade seals `radius-pill`. Page gutter 24px desktop, 16px mobile; sections 80px apart (48px mobile).

**Signature elements.**
- **The grade seal** (`GradeSeal`) — a tilted double-ring hanko in `accent` on every vehicle photo. It is the one decorative flourish; don't add others.
- **The lot tag** (`LotTag`) — notched yellow tag, mono number, only on live lots.
- **Dashed spec rules** inside cards echo the ruled boxes of an auction sheet.
- The hero carries a faint 48px sheet grid fading in from the right; nowhere else.

**Elevation & motion.** Cards rest on a hairline border, rising to `shadow-2` with a 2px lift on hover. Menus, the compare tray and dialogs use `shadow-2`. Transitions: 140ms for hover/press/toggles, 240ms for panels. Live-auction pulses are the only looping motion and stop under `prefers-reduced-motion`.

**Focus.** Every interactive element shows a solid 2px `focus` ring (= `accent`) with 2px offset — ≥3:1 on all surfaces in both themes.

**Imagery.** Real auction-floor photos only (see the Photography group), 4:3, cover-cropped. A car with no photo yet shows the striped "Photos after inspection" placeholder — never a stock or borrowed image.

## Iconography

A custom line set in `AD.Icon` — 24px grid, 1.75 stroke, round caps, `currentColor`. Icons sit beside text at 15–18px; icon-only buttons carry an `aria-label`. The 直 in the logo seal is typographic (a system Mincho face), not an icon.

## Logo

`AD.Logo` — a vermilion 直 ("direct/straight") seal plus "Auto**Direct**" in Bricolage Grotesque, "Direct" in `brand` (in `highlight` on dark bands). It is set in type; there is no separate image file yet. Minimum 16px; clear space = the seal's width.

## Feature map (old site → components)

| Old site | New components |
| --- | --- |
| Home (search, featured, why us, how to buy, brands) | `HomePage`, `HeroSearch`, `VehicleCard`, `ProcessSteps`, `Testimonials`, `SiteFooter` |
| Our stock + filters | `StockBrowser`, `VehicleCard`, `CompareTray` |
| Vehicle profile (gallery, features, quote form, loan calculator, similar) | `VehiclePage`, `VehicleGallery`, `SpecSheet`, `InquiryForm`, `LoanCalculator` |
| Compare | `CompareTable` |
| Live auction + auction inquiry | `AuctionLotCard`, `AuctionRequestForm` |
| How to read auction sheet | `AuctionSheetDecoder` |
| How to buy · Vocabulary | `ProcessSteps` · `Glossary` |
| Login · Register · Password recovery | `AuthCard` |
| My account · My inquiries · Live auction request · Profile | `AccountDashboard`, `OrderTracker` |
| Contact · Sell your car | `ContactPanel` |
| Admin: vehicles, lookups, customers, inquiries, newsletters, users, permissions, email settings | `AdminConsole` |
| Newsletter subscribe | `SiteFooter` |

Build with `window.AD` (React 18). Sample data lives in `AD.data`; replace it with your API.
