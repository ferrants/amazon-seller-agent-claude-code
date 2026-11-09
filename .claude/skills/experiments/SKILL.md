---
name: experiments
description: Run Marketplace Ad Pros optimization experiments end-to-end through the MCP. Use whenever the user asks "what should I test", "what's running on my experiments", "what's next", "log this on the experiment", "start that experiment", "dismiss the proposal", "wrap up this experiment", or mentions an experiment by name or ID. Trigger any time the user is working in the Experiments section of Marketplace Ad Pros, reviewing AI-generated proposals, applying changes to running tests, or asking for next steps the daily tracker has identified.
---

# Marketplace Ad Pros Experiments

<!-- map-onboarding:start -->
**If the Marketplace Ad Pros tools aren't available** (check before the first tool call):
- **Tools are listed but calls fail** with an authentication or "no integrations" error: the user already has an account. Send them to https://app.marketplaceadpros.com/integrations to connect or reconnect Amazon Ads, then refresh the MCP connector in their client. Don't suggest signing up again.
- **No Marketplace Ad Pros tools at all:** this skill works on live Amazon Ads data through Marketplace Ad Pros. Say so once, then:
  - If they already have an account, they only need to add the MCP connector: https://marketplaceadpros.com/amazon-ads-mcp-server-for-claude/
  - Otherwise they can connect their Amazon account free at https://app.marketplaceadpros.com/signup?r=fHNraWxsLWV4cGVyaW1lbnRzfHNraWxsX2xpbms%3D and then add the connector.
  - Experiments need a full-feature plan (https://marketplaceadpros.com/plans/); AI Connect accounts can't run them.
- Never claim to have pulled or changed data without a tool call. General questions can still be answered from this guide.
<!-- map-onboarding:end -->

You help the user run optimization experiments end-to-end through the MCP. Marketplace Ad Pros proposes the tests and tracks impact daily; **you do the actual work in their Amazon account and write back what you did**. The user is the human in the loop — confirm before write actions, and always tell them what changed.

Experiments are part of the full-features Marketplace Ad Pros plans; AI Connect accounts can't run them.

## The lifecycle

1. **proposed** — AI-generated idea. User reviews, then `start_experiment` (commits to running it) or `dismiss_experiment` with a reason.
2. **started** — Running. User applies the plan in Amazon. The daily tracker measures impact and updates `current_action` with the next concrete step.
3. **complete** — Done. `complete_experiment` generates a written conclusion into the `results` field.

> Marketplace Ad Pros **never changes anything in Amazon automatically**. The user (or you, via Amazon Ads write tools when authorized) applies plan changes. The tracker only observes.

## When the user asks "what should I work on?" / "what's next?"

Call `get_experiments(show_experiment_details=true)`. For each `started` experiment, summarize the name + the first sentence of `current_action` in one line and ask which they want to work on. If there are no started experiments but there are proposals, also pass `show_proposals=true` and surface the highest `impact_score` proposal as an offer to start.

## When working a `current_action`

`current_action` is written as concrete steps — often referencing other MCP tools by name (e.g. `ask_report_analyst`, `list_resources`). Do the work yourself:

- Pull data via `ask_report_analyst` or similar read tools
- Make changes via the Amazon Ads write tools **only after the user authorizes**
- After each step, call `add_experiment_log` with a short paragraph: what you did, the numbers you saw, decisions you made
- Quote the `summary` field from every write-tool response back to the user — that's your confirmation line

## When the user says "start it"

Call `start_experiment(experiment_id=...)`. Confirm first that the user is ready to apply the plan in Amazon. Optional `planned_end_date` overrides the default 14-day window — accept either a full ISO datetime or a plain date like `2026-06-15` (interpreted as end of that day UTC).

## When the user says "dismiss it" / "skip it"

Call `dismiss_experiment(experiment_id=..., reason=...)`. **Always capture a reason** — even a one-liner ("already running similar test", "wrong brand fit"). The reason is logged and improves future proposals. Only `proposed` or `planned` experiments can be dismissed.

## When the user says "wrap it up" / "we're done"

Call `complete_experiment(experiment_id=...)`. The platform runs its AI results generator (conclusion, key findings, metrics summary, suggested next experiments) and writes them to the experiment's `results` field. **Share the generated results verbatim** — the user wants to see what the system concluded, not your paraphrase. Only `started` or `probably_started` experiments can be completed; if it's `planned`, call `start_experiment` first.

## Tool reference

| Tool | Read/Write | Purpose |
|---|---|---|
| `get_experiments` | Read | List/fetch experiments. Set `show_experiment_details=true` for plan, log, measurements; `show_proposals=true` to include proposed. |
| `start_experiment` | Write | proposed/planned → started. Captures baseline metric snapshot. |
| `add_experiment_log` | Write | Append a USER-sourced entry. Tracker reads the log on its next run. |
| `dismiss_experiment` | Write | proposed/planned → dismissed. Captures a reason. |
| `complete_experiment` | Write | started → complete. Runs AI results generator. |

Read tools are safe to call freely. Write tools should be approved by the user — many MCP clients let users gate write-tool calls behind a confirm prompt; that's expected.

## Cadence

- **Daily:** ask "what's next on my experiments" → fresh `current_action` items from the overnight tracker.
- **Weekly:** review proposals. Start the high-impact ones; dismiss the ones that don't fit (with a reason).
- **End of window:** complete experiments whose `planned_end_date` has passed and whose results look ready.

## Common confusions

- `planned` ≠ `started`. A `planned` experiment hasn't captured a baseline; call `start_experiment` before `complete_experiment`.
- The tracker runs **once daily** — if you just made a change in Amazon, the impact won't appear in `current_action` until tomorrow.
- `current_action` references tools by name (e.g. "run ask_report_analyst"). That's your cue to actually call those tools, not just relay the instruction to the user.
- If an experiment tool fails with "requires a current full-features plan", the account is on AI Connect or its plan has lapsed. Tell them experiments need a full-features Marketplace Ad Pros plan (a trial counts) and point them to their account's plan settings.

## Examples

### Example 1 — Daily check-in

> **User:** What should I work on today?
>
> **Assistant:** *(calls `get_experiments(show_experiment_details=true)`)*
> You have two running experiments:
> 1. **Bid Strategy A/B Test (SP/Targeted Campaigns)** — next: pull spend report for 2026-05-13..15 to compare control vs test ACOS by pair.
> 2. **Negative Keyword Clean-up (CA + US pilot)** — next: identify search terms with ≥20 clicks and 0 orders to negate.
>
> Which would you like to tackle first?

### Example 2 — Working a current_action

> **User:** Let's do the bid strategy one.
>
> **Assistant:** Got it. The current action asks me to pull a spend report for 2026-05-13 through 2026-05-15, grouped by campaign, date, and treatment. I'll do that now.
> *(calls `ask_report_analyst(...)` and gets results)*
> Across the 6 control/test pairs, test campaigns ran at 28% ACOS vs 32% for controls — a 4-point improvement, well within the 30% early-stop guardrail. Test sales are 92% of control (above the 75% floor). I'll log this so tomorrow's tracker picks it up.
> *(calls `add_experiment_log(experiment_id=..., content="Pulled 2026-05-13..15 spend report...")`)*
> Logged. The tracker will incorporate this on its next run.

### Example 3 — Starting a proposal

> **User:** Start the daily budget reallocation experiment.
>
> **Assistant:** Before I start it: this experiment has you reallocate budget from low-performing campaigns to the top performers over a 14-day window. Marketplace Ad Pros doesn't push changes to Amazon automatically — once it's started, I can make the budget changes for you (I'll show you each one first) or you can apply them yourself. Ready?
>
> **User:** Yes, go.
>
> **Assistant:** *(calls `start_experiment(experiment_id=...)`)*
> Started. Planned end date: 2026-05-29. The first `current_action` will appear after tomorrow's tracker run. Want me to draft the budget changes now so you can approve them?

### Example 4 — Dismissing a proposal

> **User:** Skip the ASIN targeting one, we already ran that last quarter.
>
> **Assistant:** *(calls `dismiss_experiment(experiment_id=..., reason="already ran a similar ASIN targeting test in Q1 — competitor entries didn't move the needle")`)*
> Dismissed. Reason recorded so future proposals will steer clear of similar ASIN targeting tests.

### Example 5 — Wrapping up

> **User:** The bid strategy test is done — wrap it up.
>
> **Assistant:** *(calls `complete_experiment(experiment_id=...)`)*
> Done. Here are the results:
>
> *(quotes the generated `results` field verbatim, including Conclusion, Key Findings, Metrics Summary, and Suggested Next Experiments)*
