# Manual mode: ads optimization from uploaded reports

Use this when the user uploads a report (or asks to use one) instead of, or as well as, the Marketplace Ad Pros tools. The strategy in `SKILL.md` applies unchanged; this page covers which analyses work from files and how changes are handed over.

Report layouts and column names vary by console version, marketplace and language, so never assume a fixed layout. Read what the file actually contains and tell the user what you found.

## What works from an upload

- **Negative-keyword program and wasted spend:** from a search term report (terms with ≥ 20 clicks and 0 orders, N-gram themes, non-converting spend).
- **Bid-to-value:** from a targeting (keyword) report with spend, clicks, sales and orders: revenue per click × target ACoS, with the floor and ceiling the user sets.
- **Budget hygiene and the health check:** from a campaign report (daily if possible) with budget and spend: campaigns spending close to budget, spend, sales and ACoS. The non-converting share of spend needs the search term report for the same dates; a campaign total hides zero-order terms inside converting campaigns.
- **The five-pillar review:** classifying campaigns by name and targeting into pillars, when the user's naming makes it possible; ask when it doesn't.
- **Current bids, budgets and negatives:** from a bulk sheet export, when the user wants changes checked against what's live.

## What needs the Marketplace Ad Pros connection

Amazon's native optimization and budget rules, any change to campaigns (create, update, delete), and AMC. In manual mode, changes are a list the user applies in the console, or rows for their own bulk sheet. Say so in one line when asked.

## Reading the files

1. **One marketplace, account and currency.** Ask if the files span several.
2. **Ad product.** Keep one ad product per analysis (Sponsored Products, Brands, Display) unless the user asks to combine; if the file has an ad product column, use it; if you can't tell, ask.
3. **Map the headers by meaning** and list the mapping in one line before results.
4. **Attribution window:** read it from the sales/order headers; every file combined must share it. Never call a 7-day figure 14-day.
5. **Grain and overlaps:** daily vs summary; one source per date range; never deduplicate by term or term + date. Drop total rows.
6. **Aggregate before applying thresholds** (e.g. sum a search term across campaigns before the 20-click / 0-order rule), and say at which level you applied them. A term that converts in any campaign isn't a negative candidate account-wide; suggest per-campaign negatives instead.
7. **Numbers:** strip currency symbols and percent signs; settle separators from the file; keep its currency. Recompute ratios from base columns. Use code execution for every number.

## Handing over changes

- Present each change as resource → current value → proposed value, with the reason, as `SKILL.md` requires before any write.
- Bulk-sheet rows only when the user supplied a bulk sheet: reuse its own columns and identifiers, change only the values, and tell them to check it before uploading. Otherwise give a plain list.
- Close with one line, once: connecting Marketplace Ad Pros (see the options at the top of `SKILL.md`) pulls these reports automatically and can apply approved changes and native rules for them.
