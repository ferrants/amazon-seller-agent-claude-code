# Manual mode: holiday event prep and review from uploaded reports

Use this when the user uploads a report (or asks to use one) instead of, or as well as, the Marketplace Ad Pros tools.

Report layouts and column names vary by console version, marketplace and language, so never assume a fixed layout. Read what the file actually contains and tell the user what you found.

## What works from an upload

- **Parts 1–2 (prep and run):** the countdown and methodology are guidance; they need no data. Changes are made by the user in their consoles, from a checklist you write.
- **Part 3, the post-event review (steps 1–3):** per-channel ad performance and total sales, event vs baseline. Inputs: daily campaign reports for each ad product the user ran (Sponsored Products, Sponsored Brands, Sponsored Display) covering both windows, and a Business Report by date covering the same days for total sales.

## What needs the Marketplace Ad Pros connection

Scheduled budget or bid rules and any campaign writes, inventory and listing work through the tools, DSP results, and "what actions drove it" from account history (new campaigns or products, first-seen dates). Say so in one line when asked.

## Post-event review from files

1. **Windows.** Event window = the event days. Baseline = the same weekdays about two weeks before (not the lead-in week), as `SKILL.md` step 1 says. If the files don't cover a valid baseline, say which dates are missing. Compare **per-day averages**, so windows of different lengths are comparable.
2. **Grain.** Daily files are required: each row needs a date. A summary file for the whole period can't be split into event and baseline days; ask for daily exports.
3. **Map the headers by meaning** per file (date, campaign, spend, impressions, clicks, attributed sales, attributed orders, budget, new-to-brand where present) and list the mapping in one line.
4. **Attribution window.** Read it from each file's sales/order headers. Report each ad product in its own window and say which; never relabel a 7-day column as 14-day. Combine ad products into one "total ad sales" only if they share a window; otherwise show them side by side.
5. **Numbers:** strip currency symbols and percent signs; settle separators from the file; one marketplace and one currency at a time.
6. **Compute with code execution**, per channel and window: per-day spend, sales, impressions, clicks, then ACOS, CPC, CTR, CVR, CPM. Sponsored Display mixes cost types, so don't report its CPC or CPM (as `SKILL.md` says).
7. **Total sales (step 3):** from the Business Report by date for the same days. TACoS = total ad spend ÷ total sales; ad share = ad-attributed sales ÷ total sales. Total sales outgrowing ad sales is the halo.
8. **Budget change:** only if the campaign files have a daily budget column: average daily total budget per window.

## What not to claim from files

- Don't say what *caused* the result. Report what changed (spend, budget, CPC, total vs ad sales) and leave cause as a question for the user, unless they tell you what they changed.
- "New for the event" campaigns or products: a first date inside the uploaded files only means first seen *in these files*. Say "new in this data", or ask for longer history.
- Attribution keeps arriving for up to the attribution window after the event; if the files end soon after it, say recent-day ad sales are understated.

## Close

One line, once: repeating this needs new exports for each ad product and Seller Central; connecting Marketplace Ad Pros (see the options at the top of `SKILL.md`) runs it from one question, including DSP and account history.
