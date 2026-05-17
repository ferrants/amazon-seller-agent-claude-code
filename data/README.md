# data/

Raw and cached data pulled from the Marketplace Ad Pros MCP, Amazon reports, and other sources. Treat this directory as your **local data lake** — every brand gets its own folder, and Claude is encouraged to write snapshots here so future sessions don't have to refetch.

## Layout

```
data/
├── brands/
│   └── <brand-slug>/
│       ├── profile.md          # one-pager: who they are, integrations, key ASINs
│       ├── catalog/            # ASIN snapshots, listing audits
│       ├── ads/                # campaign + keyword snapshots, performance pulls
│       ├── inventory/          # FBA inventory, reorder math
│       └── search-terms/       # harvest + waste reports
└── shared/                     # cross-brand reference data (taxonomies, benchmarks)
```

## Conventions

- Filenames include the date pulled: `ads-2026-05-16.csv`, `inventory-2026-05-16.json`.
- Prefer CSV or JSON — they're cheap to grep and diff.
- Don't commit anything with PII, refresh tokens, or seller-secret data. See `.gitignore`.
- When Claude pulls fresh data, it should write a one-line entry to the relevant initiative's `LOG.md` pointing at the file.

See `data/brands/_example/` for the layout a new brand should follow.
