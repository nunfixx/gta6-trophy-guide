// Filtering for the checklist: kind, grade, search text, earned-only, and
// the spoiler rule. The spoiler setting hides the names and descriptions of
// story trophies until they are earned; it never hides the grade or the
// trophy's place in the list.
export function applyFilters(trophies, state) {
  const q = state.q.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind === 'missable' && !t.missable) return false;
    if (state.kind === 'online') return false;
    if (state.kind !== 'all' && state.kind !== 'missable' && t.kind !== state.kind) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.earnedOnly && !state.earned.has(t.name)) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// What the list shows for a trophy under the spoiler setting.
export function displayName(trophy, state) {
  if (state.spoiler && trophy.kind === 'story' && !state.earned.has(trophy.name)) {
    return 'Hidden trophy — story spoiler';
  }
  return trophy.name;
}

export function displayDescription(trophy, state) {
  if (state.spoiler && trophy.kind === 'story' && !state.earned.has(trophy.name)) {
    return 'Hidden until earned. Turn the spoiler setting off, or tick this trophy once you have earned it, to see its name and description.';
  }
  return trophy.description;
}

export function isHiddenBySpoiler(trophy, state) {
  return state.spoiler && trophy.kind === 'story' && !state.earned.has(trophy.name);
}
