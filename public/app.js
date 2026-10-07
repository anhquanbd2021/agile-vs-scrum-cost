import { scoreTeam } from './detector.mjs';

const $ = (sel) => document.querySelector(sel);
const EXAMPLES = [
  ['zombie-scrum', 'Zombie Scrum'],
  ['healthy-scrum', 'Healthy Scrum'],
  ['kanban-agile', 'Kanban agile'],
  ['ad-hoc', 'Ad hoc'],
];

const teams = {};
for (const [key] of EXAMPLES) {
  teams[key] = await (await fetch(`/examples/${key}.json`)).json();
}

function axisHtml(title, axis) {
  const items = axis.checks.map((c) => `
    <li class="${c.pass ? 'pass' : 'fail'}">
      <span class="q">${c.pass ? '✓' : '✗'} ${c.label}</span> — ${c.question}
      ${c.pass ? '' : `<div class="hint">${c.fix}</div>`}
    </li>`).join('');
  return `
    <div class="axis">
      <h3>${title} <span class="axis-score">${axis.score}/${axis.total}</span></h3>
      <ul class="checks">${items}</ul>
    </div>`;
}

function resultHtml(team) {
  const r = scoreTeam(team);
  return `
    <div class="verdict">
      <span class="grade ${r.verdict}">${r.verdictLabel}</span>
      <div class="grade-note">${r.verdictNote}</div>
    </div>
    <div class="axes">
      ${axisHtml('Ceremonies — did the meeting happen?', r.ceremony)}
      ${axisHtml('Mindset — did anything change?', r.mindset)}
    </div>`;
}

const tabs = $('#example-tabs');
EXAMPLES.forEach(([key, label], i) => {
  const r = scoreTeam(teams[key]);
  const b = document.createElement('button');
  b.innerHTML = `${label}<span class="score-chip">${r.ceremony.score}/${r.ceremony.total} · ${r.mindset.score}/${r.mindset.total}</span>`;
  if (i === 0) b.className = 'active';
  b.addEventListener('click', () => {
    tabs.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    show(key);
  });
  tabs.append(b);
});

function show(key) {
  $('#example-detail').innerHTML = `
    <div class="spec-view">${escapeHtml(JSON.stringify(teams[key], null, 2))}</div>
    <div>${resultHtml(teams[key])}</div>`;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

$('#score-btn').addEventListener('click', () => {
  $('#custom-error').textContent = '';
  $('#custom-result').innerHTML = '';
  let team;
  try {
    team = JSON.parse($('#custom-team').value);
  } catch (e) {
    $('#custom-error').textContent = `Not valid JSON: ${e.message}`;
    return;
  }
  if (typeof team !== 'object' || team === null || Array.isArray(team)) {
    $('#custom-error').textContent = 'Profile must be a JSON object.';
    return;
  }
  $('#custom-result').innerHTML = resultHtml(team);
});

show('zombie-scrum');
