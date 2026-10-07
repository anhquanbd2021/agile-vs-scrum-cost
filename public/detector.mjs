// Zombie Scrum Detector — shared engine (browser, CLI, tests).
// Scores a team profile on two INDEPENDENT axes:
//   ceremony  — did the Scrum mechanics happen? (the "how")
//   mindset   — did the agile behavior change anything? (the "why")
// The two axes are deliberately orthogonal: a team can pass every
// ceremony while failing every mindset check — that's zombie Scrum.

export const CEREMONY_CHECKS = [
  {
    id: 'planning', label: 'sprint planning',
    question: 'Does sprint planning actually run each sprint?',
    pass: (t) => t.planning === true,
    fix: 'Hold planning at sprint start — and give it a sprint goal, not just a task list.',
  },
  {
    id: 'daily', label: 'daily standup',
    question: 'Does the team sync every day?',
    pass: (t) => t.daily === true,
    fix: 'Run a daily — 15 minutes, for the team, not as a status report to a manager.',
  },
  {
    id: 'review', label: 'sprint review',
    question: 'Is there a review/demo at the end of each sprint?',
    pass: (t) => t.review === true,
    fix: 'Hold a sprint review that shows a working increment, not slides.',
  },
  {
    id: 'retro', label: 'retrospective',
    question: 'Does the team hold a retrospective?',
    pass: (t) => t.retro === true,
    fix: 'Hold the retro every sprint — then see the mindset axis for whether it counts.',
  },
  {
    id: 'rolesStaffed', label: 'roles staffed',
    question: 'Is there a named Product Owner and Scrum Master?',
    pass: (t) => t.rolesStaffed === true,
    fix: 'Name a real Product Owner and Scrum Master — not "the team" or a rotating hat.',
  },
  {
    id: 'backlogEstimated', label: 'backlog estimated',
    question: 'Is the backlog ordered and estimated?',
    pass: (t) => t.backlogEstimated === true,
    fix: 'Keep an ordered, estimated backlog — estimates for forecasting, not for scoring people.',
  },
  {
    id: 'fixedCadence', label: 'fixed cadence',
    question: 'Are sprints a fixed length?',
    pass: (t) => t.fixedCadence === true,
    fix: 'Fix the sprint length — a cadence that flexes to fit the work is not a cadence.',
  },
];

export const MINDSET_CHECKS = [
  {
    id: 'scopeNegotiable', label: 'scope renegotiable',
    question: 'Can sprint scope change when the team learns something new?',
    pass: (t) => t.scopeNegotiable === true,
    fix: 'Let the sprint goal bend when learning demands it — a frozen sprint backlog is waterfall in costume.',
  },
  {
    id: 'retroActionShipped', label: 'retro action shipped',
    question: 'Did the last retro produce an action that actually changed something?',
    pass: (t) => t.retroActionShipped === true,
    fix: 'Take one retro action per sprint into the backlog as real work. Inspection without adaptation is a ritual.',
  },
  {
    id: 'velocityIsForecast', label: 'velocity = forecast',
    question: 'Is velocity used to forecast — never to pressure?',
    pass: (t) => t.velocityIsForecast === true,
    fix: 'Use velocity to plan, never as a performance target — a metric aimed at a target stops measuring.',
  },
  {
    id: 'poDecides', label: 'PO decides',
    question: 'Does the Product Owner make priority calls without escalating to a committee?',
    pass: (t) => t.poDecides === true,
    fix: 'Give the PO single, ordered decision authority — a PO who defers turns every call into days.',
  },
  {
    id: 'realFeedback', label: 'real feedback',
    question: 'Does the review include stakeholders whose feedback reorders the backlog?',
    pass: (t) => t.realFeedback === true,
    fix: 'Invite stakeholders to the review with a question to answer — a demo to an empty room is dead.',
  },
  {
    id: 'doneIsUsable', label: 'done = usable',
    question: 'Does "done" mean usable by someone — not "merged" or "QA passed"?',
    pass: (t) => t.doneIsUsable === true,
    fix: 'Define done as a usable increment — "merged" is a pipeline state, not a deliverable.',
  },
  {
    id: 'teamSetsPace', label: 'team sets pace',
    question: 'Does the team control its own capacity — not commitments made for it?',
    pass: (t) => t.teamSetsPace === true,
    fix: 'Let the team pull work to capacity — commitments imposed from outside are just deadlines in costume.',
  },
];

export const THRESHOLD = 5; // >=5 of 7 counts as "high" on that axis

export const VERDICTS = {
  agile: {
    id: 'agile', label: 'agile — Scrum done well',
    note: 'High ceremonies, high mindset. The mechanics serve the feedback loops.',
  },
  'agile-without-scrum': {
    id: 'agile-without-scrum', label: 'agile without Scrum',
    note: 'Low ceremonies, high mindset. Kanban, XP, or continuous delivery can carry the why without the Scrum how.',
  },
  zombie: {
    id: 'zombie', label: 'zombie Scrum',
    note: 'High ceremonies, low mindset. Every box ticked, every feedback loop dead — the expensive case.',
  },
  'ad-hoc': {
    id: 'ad-hoc', label: 'ad hoc',
    note: 'Low on both axes. Neither the framework nor the mindset is present.',
  },
};

export function classify(ceremonyScore, mindsetScore) {
  const c = ceremonyScore >= THRESHOLD;
  const m = mindsetScore >= THRESHOLD;
  if (c && m) return VERDICTS.agile;
  if (!c && m) return VERDICTS['agile-without-scrum'];
  if (c && !m) return VERDICTS.zombie;
  return VERDICTS['ad-hoc'];
}

function runChecks(checks, team) {
  return checks.map((c) => ({
    id: c.id, label: c.label, question: c.question,
    pass: !!c.pass(team), fix: c.fix,
  }));
}

export function scoreTeam(team) {
  const ceremony = runChecks(CEREMONY_CHECKS, team);
  const mindset = runChecks(MINDSET_CHECKS, team);
  const ceremonyScore = ceremony.filter((c) => c.pass).length;
  const mindsetScore = mindset.filter((c) => c.pass).length;
  const verdict = classify(ceremonyScore, mindsetScore);
  return {
    ceremony: { score: ceremonyScore, total: ceremony.length, checks: ceremony },
    mindset: { score: mindsetScore, total: mindset.length, checks: mindset },
    verdict: verdict.id,
    verdictLabel: verdict.label,
    verdictNote: verdict.note,
    missingMindset: mindset.filter((c) => !c.pass).map((c) => c.id),
  };
}
