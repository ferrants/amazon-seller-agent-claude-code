# reports/

Generated reports — weekly status, ad-hoc analyses, audit outputs. These are *artifacts*, not source data. Source data lives in `data/`; the story we tell about it lives here.

## Layout

```
reports/
├── weekly/         # one file per week, e.g., 2026-W20-status.md (or .html)
└── ad-hoc/         # one-off audits, deep-dives, share-outs
```

## Tips

- Use the bundled `status-report` skill to produce branded HTML weekly updates.
- Use the bundled `amazon-listing-audit` skill for listing audits.
- Use the dashboard skills (`fba-inventory-risk-dashboard`, `wasted-ad-spend-dashboard`, `search-term-harvest-dashboard`) to generate React artifacts directly in chat.
- Keep filenames dated and brand-prefixed: `2026-05-16-acmebeauty-wasted-spend.html`.
