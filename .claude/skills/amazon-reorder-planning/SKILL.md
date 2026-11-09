---
name: amazon-reorder-planning
description: Guide for building reorder plans, replenishment recommendations, and PO drafts for Amazon FBA, AWD, and Vendor Central inventory using the Marketplace Ad Pros MCP server. Use whenever the user asks "what should I reorder", "when should I reorder X", talks about reorder points, safety stock, lead times, replenishment, purchase orders, AWD (Amazon Warehousing & Distribution) stock, vendor forecast vs inventory, or wants to coordinate ad spend with stock levels. Also use when the user asks Claude to draft a PO or work backwards from a desired in-stock date.
---

# Amazon Reorder Planning Skill

<!-- map-onboarding:start -->
**Pick the mode before anything else.** Part of this skill works on reports the user uploads (manual mode); the rest needs live data through Marketplace Ad Pros (connected mode).
- **Works from an upload:** FBA reorder math and a PO draft from an FBA inventory report plus sales by SKU, with the lead time and safety stock the user gives. **Needs the connection:** AWD stock and replenishment, Vendor Central forecasts and inventory, and coordinating reorders with ad spend.
- **The user uploaded a report or asks to use one:** manual mode. Read `references/manual-reports.md` and follow it; it governs wherever it differs from the tool steps below, even when the Marketplace Ad Pros tools are available. For a part that needs the connection, say so in one line and offer the manual alternative that page names.
- **`ask_selling_partner_report_analyst` and `get_selling_partner_inventory` available:** connected mode, the guide below.
- **Tools listed but failing** with an authentication or "no integrations" error: the user already has an account. Send them to https://app.marketplaceadpros.com/integrations to connect or reconnect Seller Central, then refresh the MCP connector in their client. Don't suggest signing up again. Meanwhile the upload path still works for the parts above.
- **No Marketplace Ad Pros tools at all:** say once that there are two ways to run this:
  - Upload an FBA inventory report and, if it has no recent units sold, a sales report by SKU, plus their lead time; I'll work out what to reorder.
  - Or connect Marketplace Ad Pros for the full skill, with the data pulled for them every time. If they already have an account, they only need to add the MCP connector: https://marketplaceadpros.com/amazon-ads-mcp-server-for-claude/. Otherwise they can connect their Amazon account free at https://app.marketplaceadpros.com/signup?r=fHNraWxsLWFtYXpvbi1yZW9yZGVyLXBsYW5uaW5nfHNraWxsX2xpbms%3D and then add the connector. Asking about their data through the MCP needs AI Connect ($10/week) or a higher plan.
- Name the report type only, never a menu path or exact column names: those change. The console's own help covers the current steps.
- Never claim to have pulled data or made a change without a tool call or an uploaded file.
<!-- map-onboarding:end -->

This skill turns inventory and sales data into actionable reorder decisions: what to buy, how much, and when. It works for both FBA (Seller Central) and Vendor Central inventory and emphasizes that reorder math depends on inputs only the user knows (lead times, target service level, cost per PO).

> **About artifacts:** Reorder plans are best delivered as text or compact tables — they're decisions, not dashboards. If the user wants an interactive view of inventory state instead of a reorder decision, the FBA Inventory Risk Dashboard skill is the right tool — point them at it. See `references/dashboard-pointers.md` for context on when to suggest that skill instead of building anything yourself. Do not produce React artifacts from this skill.

## Tools

| Tool | Use for |
|---|---|
| `ask_selling_partner_report_analyst` | Headline workhorse. Run rate, days of supply, sell-through, vendor sales, vendor forecast — anything backed by report data. |
| `get_selling_partner_inventory` | Live FBA inventory snapshot (fulfillable, inbound, reserved). Use for current-state quantities. **FBA only — AWD units are not in this tool; use `get_awd_inventory` (live) or the `sp_awd_inventory` report (daily history).** |
| `get_awd_inventory` | Live AWD (Amazon Warehousing & Distribution) warehouse inventory per SKU: on-hand at AWD, inbound to AWD, and AWD→FBA transit. Call this for every FBA reorder plan — if the seller isn't onboarded to AWD the tool says so cleanly and you move on. |
| `get_awd_replenishment_orders` | AWD→FBA replenishment order detail, including `distribution_ineligible_reasons` — why a SKU isn't flowing from AWD to FBA. Use when FBA is short but AWD shows stock. |
| `get_selling_partner_listings` | List the user's SKUs in an account (e.g., to pin which SKUs to plan for). |
| `list_selling_partner_integrations` / `list_selling_partner_accounts` | Always step 1: confirm which integration and which marketplace. Reorder planning is per-marketplace; never combine across marketplaces. |

## Inputs the user must supply

Reorder math is not derivable from Amazon data alone. Before producing a recommendation, ask the user for:

1. **Lead time (days)** — from PO placement to FBA check-in (or to Amazon receipt for Vendor). Often 30-90 days for international supply chains, 7-30 for domestic / 3PL.
2. **Target service level / safety stock approach** — most users want one of:
   - "I want X days of safety stock" (simple buffer)
   - "I want a 95% / 97.5% / 99% in-stock probability" (statistical, needs demand variability)
3. **Reorder horizon** — "what should I order *this month*" vs "what's my reorder schedule for the next 90 days"
4. **MOQ / case pack** (optional) — minimum order quantity from the supplier and the case-pack size. Round recommendations to the nearest MOQ.
5. **Cost per PO** (optional) — only relevant if you're doing EOQ-style optimization to balance ordering cost vs holding cost. Most users don't have this; skip unless asked.

If the user hasn't provided any of these, ask up front. Don't fabricate defaults — wrong defaults waste their cash on the wrong order size.

## The math (keep it transparent)

Show the math in your output so the user can audit it. The base reorder model:

```
lead-time demand = avg daily units * lead time (days)
safety stock     = (user's safety target, in units or days)
reorder point    = lead-time demand + safety stock
order quantity   = (target days of supply * avg daily units) - on-hand - inbound
```

Where:
- `avg daily units` comes from `ask_selling_partner_report_analyst` — typically a trailing 30-day average; use 60 or 90 days for stable lines, 7-14 for hot/seasonal SKUs. Be explicit about which window you used.
- `on-hand` = `fulfillable` from `get_selling_partner_inventory` **plus** `total_onhand_quantity` from `get_awd_inventory` (FBA sellers), or `sellableOnHandUnits` from `sp_vendor_inventory` (Vendor — vendor accounts have no AWD).
- `inbound` for FBA = `inbound_working + inbound_shipped + inbound_receiving` from `get_selling_partner_inventory` **plus** `total_inbound_quantity` (inbound to AWD) from `get_awd_inventory`. **All three FBA fields matter** — `inbound_working` is units committed to a shipment that hasn't shipped yet; dropping it overstates stockout risk and triggers unnecessary reorders. For Vendor, use `openPurchaseOrderUnits` from `sp_vendor_inventory`.
- `replenishment_quantity` from `get_awd_inventory` is AWD→FBA transit, upstream of FBA `inbound_working` — do NOT add it as a separate term; those units surface in FBA inbound once Amazon books the shipment, and adding both double-counts. It's still worth showing as its own column so the user sees stock already moving toward FBA.

AWD is a US-only Seller Central program scoped to the whole integration — the same AWD numbers come back regardless of which marketplace account anchors the call, so only fold AWD into the US marketplace plan. If the seller isn't onboarded to AWD, `get_awd_inventory` returns a clean "not onboarded" message — call it unconditionally for FBA plans and drop the AWD terms when it says so.

State the formulas in the response so the user can sanity-check. A reorder recommendation without visible math is a black box they can't trust with real money.

## Common workflows

### "What should I reorder this month?" (FBA)

> "For account <X>, list SKUs where (`fulfillable + inbound_working + inbound_shipped + inbound_receiving`) divided by trailing-30-day avg daily units is less than `lead_time_days + safety_stock_days`. For each, return seller SKU, ASIN, fulfillable, working/shipped/receiving inbound (sum these into a `total_inbound` column), avg daily (30d), days of cover, and recommended order quantity to bring days of cover up to `(lead time + safety stock + target horizon)`. Sort by days of cover ascending."

Substitute the user's actual `lead_time_days`, `safety_stock_days`, and `target horizon`. Lead with the SKU most at risk.

Then call `get_awd_inventory` and net AWD on-hand + AWD inbound out of each recommended order quantity. A SKU that looks 40 days short on FBA-only numbers may have those 40 days already sitting in an AWD warehouse — recommending a PO for units the seller already owns wastes their cash. If AWD shows stock but FBA keeps running dry, check `get_awd_replenishment_orders` for `distribution_ineligible_reasons` before recommending any reorder — the fix is usually unblocking replenishment, not buying more.

### Vendor Central forecast vs on-hand

For Vendor Central, the relevant question is "does Amazon's forecast exceed what they're holding?" Amazon places POs based on its forecast — the gap is the reorder signal:

> "Using `sp_vendor_forecasting` and `sp_vendor_inventory`, find ASINs where Amazon's mean forecast for the next 4 weeks exceeds `sellableOnHandUnits + openPurchaseOrderUnits`. Return asin, mean forecast (4w), `sellableOnHandUnits`, `openPurchaseOrderUnits`, gap, and `weeksOfCover`."

Vendor reorders are pulled by Amazon, not pushed by you — but knowing the gap tells you when to expect the next PO and whether you can fulfill it.

### Replenishment + ad coordination

This is the workflow that justifies pairing this skill with the Amazon Ads skills. Don't push spend toward SKUs that are about to stockout — and don't dial back ads on healthy SKUs:

> "Cross-reference my Sponsored Products spend (last 7 days) with FBA fulfillable quantity and days of supply. Flag any SKU where days of supply is below (lead time + safety) AND ad spend is above $50/week — those need either a stock-aware bid pull or an inventory transfer. Flag the inverse too: SKUs with healthy stock and low ad spend that could absorb more budget."

Output should be two short tables: "**Pull back / Pause ads**" and "**Push more ads**", each with the supporting numbers.

### PO draft

When the user wants a draft PO (typically off the back of a reorder plan):

Render a simple table:

| SKU | ASIN | Cases | Units | Notes |
|-----|------|-------|-------|-------|
| ... | ... | ... | ... | "Round-up to MOQ of 200" / "Tight — consider air freight" |

Include a one-line summary of total units and total cases. Don't generate prices unless the user supplied a price list — guessing wholesale cost from retail price is unreliable.

### Vendor replenishment timing

Vendor sellers can't push reorders, but they can warn Amazon's planners. If a forecast gap is large enough:

> "Show me ASINs where the 4-week forecast exceeds total available inventory by more than 50%. These are candidates for outreach to Amazon's vendor manager — production or shipping needs to ramp before the next PO comes in."

## Pitfalls

- **Combining marketplaces.** Reorder planning is per-marketplace (US != MX != UK). Always confirm which marketplace the user wants. Inventory pooling across marketplaces is rare and the user has to opt in to it.
- **Using a single demand window for all SKUs.** Stable lines (electronics, household goods) read well at 60-90 days. Hot or seasonal SKUs (gifting, summer goods) need 7-14 day windows so you don't under-order during a ramp.
- **Ignoring inbound.** A SKU at 5 days of fulfillable supply but 30 days of inbound on the way is fine — don't recommend an emergency reorder. Always net out inbound when computing days of cover.
- **Ignoring AWD.** AWD units appear in NO FBA report and not in `get_selling_partner_inventory` — for an AWD seller, FBA-only math understates on-hand and over-recommends order quantities. Always call `get_awd_inventory` for FBA plans (it fails cleanly if the seller isn't onboarded). And don't double-count: `replenishment_quantity` (AWD→FBA transit) flows into FBA inbound — count that pipeline once.
- **Reorder math without lead time.** Without a lead time, there's no reorder point. Don't proceed with a default — ask.
- **Glossing over the math.** Reorder recommendations involve real cash. Show the formulas and the inputs so the user can audit and adjust.
- **Assuming Vendor and Seller workflows are the same.** Vendor inventory is Amazon's; you don't push reorders, you respond to forecast gaps. Seller inventory is yours; you do push.

## Tips

- For new SKUs without 30 days of sales history, lean on the catalog's category run-rate or ask the user for a planning estimate. Don't extrapolate from 5 days of data — you'll either over-order on a launch spike or under-order on a slow start.
- Days of supply lower than lead time means you're already late. Flag these as "express / air freight candidates" so the user knows the standard reorder won't catch the gap.
- Pair with the FBA Inventory Risk Dashboard skill when the user wants to *see* the at-risk picture before deciding what to reorder. This skill answers "what to do"; that one answers "what's the situation".
- Ad spend coordination is a high-leverage cross-skill move that most agencies miss. If the user has both ads and inventory data flowing, the replenishment + ad coordination workflow consistently surfaces wasted spend and missed budget headroom.
