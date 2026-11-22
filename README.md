# MIDNIGHT HEIST — The Marlow Museum Job

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/Agusgarut/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/Agusgarut/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

Entered on [make.fun](https://make.fun/?ref=ctn5sjdw&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards

A complete top-down stealth heist game that plays offline in a desktop browser.
You are the thief on the Marlow Museum job: three rooms, one diamond, one
sapphire, one crown. Slip past the guards and their sweeping vision cones,
duck the wall cameras, dodge the laser grids, lift the vault loot — then
reach the green EXIT door before the alarm hits 100%.

## How to play

- **WASD / arrow keys** — move
- **SHIFT** — sneak (slower, but you are harder to spot... in spirit)
- **P** — pause, **M** — mute, **R** — retry the room after getting caught
- **ENTER** — start, next room, play again

Grab the vault loot to unlock the exit. Side gems in the display cases are
worth extra — but every second in a cone pushes the alarm up, and hiding
lets it cool back down. A guard who spots you gives chase; a guard who
touches you ends the run. Lasers trip the alarm on contact. Finish all
three rooms for the getaway and the final score.

## The rooms

1. **The Gallery Wing** — 2 guards, 1 camera. Learn the cones.
2. **The Vault Corridor** — 3 guards, 2 cameras, laser grids.
3. **The Crown Chamber** — 4 guards, 3 cameras, lasers everywhere.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no libraries, no network requests: vanilla JS + canvas 2D,
all art drawn in code, all sound from a tiny WebAudio synth.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and
writes `dossier.json` with `buildDossier` from `vendor/makefun-game.ts`.

## Source layout

- `game/index.html` — the page, canvas 1280×480
- `game/src/config.js` — tuning: speeds, vision, alarm, colours
- `game/src/world.js` — the three museum floor plans
- `game/src/guards.js` — patrols, vision cones, line of sight, detection
- `game/src/render.js` — all drawing: room, cones, HUD, screens
- `game/src/input.js` — keyboard input
- `game/src/audio.js` — WebAudio synth bleeps
- `game/src/shots.js` — deterministic `?shot=` states for screenshots
- `game/src/main.js` — game loop and state machine

Screenshots use `?shot=start|play|alarm|escape&seed=1`; each staged state
sets `document.title = 'shot-ready'` once its frame is rendered.
