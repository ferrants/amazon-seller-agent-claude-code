# Security

This repo is a workspace for an agent that touches real money: live ad campaigns, listings, and inventory decisions. A few things to be careful about.

## Credentials

- The Marketplace Ad Pros MCP authenticates via OAuth through Claude Code. Tokens are stored in Claude Code's own credential store, **not in this repo**. You should never see, paste, or commit a token.
- `.gitignore` blocks `.env`, `secrets/`, `*.pem`, `*.key`, and `credentials*`. Don't add new auth shortcuts that bypass the MCP OAuth flow.
- `.claude/settings.json` denies reads of `.env` and `secrets/`. Keep those deny rules in place.

## Data sensitivity

The `data/` directory will accumulate snapshots that include:

- ASIN-level performance numbers
- Inventory positions
- Search-term reports (which can include competitor terms)
- Margin and pricing data

If your fork is **public**, treat everything you commit under `data/` as published. Either:

1. Keep the repo private, or
2. Uncomment the patterns at the bottom of `.gitignore` so `data/brands/*/` snapshots stay local-only.

## What an agent can and can't do

The bundled skills include tools that **write** to your Amazon accounts (campaign edits, listing updates, PO drafts). Claude Code prompts for permission before tool calls by default. If you broaden the `permissions.allow` list in `.claude/settings.json`, do it deliberately — that's the difference between an assistant and an autonomous actor.

For destructive or high-blast-radius operations (deleting campaigns, mass-updating listings, submitting POs), keep the prompt in the loop.

## Reporting a vulnerability

If you find a security issue in the template (the sync script, the MCP config, default settings, anything that could leak credentials or data when someone clones this repo), please open a private security advisory on GitHub or email the maintainer rather than filing a public issue.

Upstream MCP or skill issues should be reported to Marketplace Ad Pros directly.
