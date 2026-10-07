// CLI: score the four bundled team profiles side by side.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { scoreTeam, CEREMONY_CHECKS, MINDSET_CHECKS } from '../public/detector.mjs';

const EXAMPLES = fileURLToPath(new URL('../examples', import.meta.url));
const names = ['zombie-scrum', 'healthy-scrum', 'kanban-agile', 'ad-hoc'];
const results = names.map((n) => ({
  name: n,
  team: JSON.parse(readFileSync(join(EXAMPLES, `${n}.json`), 'utf8')),
}));
for (const r of results) r.result = scoreTeam(r.team);

const col = 24;
const pad = (s) => String(s).padEnd(col);
console.log('ZOMBIE SCRUM DETECTOR — four teams, two audits\n');
console.log('check'.padEnd(col) + results.map((r) => pad(r.name)).join(''));
const mark = (list, id) => (list.find((x) => x.id === id).pass ? 'PASS' : 'fail');
for (const c of CEREMONY_CHECKS) {
  console.log(`C ${c.label}`.padEnd(col) + results.map((r) => pad(mark(r.result.ceremony.checks, c.id))).join(''));
}
for (const c of MINDSET_CHECKS) {
  console.log(`M ${c.label}`.padEnd(col) + results.map((r) => pad(mark(r.result.mindset.checks, c.id))).join(''));
}
console.log('-'.repeat(col + col * results.length));
console.log('ceremonies'.padEnd(col) + results.map((r) => pad(`${r.result.ceremony.score}/${r.result.ceremony.total}`)).join(''));
console.log('mindset'.padEnd(col) + results.map((r) => pad(`${r.result.mindset.score}/${r.result.mindset.total}`)).join(''));
console.log('verdict'.padEnd(col) + results.map((r) => pad(r.result.verdictLabel)).join(''));

console.log('\nThe proof:');
const zombie = results[0].result;
console.log(`  zombie-scrum passes ${zombie.ceremony.score}/${zombie.ceremony.total} ceremonies ` +
  `while failing ${zombie.mindset.checks.filter((c) => !c.pass).length}/${zombie.mindset.total} mindset checks.`);
console.log('  Missing mindset signals: ' + (zombie.missingMindset.join(', ') || 'none'));
