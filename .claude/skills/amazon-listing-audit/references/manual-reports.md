# Manual mode: listing content checks on text the user provides

Use this when the user pastes listing content or uploads a listing export instead of, or as well as, the Marketplace Ad Pros tools. Only the content checks work this way; this page says which.

## What works without the tools

Checks you can make by reading the listing text itself:

- **Alexa for Shopping / conversion quality:** do the bullets answer "Is this right for me?", "What's different?" and "How do I use it?"; formatting; proposed rewrites.
- **Banned claims:** phrases like "FDA approved", "clinically proven", "eco-friendly", "antibacterial", "miracle cure" in the title, bullets or description.
- **Title length:** over 75 characters (count with code, on the text exactly as given).
- **Prohibited characters and formatting** in the title and bullets.
- **Search terms**, only if the user provides their backend search terms: irrelevant, competitor or suspicious entries.

Inputs: listing text the user pastes (title, bullets, description), or a listings export with those fields. Map the columns by meaning and say which fields you received.

## What needs the Marketplace Ad Pros connection

Issues Amazon itself has flagged, suppression status, hijacking detection, product-type and variation checks, change history ("what changed and when"), catalog-wide sweeps, and any write. Say so in one line when asked.

## Rules for verdicts

- Use the severity tiers in `SKILL.md`, but **never say a listing is suppressed, at risk of suppression from Amazon's side, or hijacked** from text alone. Those verdicts need Amazon's issue data or change history. Say "this claim is the kind Amazon enforces against" instead.
- If the text looks tampered with (off-brand phrasing, competitor names, odd characters), say it could be a hijack and that confirming it needs the change history: connected, or the user's own check in Seller Central.
- Quote the exact text behind every finding, and give a rewrite for each fixable one.
- A pasted listing may be out of date; say the checks cover the text as given.

## Close

One line, once: connecting Marketplace Ad Pros (see the options at the top of `SKILL.md`) runs the full audit across the catalog, including Amazon's own flags and hijacking checks.
