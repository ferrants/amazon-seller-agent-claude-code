---
name: fba-inventory-risk-dashboard
description: Run an FBA inventory health check that surfaces at-risk SKUs alongside product names, inbound replenishment, reserved stock, and effective days of supply (post-inbound) — rendered as an interactive dashboard artifact. Trigger whenever the user asks about FBA inventory, stockout risk, days of supply, replenishment, inbound shipments, "what's running low", "what should I reorder", or wants any inventory health view — even if they don't say "dashboard". Also trigger for aged inventory questions — age tiers, aged inventory surcharges (AIS), long-term storage fees, sell-through of old stock, Historical Days of Supply, or low-inventory-level fee risk. Prefer this over a basic at-risk view whenever inbound context, product identification, or replenishment timing might matter. Also trigger to refresh a previously-built inventory view, or to "run the inventory check again". Works live through the Marketplace Ad Pros MCP tools (ask_selling_partner_report_analyst), or on inventory and sales reports the user uploads.
---

# FBA Inventory Risk Dashboard

<!-- map-onboarding:start -->
**Pick the mode before anything else.** This skill runs on live data through Marketplace Ad Pros (connected mode) or on reports the user uploads (manual mode):
- **The user uploaded a report or asks to use one:** manual mode. Read `references/manual-reports.md` and follow it; it replaces steps 1–3 below and governs wherever it differs from them. This applies even when the Marketplace Ad Pros tools are available.
- **`list_selling_partner_integrations` and `ask_selling_partner_report_analyst` are both available:** connected mode, the workflow below.
- **Only one of them is listed, or calls fail** with an authentication or "no integrations" error: the user already has an account. Send them to https://app.marketplaceadpros.com/integrations to connect or reconnect Seller Central, then refresh the MCP connector in their client. Don't suggest signing up again. Meanwhile they can upload a report instead.
- **No Marketplace Ad Pros tools at all:** say once that there are two ways to run this:
  - Upload an FBA inventory report from Seller Central. If it doesn't include recent units sold, add a sales report by SKU for the last 30 days.
  - Or connect Marketplace Ad Pros and the data is pulled for them every time. If they already have an account, they only need to add the MCP connector: https://marketplaceadpros.com/amazon-ads-mcp-server-for-claude/. Otherwise they can connect their Amazon account free at https://app.marketplaceadpros.com/signup?r=fHNraWxsLWZiYS1pbnZlbnRvcnktcmlzay1kYXNoYm9hcmR8c2tpbGxfbGluaw%3D%3D and then add the connector. Asking about their data through the MCP needs AI Connect ($10/week) or a higher plan.
- Name the report type only, never a menu path or exact column names: those change. The console's own help covers the current steps.
- Never claim to have pulled data without a tool call or an uploaded file.
<!-- map-onboarding:end -->

This skill takes the user from "how's my inventory?" to an interactive dashboard that shows every at-risk SKU with full pipeline context — current stock, reserved units, inbound replenishment, product names, and effective days of supply once inbound is counted.

The key insight this skill encodes: **fulfillable-only DOS dramatically overstates risk**. A SKU with 2 days of fulfillable stock and 900 units inbound is not a fire. A SKU with 5 days of fulfillable stock and zero inbound is. This skill surfaces both numbers so the user can act on the real picture.

## Workflow (connected mode)

Follow these steps in order. Don't skip the discovery steps — the analyst tool errors when account scoping is wrong.

### 1. Identify the account

Call `list_selling_partner_integrations` to get the user's SP integrations.

If exactly one integration is returned, proceed. If multiple, ask the user which one.

Then call `list_selling_partner_accounts` with the integration_id to get marketplace accounts. Each account is one marketplace (US, MX, BR, UK, DE, etc.).

**If multiple marketplaces exist, ask the user which one** — inventory is per-marketplace and you cannot meaningfully combine them. Use a tappable-options prompt (or a short numbered list if your client has no option buttons) with one option per marketplace. Default suggestion: US (typically the largest).

Save the chosen `account_id` (the UUID, NOT the marketplace_id like `ATVPDKIKX0DER`).

### 2. Run the at-risk query

Call `ask_selling_partner_report_analyst` with the account_id and this exact question framing:

> FBA at-risk inventory: top 50 SKUs where current fulfillable quantity is greater than 0 AND days of supply is less than 14. Use trailing 30-day average daily units sold as the run rate. For each SKU return: seller SKU, ASIN, current fulfillable quantity, avg daily units sold (last 30 days), and days of supply (fulfillable / avg daily). Exclude SKUs with zero stock and SKUs with zero sales over the last 30 days. Sort ascending by days of supply (most urgent first).

**Why this exact framing matters:** the analyst has been observed to error on overly long or comma-heavy questions. Keep the structure: filter description → run rate definition → columns → exclusions → sort. The phrase "FBA at-risk inventory" at the start helps it route correctly.

If the call errors, retry once with simpler phrasing:
> Top 50 FBA SKUs at risk of stockout in the next 14 days. For each, show seller SKU, ASIN, current fulfillable quantity, average daily units sold over the last 30 days, and days of supply. Sort by days of supply ascending. Exclude SKUs with zero sales and zero stock.

If it errors a second time, run a sanity-check query first ("How many FBA SKUs do I have with inventory data?") to confirm the analyst is responsive.

### 3. Enrich with titles, inbound, and reserved

Make a single combined enrichment call with the SKU/ASIN list from step 2. Pass both SKUs and ASINs to give the analyst flexibility on the join:

> For these N seller SKUs (list them) / ASINs (list them), return: seller SKU, ASIN, product title, afn-fulfillable-quantity, afn-reserved-quantity, afn-inbound-working-quantity, afn-inbound-shipped-quantity, afn-inbound-receiving-quantity, and total inbound (shipped + receiving). One row per SKU.

**Do not count afn-inbound-working-quantity as inbound.** A WORKING shipment plan is a draft — not shipped, not firm, and a new FBA inbound takes 1–3 weeks to receive. Counting it hides exactly the SKUs about to stock out. Mention large planned quantities in the headline instead ("476 units planned but not shipped").

A single combined call is intentional — earlier versions used two separate calls (one for titles, one for inbound) which works but burns extra query budget. If the combined call errors, fall back to two calls: titles first, then inbound. Do NOT try to combine the original at-risk query with this enrichment in a single call — the analyst tends to error on multi-table joins of that complexity.

The titles query often returns multiple rows per ASIN (one per variation SKU). Dedupe by ASIN, taking the first non-null title — Amazon's listing titles for variants of the same ASIN are usually identical.

### 4. Derive short product names

Amazon listing titles are heavily SEO-stuffed (often 200+ characters with brand names repeated 5 times). The dashboard needs a short, human-readable name. Apply this extraction:

1. Take everything before the first comma OR before the first " - " (em-dash, en-dash, and " – " count) — whichever appears first.
2. Strip leading "Official ", "Premium ", or shouting all-caps brand prefixes (e.g., "EXAMPLE BRAND NAME ").
3. Remove leading parenthetical pack indicators (e.g., "(3 Pack) Example Product Name Supplement" → "Example Product Name Supplement").
4. Pull the pack/count info from the trailing parenthetical (e.g., "(2 Pack)", "(60 Capsules)") into a separate `pack` field. If no parenthetical, leave pack empty or use a sensible default like "Pack".
5. Limit the short name to ~35 characters if possible — the dashboard cell will show the pack info separately and the full title is preserved as a hover tooltip.

Keep the full unmodified title in a `fullTitle` field on each row — the template uses it as a hover tooltip so the user can see the original Amazon listing text on demand.

### 5. Triage and headline finding

Before rendering, scan the enriched data and prepare a short headline. The triage must be inbound-aware:

- **Identify the highest-velocity at-risk SKU and check its inbound.** If it has substantial inbound (>14 days at the current run rate), call it out as "looks scary on fulfillable-only DOS, but already covered by inbound" so the user doesn't waste energy on a phantom fire.
- **List the actually-critical SKUs:** effective DOS < 2 AND inbound = 0. These are the genuine emergencies.
- **List the high-risk-no-coverage SKUs:** effective DOS 2–7 AND inbound = 0. Reorder candidates.
- **Flag reserved-quantity anomalies.** If any SKU shows reserved > 3× fulfillable, surface it specifically — this often signals stranded inventory, a stuck bulk order, or a listing-mapping bug. The template highlights this visually in amber but the narrative should name the SKU.
- **Look for same-product / different-pack clusters.** If two or more SKUs in the list share the same base product name (e.g., "Example Product Line 2-pack" + "Example Product Line 3-pack" + "Example Product Line 60-cap"), call out the category. Even if the hero pack has inbound, the variant packs often don't — that's a supplier pack-strategy gap worth surfacing.

Lead the response with this triage in 3–5 sentences before the artifact. The dashboard is interactive, but the headline is what the user actually needs to act on.

### 6. Render the dashboard artifact

Use the template at `assets/dashboard-template.jsx` as the starting point. Save the populated artifact to `/mnt/user-data/outputs/fba-inventory-risk.jsx` and present it with `present_files`.

**If you can't render artifacts** (no artifact support, no `present_files`, or no writable `/mnt/user-data/outputs` — e.g. in Claude Code), skip the template and the styling rules below. Present the same rows as a markdown table sorted the same way (SKU, effective days of supply, fulfillable/inbound units, daily run-rate and urgency tier), after the same headline triage. The analysis is the deliverable; the dashboard is the presentation.

To populate:

1. Read `assets/dashboard-template.jsx`.
2. Replace the `RAW` array with the enriched data rows. Each row needs: `sku`, `asin`, `name`, `pack`, `fulfillable`, `reserved`, `inbound`, `daily`, `dos`, `fullTitle`. Use raw numbers from the `data` field of the analyst responses, not the rounded display values from the answer text — those are formatted for humans and may have lost precision.
3. Replace the masthead values: `BRAND` (from the account's `brand` or `account_name` field), `MARKETPLACE` (from `country_code` formatted as "US Marketplace" etc.), `SNAPSHOT` (from `report_freshness.sp_fba_inventory.data_complete_through`, formatted as "YYYY-MM-DD · HH:MM UTC"), and `WINDOW` (the trailing-30-day window, e.g., "30D · 04-11 → 05-11"). Leave the source constants at their connected values: `SOURCE_LABEL = "Live"`, `SOURCE = "sp_fba_inventory · sp_listings · sp_orders"`, `RATE_DAYS = 30`, `INBOUND_KNOWN = true`.
4. Do not modify the styling, palette, fonts, or layout — those are part of the skill's design language. The aesthetic is editorial-financial: warm cream background, Instrument Serif display, Geist Mono for data, oxblood/amber/olive/forest urgency tiers. Generic-looking tables defeat the purpose of building this as a skill.

The template's effective-DOS computation, tiering (CRITICAL/HIGH/ELEVATED/SECURED), reserved-anomaly highlighting, and DOS-shift caption ("X.Xd w/o inbound" struck-through) are all handled by the template — no extra work needed beyond populating RAW correctly.

### 7. Offer next steps

After presenting the artifact, offer 1–2 follow-ups based on what the data shows. Don't list every option — pick what's actually useful:

- **If there are several genuine criticals with zero inbound:** offer to draft POs or reorder quantities. Note that this needs the user's lead time (PO to FBA check-in, in days) and optionally a service level / safety stock target.
- **If reserved anomalies were flagged:** offer to dig into Seller Central's stranded-inventory or reserved-detail reports for the affected SKU.
- **If same-product / different-pack clusters were found:** offer to pull the cluster's full pack-size lineup (including the non-at-risk packs) to assess whether the entire variation family needs replenishment.
- **If the picture is mostly secured by inbound:** offer to look at inbound-receiving lag (how long shipments are sitting in receiving vs. moving to fulfillable) to validate the assumed coverage isn't theoretical.

Do not offer all of these at once. Pick the most useful one or two.

## Variant queries

If the user asks for a different cut, adapt the at-risk query while keeping the structure tight:

**Already-stocked-out (lost sales right now):** Drop the `fulfillable > 0` filter; sort by `daily` desc instead of `dos` asc since DOS will all be 0. Inbound becomes the key column.

**Different time window (e.g., seasonal):** Replace "trailing 30-day" with "trailing 7-day" for hot-velocity products or "trailing 90-day" for stable lines. Be explicit about the window so the analyst doesn't pick its own. Update the `WINDOW` masthead value accordingly.

**Wider net (DOS < 30 instead of < 14):** Useful for medium-term planning. Update the at-risk query's threshold and update the "Stock > 0 · DOS < 14d" subtitle in the masthead.

## Aged inventory & surcharge exposure (sp_fba_inventory_planning, connected mode)

When the user asks about aged inventory, inventory age tiers, aged inventory surcharges (AIS),
long-term storage fees, Historical Days of Supply, or low-inventory-level fees, the analyst has a
dedicated report: **sp_fba_inventory_planning** (Amazon's FBA Inventory Planning snapshot). This is
the report stockout-only views can't answer from. Verified question framings (each resolves in a
single analyst step):

> Show me every SKU, how many units are sitting in each inventory age tier, and what it's costing me in aged inventory surcharges per tier and in total across all tiers. Sort by total surcharge descending.

> Estimate how long it'll take each SKU to sell through its aged inventory (181+ days old), based on recent sales velocity. Show the SKUs with the most aged units first.

> Call out any SKUs that aren't collecting aged inventory surcharges right now, but will be soon based on the average sell-through rate over the past 30+ days.

> Call out any SKUs that are under the minimum Historical Days of Supply, and any that are estimated to go under soon.

What the report carries per SKU: age tiers (0-30 through 456+ days — note Amazon's current tiers
are 366-455 and 456-plus, there is no single "365+" column), `quantity-to-be-charged-ais-<tier>`
and `estimated-ais-<tier>` dollar columns for tiers 181-210 through 456-plus, `sell-through`,
`days-of-supply`, `historical-days-of-supply` (plus short/long-term variants),
`fba-minimum-inventory-level`, `fba-inventory-level-health-status` (Healthy / Low stock /
Out of stock / Excess), low-inventory-level fee flags, `estimated-storage-cost-next-month`, and
recommended actions/removal quantities.

This report now retains daily history: each pull is one snapshot tagged with a `_loaded_at` load
timestamp, so it holds many days of rows per SKU. For a current aged-inventory / surcharge view,
take each SKU's most recent row before aggregating — `ROW_NUMBER() OVER (PARTITION BY sku
ORDER BY "_loaded_at" DESC) = 1`. Do NOT filter to a single global latest `_loaded_at`: a partial
latest pull would drop every SKU it omitted. And never `SUM` surcharge or storage across all rows
without the per-SKU-latest filter — that multiplies each SKU across every retained pull. To trend
aging over time instead, group by `_loaded_at`. (Amazon's `snapshot-date` is Amazon's own
generation date, not our load date.)

Triage guidance for the narrative: lead with the catalog-wide total surcharge per month and the
single worst SKU; separate "paying now" (any estimated-ais > 0) from "aging in soon" (units in the
91-180 tier that exceed ~3 months of t30 velocity); for fee-exempt sellers the
`Low stock` / `Out of stock` health status is the under-minimum signal, not the fee column.
Removal/liquidation candidates are SKUs whose estimated sell-through of aged units exceeds ~1 year.

Freshness for this report lives at `report_freshness.sp_fba_inventory_planning.data_complete_through`.

AWD warehouse inventory is NOT in this report — only FBA. AWD on-hand is in the `sp_awd_inventory`
report (one row per SKU per day since 2026-08-19; for current stock take each profile's latest
`snapshot_date`). For live AWD counts, call the `get_awd_inventory` tool: per-SKU AWD on-hand, inbound to AWD, and
`replenishment_quantity` (AWD→FBA transit, upstream of FBA inbound — don't double-count). Add AWD
on-hand to FBA totals for true on-hand and reorder math. If the seller isn't onboarded to AWD the
tool says so cleanly.

## Caveats to always surface

The data has known limitations. In manual mode, `references/manual-reports.md` says which of these change (the data is as of the report date):

- Connected mode: the snapshot is typically 3–4 hours stale (Amazon SP-API report cadence).
- Fulfillable and inbound quantities are FBA only. MFN inventory is not included — use `get_selling_partner_listings` if the user needs the merchant-fulfilled side.
- Inbound assumes on-time arrival. If shipments sit in receiving at FCs for days, the "effective DOS" overstates real coverage.
- "Average daily units" is the 30-day mean. For SKUs with spiky demand (Prime Day items, gifting categories near holidays) this understates real near-term risk.
- Reserved units are shown but not subtracted from fulfillable in DOS calcs — reserved represents pending customer orders that will be deducted within 1–3 days, so it's a near-term overhang the dashboard surfaces but doesn't double-count.

The template footer already includes these caveats. Mention them in the response narrative when relevant.

## Common pitfalls

**Wrong account_id type.** The analyst expects the UUID from `list_selling_partner_accounts`, not the Amazon `marketplace_id` (like `ATVPDKIKX0DER`). If the analyst returns an empty or scope-mismatched result, double-check this.

**Skipping marketplace selection.** If the user has US + MX + BR and you don't ask, you'll silently run against whichever marketplace happens to be first in the list. Always confirm.

**Combining everything into one analyst call.** The analyst is reliable on the lean at-risk query and reliable on the enrichment query, but unreliable on a single mega-query that does both. Keep them separate.

**Dumping the raw Amazon listing title into the table.** Amazon titles are 200+ characters of SEO. The dashboard cell will look broken. Always extract a short name (see step 4).

**Skipping the headline.** A 25-row interactive dashboard is great, but if you don't lead with "the SKU that looks worst on fulfillable-only DOS is actually fine because of inbound" or "these 8 SKUs have zero inbound and need POs cut this week", the user has to do the triage themselves. The skill's value is doing both.

**Treating fulfillable-only DOS as the action signal.** This is the trap the original at-risk dashboard fell into. Always tier and sort by effective DOS (fulfillable + inbound) / daily. The template defaults to this — don't override it.
