---
name: amazon-product-launch
description: Amazon new-product launch playbook for the semantic-discovery era. Use when launching a new ASIN or brand on Amazon, planning a launch, deciding launch campaign structure, mapping a product's competitive neighborhood, or diagnosing why a launch's organic rank faded after the first few weeks.
---

# Amazon Product Launch Guide

<!-- map-onboarding:start -->
**Pick the mode before anything else.** Part of this skill works on reports the user uploads (manual mode); the rest needs live data through Marketplace Ad Pros (connected mode).
- **Works from an upload:** the launch method, and the demand research from a Search Query Performance report for their own related ASINs (and a search term report for an existing product's ads), with the PDP and campaign plan built by the user. **Needs the connection:** category, competitive and review research through the tools, Share of Voice tracking, and every write.
- **The user uploaded a report or asks to use one:** manual mode. Read `references/manual-reports.md` and follow it; it governs wherever it differs from the tool steps below, even when the Marketplace Ad Pros tools are available. For a part that needs the connection, say so in one line and offer the manual alternative that page names.
- **`ask_selling_partner_report_analyst` available:** connected mode, the guide below.
- **Tools listed but failing** with an authentication or "no integrations" error: the user already has an account. Send them to https://app.marketplaceadpros.com/integrations to connect or reconnect Seller Central, then refresh the MCP connector in their client. Don't suggest signing up again. Meanwhile the upload path still works for the parts above.
- **No Marketplace Ad Pros tools at all:** say once that there are two ways to run this:
  - Upload a Search Query Performance report for their own brand or a related ASIN they already sell, and I'll run the research steps it supports.
  - Or connect Marketplace Ad Pros for the full skill, with the data pulled for them every time. If they already have an account, they only need to add the MCP connector: https://marketplaceadpros.com/amazon-ads-mcp-server-for-claude/. Otherwise they can connect their Amazon account free at https://app.marketplaceadpros.com/signup?r=fHNraWxsLWFtYXpvbi1wcm9kdWN0LWxhdW5jaHxza2lsbF9saW5r and then add the connector. Asking about their data through the MCP needs AI Connect ($10/week) or a higher plan.
- Name the report type only, never a menu path or exact column names: those change. The console's own help covers the current steps.
- Never claim to have pulled data or made a change without a tool call or an uploaded file.
<!-- map-onboarding:end -->

Use this guide to launch a new product on Amazon so organic rank **sticks** instead of fading when the ad push eases. It covers the semantic-discovery model, a research-first sequence, and how to build the listing and campaigns off that research using the Marketplace Ad Pros MCP tools.

**Before you start:**

* Some tools named here depend on the account's plan, connected integrations or add-ons (e.g. Jungle Scout, competitive and image analysis, Selling Partner tools). If a tool isn't in your tool list, skip that step, say what it would have added, and continue with what is available.
* Steps that change the account — `update_listing`, `update_listing_images`, `create_resources`, `create_automation_rule` — are live changes on Amazon. Show the user exactly what you'll create or change and get an explicit yes before each write.

## The Shift: Win a Neighborhood, Not a Keyword

Amazon discovery is no longer a simple keyword-to-product match. Amazon ranks and surfaces products using many signals — query/product relevance, historical engagement and conversion, offer quality (price, availability, reviews, delivery), listing content and attributes, ads, and shopper personalization. Practically, Amazon is trying to fill each search-results page with the products most likely to convert for that shopper.

So the launch unit has shifted from "win a keyword" to **earn a product neighborhood** — the cluster of substitute products and shopper need-states you compete inside. Showing up on queries you can't convert isn't free: weak clicks and conversions on off-target queries build poor engagement signals for that cluster and make efficient relevance harder to earn. Choosing the right neighborhood — and fencing off the wrong ones — protects rank, not just spend.

**Success metric:** organic **Share of Voice / Share of Shelf** on the branded and non-branded keyword sets you care about, sustained past the launch window — not day-30 sales alone.

## Phase 1 — Research First

Do the research before building any asset. The edge is finding **latent, unspoken need-states** — a cohort the obvious positioning underserves.

* **Demand** — `ask_selling_partner_report_analyst` for Search Query Performance: what shoppers actually search, and where impressions and purchases concentrate.
* **Category structure** — `get_sp_category_recommendations` and `get_sp_category_refinements` to see how Amazon organizes the space and which refinements matter.
* **Competitors / substitutes** — `run_competitive_analysis` to map the real substitute set (the ASINs and attributes you compete against, not just keywords).
* **Voice of customer** — `get_review_topics` (own brand-registered ASINs, sorted by star-rating impact) and `get_review_trends` for the language shoppers use to praise and complain. Complaints often reveal an underserved need-state to wedge into.

**Cadence:** front-loaded, once, before assets. Refresh at the 30- and 60-day marks.

## Phase 2 — Define the Neighborhood

From the research, decide the cluster you will own:

* The **substitute ASINs** and **product attributes** that define the neighborhood.
* The **need-states** (implicit and explicit) and the **ideal customer** you are answering for.
* What is clearly **outside** the neighborhood — this becomes your day-one negative set.

Write this down before building. It drives both the listing and the campaign structure.

## Phase 3 — Build the PDP as an Answer Engine

The PDP is what teaches Amazon the neighborhood. Give it structured evidence in three buckets and help the shopper self-qualify ("this is for me"):

* **Facts** — what the product literally is: attributes, materials, dimensions, compatibility. Anchors catalog placement and feeds semantic (COSMO) matching.
* **Fit** — the need-states and usage occasions it serves. Source from SQP (demand) and review themes (language). This is where most listings are thin.
* **Proof** — claims, certifications, ratings, and imagery that make the fit credible.

**Build / audit with:** `audit_listings` (Alexa for Shopping bullets, formatting, prohibited-content, long-title checks), `run_product_image_analysis` (does imagery carry fit + proof, not just facts), and `update_listing` / `update_listing_images` to push copy and creative. Lead the title and bullets with the top praised need-states; address the top complaints directly.

**Launching in several EU marketplaces?** Copy is per marketplace, but images are not: Amazon shares listing images across a seller's EU marketplaces, so `update_listing_images` through one may replace them in all of them. Use one image set that works in every language; country-specific images can only be set in Seller Central (Country-Specific Upload).

For deeper listing work, hand off to the **Amazon Listing Audit** and **Amazon Title Optimizer** skills.

## Phase 4 — Build Campaigns and Negatives

Build the campaign structure off the neighborhood, not off a generic keyword dump.

* **Targets** — create ASIN / category / brand targeting with `sp_targets` (via `create_resources`). Because the research is done, you can start with tighter exact-match and product-attribute targets and less broad/auto discovery.
* **Day-one negatives** — fence the wrong neighborhoods from the start with `sp_negative_keywords` (search terms) and `sp_negative_targets` (ASIN/brand), or campaign-wide via `sp_campaign_negative_keywords` / `sp_campaign_negative_targets`. Don't block everything — keep some controlled auto/broad running for discovery.
* **Go higher-funnel sooner** — with the contextual research in hand, stand up Sponsored Brands (including video) and Sponsored Display earlier via `sb_campaigns` / `sd_campaigns`, and DSP (`dsp_campaigns`) where you have an agency profile. This cements share of shelf faster.
* **Keep the negation cadence running** — `create_automation_rule` for ongoing negative harvesting.

Once the launch is live, run the ongoing operating system from the **Amazon Ads Optimization** skill (five-pillar framework, bid-to-value, wasted-spend sweeps).

## Phase 5 — Track Whether It Stuck

* **Organic Share of Voice** — `junglescout_share_of_voice` (requires the Jungle Scout integration; without it, track sponsored + organic placement from Search Query Performance and tracked search terms instead) on the branded and non-branded keyword sets you defined. Sustained SoV after the launch window is the signal the neighborhood held. Consider pinning it to a dashboard (`add_query_to_dashboard`) keyed to the launch date.
* **Honeymoon awareness** — sellers often see a short early lift (commonly discussed as ~2-4 weeks; duration varies by category, price, traffic, inventory, and conversion). The goal is rank that holds *after* it, so watch organic — not just paid — through weeks 3-8.

## Common Launch Pitfalls

### Organic sales fell off a cliff after ~3 weeks
The launch bought traffic without building durable query/product fit. Re-run Phase 1-3: is the PDP answering the need-states, and is the product placed in a neighborhood it can actually convert?

### Aggressive auto/broad from day one, ACoS out of control
You skipped the neighborhood work. Add a day-one negative set (Phase 4), tighten to exact and product-attribute targets, and let the research — not the auto campaign — do the discovery.

### Ranking for a keyword but not converting
Wrong neighborhood, or the PDP doesn't support that query's need-state. Check whether the query belongs to your cluster; if not, negate it. If it does, fix the fit evidence on the PDP.

### "Sensitive skin" problem — real demand you can't see
The highest-value need-states are often unspoken. Mine review and Q&A language (`get_review_topics`, `run_competitive_analysis`) for the complaint patterns that reveal an underserved cohort, then position into that open space instead of the crowded obvious one.
