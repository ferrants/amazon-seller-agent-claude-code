# Manual mode: title rewrites from uploaded reports

Use this when the user uploads a report (or asks to use one) instead of, or as well as, the Marketplace Ad Pros tools. The method in `SKILL.md` (core principle, Step 3, category playbooks, pitfalls) applies unchanged; this page replaces the tool calls in Steps 0–2 and stops before Step 4.

Report layouts and column names vary by Seller Central version, marketplace and language, so never assume a fixed layout. Read what the file actually contains and tell the user what you found.

## What works from an upload

- **Step 1, find and rank long titles:** from a listings report (any export with SKU, ASIN and the item name / title). Ranking by what matters needs sales per ASIN or SKU too (a Business Report by child ASIN, or a sales column in the export).
- **Step 2, what shoppers search:** from a Search Query Performance report by ASIN, if the user has Brand Analytics.
- **Step 3, the rewrite and a proposed Item Highlight**, with before → after and character counts.

## What needs the Marketplace Ad Pros connection

Review themes (`get_review_topics` / trends), the catalog's structured attributes, the product-type schema check for Item Highlight, and **Step 4: writing the title and verifying it**. In manual mode the user applies the new title in Seller Central themselves; say so, and give them the final text to paste.

## Reading the files

1. One marketplace at a time; ask if the files span several.
2. Map the headers by meaning (SKU, ASIN, title, and sales, units, or query fields when present) and list the mapping in one line.
3. **Count characters with code**, on the title exactly as exported (spaces and punctuation count). List titles over 75 characters, sorted by sales when sales are available, else by length; say which.
4. Several SKUs sharing one ASIN usually share one title; rewrite it once and list the SKUs.
5. **Facts come only from the file or the user.** Take brand, dose, count, size and material from the current title or other columns in the export. If a spec you'd want isn't there, ask; never invent one.
6. **Review signal:** without the tools there's no review-topic data. Ask the user what customers praise most, or work from search demand and the product facts alone, and say which.
7. **Search Query Performance:** read the period; rank queries by purchases and impressions for that ASIN. Queries are market demand, not the ASIN's own sales.

## Output

- Before → after with character counts, what was kept and cut and why, as `SKILL.md` Step 3 requires, plus a proposed Item Highlight (≤ ~125 characters, not repeating the title). Note that the user should check the Item Highlight is offered for their product type in Seller Central.
- Remind them of Step 4's cautions that still apply: changes can take hours and may need review; don't change winning titles right before a major event.
- Close with one line, once: connecting Marketplace Ad Pros (see the options at the top of `SKILL.md`) adds review themes and the schema check, and lets Claude apply and verify the change.
