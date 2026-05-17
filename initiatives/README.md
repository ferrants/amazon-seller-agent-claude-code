# initiatives/

Each initiative is a focused, time-bound effort: a launch, a turnaround, an experiment program, a Q4 push. One folder per initiative.

## Why this exists

Without somewhere durable to record *what you're doing and why*, Claude restarts from scratch every session and you lose the thread. An initiative folder is the memory layer between sessions.

## Layout

```
initiatives/
├── _template/                  # copy this for new initiatives
│   ├── PLAN.md                 # goal, hypothesis, scope, success criteria, owner
│   ├── LOG.md                  # dated, append-only running log
│   └── METRICS.md              # numbers we'll move + baselines + targets
└── <slug>/                     # e.g., q3-ppc-efficiency-push/
```

## How to use it with Claude

- Start a new initiative: `cp -R initiatives/_template initiatives/<slug>` then fill in `PLAN.md`.
- Every meaningful session, Claude should append a dated entry to `LOG.md` — what was pulled, what was decided, what's next.
- When metrics shift, update `METRICS.md` rather than burying numbers in chat history.
- Close out: rename to `initiatives/_archive/<slug>/` and write a final summary at the top of `PLAN.md`.

The `status-report` skill reads from these folders to generate weekly updates.
