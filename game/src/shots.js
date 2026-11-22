// MIDNIGHT HEIST — deterministic screenshot states. The parent takes
// screenshots at ?shot=start|play|alarm|escape&seed=1; each state stages
// a full frame with no key press, then sets document.title to
// 'shot-ready' so the capture knows the frame is complete.
function readShotQuery() {
  const params = new URLSearchParams(window.location.search);
  return {
    shot: params.get('shot') || '',
    seed: parseInt(params.get('seed') || '1', 10) || 1,
  };
}

// Stage a state object for the requested shot. Returns null for normal play.
function stageShotState(shot, seed) {
  const rng = makeSeededRng(seed);
  const sparkle = [];
  for (let i = 0; i < 16; i++) sparkle.push(rng());
  if (shot === 'start') {
    return { mode: 'title', sparkle };
  }
  if (shot === 'escape') {
    const confetti = [];
    const colors = ['#f5c542', '#37d67a', '#e5484d', '#3f6fb5', '#e8e4d8'];
    for (let i = 0; i < 140; i++) {
      confetti.push({
        x: rng() * 1280, y: rng() * 480, w: 6, h: 10,
        color: colors[i % colors.length], vy: 40 + rng() * 80, vx: (rng() - 0.5) * 40,
      });
    }
    return {
      mode: 'win', sparkle, confetti,
      score: 7240, attempts: 2, lootValue: 3150,
    };
  }
  if (shot === 'play') {
    // Level 1 mid-heist: thief near the vault, guards mid-patrol, a
    // gem already pocketed, cones sweeping, alarm just warming up.
    const level = freshLevel(0);
    level.loot[0].taken = true;
    const guards = level.guards.map(makeGuard);
    guards[0].x = 560; guards[0].y = 260; guards[0].facing = Math.PI / 2; guards[0].waypoint = 1;
    guards[1].x = 950; guards[1].y = 400; guards[1].facing = 0; guards[1].waypoint = 1;
    const cameras = level.cameras.map(makeCamera);
    cameras[0].angle = Math.PI / 2 + 0.5;
    return {
      mode: 'play', sparkle, level, levelIndex: 0,
      guards, cameras,
      thief: { x: 1020, y: 260, carrying: false },
      alarm: 22, score: 1150, lootValue: 150, timeLeft: 118,
      popups: [{ x: 238, y: 140, text: '+$150', alpha: 1 }],
      footsteps: [], confetti: [], spotted: false, muted: false,
    };
  }
  if (shot === 'alarm') {
    // Alarm ~75%: a guard alerted and converging, red tint, thief
    // cornered near the cases, vault still unopened.
    const level = freshLevel(0);
    const guards = level.guards.map(makeGuard);
    guards[0].x = 700; guards[0].y = 300; guards[0].facing = Math.atan2(360 - 300, 640 - 700);
    guards[0].state = 'alert'; guards[0].suspicion = 95;
    guards[0].lastSeenX = 640; guards[0].lastSeenY = 360;
    guards[1].x = 900; guards[1].y = 200; guards[1].facing = Math.PI * 0.75;
    guards[1].state = 'suspicious'; guards[1].suspicion = 45;
    const cameras = level.cameras.map(makeCamera);
    cameras[0].angle = Math.PI / 2 - 0.4; cameras[0].suspicion = 60;
    return {
      mode: 'play', sparkle, level, levelIndex: 0,
      guards, cameras,
      thief: { x: 640, y: 360, carrying: false },
      alarm: 75, score: 400, lootValue: 400, timeLeft: 96,
      popups: [{ x: 640, y: 330, text: 'SPOTTED!', alpha: 1 }],
      footsteps: [], confetti: [], spotted: true, muted: false,
    };
  }
  return null;
}
