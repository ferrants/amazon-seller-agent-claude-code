# Manual mode: FBA inventory risk from uploaded reports

Use this when the user uploads a report (or asks to use one) instead of, or as well as, the Marketplace Ad Pros tools. It replaces workflow steps 1–3 in `SKILL.md`; steps 4–7 (short names, triage, dashboard, next steps) still apply with the changes below. The at-risk definition is the same as in connected mode, so results are comparable.

Report layouts and column names vary by Seller Central version, marketplace and language, so never assume a fixed layout. Read what the file actually contains and tell the user what you found.

## 1. What to ask for

- **Required:** an FBA inventory report from Seller Central with stock per SKU. Several FBA inventory reports include recent units sold and the inbound quantities by shipment status; those cover everything in one file.
- **If the inventory file has no recent units sold:** a sales report by SKU for a stated period (30 days is the default; 14–90 days works). Sales by ASIN also works, with the limits in step 5.
- **Optional:** inventory age or surcharge columns, for the aged-inventory questions (step 8).
- CSV, Excel or tab-delimited text are all fine.

Don't give menu paths or exact column names for the export; they change. If the user asks how to get a report, name the report type (an FBA inventory report, a sales report by SKU) and say Seller Central's own help covers the current steps.

## 2. Confirm scope before computing

- **One marketplace.** Inventory is per marketplace and can't be combined. If a file spans several (a marketplace or country column), ask which one.
- **FBA only.** Keep FBA rows if the file mixes fulfillment channels. Merchant-fulfilled stock isn't part of this view.
- Drop total and subtotal rows.
- **One stock snapshot.** If the inventory file holds several snapshot dates, use the latest one for each SKU and say which date; never sum stock across snapshots. If it's unclear which rows are current, ask.

## 3. Map the columns

Read the headers and map them by meaning:

| Field | Needed for |
|---|---|
| Seller SKU | Required |
| Fulfillable (available) units | Required |
| Units sold over a stated number of days | Required (the run rate), from the inventory file or a sales file |
| ASIN | The product column; joining a sales file by ASIN |
| Product title | The short name and the tooltip |
| Reserved units | The reserved overhang and anomaly flag |
| Inbound by status: working (planned), shipped, receiving | Effective DOS |
| Age tiers, estimated surcharges | Step 8 only |
| Report or snapshot date | `SNAPSHOT` |

Before showing results, list the mapping in one short line, e.g. "Mapped: SKU, ASIN, title, fulfillable, reserved, inbound shipped, inbound receiving, inbound working, units shipped (last 30 days)."

If a **required** field is missing, name it and stop. Without units sold there is no run rate and no days of supply: ask for a sales report rather than estimating. If an optional field is missing, say which features are unavailable and carry on.

## 4. Inbound

- Count only **shipped + receiving** as inbound, as in connected mode. **Working** (planned, not shipped) is not supply; mention large planned quantities in the headline instead.
- **No inbound columns:** set `INBOUND_KNOWN = false` and `inbound: 0` on every row. Days of supply then use fulfillable stock only, the dashboard says inbound isn't in the report, and the "covered by inbound" triage in `SKILL.md` step 5 doesn't apply. Say that a SKU may already have stock on the way.
- **One combined inbound column with no status split:** ask whether it includes planned shipments. If the user can't say, treat it like no inbound columns (`INBOUND_KNOWN = false`) and mention each SKU's combined figure in the narrative. Never add it to days of supply.

## 5. Run rate

- `daily` = units sold ÷ the number of days in the sales period. Say the period out loud ("units shipped, last 30 days") and set `RATE_DAYS` to it. Never assume 30 when the file says otherwise; if the file doesn't state its period, ask.
- **Join at one row per key.** Sum the sales file to one row per SKU (or per ASIN) over the whole period first, then join. Check that each stock row matches at most one sales row and say how many SKUs had no sales match; never let a join multiply stock or sales rows.
- **A separate sales file:** it must be the same marketplace, and its dates must end close to the inventory snapshot. If it includes merchant-fulfilled orders and has a fulfillment channel column, use the FBA rows only; if it can't be told apart, say the run rate may overstate FBA demand.
- **Sales by ASIN only, and an ASIN has several SKUs:** don't split the sales across SKUs. Sum that ASIN's fulfillable units (and shipped + receiving inbound) and show one ASIN-level row, with `sku` = the SKUs joined by " + " and a note that it's an ASIN-level line. Sales by ASIN with one SKU per ASIN join directly.
- SKUs with no sales in the period are excluded (as in connected mode); say how many.

## 6. Compute

Use code execution (or your analysis tool) for every number; don't do the arithmetic in your head.

1. `dos` = fulfillable ÷ daily.
2. Keep rows with fulfillable > 0, daily > 0 and DOS < 14, as in connected mode. Effective DOS (fulfillable + inbound) ÷ daily is computed by the template from `inbound`; tier and sort on it.
3. Sort by DOS ascending and keep the top 50 for `RAW`.
4. Zero rows is a valid result: say plainly that no SKU with stock is under 14 days of supply at this run rate, instead of rendering an empty dashboard. For an already-stocked-out view, use the variant in `SKILL.md`.
5. Short names and `fullTitle` as in `SKILL.md` step 4 when the file has titles; otherwise `name` = the ASIN or SKU and `fullTitle` = "".

## 7. Dates and freshness

- `SNAPSHOT` = the report's own date or snapshot timestamp, formatted "YYYY-MM-DD · report date". If the file has none, ask when it was downloaded; never use the upload time silently.
- `WINDOW` = the sales period, e.g. "30D · 10-01 → 10-30", or "Last 30 days" if only the length is known.
- Stock moves daily. Say the view is as of the report date, and that an older report understates what's sold since.

## 8. Aged inventory and surcharges

Answer the aged-inventory questions in `SKILL.md` only when the file has age-tier or surcharge columns. Read the tiers as the file labels them; don't assume tier boundaries. Without those columns, name what's missing (an inventory age or planning report) and stop that part.

## 9. Fill the dashboard

Same template and design rules as `SKILL.md` step 6, with these values:

- `SOURCE_LABEL = "Uploaded report"`, `SOURCE` = the file name(s), `RATE_DAYS` from step 5, `INBOUND_KNOWN` from step 4.
- `BRAND` and `MARKETPLACE`: from the file or what the user tells you. If unknown, ask.
- Rows: `sku`, `asin`, `name`, `pack`, `fulfillable`, `reserved` (0 if not in the file), `inbound`, `daily`, `dos`, `fullTitle`.

## 10. Caveats and follow-ups

- Lead with the same inbound-aware triage as connected mode, plus the mapping line, the run-rate period and how inbound was treated.
- The `SKILL.md` caveats apply with these changes: the data is as of the report date, not live; the run rate is over the period you found.
- **Reorder quantities:** offer them only with the user's lead time; for full purchase planning, the amazon-reorder-planning skill covers it.
- Follow-ups that need the tools (stranded-inventory detail, inbound-receiving lag, the variation family's other packs) become suggestions for the user to check in Seller Central.
- Close with one line, once: refreshing this view means downloading new reports; connecting Marketplace Ad Pros (see the options at the top of `SKILL.md`) keeps it current without exports.
