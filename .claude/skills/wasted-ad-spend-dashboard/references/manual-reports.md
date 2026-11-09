# Manual mode: wasted ad spend from an uploaded report

Use this when the user uploads a report (or asks to use one) instead of, or as well as, the Marketplace Ad Pros tools. It replaces workflow steps 1–3 in `SKILL.md`; steps 4–6 (triage, dashboard, next steps) still apply with the changes below. The definition of waste is the same as in connected mode, so results are comparable.

Report layouts and column names vary by console version, marketplace and language, so never assume a fixed layout. Read what the file actually contains and tell the user what you found.

## 1. What to ask for

- **Required:** a Sponsored Products search term report covering the period to analyze (30 days is a good default). Daily or summary both work.
- **Optional:** a Sponsored Products campaign report for the same dates. It gives the "% of total spend" figure a full Sponsored Products denominator.
- CSV or Excel are both fine. Several files are fine if they follow the rules in step 3.

Don't give menu paths or exact column names for the export; they change. If the user asks how to get the report, say it's a Sponsored Products search term report from the Amazon Ads reporting section, and that the console's own help covers the current steps.

## 2. Confirm scope before computing

- **Sponsored Products only.** If the file has an ad product or campaign type column, keep only the Sponsored Products rows and say how many others you dropped. If you can't confirm the file is Sponsored Products (from its title, an ad product column, or the user telling you), ask. Don't infer it from familiar-looking headers.
- **One marketplace, one advertiser account, one currency.** If the files span several, ask which one to analyze. Waste is per marketplace, as in connected mode.
- Drop total and subtotal rows (a "Total" label, or a blank search term with summed values).

## 3. Grain, overlaps and multiple files

- Say whether each file is **daily** or a **summary** for a range. Daily means one date column whose values change from row to row (one day per row). Start/end date columns, or a single date repeated on every row, mark a summary: use them as the range, not as observation dates.
- Each date range must come from exactly one source. If a summary and daily rows cover the same dates, or two exports overlap, use one of them for that range (prefer the newer export, since attribution keeps arriving) and say which. If you can't tell which is authoritative, ask.
- Never deduplicate by search term or by search term + date: the same term legitimately appears once per campaign, ad group, keyword or target. Only drop rows that are exact duplicates of the whole row and come from the same file uploaded twice.
- Reconcile files before aggregating.

## 4. Map the columns

Read the headers and map them by meaning:

| Field | Needed for |
|---|---|
| Customer search term | Required |
| Clicks | Required |
| Spend / cost | Required |
| Orders (purchases) attributed to the ad | Required |
| Impressions | CTR and the dashboard (without it, use the markdown table) |
| Campaign name | Top campaign, the by-campaign view |
| Ad group name | A per-campaign negative keyword list (with campaign) |
| Match type | The match-type badges |
| Attributed sales | The near-zero (high-ACOS) variant |
| Date | Window, overlap checks, maturity flag |

Before showing results, list the mapping in one short line, e.g. "Mapped: search term, clicks, spend, 7-day orders, 7-day sales, campaign, match type, date."

If a **required** field is missing, name it and stop. Don't estimate it, and don't use zero sales as a stand-in for zero orders. If an optional field is missing, say which features are unavailable and carry on.

## 5. Attribution window

- Read the window from the order and sales headers (for example a "7 Day" or "14d" prefix).
- The orders and sales you use must share one window, and every combined file must use it. Don't mix a 7-day orders column with 14-day sales, or a 7-day file with a 14-day file.
- If both 7- and 14-day columns are present, use 14-day (it matches connected mode) and say so.
- If the window can't be identified, or files disagree, ask the user.
- **Never call a 7-day figure 14-day.** Every place the window appears (your text, the dashboard's `ATTRIBUTION`, the footer) uses the window you found.

## 6. Numbers and currency

- Strip currency symbols and spaces. Decide the thousands and decimal separators from the file (for example "1.234,56" vs "1,234.56"). If a value could be read either way and the file doesn't settle it, ask.
- Keep the file's currency. Never convert it. Set the dashboard's `CURRENCY` to its symbol.

## 7. Compute

Use code execution (or your analysis tool) for every number; don't do the arithmetic in your head. If you can't run code and the file has more than a few dozen rows, say so and ask the user to try in a client that can.

1. **Denominator, before any filtering:**
   - If a campaign report was provided and it's Sponsored Products, the same marketplace and account, the same currency and the same dates: its total spend, with `SPEND_LABEL = "ad spend"`.
   - Otherwise: total spend over **all** rows of the search term data, with `SPEND_LABEL = "spend in this report"`. Never present it as total ad spend.
   - If neither is valid, set `TOTAL_SPEND = null` so the dashboard hides the percentage. Never show 0%.
2. **Aggregate first:** sum impressions, clicks, spend and orders per search term (trimmed; Amazon search terms are already lowercase) across every campaign, ad group and match type.
3. **Then filter:** waste = clicks ≥ 5 and orders = 0 on the aggregated totals. A term that converts in any campaign is not waste.
4. Per term: CTR = clicks / impressions, CPC = spend / clicks, `campaign` = the campaign with the most spend on that term, campaign count, and `matches` = the distinct match types limited to EXACT, PHRASE and BROAD (product targeting rows have none).
5. Sort by spend, keep the top 30 for `RAW`, and compute `TOTAL_WASTED` over **all** qualifying terms.
6. Zero qualifying terms is a valid result. Say so plainly (with the clicks floor and window) instead of rendering an empty dashboard.

## 8. Dates and freshness

- Window: for daily data, min → max of the date column, noting any missing days. For a summary file, use the range in its title or what the user tells you; if neither, ask.
- `SNAPSHOT` = "YYYY-MM-DD · end of data" (the last date in the data), not the upload time.
- Attribution keeps arriving for days after a click. If the data ends within the attribution window of today, say that recent days may still pick up orders, and treat terms whose clicks are mostly in those days as borderline before recommending negatives.

## 9. Fill the dashboard

Same template and design rules as `SKILL.md` step 5, with these values:

- `SOURCE_LABEL = "Uploaded report"`, `SOURCE` = the file name(s), `ATTRIBUTION` = the window from step 5, `SPEND_LABEL` and `TOTAL_SPEND` from step 7, `CURRENCY` from step 6.
- `BRAND` and `MARKETPLACE`: from the file or what the user tells you. If unknown, ask. Don't guess the marketplace from the currency (euros cover several).
- `WINDOW` = the date range from step 8, e.g. "30D · 10-01 → 10-30".
- `TIERS`: the defaults (100 / 60) are scaled for USD accounts with mid-six-figure spend. For another currency or a very different spend scale, re-anchor them to the rows you have: `critical` at about the 10th-largest cost in `RAW` and `high` at about the 20th, rounded to a readable number, so the three tiers split the table. Say which thresholds you used.
- Missing optional fields: `campaign` = "—" and `matches` = [] where unavailable. Without impressions, skip the dashboard and present the markdown table.

## 10. Caveats and follow-ups

- Lead with the same headline triage as connected mode, plus the mapping line, the window and which denominator you used.
- The "% of total spend" bands in `SKILL.md` step 4 (under 2% healthy, over 5% real money) only apply with a campaign-report denominator. With "spend in this report", give the percentage as a share of that report's spend and don't call the account healthy or unhealthy from it; with no denominator, lead with the amount instead.
- The `SKILL.md` caveats apply with these changes: the data is as of the export, not live; the attribution window is the one you found.
- Follow-ups depend on what the file has:
  - **Negative keywords:** a list of terms with a suggested negative match type for the user to apply by hand. A per-campaign list only when campaign and ad group are present.
  - **By-campaign view:** only with a campaign column. **Near-zero view:** only with attributed sales in the same window.
  - **Listing audit:** needs the Marketplace Ad Pros tools; in manual mode, suggest the user review those listings themselves.
- Close with one line, once: refreshing this view means exporting a new report; connecting Marketplace Ad Pros (see the options at the top of `SKILL.md`) keeps it current without exports.
