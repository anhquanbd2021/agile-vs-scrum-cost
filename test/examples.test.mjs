import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { scoreTeam } from '../public/detector.mjs';

const EXAMPLES = fileURLToPath(new URL('../examples', import.meta.url));
const load = (n) => JSON.parse(readFileSync(join(EXAMPLES, `${n}.json`), 'utf8'));

test('four bundled example profiles exist and parse', () => {
  const files = readdirSync(EXAMPLES).filter((f) => f.endsWith('.json'));
  assert.equal(files.length, 4);
  for (const f of files) assert.ok(load(f.replace('.json', '')));
});

test('the four examples score exactly as the article claims', () => {
  const expected = [
    ['zombie-scrum', 7, 0, 'zombie'],
    ['healthy-scrum', 7, 7, 'agile'],
    ['kanban-agile', 3, 7, 'agile-without-scrum'],
    ['ad-hoc', 2, 1, 'ad-hoc'],
  ];
  for (const [name, cer, mind, verdict] of expected) {
    const r = scoreTeam(load(name));
    assert.equal(r.ceremony.score, cer, `${name} ceremonies should be ${cer}/7, got ${r.ceremony.score}`);
    assert.equal(r.mindset.score, mind, `${name} mindset should be ${mind}/7, got ${r.mindset.score}`);
    assert.equal(r.verdict, verdict, `${name} should verdict ${verdict}, got ${r.verdict}`);
  }
});

test('the zombie example fails EVERY mindset check — the article headline claim', () => {
  const r = scoreTeam(load('zombie-scrum'));
  assert.equal(r.ceremony.score, r.ceremony.total);
  assert.equal(r.mindset.checks.every((c) => !c.pass), true);
});

test('kanban-agile out-scores zombie-scrum on the mindset axis', () => {
  const kanban = scoreTeam(load('kanban-agile'));
  const zombie = scoreTeam(load('zombie-scrum'));
  assert.ok(kanban.mindset.score > zombie.mindset.score);
  assert.ok(kanban.ceremony.score < zombie.ceremony.score);
});
