// MIDNIGHT HEIST — guards, cameras and detection. A guard walks a
// waypoint loop, sweeps a vision cone, and gets suspicious when the
// thief crosses it in the open. Cameras sweep from the wall. Sight is
// blocked by walls and display cases, so cover is real cover.

// Shortest angle between two headings, in (-PI, PI].
function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

// Does segment (x1,y1)-(x2,y2) cross rectangle r? Used for line of sight.
function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  if (dx === 0) {
    if (x1 < r.x || x1 > r.x + r.w) return false;
  } else {
    let t1 = (r.x - x1) / dx;
    let t2 = (r.x + r.w - x1) / dx;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  if (dy === 0) {
    if (y1 < r.y || y1 > r.y + r.h) return false;
  } else {
    let t1 = (r.y - y1) / dy;
    let t2 = (r.y + r.h - y1) / dy;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  return true;
}

// Line of sight: nothing solid between the watcher and the thief.
function hasLineOfSight(x1, y1, x2, y2, blockers) {
  for (const b of blockers) {
    if (segmentHitsRect(x1, y1, x2, y2, b)) return false;
  }
  return true;
}

// Is the thief inside this watcher's cone and visible? A cone is a
// position, a facing, a range and a half-angle.
function thiefInCone(wx, wy, facing, range, halfAngle, thief, blockers) {
  const dx = thief.x - wx;
  const dy = thief.y - wy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (dist < 4) return true;
  const toThief = Math.atan2(dy, dx);
  if (Math.abs(angleDifference(toThief, facing)) > halfAngle) return false;
  return hasLineOfSight(wx, wy, thief.x, thief.y, blockers);
}

// A guard at runtime: patrol waypoint index, facing, suspicion 0..100,
// state 'patrol' | 'suspicious' | 'alert', and a memory of the thief.
function makeGuard(def) {
  const start = def.path[0];
  return {
    path: def.path,
    speed: def.speed,
    x: start[0],
    y: start[1],
    waypoint: 1 % def.path.length,
    facing: Math.PI / 2,
    suspicion: 0,
    state: 'patrol',
    pauseTimer: 0,
    unseenTimer: 0,
    lastSeenX: start[0],
    lastSeenY: start[1],
    bobPhase: Math.random() * Math.PI * 2,
  };
}

function makeCamera(def) {
  return {
    x: def.x,
    y: def.y,
    baseAngle: def.baseAngle,
    sweep: def.sweep,
    range: def.range,
    phase: Math.random() * Math.PI * 2,
    angle: def.baseAngle,
    suspicion: 0,
  };
}

// Walk toward the current waypoint; returns true when it arrives.
function guardWalkToWaypoint(guard, dt) {
  const target = guard.path[guard.waypoint];
  const dx = target[0] - guard.x;
  const dy = target[1] - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 3) {
    guard.waypoint = (guard.waypoint + 1) % guard.path.length;
    return true;
  }
  const step = guard.speed * dt;
  guard.x += (dx / dist) * Math.min(step, dist);
  guard.y += (dy / dist) * Math.min(step, dist);
  guard.facing = Math.atan2(dy, dx);
  return false;
}

// One guard's brain, per frame. Returns 'seen' when the thief is in
// this guard's cone right now, so the alarm can rise.
function updateGuard(guard, thief, blockers, dt) {
  const seen = thiefInCone(
    guard.x, guard.y, guard.facing,
    CONFIG.guardVisionRange, CONFIG.guardVisionHalfAngle, thief, blockers,
  );
  if (seen) {
    guard.suspicion = Math.min(100, guard.suspicion + CONFIG.guardSuspicionRise * dt);
    guard.lastSeenX = thief.x;
    guard.lastSeenY = thief.y;
    guard.unseenTimer = 0;
  } else {
    guard.suspicion = Math.max(0, guard.suspicion - CONFIG.guardSuspicionFall * dt);
    guard.unseenTimer += dt;
  }

  if (guard.suspicion >= CONFIG.guardAlertAt) {
    guard.state = 'alert';
  } else if (guard.suspicion > 8) {
    guard.state = 'suspicious';
  } else if (guard.state !== 'alert' || guard.unseenTimer > CONFIG.guardLoseSightAfter) {
    guard.state = 'patrol';
  }

  if (guard.state === 'alert') {
    // Chase the last place the thief was seen; give up after a while unseen.
    const dx = guard.lastSeenX - guard.x;
    const dy = guard.lastSeenY - guard.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 6) {
      const step = CONFIG.guardChaseSpeed * dt;
      guard.x += (dx / dist) * Math.min(step, dist);
      guard.y += (dy / dist) * Math.min(step, dist);
      guard.facing = Math.atan2(dy, dx);
    }
    if (guard.unseenTimer > CONFIG.guardLoseSightAfter) {
      guard.state = 'patrol';
      guard.suspicion = 30;
    }
  } else if (guard.state === 'suspicious') {
    // Stop, stare at the thief, then resume the patrol if it was nothing.
    guard.pauseTimer += dt;
    if (seen) guard.facing = Math.atan2(thief.y - guard.y, thief.x - guard.x);
    if (!seen && guard.pauseTimer > 1.6) {
      guard.pauseTimer = 0;
      guard.state = 'patrol';
    }
  } else {
    guard.pauseTimer = 0;
    guardWalkToWaypoint(guard, dt);
  }
  guard.bobPhase += dt * 6;
  return seen;
}

// One camera's sweep. Returns 'seen' when the thief is in its cone.
function updateCamera(camera, thief, blockers, dt, time) {
  camera.angle = camera.baseAngle + Math.sin(time * CONFIG.cameraSweepSpeed + camera.phase) * camera.sweep;
  const seen = thiefInCone(
    camera.x, camera.y, camera.angle,
    camera.range, CONFIG.cameraVisionHalfAngle, thief, blockers,
  );
  if (seen) {
    camera.suspicion = Math.min(100, camera.suspicion + CONFIG.cameraSuspicionRise * dt);
  } else {
    camera.suspicion = Math.max(0, camera.suspicion - CONFIG.guardSuspicionFall * dt);
  }
  return seen;
}

// Laser tripwire: does the thief's step cross this beam? A beam trips
// once, then needs its cooldown before it can trip again.
function laserTrippedBy(laser, px, py, oldX, oldY) {
  if (laser.cooldown > 0) return false;
  // Distance from the thief's movement segment to the beam segment.
  const x1 = laser.x1; const y1 = laser.y1;
  const x2 = laser.x2; const y2 = laser.y2;
  const dx = x2 - x1; const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy) < CONFIG.thiefRadius + 4;
}
