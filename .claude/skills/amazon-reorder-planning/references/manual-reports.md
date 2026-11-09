# Manual mode: FBA reorder planning from uploaded reports

Use this when the user uploads a report (or asks to use one) instead of, or as well as, the Marketplace Ad Pros tools. Only the FBA reorder math works from files; this page says how. "The math" and "Inputs the user must supply" in `SKILL.md` apply unchanged.

Report layouts and column names vary by Seller Central version, marketplace and language, so never assume a fixed layout. Read what the file actually contains and tell the user what you found.

## What works from an upload

- "What should I reorder?" and the PO draft table for **FBA**, from an FBA inventory report (stock and inbound per SKU) plus units sold per SKU over a stated period (from the same report if it has them, or a sales report by SKU).

## What needs the Marketplace Ad Pros connection

AWD stock and replenishment detail, Vendor Central forecasts and inventory, and replenishment + ad coordination (that needs ad spend by SKU as well). Say so in one line when asked.

## Before any quantity

1. **Ask for the inputs in `SKILL.md`**: lead time, safety stock or service level, horizon, MOQ / case pack. Never assume defaults.
2. **Ask about upstream stock.** Does the seller hold stock outside FBA: AWD, a 3PL or own warehouse, or goods already shipped from the supplier but not yet booked as an FBA shipment? If yes and the quantities aren't provided, show each SKU's FBA coverage gap in days and units and **withhold a final order quantity**, saying that those units would reduce it. If the user gives the quantities, ask for upstream stock on hand and stock already on its way to FBA separately. Add upstream on hand to on-hand. Units already moving to FBA (for example AWD→FBA transfers) usually appear in the FBA inbound columns once the shipment is booked; count each unit once, and ask if it's unclear whether they're already in the file's inbound.
3. **One marketplace.** Ask which if the files span several.

## Reading the files

- Map the headers by meaning and list the mapping in one short line before results.
- **Required per SKU:** SKU, fulfillable units, units sold over a stated number of days. Missing any → name it and stop; without sales there is no run rate.
- **Inbound:** as `SKILL.md` defines it for reorder math, working + shipped + receiving all count (working units are already committed to a shipment). If the file has one combined inbound figure, use it and say it's combined. If there's no inbound column, ask whether anything is on the way before treating inbound as zero.
- **Run rate:** units ÷ the days in the sales period. State the period and window choice ("units shipped, last 30 days"). If the file doesn't state its period, ask.
- **Sales only by ASIN with several SKUs on one ASIN:** don't allocate sales across SKUs. Plan at ASIN level (sum the SKUs' stock and inbound) and say so.
- **One stock snapshot, one row per key.** Use the latest snapshot per SKU if the inventory file holds several. Sum sales to one row per SKU (or ASIN) over the period before joining, and check each stock row matches at most one sales row.
- A sales file that includes merchant-fulfilled orders: use the FBA rows if a fulfillment channel column exists; otherwise say the run rate may overstate FBA demand.
- Use code execution for every number. Round order quantities to the MOQ / case pack only after computing them.

## Output

- Show the formulas and inputs as `SKILL.md` requires, then the reorder table sorted by days of cover. Flag SKUs whose days of cover are already below the lead time as expedite candidates.
- The data is as of the report date; say so, and that stock moves daily.
- Close with one line, once: refreshing this means downloading new reports; connecting Marketplace Ad Pros (see the options at the top of `SKILL.md`) pulls stock, inbound and AWD automatically.
