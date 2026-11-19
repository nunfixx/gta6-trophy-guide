// Renders the four sections: the checklist with its detail pane, the
// roadmap to the platinum, the missables page, and the sources page.
// Everything is built with DOM calls and textContent, never innerHTML
// from data, so a trophy's text can never inject markup.
import { KIND_LABELS, GRADE_LABELS, STAGES, countsByGrade } from './data.js';
import { applyFilters, displayName, displayDescription, isHiddenBySpoiler } from './filters.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function medal(grade) {
  const span = el('span', `medal ${grade}`, GRADE_LABELS[grade]);
  return span;
}

function kindLabel(t) {
  return KIND_LABELS[t.kind] || t.kind;
}

export function renderProgress(trophies, earned) {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  const fill = document.getElementById('progressFill');
  const text = document.getElementById('progressText');
  const grades = document.getElementById('gradeCounts');
  if (fill) fill.style.width = total ? `${Math.round((done / total) * 100)}%` : '0%';
  if (text) text.textContent = `${done} of ${total} earned${done === total ? ' — platinum!' : ''}`;
  if (grades) {
    const counts = countsByGrade(trophies);
    const earnedByGrade = {};
    for (const t of trophies) {
      if (earned.has(t.name)) earnedByGrade[t.grade] = (earnedByGrade[t.grade] || 0) + 1;
    }
    grades.textContent = ['platinum', 'gold', 'silver', 'bronze']
      .map((g) => `${GRADE_LABELS[g]} ${earnedByGrade[g] || 0}/${counts[g]}`)
      .join(' · ');
  }
}

export function renderChecklist(view, trophies, state, actions) {
  view.replaceChildren();
  const toolbar = el('div', 'toolbar');
  const search = el('input');
  search.type = 'search';
  search.placeholder = 'Search trophies, descriptions and guides…';
  search.setAttribute('aria-label', 'Search trophies');
  search.value = state.q;
  search.addEventListener('input', () => actions.setQuery(search.value));
  toolbar.append(search);

  const grade = el('select');
  grade.setAttribute('aria-label', 'Filter by grade');
  for (const [value, label] of [['all', 'All grades'], ['platinum', 'Platinum'], ['gold', 'Gold'], ['silver', 'Silver'], ['bronze', 'Bronze']]) {
    const opt = el('option', null, label);
    opt.value = value;
    if (state.grade === value) opt.selected = true;
    grade.append(opt);
  }
  grade.addEventListener('change', () => actions.setGrade(grade.value));
  toolbar.append(grade);

  const spoiler = el('label', 'toggle');
  const spoilerBox = el('input');
  spoilerBox.type = 'checkbox';
  spoilerBox.checked = state.spoiler;
  spoilerBox.addEventListener('change', () => actions.setSpoiler(spoilerBox.checked));
  spoiler.append(spoilerBox, document.createTextNode('Hide story spoilers'));
  toolbar.append(spoiler);

  const earnedOnly = el('label', 'toggle');
  const earnedBox = el('input');
  earnedBox.type = 'checkbox';
  earnedBox.checked = state.earnedOnly;
  earnedBox.addEventListener('change', () => actions.setEarnedOnly(earnedBox.checked));
  earnedOnly.append(earnedBox, document.createTextNode('Earned only'));
  toolbar.append(earnedOnly);

  const exportBtn = el('button', 'btn', 'Export progress');
  exportBtn.type = 'button';
  exportBtn.addEventListener('click', () => actions.exportProgress());
  toolbar.append(exportBtn);

  const importLabel = el('label', 'btn', 'Import progress');
  const importInput = el('input');
  importInput.type = 'file';
  importInput.accept = 'application/json,.json';
  importInput.hidden = true;
  importInput.addEventListener('change', () => {
    if (importInput.files && importInput.files[0]) actions.importProgress(importInput.files[0]);
    importInput.value = '';
  });
  importLabel.append(importInput);
  toolbar.append(importLabel);
  view.append(toolbar);

  const chips = el('div', 'chips');
  for (const [value, label] of [
    ['all', 'All kinds'], ['story', 'Story'], ['missable', 'Missable'],
    ['collectible', 'Collectibles'], ['activity', 'Activities'], ['combat', 'Combat'],
    ['heist', 'Heists'], ['money', 'Money'], ['secret', 'Secrets'], ['online', 'Online'],
  ]) {
    const chip = el('button', `chip${state.kind === value ? ' active' : ''}`, label);
    chip.type = 'button';
    chip.addEventListener('click', () => actions.setKind(value));
    chips.append(chip);
  }
  view.append(chips);

  const layout = el('div', 'layout');
  const list = el('div', 'list');
  const shown = applyFilters(trophies, state);
  if (shown.length === 0) {
    list.append(el('p', 'empty', state.kind === 'online'
      ? 'No online trophies: this game lists no online trophies on PlayStation, so this filter is empty by design.'
      : 'No trophies match these filters.'));
  }
  for (const t of shown) {
    const row = el('button', `row${state.earned.has(t.name) ? ' earned' : ''}${state.selected === t.id ? ' selected' : ''}`);
    row.type = 'button';
    row.addEventListener('click', (event) => {
      if (event.target.tagName === 'INPUT') return;
      actions.select(t.id);
    });
    const box = el('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => actions.toggleEarned(t));
    row.append(box);
    const body = el('div');
    body.append(el('div', 'name', displayName(t, state)));
    body.append(el('div', 'desc', displayDescription(t, state)));
    row.append(body);
    const meta = el('div', 'meta');
    meta.append(medal(t.grade));
    meta.append(el('span', 'kind-tag', kindLabel(t)));
    if (t.missable) meta.append(el('span', 'flag missable', 'Missable'));
    if (t.count !== null && t.count !== undefined) meta.append(el('span', 'kind-tag', `× ${t.count.toLocaleString('en-US')}`));
    row.append(meta);
    list.append(row);
  }
  layout.append(list);
  layout.append(renderDetail(trophies, state, actions));
  view.append(layout);
}

export function renderDetail(trophies, state, actions) {
  const pane = el('aside', 'detail');
  const t = trophies.find((x) => x.id === state.selected) || null;
  if (!t) {
    pane.append(el('h2', null, 'Pick a trophy'));
    pane.append(el('p', null, 'Select any trophy on the left to see its official description, its guide and its sources here.'));
    return pane;
  }
  const hidden = isHiddenBySpoiler(t, state);
  pane.append(el('h2', null, hidden ? 'Hidden trophy — story spoiler' : t.name));
  pane.append(el('p', 'official', hidden
    ? 'The name and description are hidden by the spoiler setting until this trophy is earned.'
    : `Official: “${t.description}”`));
  const badges = el('p');
  badges.append(medal(t.grade), document.createTextNode(` ${kindLabel(t)}`));
  if (t.missable) badges.append(document.createTextNode(' '), el('span', 'flag missable', 'Missable — see the Missables page'));
  if (t.count !== null && t.count !== undefined) badges.append(document.createTextNode(` · PSN target × ${t.count.toLocaleString('en-US')}`));
  pane.append(badges);
  if (!hidden) {
    pane.append(el('h3', null, 'Guide'));
    pane.append(el('p', 'guide', t.guide));
    pane.append(el('h3', null, 'Sources'));
    const sources = el('ul', 'sources');
    for (const s of t.sources) sources.append(el('li', null, s));
    pane.append(sources);
  }
  const act = el('div', 'actions');
  const toggle = el('button', state.earned.has(t.name) ? 'btn' : 'btn primary', state.earned.has(t.name) ? 'Mark as not earned' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => actions.toggleEarned(t));
  act.append(toggle);
  pane.append(act);
  return pane;
}

export function renderRoadmap(view, trophies, state, actions) {
  view.replaceChildren();
  const intro = el('p');
  intro.textContent = 'Six stages, in the order to play them. Story first, then side stories, activities, collectibles, heists and cleanup — the platinum is the last step. Tick trophies off here or on the checklist; it is the same progress.';
  view.append(intro);
  for (const stage of STAGES) {
    const card = el('section', 'stage');
    const members = trophies.filter((t) => t.stage === stage.n);
    const done = members.filter((t) => state.earned.has(t.name)).length;
    card.append(el('h2', null, `Stage ${stage.n} — ${stage.title}`));
    const count = el('p');
    count.append(el('span', 'count', `${done}/${members.length} earned`), document.createTextNode(` · ${stage.text}`));
    card.append(count);
    const list = el('ul');
    for (const t of members) {
      const li = el('li');
      const box = el('input');
      box.type = 'checkbox';
      box.checked = state.earned.has(t.name);
      box.setAttribute('aria-label', `Mark ${t.name} as earned`);
      box.addEventListener('change', () => actions.toggleEarned(t));
      const label = el('span', state.earned.has(t.name) ? 'done' : null);
      label.append(document.createTextNode(`${t.name} — `), medal(t.grade));
      if (t.missable) label.append(document.createTextNode(' '), el('span', 'flag missable', 'Missable'));
      li.append(box, label);
      list.append(li);
    }
    card.append(list);
    view.append(card);
  }
}

export function renderMissables(view, trophies, state, actions) {
  view.replaceChildren();
  const callout = el('div', 'callout');
  callout.append(el('h2', null, 'How this list was built'));
  callout.append(el('p', null, 'The missable flags come from the official descriptions alone. Story trophies are not missable: story missions in GTA games are replayable, so a chapter or mission trophy can always be earned again. Open-world trophies are not missable either: they repeat until they pop. The four below are the watchlist — their descriptions suggest a one-time chance, so check them before the final mission.'));
  callout.append(el('p', null, 'The game launched 19 November 2026 and no complete guide exists yet. Where a trigger is not confirmed by any published source, this page says so instead of inventing a location or step.'));
  view.append(callout);
  const watch = trophies.filter((t) => t.missable);
  for (const t of watch) {
    const card = el('section', 'stage');
    card.append(el('h2', null, t.name));
    const meta = el('p');
    meta.append(medal(t.grade), document.createTextNode(` ${kindLabel(t)} · `), el('span', 'flag missable', 'Possibly missable'));
    card.append(meta);
    card.append(el('p', null, `Official: “${t.description}”`));
    card.append(el('p', 'guide', t.guide));
    const sources = el('ul', 'sources');
    for (const s of t.sources) sources.append(el('li', null, s));
    card.append(sources);
    const act = el('div', 'actions');
    const toggle = el('button', state.earned.has(t.name) ? 'btn' : 'btn primary', state.earned.has(t.name) ? 'Mark as not earned' : 'Mark as earned');
    toggle.type = 'button';
    toggle.addEventListener('click', () => actions.toggleEarned(t));
    act.append(toggle);
    card.append(act);
    view.append(card);
  }
  const safe = el('section', 'stage');
  safe.append(el('h2', null, 'Safe: everything else'));
  safe.append(el('p', null, 'The other 51 trophies are story trophies (replayable missions), open-world activities, collectibles, heists and money goals. None of them needs a one-time story moment, so they can all be earned after the story in free roam.'));
  view.append(safe);
}

export function renderSources(view) {
  view.replaceChildren();
  const card = el('section', 'stage');
  card.append(el('h2', null, 'Sources & method'));
  card.append(el('p', null, 'The official list — 55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 of them hidden on PlayStation until earned — comes from Exophase and PSNProfiles, which agree on every name, description and grade. Each trophy below names its sources beside its guide.'));
  const list = el('ul', 'sources');
  const links = [
    ['Exophase — Grand Theft Auto VI trophies (official names, descriptions, grades): ', 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/'],
    ['PSNProfiles — Grand Theft Auto VI trophies (PSN progress targets): ', 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi'],
    ['PlayStation — the trophy list as published on PSN (via the two trackers above).', null],
  ];
  for (const [text, href] of links) {
    const li = el('li');
    li.append(document.createTextNode(text));
    if (href) {
      const a = el('a', null, href);
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
    }
    list.append(li);
  }
  card.append(list);
  card.append(el('h3', null, 'What the guides claim — and what they do not'));
  card.append(el('p', null, 'Every guide is written for this entry, in our own words, from the official description of its trophy. A guide that names a count (42 shooting-range challenges, 18 meditation spots, 52 areas) takes that count from PSNProfiles. Where a place or step is not pinned down by any published source yet — the game launched 19 November 2026 — the guide says so plainly instead of inventing it. No guide text is copied from another guide.'));
  card.append(el('h3', null, 'Offline, by design'));
  card.append(el('p', null, 'This app is static files only. It fetches one local file (data/trophies.json) and makes no network request. Your progress lives only in this browser, under localStorage, and export writes a file you own.'));
  view.append(card);
}
