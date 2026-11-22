// MIDNIGHT HEIST — the game loop and state machine. Modes: title,
// play, paused, caught, levelclear, win. Owns the thief, the alarm,
// the score, the loot, the juice (popups, footsteps, shake, confetti)
// and the deterministic ?shot= states used for screenshots.
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = {
  mode: 'title',
  shotMode: false,
  levelIndex: 0,
  level: null,
  blockers: [],
  thief: { x: 80, y: 420, carrying: false },
  guards: [],
  cameras: [],
  alarm: 0,
  score: 0,
  lootValue: 0,
  timeLeft: CONFIG.levelTimeLimit,
  attempts: 0,
  vaultOpen: false,
  caughtReason: '',
  lastTimeBonus: 0,
  popups: [],
  footsteps: [],
  confetti: [],
  sparkle: [],
  shake: 0,
  spotted: false,
  muted: false,
  time: 0,
  footstepTimer: 0,
  alarmTickTimer: 0,
  wasAlert: false,
};

// ---- level lifecycle -------------------------------------------------
function loadLevel(index) {
  game.levelIndex = index;
  game.level = freshLevel(index);
  game.blockers = levelBlockers(game.level);
  game.thief = { x: game.level.playerStart.x, y: game.level.playerStart.y, carrying: false };
  game.guards = game.level.guards.map(makeGuard);
  game.cameras = game.level.cameras.map(makeCamera);
  game.alarm = 0;
  game.lootValue = 0;
  game.timeLeft = CONFIG.levelTimeLimit;
  game.vaultOpen = false;
  game.popups = [];
  game.footsteps = [];
  game.spotted = false;
  game.wasAlert = false;
  game.shake = 0;
  game.mode = 'play';
}

function startNewGame() {
  game.score = 0;
  game.attempts = 1;
  game.confetti = [];
  loadLevel(0);
}

function retryLevel() {
  game.attempts += 1;
  loadLevel(game.levelIndex);
}

function nextLevel() {
  if (game.levelIndex + 1 >= LEVELS.length) {
    enterWinScreen();
  } else {
    loadLevel(game.levelIndex + 1);
  }
}

function enterWinScreen() {
  game.mode = 'win';
  game.confetti = [];
  const rng = makeSeededRng(7);
  const colors = ['#f5c542', '#37d67a', '#e5484d', '#3f6fb5', '#e8e4d8'];
  for (let i = 0; i < 140; i++) {
    game.confetti.push({
      x: rng() * 1280, y: rng() * 200, w: 6, h: 10,
      color: colors[i % colors.length], vy: 50 + rng() * 90, vx: (rng() - 0.5) * 50,
    });
  }
  HeistAudio.getawayFanfare();
}

function caughtBy(reason) {
  if (game.mode !== 'play') return;
  game.mode = 'caught';
  game.caughtReason = reason;
  game.shake = CONFIG.shakeOnCaught;
  HeistAudio.caughtSting();
}

// ---- movement and collision -----------------------------------------
function circleHitsRect(x, y, r, rect) {
  const cx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy < r * r;
}

function moveThiefWithCollision(dx, dy) {
  const r = CONFIG.thiefRadius;
  const bounds = roomBounds();
  let nx = game.thief.x + dx;
  let ny = game.thief.y + dy;
  nx = Math.max(bounds.x + r, Math.min(bounds.x + bounds.w - r, nx));
  ny = Math.max(bounds.y + r, Math.min(bounds.y + bounds.h - r, ny));
  // Resolve per axis so the thief slides along walls instead of sticking.
  let blockedX = false;
  for (const b of game.blockers) {
    if (circleHitsRect(nx, game.thief.y, r, b)) { blockedX = true; break; }
  }
  if (!blockedX) game.thief.x = nx;
  let blockedY = false;
  for (const b of game.blockers) {
    if (circleHitsRect(game.thief.x, ny, r, b)) { blockedY = true; break; }
  }
  if (!blockedY) game.thief.y = ny;
  return { movedX: !blockedX && dx !== 0, movedY: !blockedY && dy !== 0 };
}

function thiefInside(rect, pad) {
  const p = pad || 0;
  return game.thief.x > rect.x - p && game.thief.x < rect.x + rect.w + p
    && game.thief.y > rect.y - p && game.thief.y < rect.y + rect.h + p;
}

// ---- scoring juice ----------------------------------------------------
function addScorePopup(x, y, text) {
  game.popups.push({ x, y, text, alpha: 1, life: CONFIG.popupLifetime });
}

function addScore(amount, x, y, label) {
  game.score += amount;
  addScorePopup(x, y, (label || '+$') + amount);
}

// ---- per-frame update --------------------------------------------------
function updatePlaying(dt) {
  const dir = readMoveDirection();
  const sneaking = thiefIsSneaking();
  const speed = (sneaking ? CONFIG.thiefSneakSpeed : CONFIG.thiefSpeed) * dt;
  const oldX = game.thief.x;
  const oldY = game.thief.y;
  const moved = moveThiefWithCollision(dir.dx * speed, dir.dy * speed);
  const moving = (moved.movedX || moved.movedY) && (dir.dx !== 0 || dir.dy !== 0);

  // Footstep dots while moving.
  game.footstepTimer -= dt;
  if (moving && game.footstepTimer <= 0) {
    game.footstepTimer = CONFIG.footstepEvery;
    game.footsteps.push({ x: game.thief.x, y: game.thief.y + 10, alpha: 0.5 });
  }
  for (const f of game.footsteps) f.alpha -= dt * 0.45;
  game.footsteps = game.footsteps.filter((f) => f.alpha > 0);

  game.timeLeft = Math.max(0, game.timeLeft - dt);

  // Guards and cameras: who sees the thief right now?
  let guardSees = false;
  let cameraSees = false;
  let anyAlert = false;
  for (const guard of game.guards) {
    if (updateGuard(guard, game.thief, game.blockers, dt)) guardSees = true;
    if (guard.state === 'alert') anyAlert = true;
    const d = Math.hypot(guard.x - game.thief.x, guard.y - game.thief.y);
    if (d < CONFIG.guardCatchDistance) {
      caughtBy('A guard grabbed you in the gallery.');
      return;
    }
  }
  for (const camera of game.cameras) {
    if (updateCamera(camera, game.thief, game.blockers, dt, game.time)) cameraSees = true;
  }
  game.spotted = guardSees || cameraSees;

  // First moment of being spotted: flash, shake, sting.
  if (anyAlert && !game.wasAlert) {
    game.shake = Math.max(game.shake, CONFIG.shakeOnSpotted);
    HeistAudio.spottedSting();
    addScorePopup(game.thief.x, game.thief.y - 30, 'SPOTTED!');
  }
  game.wasAlert = anyAlert;

  // The alarm: rises while seen, falls while hidden.
  if (guardSees || cameraSees) {
    let rise = 0;
    if (guardSees) rise += anyAlert ? CONFIG.alarmRiseAlertChase : CONFIG.alarmRiseGuardSeen;
    if (cameraSees) rise += CONFIG.alarmRiseCameraSeen;
    game.alarm = Math.min(CONFIG.alarmMax, game.alarm + rise * dt);
    game.alarmTickTimer -= dt;
    if (game.alarmTickTimer <= 0) {
      game.alarmTickTimer = 0.6;
      HeistAudio.alarmTick();
    }
  } else {
    game.alarm = Math.max(0, game.alarm - CONFIG.alarmDecayHidden * dt);
  }
  if (game.alarm >= CONFIG.alarmMax) {
    caughtBy('The alarm hit 100% — the museum locked down.');
    return;
  }

  // Lasers: crossing a live beam trips the alarm.
  for (const laser of game.level.lasers) {
    laser.cooldown = Math.max(0, laser.cooldown - dt);
    if (laserTrippedBy(laser, game.thief.x, game.thief.y, oldX, oldY)) {
      laser.cooldown = 1.5;
      game.alarm = Math.min(CONFIG.alarmMax, game.alarm + CONFIG.alarmLaserTrip);
      game.shake = Math.max(game.shake, 5);
      HeistAudio.laserTrip();
      addScorePopup(game.thief.x, game.thief.y - 30, 'LASER!');
    }
  }

  // Side loot in the cases.
  for (const gem of game.level.loot) {
    if (gem.taken) continue;
    if (Math.hypot(gem.x - game.thief.x, gem.y - game.thief.y) < 26) {
      gem.taken = true;
      game.lootValue += gem.value;
      addScore(gem.value, gem.x, gem.y - 14);
      HeistAudio.pickupLoot();
    }
  }

  // The vault: the main prize. Grab it, then the exit unlocks.
  const v = game.level.vault;
  if (!game.vaultOpen) {
    const vc = { x: v.x + v.w / 2, y: v.y + v.h / 2 };
    if (Math.hypot(vc.x - game.thief.x, vc.y - game.thief.y) < 58) {
      game.vaultOpen = true;
      game.thief.carrying = true;
      game.lootValue += v.value;
      addScore(v.value, vc.x, vc.y - 46, '+$');
      HeistAudio.vaultOpen();
      addScorePopup(vc.x, vc.y - 66, v.label + ' LIFTED!');
    }
  }

  // The exit: only open once the vault is lifted.
  if (game.vaultOpen && thiefInside(game.level.exit, 4)) {
    game.lastTimeBonus = Math.round(game.timeLeft) * CONFIG.timeBonusPerSecondLeft;
    game.score += game.lastTimeBonus;
    game.mode = 'levelclear';
    HeistAudio.getawayFanfare();
    return;
  }

  // Popups rise and fade.
  for (const p of game.popups) {
    p.y -= CONFIG.popupRiseSpeed * dt;
    p.life -= dt;
    p.alpha = Math.max(0, p.life / CONFIG.popupLifetime);
  }
  game.popups = game.popups.filter((p) => p.life > 0);
  game.shake = Math.max(0, game.shake - dt * 22);
}

function updateConfetti(dt) {
  for (const p of game.confetti) {
    p.y += p.vy * dt;
    p.x += p.vx * dt + Math.sin(game.time * 3 + p.y * 0.05) * 20 * dt;
    if (p.y > 480) { p.y = -10; p.x = Math.random() * 1280; }
  }
}

// ---- menus --------------------------------------------------------------
function handleMenuKeys() {
  if (game.mode === 'title' && consumeKeyPress('enter')) startNewGame();
  else if (game.mode === 'levelclear' && consumeKeyPress('enter')) nextLevel();
  else if (game.mode === 'win' && consumeKeyPress('enter')) startNewGame();
  else if (game.mode === 'caught' && consumeKeyPress('r')) retryLevel();
  else if (game.mode === 'play' && consumeKeyPress('p')) game.mode = 'paused';
  else if (game.mode === 'paused' && consumeKeyPress('p')) game.mode = 'play';
  if (consumeKeyPress('m')) {
    game.muted = HeistAudio.toggleMute();
  }
}

// ---- render ---------------------------------------------------------------
function renderFrame() {
  ctx.save();
  if (game.shake > 0.2) {
    ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
  }
  if (game.mode === 'title') {
    drawTitleScreen(ctx, game.time);
  } else if (game.mode === 'win') {
    drawWinScreen(ctx, game, game.time);
  } else {
    drawMarbleFloor(ctx, game.time);
    drawWallsAndCases(ctx, game.level);
    drawLasers(ctx, game.level, game.time);
    drawVaultAndExit(ctx, game.level, game.vaultOpen, game.time);
    drawLootGems(ctx, game.level, game.time, game.sparkle);
    for (const camera of game.cameras) drawCamera(ctx, camera, game.time);
    for (const guard of game.guards) drawGuard(ctx, guard, game.time);
    drawThief(ctx, game.thief, game.time, game.mode === 'play');
    drawFootsteps(ctx, game.footsteps);
    drawPopups(ctx, game.popups);
    drawHud(ctx, game);
    drawAlarmVignette(ctx, game.alarm, game.time);
    if (game.mode === 'caught') drawCaughtScreen(ctx, game);
    else if (game.mode === 'levelclear') drawLevelClearScreen(ctx, game);
    else if (game.mode === 'paused') drawPausedScreen(ctx);
  }
  ctx.restore();
}

// ---- main loop --------------------------------------------------------------
let lastTimestamp = 0;
let shotReadyMarked = false;

function frameLoop(timestamp) {
  const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000 || 0.016);
  lastTimestamp = timestamp;
  game.time += dt;
  if (!game.shotMode) {
    handleMenuKeys();
    if (game.mode === 'play') updatePlaying(dt);
    if (game.mode === 'win') updateConfetti(dt);
  } else if (game.mode === 'win') {
    updateConfetti(dt);
  }
  renderFrame();
  if (game.shotMode && !shotReadyMarked) {
    shotReadyMarked = true;
    document.title = 'shot-ready';
  }
  requestAnimationFrame(frameLoop);
}

// ---- boot -------------------------------------------------------------------
function bootHeistGame() {
  setupKeyboardInput();
  const rng = makeSeededRng(1);
  for (let i = 0; i < 16; i++) game.sparkle.push(rng());
  const query = readShotQuery();
  const staged = stageShotState(query.shot, query.seed);
  if (staged) {
    // A screenshot state: stage it exactly and freeze the gameplay.
    game.shotMode = true;
    game.mode = staged.mode;
    game.sparkle = staged.sparkle;
    if (staged.level) {
      game.level = staged.level;
      game.levelIndex = staged.levelIndex;
      game.blockers = levelBlockers(staged.level);
      game.thief = staged.thief;
      game.guards = staged.guards;
      game.cameras = staged.cameras;
      game.alarm = staged.alarm;
      game.score = staged.score;
      game.lootValue = staged.lootValue;
      game.timeLeft = staged.timeLeft;
      game.popups = staged.popups;
      game.footsteps = staged.footsteps;
      game.spotted = staged.spotted;
      game.muted = staged.muted;
      game.vaultOpen = false;
    }
    if (staged.confetti) game.confetti = staged.confetti;
    if (staged.score !== undefined && !staged.level) game.score = staged.score;
    if (staged.attempts !== undefined) game.attempts = staged.attempts;
    if (staged.lootValue !== undefined && !staged.level) game.lootValue = staged.lootValue;
  } else {
    game.level = freshLevel(0);
    game.blockers = levelBlockers(game.level);
    game.guards = game.level.guards.map(makeGuard);
    game.cameras = game.level.cameras.map(makeCamera);
  }
  requestAnimationFrame(frameLoop);
}

bootHeistGame();
