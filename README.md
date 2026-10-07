# Zombie Scrum Detector — companion demo

Interactive lab for the article *Agile ≠ Scrum — and Confusing Them Is
Expensive*. Score a team profile against **seven ceremony checks** (the
Scrum mechanics) and **seven mindset checks** (the agile behaviors) on two
independent axes, then read the quadrant verdict.

Zero dependencies — Node 20+ only. The detection engine is a plain ES
module shared by the browser UI, the CLI report, and the test suite.

## What it proves

| Team | Ceremonies | Mindset | Verdict |
|---|---|---|---|
| `zombie-scrum` | 7/7 | 0/7 | **zombie Scrum** |
| `healthy-scrum` | 7/7 | 7/7 | agile — Scrum done well |
| `kanban-agile` | 3/7 | 7/7 | agile without Scrum |
| `ad-hoc` | 2/7 | 1/7 | ad hoc |

The headline row is the first one: a team can run every Scrum ceremony
perfectly while every feedback loop the ceremonies exist for is dead.
And the Kanban row proves the converse — Scrum is neither necessary nor
sufficient for agility.

## The checks

- **Ceremony (the how):** sprint planning, daily standup, sprint review,
  retrospective, roles staffed (PO + Scrum Master), backlog estimated,
  fixed cadence.
- **Mindset (the why):** scope renegotiable, retro action shipped,
  velocity = forecast not pressure, PO decides without a committee,
  review yields real stakeholder feedback, done = usable, team sets its
  own pace.

Each failing check ships a concrete fix in the UI.

## Run it

```text
npm start        # serve the lab on :3000
npm test         # engine + examples + server
npm run report   # side-by-side CLI table on examples/
npm run check    # both
```

## Honest limits

- Inputs are self-reported booleans — the detector cannot tell an honest
  "yes" from an aspirational one. It scores described behavior, not
  culture.
- A 7/7 mindset score proves the feedback loops exist, not that they
  produce good decisions.
- The quadrant threshold (≥5/7) is a teaching simplification, not a
  certified maturity model.
- Scrum's real guide has more nuance than seven mechanics; this models
  the auditable surface, not the whole framework.

This is an educational demo, not an org-health instrument.
