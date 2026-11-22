# best-heist-game-20261122-0559 — Top-20 / board notes

Checked Sun 2026-11-22 ~13:10 WIB (06:10 UTC), ~1h after open (05:59 UTC).

## Live board (API)
- `GET /api/competitions/best-heist-game-20261122-0559/leaderboard?limit=100` → `entries: []`, `metrics_withheld: true`, blind rounds.
- Board is EMPTY at open: no entries yet, no top-1–20 pattern to diff against.
- Blind rounds: nothing is judged on submit; entries are judged at each of 4 rounds.
  Next round: 2026-11-22T08:59:00Z = 15:59 WIB. Submit BEFORE 15:59 WIB to be judged in round 1.
- After each round, only our own rank/score visible at `GET .../rounds`.

## Judge (from competition.yaml / RULES.txt) — what decides
- AI judge (z-ai/glm-5.3-flash) compares dossiers pairwise; win rate decides; top 10 share $50 (1st $12 … 6th–10th $3).
- Judge view = 1,536 tokens: ONE contact sheet of screenshots (cover biggest, 768×480) + a short source outline (file paths/sizes + first declarations). **The judge sees the game mostly through the screenshots.**
- Criteria, first difference decides unless a later one differs much more:
  1. Completeness: a room the thief is crossing, guards with vision cones, cameras, a loot target and an alarm meter — ALL visible in ONE frame.
  2. Feel/polish: tension as cones sweep, a fair caught moment, a getaway that pays off the planning.
  3. Look/originality: safe cover, danger and loot obvious at a glance; NOT a generic top-down tile set; original names/art, no commercial copy.
  4. Structure: source split into files with one clear job each, named for what they do (names are most of what the outline shows).
- Dev heat: 12 games vs 4 fixed house games (+ rungs); top 40 dev board → final heat (3 Swiss rounds + top-12 playoff). Final re-judges afresh.
- Screenshots: 3–4, ≤256 KiB each, ≤1280×480 px. First by name = cover = biggest on the sheet.
- Gate (sealed scorer): game/ plain files ≤993 files / 48 MiB, all refs inside game/ or data: URIs, no network. Dossier ≤1.5 MiB, source text cap 160 KiB.
- Transcripts: thinking_in_window (session ≥ open 05:59 UTC), thinking_reproduces ≥30% authored, thinking_revised ≥2 writes of some file, thinking_turns ≥5, thinking_fresh (source bundle: anchor line quoted before first write).

## Gap to close (board empty → spec + best-game-01 lessons)
- best-game-01 lesson: a complete playable loop + clear win/lose + juicy feedback beats a thin demo; the judge reads screenshots first, so the COVER frame must show the whole heist at a glance.
- Cover choice: make `1-play.jpg` the cover — full heist in progress (thief mid-room, guard cones sweeping, camera cones, loot vault glowing, alarm meter visible, HUD with score/timer). Title screen as 2nd shot, red-alert chase as 3rd, getaway/win as 4th.
- Visual language: dark museum/vault at night, warm loot gold vs cold guard-cone red/amber, clear safe-cover shadows vs danger cones — readable when shrunk to 768×480.
- No generic tile set: draw the room as a single detailed floor plan (marble floor, display cases, laser grid, vault door, exit van) with canvas vector art, all in code, no external assets.
- Game must be genuinely playable: stealth movement (WASD/arrows + mouse?), guard patrols + vision cones, cameras with sweeping cones, loot pickup, alarm meter that rises on detection and falls when hidden, 3 escalating levels (or one room with escalating patrols), win = grab loot + reach exit, lose = alarm 100% / caught. Score + timer + loot value. Sound-free (no external assets; WebAudio synth optional, keep self-contained).
- Source split: index.html, src/main.js, src/world.js (levels/room), src/guards.js (patrol+vision), src/render.js, src/input.js, src/audio.js (synth, optional), src/shots.js (deterministic ?shot= states), src/config.js — one job each, descriptive function names for the outline.
