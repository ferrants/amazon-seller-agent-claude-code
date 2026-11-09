# Manual mode: Seller Central reports the user uploads

Use this when the user uploads a report (or asks to use one) instead of, or as well as, the Marketplace Ad Pros tools. Only part of this guide works from files; this page says which part and how.

Report layouts and column names vary by Seller Central version, marketplace and language, so never assume a fixed layout. Read what the file actually contains and tell the user what you found.

## What works from an upload

- **Sales & Traffic:** top products by sales, trends over time, conversion (unit session percentage), sessions and page views, Buy Box percentage. Input: a Business Report by child ASIN (or by date for trends) for the period.
- **Search & Discovery: the search query funnel and top queries**, only if the user has Brand Analytics and uploads a Search Query Performance report.

## What needs the Marketplace Ad Pros connection

Inventory health and reorder planning, fees and settlements, refunds and reimbursements, market basket, repeat purchase, the cross-report insights, and everything under Vendor Central. Say so in one line when asked, and point to an alternative where one exists: for inventory, the FBA Inventory Risk Dashboard skill works on an uploaded FBA inventory report if the user has it installed.

## Reading the files

1. **One marketplace and one currency per analysis.** If a file spans several, ask which.
2. **Map the headers by meaning** and list the mapping in one short line before results (for example "Mapped: child ASIN, title, sessions, page views, units ordered, ordered product sales, unit session %, Buy Box %").
3. **Name the grain.** A report by child ASIN covers one period (find it in the file title, a date column, or ask); it can't show a trend. A report by date shows trends but not products. If the user asks for both, they need both reports. Never split a period total into days.
4. **Recompute ratios from base columns** (conversion = units ÷ sessions; average selling price = sales ÷ units) so every row uses the same definition. Use the report's own Buy Box percentage, as it can't be recomputed.
5. **Numbers:** strip currency symbols, percent signs and spaces; settle the thousands and decimal separators from the file and ask if a value is ambiguous. Keep the file's currency.
6. **Comparisons** (this month vs last, before vs after a change) need two files of the same report type, grain and marketplace, with periods of equal length. Compare per-day averages when the lengths differ, and say so.
7. Use code execution for every number. Drop total rows before summing.

## Search Query Performance (Brand Analytics)

- Read the period and whether the file is by ASIN or by brand. Keep the funnel stages the file has (impressions, clicks, cart adds, purchases) and the shares (your share of each stage vs the total for the query).
- Rank queries by search volume or purchases, as the user asks. A drop-off is where your share falls between stages (e.g. strong click share, weak purchase share).
- Don't present query volumes as your own sales; they're market totals for the query.

## Caveats and close

- The data is as of the export, not live, and Business Reports lag a day or two.
- Close with one line, once: refreshing this means exporting new reports; connecting Marketplace Ad Pros (see the options at the top of `SKILL.md`) keeps these and the connected-only analyses current.
