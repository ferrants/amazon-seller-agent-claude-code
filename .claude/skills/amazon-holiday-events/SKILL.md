---
name: amazon-holiday-events
description: Playbook for Amazon sales events — Prime Day, Prime Big Deal Days, Black Friday / Cyber Monday, and the holiday season. Use when preparing for a major sales event, building an event countdown or readiness plan, deciding event budget/bid strategy, or running the post-event analysis ("how did I do on Prime Day / Black Friday vs a normal week?"). Covers the full prep → run → analyze arc through the Marketplace Ad Pros MCP tools.
---

# Amazon Seasonal & Holiday Events

<!-- map-onboarding:start -->
**Pick the mode before anything else.** Part of this skill works on reports the user uploads (manual mode); the rest needs live data through Marketplace Ad Pros (connected mode).
- **Works from an upload:** the prep countdown (no data needed) and the post-event review from daily campaign reports and a Business Report by date covering the event and baseline days. **Needs the connection:** scheduled rules and campaign changes, inventory and listing work through the tools, DSP results, and account history (what was new for the event).
- **The user uploaded a report or asks to use one:** manual mode. Read `references/manual-reports.md` and follow it; it governs wherever it differs from the tool steps below, even when the Marketplace Ad Pros tools are available. For a part that needs the connection, say so in one line and offer the manual alternative that page names.
- **`ask_report_analyst` available:** connected mode, the guide below.
- **Tools listed but failing** with an authentication or "no integrations" error: the user already has an account. Send them to https://app.marketplaceadpros.com/integrations to connect or reconnect Amazon Ads (and Seller Central for total sales), then refresh the MCP connector in their client. Don't suggest signing up again. Meanwhile the upload path still works for the parts above.
- **No Marketplace Ad Pros tools at all:** say once that there are two ways to run this:
  - For a post-event review, upload daily campaign reports for each ad type they ran and a Business Report by date covering the event and the baseline weeks.
  - Or connect Marketplace Ad Pros for the full skill, with the data pulled for them every time. If they already have an account, they only need to add the MCP connector: https://marketplaceadpros.com/amazon-ads-mcp-server-for-claude/. Otherwise they can connect their Amazon account free at https://app.marketplaceadpros.com/signup?r=fHNraWxsLWFtYXpvbi1ob2xpZGF5LWV2ZW50c3xza2lsbF9saW5r and then add the connector. Asking about their data through the MCP needs AI Connect ($10/week) or a higher plan.
- Name the report type only, never a menu path or exact column names: those change. The console's own help covers the current steps.
- Never claim to have pulled data or made a change without a tool call or an uploaded file.
<!-- map-onboarding:end -->

Use this to prepare for, run, and measure a major Amazon sales event — **Prime Day, Prime Big Deal Days,
Black Friday / Cyber Monday, or the holiday season** — through the Marketplace Ad Pros MCP tools.

Two ideas drive everything below:

1. **The event is won in the weeks before it, not on the day.** The advertisers who win show up prepared —
   inventory in, deals submitted, catalog locked, campaigns already out of the learning phase. The ones who
   scramble on day one get outbid. *Typical pattern: about 1 in 4 brands do WORSE than a normal week during
   a big event — the difference is preparation.*
2. **Measure on total sales, not just ACOS.** A sales event lifts organic and branded demand, not just the
   ad click. Judge it on total (Seller Central) sales and TACoS, or you'll under-credit the channel that
   drove it.

> **Dates:** Amazon's exact holiday **FBA inbound cutoffs** and **deal-submission windows** move every year.
> Confirm the current dates against Amazon's own announcements (Seller Central / the event's help page)
> before you commit to a plan — don't rely on last year's calendar.

---

> **Making changes:** `create_resources`, `update_resources`, `delete_resources` and automation-rule tools change live campaigns on Amazon. Before any write, show the user exactly what will change (resource, old → new value) and get an explicit yes.

## Part 1 — The Prep Countdown

Work backward from the event. The lead times below are typical; confirm the exact cutoffs for the year.

### ~8 weeks out — inventory & deals (the hard deadlines)
Nothing else matters if you stock out or miss the deal window.

* **Inventory / days-of-supply** — make sure you'll have cover for the surge *and* clear Amazon's holiday
  inbound cutoff. Check fulfillable vs effective days-of-supply and inbound/AWD pipeline. → Hand off to the
  **FBA Inventory Risk** and **Amazon Reorder Planning** skills to size the reorder and flag stockout risk.
* **Deals** — Lightning Deals and Best Deals have submission deadlines weeks ahead (for Prime Big Deal Days
  2026 the US window closed about two weeks out). Decide which ASINs get a deal and get them in before the
  window closes. Prime Exclusive Discounts and coupons are shorter-lead and can usually still be created in
  the final week, but approval time varies — don't leave them to the last two days.

### ~4 weeks out — lock the catalog & creative
Traffic can't fix a weak listing, and you don't want to be editing hero products mid-event.

* **Listings** — audit titles, bullets, images, and A+ for the products you'll push. → Hand off to the
  **Amazon Listing Audit** and **Amazon Title Optimizer** skills. Lock winners early — *don't retitle a
  strong performer right before the event.*
* **Creative** — refresh Sponsored Brands / video / storefront assets now so moderation clears in time.

### ~3 weeks out — build the ad plan
* **Get new campaigns & products live now** — new campaigns and ASINs need time to exit the **learning
  phase** before the traffic spike. Launch them 2–3 weeks out, not on the day. → For net-new products, use
  the **Amazon Product Launch** skill.
* **Find your winners** — pull the keywords, targets, and ASINs with real conversion history (e.g. ≥2 orders
  in the last 30 days at healthy ACOS) with `ask_report_analyst` / `run_report_sql`. These get the aggressive
  budgets and bids.
* **Cut waste before peak CPCs** — run a wasted-spend sweep; anything with meaningful clicks and no orders
  becomes a negative exact. → The **Amazon Ads Optimization** skill has the five-pillar framework, bid-to-value
  method, and wasted-spend workflow.
* **Raise floor bids** (~25% on ranking terms) so you don't fall off the page as competition heats up.

### ~1 week out — pre-stage the automation & pick a mode
Set it and forget it so you're not glued to the console on the day.

* **Schedule budget lifts for the event window** on your top performers — create `sp_budget_rules` /
  `sb_budget_rules` / `sd_budget_rules` (SCHEDULE, date-ranged to the event) via `create_resources`, with the
  campaign IDs auto-associated. Times use the profile's timezone.
* **Auto-scale the winners** — add `sp_optimization_rules` (PERFORMANCE, e.g. +25% bid when ACOS < target).
  Native rules only *increase*; use `update_resources` for decreases.
* **Pick your mode** and set expectations on ACOS:
  * **All-Gas / No-Brakes** — open budget headroom widely and lift bids on ranking terms, accepting higher ACOS
    to grab share and rank.
  * **Profit-Only** — hold bids, raise budgets only on already-efficient campaigns.
  * **Hybrid** — All-Gas on heroes, Profit-Only elsewhere.
  * Rule of thumb: "Best" set → up to 3× budget *headroom*; "Good" set → up to 2×; the rest stay normal. Lift
    bids only on ranking terms. This is cap headroom, not a spend target: on Prime Day 2026, brands that raised
    budget 20%+ saw the same median lift as brands that held it (see Typical patterns below).

---

## Part 2 — Run the Event

* **Lock budgets, not bids.** Let budgets absorb the volume; the scheduled rules do the lifting. Save bid
  changes for ranking terms only.
* **Raise budgets on top performers first** — your top ~20% of campaigns should never cap out. Use Amazon's
  Out-of-Budget filter and re-check midday. Re-allocate from the bottom 80%.
* **Trust Business Reports for real-time data** — the ad console lags on event days. Ask the analyst for
  intraday spend/sales rather than reading stale console numbers. (For hourly Sponsored Products data, see the
  **Amazon Marketing Stream** playbook.)
* **Don't chase every spike.** The plan is the plan — resist re-bidding the whole account mid-event.

---

## Part 3 — The Post-Event Analysis

Measure what happened and what drove it. On your own account, absolute numbers are fine.

### 1. Define the windows
Compare the **event window** to a **matched-weekday baseline** — the *same weekdays* from ~2 weeks before the
event (not the immediate week prior, which is a lead-in ramp). Compare them as **per-day averages** so a short
event is comparable to a longer baseline. Work one marketplace / currency at a time.

### 2. Per-channel performance (`run_report_sql` or `ask_report_analyst`)
Tag each day into `event` vs `baseline`, `GROUP BY` the window, and divide by the day count. Watch the
per-report column differences:

* **Sponsored Products** — `sponsored_products_campaigns`: `cost`, `sales14d`, `impressions`, `clicks`,
  `purchases14d`, `campaignBudgetAmount`.
* **Sponsored Brands** — `sponsored_brands_campaigns`: `cost`, **`sales` / `purchases` (no `14d` suffix)**,
  `newToBrandSales`.
* **Sponsored Display** — `sponsored_display_campaigns`: **`cost` and `sales` are integers — CAST to DOUBLE**,
  and SD mixes `costType` (CPC vs vCPM) so **don't report SD CPC / CPM** — read spend, sales, impressions,
  and new-to-brand only.
* Compute per-day spend/sales/impressions plus ACOS, CPC, CTR, CVR, CPM, and NTB share.

### 3. Total sales + the halo (Seller Central)
`ask_selling_partner_report_analyst` for **`sp_sales_traffic`** — daily ordered product sales, sessions, units,
event vs baseline. Then:

* **TACoS** = total ad spend ÷ total sales (a sales event often *improves* TACoS even as ACOS rises).
* **Ad share of sales** = ad-attributed sales ÷ total sales. If total sales grow faster than ad sales, that's
  the **halo** — the event lifted organic demand, not just the click.

### 4. DSP (if you run it)
DSP isn't in `run_report_sql` — ask `ask_report_analyst` for the `dsp_campaign_performance` report. It uses
**14-day attribution** and is impression/CPM-led — **omit DSP CPC** (clicks are tiny). Lead with impressions,
CPM, sales, purchases, detail-page views, ROAS, and new-to-brand. (See the **Amazon DSP** skill for depth.)

### 5. What actions drove it (prep vs during)
* **Budget change** — avg daily total budget = `SUM(campaignBudgetAmount) ÷ days` per window. Note spend can
  jump *without* a budget increase — event demand often just fills the budgets you already had.
* **New campaigns / products** — first-seen date (`MIN(date)`) per `campaignId`
  (`sponsored_products_campaigns`) and per `advertisedAsin` (`sponsored_products_product_ads`); count those
  that first appeared in the prep or event window.

### Ask like
* "Compare my Prime Day ad performance to the matched weekdays two weeks earlier, by channel — spend, sales,
  ACOS, CPC per day."
* "During the event, did my total (Seller Central) sales grow faster than my ad sales? What was my TACoS vs
  baseline?"
* "Which of my campaigns or products were new for the event, and did I raise any budgets going in?"

---

## Typical patterns (guidance, not guarantees)

From aggregate advertiser behavior on a recent major event — use these as a sanity check, not a target. Your
result depends on your category, prep, and inventory.

* **~75% of brands spent more, but only ~14% raised their budget 20%+** (about half actually cut budget) —
  most extra spend came from demand filling existing budgets. Raising budget showed no automatic sales-lift
  advantage.
* **Median total sales rose ~+37% vs ad sales ~+30%** — total outran ad sales (the halo).
* **Median CPC rose ~+10%**; ACOS was roughly flat-to-slightly-up. Auctions get more competitive, not
  runaway.
* **Sponsored Display was the exception** — the median advertiser *cut* SD (~−17%) even as SD efficiency
  improved. Decide deliberately; don't cut a channel that's working for you.
* **Category matters** — leaders (Electronics, Home & Kitchen, Baby, Automotive) leaned in hard (+50–80%);
  quieter categories (e.g. Office Products) barely moved. Benchmark against *your* category, not the average.

## Caveats
* **Confirm Amazon's exact FBA cutoff and deal-submission dates for the year** before you plan around them.
* **Attribution maturity** — SP/SB/SD `sales14d`/`sales` and DSP sales use a 14-day window; within ~2 weeks of
  the event, recent-day sales are still maturing (your lift is understated). Seller Central ordered sales
  settle immediately.
* **Match weekdays**, keep to one marketplace/currency, and remember report data lags ~2–3 days.

Prep with Parts 1–2; after the dust settles, run Part 3 and feed what you learn into next event's plan.
