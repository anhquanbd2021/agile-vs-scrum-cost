import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scoreTeam, classify, CEREMONY_CHECKS, MINDSET_CHECKS, VERDICTS, THRESHOLD,
} from '../public/detector.mjs';

const ALL_ON = Object.fromEntries(
  [...CEREMONY_CHECKS, ...MINDSET_CHECKS].map((c) => [c.id, true]));
const ALL_OFF = Object.fromEntries(
  [...CEREMONY_CHECKS, ...MINDSET_CHECKS].map((c) => [c.id, false]));

test('seven ceremony + seven mindset checks, matching the article checklist', () => {
  assert.equal(CEREMONY_CHECKS.length, 7);
  assert.equal(MINDSET_CHECKS.length, 7);
  assert.deepEqual(CEREMONY_CHECKS.map((c) => c.id),
    ['planning', 'daily', 'review', 'retro', 'rolesStaffed', 'backlogEstimated', 'fixedCadence']);
  assert.deepEqual(MINDSET_CHECKS.map((c) => c.id),
    ['scopeNegotiable', 'retroActionShipped', 'velocityIsForecast', 'poDecides',
     'realFeedback', 'doneIsUsable', 'teamSetsPace']);
});

test('THE ZOMBIE PROOF: all 7 ceremonies pass while all 7 mindset checks fail', () => {
  const team = { ...ALL_OFF, planning: true, daily: true, review: true,
    retro: true, rolesStaffed: true, backlogEstimated: true, fixedCadence: true };
  const r = scoreTeam(team);
  assert.equal(r.ceremony.score, 7);
  assert.equal(r.mindset.score, 0);
  assert.equal(r.verdict, 'zombie');
});

test('the converse: zero Scrum ceremonies can still be fully agile', () => {
  const team = { ...ALL_ON, planning: false, daily: false, review: false,
    retro: false, rolesStaffed: false, backlogEstimated: false, fixedCadence: false };
  const r = scoreTeam(team);
  assert.equal(r.ceremony.score, 0);
  assert.equal(r.mindset.score, 7);
  assert.equal(r.verdict, 'agile-without-scrum');
});

test('quadrant classification covers all four corners', () => {
  assert.equal(classify(7, 7).id, 'agile');
  assert.equal(classify(THRESHOLD, THRESHOLD).id, 'agile');
  assert.equal(classify(0, 7).id, 'agile-without-scrum');
  assert.equal(classify(7, 0).id, 'zombie');
  assert.equal(classify(0, 0).id, 'ad-hoc');
  assert.equal(classify(4, 4).id, 'ad-hoc'); // just under threshold on both
});

test('every check defaults to fail on absent or non-true input', () => {
  const r = scoreTeam({});
  assert.equal(r.ceremony.score, 0);
  assert.equal(r.mindset.score, 0);
  const sloppy = scoreTeam({ planning: 'yes', daily: 1, review: 'held' });
  assert.equal(sloppy.ceremony.score, 0); // strict booleans only
});

test('each failing check carries a concrete fix', () => {
  for (const c of [...CEREMONY_CHECKS, ...MINDSET_CHECKS]) {
    assert.ok(c.fix.length > 20, `${c.id} needs a real fix hint`);
  }
});

test('verdicts carry a label and a note', () => {
  for (const v of Object.values(VERDICTS)) {
    assert.ok(v.label.length > 0 && v.note.length > 20);
  }
});

test('missingMindset lists exactly the failed mindset check ids', () => {
  const team = { ...ALL_ON, retroActionShipped: false, poDecides: false };
  const r = scoreTeam(team);
  assert.deepEqual(r.missingMindset, ['retroActionShipped', 'poDecides']);
});
