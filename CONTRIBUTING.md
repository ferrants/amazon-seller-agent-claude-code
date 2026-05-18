# Contributing

This repo is a starter template, so most "contributions" are actually forks: you clone it and shape it into your own workspace. That's the intended path. Don't feel obligated to send anything upstream.

That said, if you've found a bug in the template itself (the sync script, the directory layout, CLAUDE.md guidance, the MCP config), pull requests are welcome.

## What belongs in the template

Good upstream changes:

- Bug fixes to `scripts/sync-skills.sh`
- Improvements to `CLAUDE.md` operating instructions that apply to anyone running an Amazon biz
- Better defaults in `.claude/settings.json` (more useful allows, safer denies)
- Clearer README onboarding
- New initiative or report templates

What doesn't belong:

- Your own brand data, real ASINs, real numbers
- Personal scripts or skills that aren't broadly useful
- Skill changes (those live upstream at [marketplaceadpros.com/skills](https://marketplaceadpros.com/skills/) — send those there)

## Setup for local development

```bash
git clone <fork>
cd amazon-seller-agent-claude-code

# Validate the sync script before pushing
bash scripts/sync-skills.sh --dry-run
shellcheck scripts/sync-skills.sh   # if installed
```

The GitHub Actions workflow at `.github/workflows/validate.yml` runs both on every PR.

## PR checklist

- [ ] No real brand or seller data committed
- [ ] `bash scripts/sync-skills.sh --dry-run` works
- [ ] README still describes what the repo actually does
- [ ] If you changed CLAUDE.md, it still reads as durable instructions to Claude (not a changelog of decisions)
