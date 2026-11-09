# Manual mode: search term harvest from an uploaded report

Use this when the user uploads a report (or asks to use one) instead of, or as well as, the Marketplace Ad Pros tools. It replaces workflow steps 1–3 in `SKILL.md`; steps 4–6 (triage, dashboard, next steps) still apply with the changes below. The harvest definition is the same as in connected mode, so results are comparable.

Report layouts and column names vary by console version, marketplace and language, so never assume a fixed layout. Read what the file actually contains and tell the user what you found.

## 1. What to ask for

- **Required:** a Sponsored Products search term report covering the period to analyze (30 days is a good default; under 14 days is thin). Daily or summary both work.
- **Optional:** a Sponsored Products campaign report for the same dates, for a "% of total ad sales" figure that covers all Sponsored Products sales.
- **Optional:** a current keyword or bulk export, if the user wants to know which candidates are already targeted as exact somewhere.
- CSV or Excel are both fine. Several files are fine if they follow the rules in step 3.

Don't give menu paths or exact column names for the export; they change. If the user asks how to get the report, say it's a Sponsored Products search term report from the Amazon Ads reporting section, and that the console's own help covers the current steps.

## 2. Confirm scope before computing

- **Sponsored Products only.** If the file has an ad product or campaign type column, keep only the Sponsored Products rows and say how many others you dropped. If you can't confirm the file is Sponsored Products (from its title, an ad product column, or the user telling you), ask. Don't infer it from familiar-looking headers.
- **One marketplace, one advertiser account, one currency.** If the files span several, ask which one to analyze. Harvest is per marketplace, as in connected mode.
- Drop total and subtotal rows (a "Total" label, or a blank search term with summed values).

## 3. Grain, overlaps and multiple files

- Say whether each file is **daily** or a **summary** for a range. Daily means one date column whose values change from row to row. Start/end date columns, or a single date repeated on every row, mark a summary: use them as the range, not as observation dates.
- Each date range must come from exactly one source. If a summary and daily rows cover the same dates, or two exports overlap, use one of them for that range (prefer the newer export, since attribution keeps arriving) and say which. If you can't tell which is authoritative, ask.
- Never deduplicate by search term or by search term + date: the same term legitimately appears once per campaign, ad group and keyword. Only drop rows that are exact duplicates of the whole row and come from the same file uploaded twice.

## 4. Map the columns

Read the headers and map them by meaning:

| Field | Needed for |
|---|---|
| Customer search term | Required |
| Targeting / keyword text that matched it | Required (NEW vs SAME) |
| Match type of that keyword | Required (the BROAD/PHRASE filter) |
| Impressions | Required (CTR and the impression floor) |
| Clicks | Required |
| Spend / cost | Required (CPC, suggested bid) |
| Orders (purchases) attributed to the ad | Required (tiers, WATCH) |
| Attributed sales | Required (ACOS, revenue ranking) |
| Campaign name | The candidate list, the source campaign |
| Ad group name | The candidate list, the source ad group |
| Date | Window, overlap checks, maturity flag |

Before showing results, list the mapping in one short line, e.g. "Mapped: search term, targeting, match type, impressions, clicks, spend, 7-day orders, 7-day sales, campaign, ad group, date."

If a **required** field is missing, name it and stop. Don't estimate it, and don't infer the match type from the campaign name. If an optional field is missing, say which features are unavailable and carry on.

## 5. Attribution window

- Read the window from the order and sales headers (for example a "7 Day" or "14d" prefix).
- The orders and sales you use must share one window, and every combined file must use it. Don't mix a 7-day orders column with 14-day sales, or a 7-day file with a 14-day file.
- If both 7- and 14-day columns are present, use 14-day (it matches connected mode) and say so.
- If the window can't be identified, or files disagree, ask the user.
- **Never call a 7-day figure 14-day.** Every place the window appears (your text, the dashboard's `ATTRIBUTION`, the footer) uses the window you found.

## 6. Numbers and currency

- Strip currency symbols, percent signs and spaces. Decide the thousands and decimal separators from the file (for example "1.234,56" vs "1,234.56"). If a value could be read either way and the file doesn't settle it, ask.
- Recompute CTR, CPC, ACOS and conversion rate from the base columns rather than reading the report's own ratio columns, so every row uses the same definitions.
- Keep the file's currency. Never convert it. Set the dashboard's `CURRENCY` to its symbol.

## 7. Compute

Use code execution (or your analysis tool) for every number; don't do the arithmetic in your head. If you can't run code and the file has more than a few dozen rows, say so and ask the user to try in a client that can.

1. **Denominator, before any filtering:**
   - If a campaign report was provided and it's Sponsored Products, the same marketplace and account, the same currency, the same dates and the same attribution window: its total sales, with `SALES_LABEL = "ad sales"`.
   - Otherwise: total attributed sales over **all** Sponsored Products rows of the search term data, with `SALES_LABEL = "ad sales in this report"`. Never present it as total ad sales.
   - If neither is valid, set `TOTAL_AD_SALES = null` so the dashboard hides the percentage. Never show 0%.
2. **Keep the harvest rows:** match type BROAD or PHRASE only. Exclude EXACT (already targeted) and product-targeting or auto rows with no keyword match type; say how many rows each exclusion removed.
3. **Aggregate** at (search term, keyword, match type, campaign, ad group) — the same grain as connected mode plus the ad group when the file has one. Sum impressions, clicks, spend, orders and sales. Trim whitespace in the term and keyword.
4. **Then filter:** impressions ≥ 100 and clicks ≥ 3 on the aggregated rows.
5. Per row: `ctr` = clicks / impressions, `cvr` = orders / clicks, `acos` = spend / sales (null when sales = 0), and `isNew` = the search term differs from the keyword text (compare trimmed and lowercased). Use the raw computed numbers, not rounded ones.
6. Sort by CTR, keep the top 50 for `RAW` (the template then sorts by revenue). Zero qualifying rows is a valid result: say so plainly (with the floors, the match types kept and the window) instead of rendering an empty dashboard. For a small account, offer the looser floor from `SKILL.md` "Variant queries".

## 8. What NEW does and doesn't mean

- NEW means only that the search term's text differs from the keyword that triggered it. It does **not** prove the term isn't already an exact keyword in that ad group or anywhere else in the account, so don't promise added reach.
- Only say a term is "not targeted yet" if the user supplied a current keyword or bulk export and you checked it there (match on trimmed, lowercased text, enabled exact keywords). Otherwise call the list "candidates" and suggest the user check before adding.

## 9. Dates and freshness

- Window: for daily data, min → max of the date column, noting any missing days. For a summary file, use the range in its title or what the user tells you; if neither, ask.
- `SNAPSHOT` = "YYYY-MM-DD · end of data" (the last date in the data), not the upload time.
- Attribution keeps arriving for days after a click. If the data ends within the attribution window of today, say that recent days may still pick up orders, and treat WATCH rows whose clicks are mostly in those days as too early to judge.

## 10. Fill the dashboard

Same template and design rules as `SKILL.md` step 5, with these values:

- `SOURCE_LABEL = "Uploaded report"`, `SOURCE` = the file name(s), `ATTRIBUTION` = the window from step 5, `SALES_LABEL` and `TOTAL_AD_SALES` from step 7, `CURRENCY` from step 6.
- `BRAND` and `MARKETPLACE`: from the file or what the user tells you. If unknown, ask. Don't guess the marketplace from the currency (euros cover several).
- `WINDOW` = the date range from step 9, e.g. "30D · 10-01 → 10-30".
- `RAW` rows use the template schema: `sales` and `buys` are the attributed sales and orders in the window you found.
- The PRIME / STRONG thresholds are clicks and ACOS, so they don't depend on currency. Leave them as they are.

## 11. Caveats and follow-ups

- Lead with the same headline triage as connected mode, plus the mapping line, the window, the exclusions and which denominator you used. With "ad sales in this report", the ≥10% / <3% impact bands in `SKILL.md` step 4 describe a share of that report's sales; say so.
- The `SKILL.md` caveats apply with these changes: the data is as of the export, not live; the attribution window is the one you found.
- **Candidate list follow-up:** one line per (term, source campaign, source ad group) with clicks, orders, ACOS and a suggested starting bid = that row's CPC. A term that came from several ad groups is listed once per source. Don't call it upload-ready: the user chooses which ad group each exact keyword goes into, and applies it by hand or through their own bulk sheet. Without campaign and ad group columns, list terms only.
- **Listing check:** suggest the user review those listings themselves; the listing tools need the Marketplace Ad Pros connection.
- Close with one line, once: refreshing this view means exporting a new report; connecting Marketplace Ad Pros (see the options at the top of `SKILL.md`) keeps it current without exports.
