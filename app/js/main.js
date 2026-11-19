// Boots the guide: loads the trophy list, restores saved progress, wires
// the tabs and the checklist actions, and renders the current section.
// ?demo=1 seeds a plausible early-game progress (13 of 55 earned) when no
// progress is saved yet, so the guide can be shown as it looks in use.
import { loadTrophies } from './data.js';
import { loadEarned, saveEarned, loadSpoiler, saveSpoiler, syncPlatinum, exportProgress, importProgress } from './store.js';
import { renderProgress, renderChecklist, renderRoadmap, renderMissables, renderSources } from './views.js';

const DEMO_EARNED = [2, 3, 4, 8, 15, 16, 19, 21, 28, 35, 44, 46, 53];

const state = {
  trophies: [],
  earned: loadEarned(),
  spoiler: loadSpoiler(),
  tab: 'checklist',
  kind: 'all',
  grade: 'all',
  q: '',
  earnedOnly: false,
  selected: 17,
};

const view = document.getElementById('view');

function persist() {
  if (syncPlatinum(state.trophies, state.earned)) saveEarned(state.earned);
  else saveEarned(state.earned);
}

function render() {
  renderProgress(state.trophies, state.earned);
  document.querySelectorAll('.tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === state.tab);
  });
  if (state.tab === 'checklist') renderChecklist(view, state.trophies, state, actions);
  else if (state.tab === 'roadmap') renderRoadmap(view, state.trophies, state, actions);
  else if (state.tab === 'missables') renderMissables(view, state.trophies, state, actions);
  else renderSources(view);
}

const actions = {
  select(id) {
    state.selected = id;
    if (state.tab !== 'checklist') state.tab = 'checklist';
    render();
  },
  toggleEarned(trophy) {
    if (state.earned.has(trophy.name)) state.earned.delete(trophy.name);
    else state.earned.add(trophy.name);
    persist();
    render();
  },
  setKind(kind) {
    state.kind = kind;
    render();
  },
  setGrade(grade) {
    state.grade = grade;
    render();
  },
  setQuery(q) {
    state.q = q;
    render();
    const search = view.querySelector('input[type="search"]');
    if (search) {
      search.focus();
      search.setSelectionRange(search.value.length, search.value.length);
    }
  },
  setSpoiler(on) {
    state.spoiler = on;
    saveSpoiler(on);
    render();
  },
  setEarnedOnly(on) {
    state.earnedOnly = on;
    render();
  },
  exportProgress() {
    exportProgress(state.earned);
  },
  async importProgress(file) {
    try {
      const names = state.trophies.map((t) => t.name);
      state.earned = await importProgress(file, names);
      persist();
      render();
    } catch {
      alert('That file is not a trophy-progress export from this guide.');
    }
  },
};

document.querySelectorAll('.tab').forEach((button) => {
  button.addEventListener('click', () => {
    state.tab = button.dataset.tab;
    history.replaceState(null, '', `#${state.tab}`);
    render();
  });
});

window.addEventListener('hashchange', () => {
  const tab = location.hash.replace('#', '');
  if (['checklist', 'roadmap', 'missables', 'sources'].includes(tab)) {
    state.tab = tab;
    render();
  }
});

try {
  state.trophies = await loadTrophies();
  const params = new URLSearchParams(location.search);
  const hashTab = location.hash.replace('#', '');
  if (['checklist', 'roadmap', 'missables', 'sources'].includes(hashTab)) state.tab = hashTab;
  if (params.get('spoiler') === '1') {
    state.spoiler = true;
    saveSpoiler(true);
  }
  if (params.get('demo') === '1' && state.earned.size === 0) {
    for (const id of DEMO_EARNED) {
      const t = state.trophies.find((x) => x.id === id);
      if (t) state.earned.add(t.name);
    }
    persist();
  }
  render();
} catch (error) {
  view.replaceChildren();
  const p = document.createElement('p');
  p.className = 'empty';
  p.textContent = 'The trophy list could not be loaded. Open this guide from its own files (data/trophies.json must sit beside it) and reload.';
  view.append(p);
}
