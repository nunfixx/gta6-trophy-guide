// Saved progress: which trophies are earned, kept in localStorage only.
// Nothing leaves the browser. Export writes a JSON file; import reads one
// back and keeps only the names that are on the official list.
const KEY = 'gta6-trophy-guide-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoiler-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const names = JSON.parse(raw);
    if (!Array.isArray(names)) return new Set();
    return new Set(names.filter((n) => typeof n === 'string'));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

export function loadSpoiler() {
  return localStorage.getItem(SPOILER_KEY) === '1';
}

export function saveSpoiler(on) {
  localStorage.setItem(SPOILER_KEY, on ? '1' : '0');
}

// The platinum unlocks itself: when the other 54 are earned, it is earned.
export function syncPlatinum(trophies, earned) {
  const platinum = trophies.find((t) => t.grade === 'platinum');
  if (!platinum) return false;
  const others = trophies.filter((t) => t.grade !== 'platinum');
  const allOthers = others.every((t) => earned.has(t.name));
  const had = earned.has(platinum.name);
  if (allOthers && !had) {
    earned.add(platinum.name);
    return true;
  }
  if (!allOthers && had) {
    earned.delete(platinum.name);
    return true;
  }
  return false;
}

export function exportProgress(earned) {
  const blob = new Blob(
    [JSON.stringify({ game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned] }, null, 2)],
    { type: 'application/json' },
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function importProgress(file, validNames) {
  const text = await file.text();
  const doc = JSON.parse(text);
  const names = Array.isArray(doc) ? doc : doc.earned;
  if (!Array.isArray(names)) throw new Error('not a progress file');
  const valid = new Set(validNames);
  const kept = names.filter((n) => typeof n === 'string' && valid.has(n));
  return new Set(kept);
}
