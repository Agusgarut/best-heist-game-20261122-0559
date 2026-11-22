// MIDNIGHT HEIST — the museum floor plans. One level is one room:
// walls and display cases (both block sight), a vault holding the main
// loot, side gems in the cases, laser grids on the later floors, the
// guards' patrol routes, the cameras, and the exit door. Coordinates
// live in the 1280x480 canvas; the play area runs y 56..470.
const LEVELS = [
  {
    name: 'LEVEL 1 — THE GALLERY WING',
    subtitle: 'Two guards, one camera. Learn the cones, then lift the Marlow Diamond.',
    playerStart: { x: 80, y: 420 },
    vault: { x: 1152, y: 196, w: 72, h: 76, value: 1000, label: 'MARLOW DIAMOND' },
    exit: { x: 36, y: 66, w: 64, h: 54, label: 'EXIT' },
    walls: [
      { x: 420, y: 56, w: 16, h: 168 },
      { x: 420, y: 316, w: 16, h: 154 },
      { x: 700, y: 56, w: 300, h: 16 },
      { x: 700, y: 454, w: 16, h: 16 },
    ],
    cases: [
      { x: 190, y: 140, w: 96, h: 52 },
      { x: 190, y: 330, w: 96, h: 52 },
      { x: 580, y: 196, w: 96, h: 52 },
      { x: 880, y: 330, w: 96, h: 52 },
      { x: 1010, y: 120, w: 96, h: 52 },
    ],
    loot: [
      { x: 238, y: 166, value: 150, taken: false },
      { x: 628, y: 222, value: 250, taken: false },
      { x: 1058, y: 146, value: 400, taken: false },
    ],
    lasers: [],
    guards: [
      { path: [[560, 100], [560, 420]], speed: 62 },
      { path: [[720, 400], [1130, 400], [1130, 110], [720, 110]], speed: 62 },
    ],
    cameras: [
      { x: 850, y: 62, baseAngle: Math.PI / 2, sweep: 0.9, range: 200 },
    ],
  },
  {
    name: 'LEVEL 2 — THE VAULT CORRIDOR',
    subtitle: 'Three guards, two cameras, and a laser grid across the corridor.',
    playerStart: { x: 80, y: 420 },
    vault: { x: 1152, y: 110, w: 72, h: 76, value: 1000, label: 'CROWN SAPPHIRE' },
    exit: { x: 36, y: 66, w: 64, h: 54, label: 'EXIT' },
    walls: [
      { x: 300, y: 56, w: 16, h: 130 },
      { x: 300, y: 280, w: 16, h: 190 },
      { x: 640, y: 56, w: 16, h: 190 },
      { x: 640, y: 360, w: 16, h: 110 },
      { x: 950, y: 200, w: 16, h: 270 },
      { x: 950, y: 56, w: 16, h: 80 },
    ],
    cases: [
      { x: 140, y: 200, w: 96, h: 52 },
      { x: 430, y: 330, w: 96, h: 52 },
      { x: 740, y: 130, w: 96, h: 52 },
      { x: 1030, y: 330, w: 96, h: 52 },
    ],
    loot: [
      { x: 188, y: 226, value: 150, taken: false },
      { x: 478, y: 356, value: 250, taken: false },
      { x: 788, y: 156, value: 250, taken: false },
      { x: 1078, y: 356, value: 400, taken: false },
    ],
    lasers: [
      { x1: 316, y1: 186, x2: 640, y2: 186, tripped: false, cooldown: 0 },
      { x1: 966, y1: 280, x2: 1224, y2: 280, tripped: false, cooldown: 0 },
    ],
    guards: [
      { path: [[180, 100], [180, 420]], speed: 68 },
      { path: [[480, 120], [480, 420], [900, 420], [900, 120]], speed: 68 },
      { path: [[1080, 300], [1080, 420], [1220, 420], [1220, 300]], speed: 68 },
    ],
    cameras: [
      { x: 480, y: 62, baseAngle: Math.PI / 2, sweep: 1.0, range: 200 },
      { x: 800, y: 464, baseAngle: -Math.PI / 2, sweep: 1.0, range: 200 },
    ],
  },
  {
    name: 'LEVEL 3 — THE CROWN CHAMBER',
    subtitle: 'Four guards, three cameras, lasers everywhere. The Marlow Crown is waiting.',
    playerStart: { x: 80, y: 420 },
    vault: { x: 1152, y: 220, w: 72, h: 76, value: 1000, label: 'MARLOW CROWN' },
    exit: { x: 36, y: 66, w: 64, h: 54, label: 'EXIT' },
    walls: [
      { x: 260, y: 56, w: 16, h: 150 },
      { x: 260, y: 300, w: 16, h: 170 },
      { x: 560, y: 200, w: 16, h: 270 },
      { x: 560, y: 56, w: 16, h: 70 },
      { x: 860, y: 56, w: 16, h: 170 },
      { x: 860, y: 320, w: 16, h: 150 },
      { x: 1060, y: 120, w: 200, h: 16 },
    ],
    cases: [
      { x: 120, y: 130, w: 96, h: 52 },
      { x: 340, y: 360, w: 96, h: 52 },
      { x: 640, y: 130, w: 96, h: 52 },
      { x: 940, y: 380, w: 96, h: 52 },
      { x: 1120, y: 380, w: 96, h: 52 },
    ],
    loot: [
      { x: 168, y: 156, value: 150, taken: false },
      { x: 388, y: 386, value: 250, taken: false },
      { x: 688, y: 156, value: 400, taken: false },
      { x: 988, y: 406, value: 250, taken: false },
      { x: 1168, y: 406, value: 400, taken: false },
    ],
    lasers: [
      { x1: 276, y1: 206, x2: 560, y2: 206, tripped: false, cooldown: 0 },
      { x1: 576, y1: 330, x2: 860, y2: 330, tripped: false, cooldown: 0 },
      { x1: 876, y1: 226, x2: 1060, y2: 226, tripped: false, cooldown: 0 },
    ],
    guards: [
      { path: [[160, 100], [160, 420]], speed: 74 },
      { path: [[410, 110], [410, 420], [700, 420], [700, 110]], speed: 74 },
      { path: [[990, 180], [990, 430], [1220, 430], [1220, 180]], speed: 74 },
      { path: [[700, 260], [1000, 260], [1000, 100], [700, 100]], speed: 74 },
    ],
    cameras: [
      { x: 410, y: 62, baseAngle: Math.PI / 2, sweep: 1.1, range: 200 },
      { x: 700, y: 464, baseAngle: -Math.PI / 2, sweep: 1.1, range: 200 },
      { x: 1224, y: 200, baseAngle: Math.PI, sweep: 0.9, range: 200 },
    ],
  },
];

// Every rectangle that blocks movement and sight: walls plus cases.
// The vault is solid too until it is opened; the exit is a doorway.
function levelBlockers(level) {
  const blocks = [];
  for (const w of level.walls) blocks.push(w);
  for (const c of level.cases) blocks.push(c);
  blocks.push({ x: level.vault.x, y: level.vault.y, w: level.vault.w, h: level.vault.h });
  return blocks;
}

// The room's outer shell, drawn as a frame and used to clamp the thief.
function roomBounds() {
  return {
    x: CONFIG.playLeft,
    y: CONFIG.playTop,
    w: CONFIG.playRight - CONFIG.playLeft,
    h: CONFIG.playBottom - CONFIG.playTop,
  };
}

// Fresh, mutable copy of a level so retries and replays never share state.
function freshLevel(index) {
  return JSON.parse(JSON.stringify(LEVELS[index]));
}
