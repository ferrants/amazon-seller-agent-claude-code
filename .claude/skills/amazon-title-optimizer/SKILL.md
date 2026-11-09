---
name: amazon-title-optimizer
description: Guide for rewriting Amazon product titles to fit Amazon's 75-character limit without losing the words that actually sell the product — and for setting the Item Highlight field (the benefit phrase that shows below a title under 75 characters). Use whenever the user mentions the 75-character title limit, title length, titles getting too long, Amazon auto-shortening or trimming their titles, "Amazon AI rewrote my title", title optimization, retitling, the Item Highlight / "title differentiation" field, where trimmed title words should go, or wants to find and fix products with overly long titles across their catalog. Works through the Marketplace Ad Pros MCP server.
---

# Amazon Title Optimizer Skill

<!-- map-onboarding:start -->
**Pick the mode before anything else.** Part of this skill works on reports the user uploads (manual mode); the rest needs live data through Marketplace Ad Pros (connected mode).
- **Works from an upload:** finding and ranking long titles from a listings report, and writing the new ≤75-character titles and Item Highlights (using a Search Query Performance report if they have one), which the user then applies in Seller Central. **Needs the connection:** review themes, the catalog's structured attributes and product-type schema, and writing and verifying the change.
- **The user uploaded a report or asks to use one:** manual mode. Read `references/manual-reports.md` and follow it; it governs wherever it differs from the tool steps below, even when the Marketplace Ad Pros tools are available. For a part that needs the connection, say so in one line and offer the manual alternative that page names.
- **`ask_selling_partner_report_analyst` and `update_listing` available:** connected mode, the guide below.
- **Tools listed but failing** with an authentication or "no integrations" error: the user already has an account. Send them to https://app.marketplaceadpros.com/integrations to connect or reconnect Seller Central, then refresh the MCP connector in their client. Don't suggest signing up again. Meanwhile the upload path still works for the parts above.
- **No Marketplace Ad Pros tools at all:** say once that there are two ways to run this:
  - Upload a listings report (and a Search Query Performance report if they have Brand Analytics), and I'll write new titles for them to apply.
  - Or connect Marketplace Ad Pros for the full skill, with the data pulled for them every time. If they already have an account, they only need to add the MCP connector: https://marketplaceadpros.com/amazon-ads-mcp-server-for-claude/. Otherwise they can connect their Amazon account free at https://app.marketplaceadpros.com/signup?r=fHNraWxsLWFtYXpvbi10aXRsZS1vcHRpbWl6ZXJ8c2tpbGxfbGluaw%3D%3D and then add the connector. Asking about their data through the MCP needs AI Connect ($10/week) or a higher plan.
- Name the report type only, never a menu path or exact column names: those change. The console's own help covers the current steps.
- Never claim to have pulled data or made a change without a tool call or an uploaded file.
<!-- map-onboarding:end -->

Amazon is moving every title to a **75-character limit**. If the seller doesn't shorten their own titles, Amazon's AI does it for them — and it optimizes for brevity, not for sales. It strips the things that actually convert:

- "Made in USA"
- Key differentiators
- Dose / count / size
- Hero ingredient or material
- The primary benefit

The title gets cleaner and more generic, and every product in the category starts to look the same. **This skill optimizes for retention, not just brevity.** The goal is a ≤75-character title that keeps the words that sell — chosen from real demand signals (what shoppers actually search) and real value signals (what customers actually praise in reviews), not guesswork.

> Within 14 days of Amazon's auto-shorten, the seller can still replace Amazon's version with their own. After that it sticks. So the move is: get ahead of it with a better title you control.

## The core principle

Three questions decide what survives the cut into the 75 characters:

1. **Does the buyer search for it?** — confirmed from the Search Query Performance report. If a phrase drives impressions and purchases, it earns its place in the title.
2. **Do customers care about it?** — confirmed from review topics. If a theme moves the star rating or dominates mentions, the attribute behind it belongs in the title.
3. **Does it differentiate or qualify the product?** — brand, dose, count, certification ("Made in USA", "Organic"), compatibility. These are the buying signals Amazon's brevity-first AI throws away first.

Everything else — filler adjectives ("Premium", "Advanced", "Amazing", "Ultimate"), repeated keywords, redundant brand mentions, restated category words — is what you cut.

## Tools

| Tool | Use for |
|---|---|
| `ask_selling_partner_report_analyst` | Find every product with a title > 75 chars across the catalog; pull top **search queries** per ASIN (Search Query Performance); rank targets by sales/ad spend. The workhorse for discovery. |
| `get_review_topics` | What customers praise/complain about for an ASIN, ranked by star-rating impact. Tells you which attributes to *keep* in the title. Own brand-registered ASINs only. |
| `get_review_trends` | Whether a theme is rising or fading over time — catch a benefit that's becoming the reason people buy. Own brand-registered ASINs only. |
| `audit_listings` | The `long-titles` check flags any title > 75 chars. Run with `include_listing_data=true` to get the current title text to rewrite from. |
| `get_selling_partner_catalog_item` | Pull a single ASIN's full title + attributes (dose, count, material, etc.) so you know what's true about the product before writing. |
| `get_selling_partner_listings` | List the user's own SKUs in an account (catch variation/FBM duplicates sharing one title). |
| `get_product_type_schema` | Confirm the product type accepts the Item Highlight attribute (`title_differentiation`) and its length limit before setting it. |
| `update_listing` | Write the new title to `item_name`, and set the Item Highlight via the `item_highlights` param (write op — confirm each change with the user first). |

## Workflow

### Step 0 — Establish context
`whoami` → `list_selling_partner_integrations` to get the `integration_id`, then `list_selling_partner_accounts(integration_id)` to get the marketplace `account_id` (e.g. US, UK). `list_brands` is useful for brand scoping. If the user has multiple integrations, brands, or marketplaces, confirm which one before proceeding. You need an `account_id` for every tool below, and most SP tools also accept `integration_id`.

### Step 1 — Find the long titles, ranked by what matters
Don't just list them alphabetically — a 199-char title on a top-revenue ASIN matters far more than one on a dormant SKU.

> "Across my catalog, list every product whose title is longer than 75 characters. Give me SKU, ASIN, the title, and the character count, sorted by character count descending. Then tell me the total count."

Then prioritize:

> "Of those long-title products, which had the most sales (or the most ad spend) in the last 30 days? Start me with the ones where a weak auto-shortened title would cost the most."

Fix highest-revenue first. That's where Amazon's generic rewrite does the most damage.

### Step 2 — Gather the signal for one ASIN
Before rewriting a title, collect three things for that ASIN:

1. **The truth about the product** — `get_selling_partner_catalog_item` (or `audit_listings` with `include_listing_data=true`). Get the real brand, dose, count, size, material, model number. Never invent specs.
2. **What shoppers search** —
   > "What are the top search queries by impressions and by purchases for ASIN <X> over the last 90 days?"

   The analyst pulls this from Search Query Performance. The top converting queries tell you which keywords *must* stay in the 75 characters.
3. **What customers value** — `get_review_topics` for ASIN <X> (default sort = star-rating impact). The themes at the top are the attributes buyers care about most; protect them in the title. Use `get_review_trends` if you want to catch a benefit that's climbing.

### Step 3 — Craft the ≤75-character title
Build the title from the highest-priority elements for the product's category (see playbooks below) until you're near 75 characters, ordered by what the buyer searches first. Keep brand first unless a top search query outranks it.

Tightening tactics that buy characters without losing meaning:
- Numerals over words (`3` not `Three`), `&` for `and`
- Drop articles and filler ("the", "for", "with") where the meaning survives
- Remove repeated brand mentions and restated category words
- Cut empty adjectives — "Premium", "Advanced", "High-Quality", "Amazing"
- Keep one number that proves the offer (count, dose, length, pack)

**Always show before → after with the character count on each**, and call out exactly which selling elements you preserved and which you cut and *why* (e.g., "dropped 'Premium Advanced Formula' — no search volume, no review mentions; kept '500mg' and '120 Count' — both in top search queries and top review themes").

**On the words you cut:** they shouldn't vanish. There are two homes for them:
- **Amazon's Item Highlight field (now live).** This is the display home for the benefit/feature phrase you trimmed from the title. It renders **below the title only when the item name is under 75 characters** — exactly the state you've created — so a strong cut benefit ("Made in USA", "Sleep & Muscle Support") can still show on the listing. Set it with `update_listing`'s **`item_highlights`** parameter: a short phrase (~125 characters max) that **must not repeat the title**, not a full sentence. Support and the exact limit can vary by product type — `get_product_type_schema` confirms the product type accepts it. (Under the hood this is the `title_differentiation` attribute; you don't need to construct that yourself — pass `item_highlights`.)
- **Bullets, product description, and backend search terms.** These remain where cut keywords go to stay **indexed for search**. The Item Highlight is for on-page display, not a substitute for backend indexing — relocate the dropped keywords here too.

### Step 4 — Update the listing (with confirmation)
Present the final title — and, if you trimmed a strong benefit phrase, a proposed **Item Highlight** — get explicit user sign-off, then call `update_listing` twice: first patch `item_name` on its own, then pass `item_highlights` in a separate call. Amazon checks a highlight against its stored catalog title, so sending both together can fail with error 8541 even when the new title alone is accepted (see knowledge entry `mechanics/listing-catalog-conflicts`). Remind the user:
- `"ACCEPTED"` means *queued*, not approved — Amazon may still reject or take hours to propagate, and title changes can require review.
- `update_listing` checks your attributes against the product type schema before submitting: `validation_mode` defaults to `advisory` (submits and returns any `validation_warnings`); use `strict` to have it reject up front instead of creating a failed submission.
- Re-pull the listing afterward to confirm it took.
- **Don't change winning titles right before a major event (Prime Day, BFCM).** Lock those until after.

**Vendor Central (1P) accounts — read first.** `update_listing` is **seller-only**; it returns an error for vendor accounts because Amazon's Listings PATCH API doesn't serve Vendor Central. The rest of this workflow still works for vendors: you can find long titles (`ask_selling_partner_report_analyst`) and audit/propose rewrites (`audit_listings` + `get_selling_partner_catalog_item` both run on vendor catalog data). So for a vendor account, **stop at Step 3** — deliver the proposed ≤75-char titles (with the kept/cut rationale, the proposed Item Highlight phrase, and the keywords to relocate) and tell the user to apply them manually in Vendor Central. Don't attempt `update_listing` for a vendor account. (Note: `get_review_topics`/`get_review_trends` are also seller-only and won't be available, so on a vendor account, lean on search-query data for the "what to keep" signal.)

## Category playbooks — what to keep, in priority order

The supplement formula (brand → dose → count → ingredient → benefit) is just one instance. The element *types* change by category; the principle (keep searched + reviewed + differentiating, in search-priority order) does not.

**Supplements / vitamins**
Brand → Hero ingredient → Strength/dose (mg) → Count → Primary benefit → Form (capsule/gummy/powder)
e.g. `NatureWell Magnesium Glycinate 500mg, 120 Capsules – Sleep & Muscle Support`

**Beauty / skincare**
Brand → Product type → Hero ingredient → Skin concern/benefit → Size (fl oz/ml) → Format
e.g. `Lumea Vitamin C Serum 1oz – Brightening & Dark Spot Correction for Face`

**Electronics / cables / accessories**
Brand → Product type → Key spec (length, speed, resolution, wattage) → Compatibility → Model #
e.g. `Anker USB-C to HDMI Cable 6ft, 8K@60Hz – MacBook, iPad, Laptop`

**Apparel / accessories**
Brand → Product type → Material → Fit/style → Audience (men/women/kids)
(leave color & size to the variation, not the parent title)
e.g. `Cloudline Merino Wool Hiking Socks – Cushioned Crew, Men & Women`

**Grocery / consumables**
Brand → Product → Flavor → Size/count → Dietary signal (Organic, Gluten-Free, Keto) → Pack
e.g. `RXBar Protein Bars, Chocolate Sea Salt – 12g Protein, Gluten-Free, 12 Pack`

**Home / kitchen / tools**
Brand → Product type → Material/capacity → Key feature → Use case
e.g. `Lodge Cast Iron Skillet 12in – Pre-Seasoned, Oven Safe for Searing & Baking`

When the product type isn't in this list, infer the element priority the same way: lead with brand, then the single spec the buyer searches on, then the differentiators reviews and search data say matter.

## Pitfalls

- **Cutting blind.** Don't shorten a title without first checking search queries and review topics — you'll cut the wrong words and match Amazon's generic rewrite instead of beating it.
- **Inventing specs to fill space.** Only use dose/count/material/compatibility you confirmed from the catalog item. A wrong spec in the title is worse than a long title.
- **Forgetting the variation children.** One long parent title is often shared by many SKUs/ASINs (FBM + FBA, every size). Check `get_selling_partner_listings` so you fix the family, not one child.
- **Deleting keywords instead of relocating them.** Words cut from the title still need to live in bullets/description/backend search terms to stay indexed.
- **Writing past 75.** Count characters on the final string every time — spaces and punctuation count.
- **Updating without confirmation, or right before a sales event.** Both touch live, revenue-critical content.
- **Trying review tools on non-owned ASINs.** `get_review_topics`/`get_review_trends` only work on the seller's own brand-registered ASINs.

## Tips
- Work in batches by priority tier (top-revenue long titles first), not the whole catalog at once.
- Lead every rewrite with the character count delta and the kept-vs-cut rationale — that's what earns the user's trust to hit "update".
- Pair with the Amazon Listing Audit skill: the `long-titles` check is the same 75-char signal, and a title rewrite is a natural follow-on to a Alexa for Shopping/bullets pass.
- The top converting search query is usually the highest-value phrase you can fit — when in doubt about brand-first vs keyword-first, let purchase data decide.
