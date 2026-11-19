# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/nunfixx/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/nunfixx/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Platinum** — the best offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI. Every trophy with its official name, description and grade as PlayStation publishes them, a guide in our own words that cites its sources, a roadmap to the platinum, the missable trophies flagged before you pass them, and a checklist whose progress is saved in the browser with export, import, filters by kind and a spoiler setting that hides story trophies until they are earned. It is static files only and works with the network off.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `app/` with any static file server and open `app/index.html`. Add `?demo=1` to the URL to see the guide with a sample early-game progress (13 of 55 earned).

## How it is built

- `app/index.html` — the shell: progress, tabs, and the four sections.
- `app/js/main.js` — boots the guide, restores saved progress, wires the tabs.
- `app/js/data.js` — loads the trophy list; names the kinds, filters and roadmap stages.
- `app/js/store.js` — progress in localStorage, export to a file and import back.
- `app/js/filters.js` — kind, grade, search, earned-only and the spoiler rule.
- `app/js/views.js` — renders the checklist, detail pane, roadmap, missables and sources.
- `app/css/style.css` — the original sunset look: gradients and system faces only.
- `app/data/trophies.json` — the official 55 trophies with a guide and sources for each.
- `main.ts` — hands the guide in: copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library.

## Sources

The official list (55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze) comes from Exophase and PSNProfiles, which agree on every name, description and grade. Every guide is written for this entry from the official description of its trophy. The game launched 19 November 2026, so where a place or step is not pinned down by any published source yet, the guide says so plainly instead of inventing it.

---

<sub>Entered on [make.fun](https://make.fun/?ref=pqrphsn3&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
