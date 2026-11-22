// MIDNIGHT HEIST — tuning constants. One place for every number the
// designers (that's us) fiddle with, so balancing never means hunting
// through the game loop. All speeds are pixels per second, all times
// in seconds, canvas is 1280 x 480 with a 46px HUD strip on top.
const CONFIG = {
  canvasWidth: 1280,
  canvasHeight: 480,
  hudHeight: 46,
  playTop: 56,
  playBottom: 470,
  playLeft: 20,
  playRight: 1260,

  // The thief.
  thiefRadius: 13,
  thiefSpeed: 205,
  thiefSneakSpeed: 120,

  // Guards: patrol speed, chase speed, how far they see, how wide.
  guardRadius: 14,
  guardPatrolSpeed: 62,
  guardChaseSpeed: 148,
  guardVisionRange: 185,
  guardVisionHalfAngle: 0.61, // ~35 degrees each side
  guardCatchDistance: 24,
  guardSuspicionRise: 55, // per second while the thief is in the cone
  guardSuspicionFall: 30, // per second while hidden
  guardAlertAt: 62, // suspicion above this: the guard gives chase
  guardLoseSightAfter: 2.5, // seconds unseen before giving up the chase

  // Cameras: wall mounted, sweeping cones, no legs to outrun.
  cameraVisionRange: 200,
  cameraVisionHalfAngle: 0.5,
  cameraSweepSpeed: 0.55, // radians per second of sweep
  cameraSuspicionRise: 70,

  // The alarm: the shared meter that ends the run.
  alarmRiseGuardSeen: 26, // per second while a guard has eyes on you
  alarmRiseCameraSeen: 20,
  alarmRiseAlertChase: 34,
  alarmDecayHidden: 9,
  alarmLaserTrip: 26, // instant jump for crossing a laser beam
  alarmMax: 100,

  // Loot values and time bonus.
  vaultValue: 1000,
  gemValues: [150, 250, 400],
  timeBonusPerSecondLeft: 12,
  levelTimeLimit: 150, // seconds per level; 0 left is not a loss, just no bonus

  // Juice.
  footstepEvery: 0.22, // seconds between footstep dots while moving
  sparkleCount: 26,
  popupRiseSpeed: 34,
  popupLifetime: 1.1,
  shakeOnSpotted: 7,
  shakeOnCaught: 14,

  // Colours: night museum, warm gold loot, cold red danger.
  colors: {
    floorA: '#2b2f3a',
    floorB: '#262a33',
    floorLine: '#343947',
    wall: '#171a21',
    wallTop: '#3a4152',
    caseGlass: 'rgba(150, 200, 235, 0.20)',
    caseFrame: '#8a6d2f',
    vaultDoor: '#6b5a1e',
    vaultGold: '#f5c542',
    exitDoor: '#1e6b3a',
    exitGlow: '#37d67a',
    coneCalm: 'rgba(250, 220, 90, 0.13)',
    coneSuspicious: 'rgba(250, 170, 40, 0.25)',
    coneAlert: 'rgba(240, 50, 40, 0.30)',
    coneEdge: 'rgba(250, 220, 90, 0.35)',
    thief: '#e8e4d8',
    thiefHat: '#1c1c22',
    guard: '#3f6fb5',
    guardUniform: '#2c4f86',
    cameraBody: '#c8ccd4',
    laser: 'rgba(255, 40, 60, 0.85)',
    alarmBar: '#e5484d',
    hudText: '#e8e4d8',
    hudMuted: '#9aa3b2',
  },
};

// mulberry32 — a tiny deterministic RNG so ?seed=1 always stages the
// same sparkles and patrol offsets for the screenshots.
function makeSeededRng(seed) {
  let a = seed >>> 0;
  return function seededRandom() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
