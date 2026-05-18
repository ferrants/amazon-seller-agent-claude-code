# Amazon Seller Agent (Claude Code starter)

[![validate](https://github.com/ferrants/amazon-seller-agent-claude-code/actions/workflows/validate.yml/badge.svg)](https://github.com/ferrants/amazon-seller-agent-claude-code/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A starter repo that turns Claude Code into an operating agent for your Amazon selling business. Clone it, authenticate the Marketplace Ad Pros (MAP) MCP, and Claude gets a curated set of Amazon-focused skills plus a durable place to track brands, initiatives, and reports.

> **Using this as a template?** On GitHub, click **Use this template → Create a new repository** to start with a clean history. Or just `git clone` and re-init if you want to keep the upstream available for updates.

## What's in here

- **Marketplace Ad Pros MCP** wired up at the project level (`.mcp.json`) — Amazon Ads + Selling Partner data, optimization recommendations, and experiments.
- **Bundled skills** in `.claude/skills/` — auto-loaded by Claude Code:
  - `amazon-ads` — using MAP MCP for reporting, optimization, bid recommendations
  - `amazon-ads-optimization` — bid/budget tuning, negatives, seasonal playbooks
  - `amazon-seller-central` — inventory health, FBA fees, search query performance
  - `amazon-dsp` — DSP performance (agency profiles)
  - `amazon-listing-audit` — RUFUS scoring, hijack detection, suppression triage
  - `amazon-reorder-planning` — reorder points, safety stock, PO drafts
  - `experiments` — design, launch, log, and conclude optimization experiments
  - `fba-inventory-risk-dashboard` — interactive React dashboard for stockout risk
  - `wasted-ad-spend-dashboard` — search terms burning clicks with no conversions
  - `search-term-harvest-dashboard` — promote winning broad/phrase terms to exact
- **Tracking layout** — `data/brands/`, `initiatives/`, `reports/` — so progress survives across sessions.
- **`CLAUDE.md`** — durable instructions that make Claude operate as a brand manager, not a one-shot assistant.

## Prereqs

- [Claude Code](https://claude.com/claude-code) installed
- A Marketplace Ad Pros account (free tier is fine to start)
- `curl` and `unzip` (used by `scripts/sync-skills.sh`)

## Setup

```bash
# 1. Clone
git clone <your-fork-url> amazon-seller-agent
cd amazon-seller-agent

# 2. Open in Claude Code
claude
```

On first launch, Claude Code will ask whether to trust the project's `.mcp.json` and `.claude/skills/`. Approve both.

### Authenticate the MCP

In the Claude Code prompt:

```
/mcp
```

Pick `marketplaceadpros`, then `Authenticate`. A browser window will open, you sign into Marketplace Ad Pros, and Claude Code stores the OAuth token. The MAP tools (`list_brands`, `list_amazon_ads_integrations`, `ask_report_analyst`, …) become available immediately.

### Verify skills loaded

```
/skills
```

You should see the 10 Amazon skills listed above.

## Keeping skills up to date

The skills are bundled in the repo, but Marketplace Ad Pros publishes updates. To pull the latest:

```bash
bash scripts/sync-skills.sh           # upsert from remote bundle
bash scripts/sync-skills.sh --dry-run # preview what would change
```

The script overwrites bundled skills from the latest `https://marketplaceadpros.com/skills/all.zip` and leaves any local-only skill directories untouched.

## First-session checklist

Ask Claude:

```
Get me oriented. Run /mcp first if MAP isn't authenticated, then list my brands and ad integrations, and scaffold a data/brands/<slug>/profile.md for each.
```

Then pick the first thing to work on:

```
I want to run a Q3 PPC efficiency push for <brand>. Set up an initiative and propose a plan using the amazon-ads-optimization skill.
```

Claude will copy `initiatives/_template/` into a new initiative folder, fill in `PLAN.md`, and start logging.

## Directory cheat sheet

```
.claude/skills/         Amazon-focused skills (auto-loaded)
.claude/settings.json   Permissions + project config
.mcp.json               Marketplace Ad Pros HTTP MCP
CLAUDE.md               Agent instructions (read on every session)
data/                   Pulled snapshots, organized by brand
initiatives/            Active projects with PLAN/LOG/METRICS
reports/                Weekly status and ad-hoc artifacts
scripts/sync-skills.sh  Upsert skills from MAP
```

## Notes on data and secrets

- Token-bearing files are never committed. `.gitignore` covers `.env`, `secrets/`, credential blobs.
- The MAP MCP stores its OAuth credentials in Claude Code's own keychain — nothing lands in the repo.
- Data you pull (campaign reports, inventory snapshots) lands under `data/brands/<slug>/`. Decide per-brand whether to commit those snapshots or keep them local (uncomment the patterns in `.gitignore` to keep them local-only).

## License

The template itself (scaffolding, scripts, CLAUDE.md, configs) is MIT-licensed — see [LICENSE](LICENSE). The bundled skills under `.claude/skills/` are produced and maintained by [Marketplace Ad Pros](https://marketplaceadpros.com/skills/) and licensed by them separately.

## Contributing & security

- [CONTRIBUTING.md](CONTRIBUTING.md) — what belongs upstream vs. what to keep in your fork
- [SECURITY.md](SECURITY.md) — credential handling, data sensitivity, and reporting issues
