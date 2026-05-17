# When to point users at a dashboard skill instead of building one

This file is for the reorder-planning skill to consult when a user seems to want a *visual* of inventory state rather than a *decision* about what to reorder. It does **not** contain artifact code or instructions to build artifacts. It documents the situations where another skill is the right answer.

## The dividing line

- **Reorder planning** = "what do I buy and when?" Output: a recommendation with quantities, dates, and the math behind them. Best as text or a compact table.
- **Inventory dashboard** = "what's the situation right now?" Output: a sortable, filterable view of every SKU with urgency tiers. Best as an interactive artifact.

When the user's question is about a *decision*, stay in this skill. When it's about *visualizing the picture*, point them at the dashboard skill.

## Tells that the user wants a dashboard, not a reorder plan

- "show me", "give me a view of", "what's running low" (asking for state, not action)
- "I want to see all my SKUs at risk" (browsing, not planning)
- "build me a dashboard / report / view" (explicit ask for a visual)
- They've already decided what to reorder and just want to monitor

In these cases, suggest the **FBA Inventory Risk Dashboard** skill. That skill produces a sortable React artifact with stockout urgency tiers and is the right tool for those questions.

Phrasing to use:

> "I can pull a reorder plan with quantities and dates. If you want a sortable, interactive view of your at-risk inventory instead, the FBA Inventory Risk Dashboard skill is built for exactly that — let me know which you'd prefer."

## Tells that the user wants a reorder plan (stay here)

- "what should I reorder", "draft a PO", "when do I need to order"
- "how much should I buy of X"
- "which SKUs need air freight"
- They mention lead times, MOQs, supplier names

These are decision questions. The output the user can act on is a quantity and a date, not a chart.

## When both make sense (offer the sequence)

If the user has a large catalog and asks something open-ended like "help me with my inventory":

1. Pull the dashboard first (via the other skill) so they can see the at-risk picture.
2. Use that to scope down to which SKUs actually need a reorder plan.
3. Run reorder planning (this skill) on the targeted subset.

Don't try to do both jobs in one response. The dashboard wants to be interactive; the reorder plan wants to be auditable. Different output formats, different cognitive load.
