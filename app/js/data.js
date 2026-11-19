// Loads the trophy list and names the shapes the app works with.
// Every trophy comes from app/data/trophies.json: the official name,
// description and grade as PlayStation publishes them, plus this guide's
// own kind, roadmap stage, missable flag, PSN count and guide text.
export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('could not load data/trophies.json');
  const doc = await response.json();
  return doc.trophies;
}

export const KIND_LABELS = {
  story: 'Story',
  collectible: 'Collectibles',
  activity: 'Activities',
  combat: 'Combat',
  heist: 'Heists',
  money: 'Money',
  secret: 'Secrets',
};

// The filter chips the tracker offers. "Online" is listed because the
// rules ask for it: this game lists no online trophies, so it shows none.
export const KIND_FILTERS = [
  ['all', 'All kinds'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['collectible', 'Collectibles'],
  ['activity', 'Activities'],
  ['combat', 'Combat'],
  ['heist', 'Heists'],
  ['money', 'Money'],
  ['secret', 'Secrets'],
  ['online', 'Online'],
];

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const STAGES = [
  { n: 1, title: 'Play the story', text: 'Chapters 1 to 4 and the final mission, in order. The chapter trophies and the named-mission trophies all land here. Keep a manual save before the final mission.' },
  { n: 2, title: 'Side stories & partners', text: 'The stranger strands (Andy, Kenton, Billy, Randy, Tyrone and the three more the map reveals) and the partner trophies. Do these before the finale if you can — two of the watchlist trophies live in this stage.' },
  { n: 3, title: 'Activities & skills', text: 'Stunts, the shooting range, races, fishing, arcade, meditation, hunting and bowling. One try of each activity type also lands Master of None.' },
  { n: 4, title: 'Collect & explore', text: 'Cards, WAiNK tags, vehicles, the 52 areas of Leonida, challenges, garages, the Scooter Bros app and the money trophies. Grab these while you are out doing other things.' },
  { n: 5, title: 'Heists & cleanup', text: 'Bank vaults, the armored truck, gang operations, the jewelry store, the Rhino and the odd one-offs (VCIA, the showroom, the strange event). Everything repeatable in the open world.' },
  { n: 6, title: 'Platinum', text: 'Attain 100% Completion, then the platinum pops on its own. The 100% counter covers the story, the strands, the collectibles, the activities and the stunts — everything this guide tracks.' },
];

export function trophyById(trophies, id) {
  return trophies.find((t) => t.id === id) || null;
}

export function countsByGrade(trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) counts[t.grade] = (counts[t.grade] || 0) + 1;
  return counts;
}
