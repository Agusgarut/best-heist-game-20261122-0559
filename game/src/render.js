// MIDNIGHT HEIST — all drawing. Canvas 2D vector art, drawn in code:
// marble floor, glass display cases, the vault, sweeping vision cones,
// the thief, the guards, the HUD. Nothing is loaded from a file.

// ---- helpers -------------------------------------------------------
function drawVisionCone(ctx, x, y, facing, range, halfAngle, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, facing - halfAngle, facing + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---- the room ------------------------------------------------------
function drawMarbleFloor(ctx, time) {
  const c = CONFIG.colors;
  const bounds = roomBounds();
  ctx.fillStyle = c.floorA;
  ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
  // Checker tiles, 80px, faint.
  for (let ty = 0; ty < 6; ty++) {
    for (let tx = 0; tx < 16; tx++) {
      if ((tx + ty) % 2 === 0) {
        ctx.fillStyle = c.floorB;
        ctx.fillRect(bounds.x + tx * 80, bounds.y + ty * 70, 80, 70);
      }
    }
  }
  ctx.strokeStyle = c.floorLine;
  ctx.lineWidth = 1;
  for (let tx = 0; tx <= 16; tx++) {
    ctx.beginPath();
    ctx.moveTo(bounds.x + tx * 80, bounds.y);
    ctx.lineTo(bounds.x + tx * 80, bounds.y + bounds.h);
    ctx.stroke();
  }
  for (let ty = 0; ty <= 6; ty++) {
    ctx.beginPath();
    ctx.moveTo(bounds.x, bounds.y + ty * 70);
    ctx.lineTo(bounds.x + bounds.w, bounds.y + ty * 70);
    ctx.stroke();
  }
  // A worn red carpet from the door to the vault — the thief's runway.
  ctx.fillStyle = 'rgba(120, 30, 40, 0.35)';
  ctx.fillRect(bounds.x + 30, 380, 1120, 26);
  ctx.fillStyle = 'rgba(200, 160, 60, 0.25)';
  ctx.fillRect(bounds.x + 30, 380, 1120, 2);
  ctx.fillRect(bounds.x + 30, 404, 1120, 2);
}

function drawWallsAndCases(ctx, level) {
  const c = CONFIG.colors;
  const bounds = roomBounds();
  // Outer shell.
  ctx.fillStyle = c.wall;
  ctx.fillRect(0, CONFIG.playTop - 10, CONFIG.canvasWidth, 10);
  ctx.fillRect(0, CONFIG.playBottom, CONFIG.canvasWidth, 10);
  ctx.fillRect(0, CONFIG.playTop - 10, 10, CONFIG.playBottom - CONFIG.playTop + 20);
  ctx.fillRect(CONFIG.canvasWidth - 10, CONFIG.playTop - 10, 10, CONFIG.playBottom - CONFIG.playTop + 20);
  ctx.fillStyle = c.wallTop;
  ctx.fillRect(0, CONFIG.playTop - 10, CONFIG.canvasWidth, 3);
  ctx.fillRect(0, CONFIG.playBottom, CONFIG.canvasWidth, 3);
  // Interior walls.
  for (const w of level.walls) {
    ctx.fillStyle = c.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = c.wallTop;
    if (w.w >= w.h) ctx.fillRect(w.x, w.y, w.w, 3);
    else ctx.fillRect(w.x, w.y, 3, w.h);
  }
  // Display cases: wooden plinth, glass top, gold inside.
  for (const cs of level.cases) {
    ctx.fillStyle = '#4a3820';
    ctx.fillRect(cs.x, cs.y + cs.h - 10, cs.w, 10);
    ctx.fillStyle = c.caseFrame;
    ctx.fillRect(cs.x, cs.y, cs.w, 4);
    ctx.fillStyle = c.caseGlass;
    ctx.fillRect(cs.x + 3, cs.y + 4, cs.w - 6, cs.h - 14);
    ctx.strokeStyle = 'rgba(200, 220, 245, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cs.x + 3, cs.y + 4, cs.w - 6, cs.h - 14);
    ctx.beginPath();
    ctx.moveTo(cs.x + 10, cs.y + cs.h - 10);
    ctx.lineTo(cs.x + cs.w - 20, cs.y + 4);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.stroke();
  }
}

function drawLasers(ctx, level, time) {
  const c = CONFIG.colors;
  for (const l of level.lasers) {
    const on = l.cooldown <= 0;
    const alpha = on ? 0.55 + 0.35 * Math.sin(time * 6) : 0.12;
    ctx.strokeStyle = on ? c.laser : 'rgba(255, 40, 60, 0.15)';
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(l.x1, l.y1);
    ctx.lineTo(l.x2, l.y2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Emitter posts.
    ctx.fillStyle = '#888';
    ctx.fillRect(l.x1 - 3, l.y1 - 5, 6, 10);
    ctx.fillRect(l.x2 - 3, l.y2 - 5, 6, 10);
    ctx.fillStyle = on ? '#ff283c' : '#552228';
    ctx.beginPath();
    ctx.arc(l.x1, l.y1, 3, 0, Math.PI * 2);
    ctx.arc(l.x2, l.y2, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVaultAndExit(ctx, level, vaultOpen, time) {
  const c = CONFIG.colors;
  const v = level.vault;
  // Vault: steel door with a glowing gold seam; swings open when looted.
  ctx.fillStyle = '#3a3f4a';
  ctx.fillRect(v.x - 6, v.y - 6, v.w + 12, v.h + 12);
  ctx.fillStyle = vaultOpen ? '#2c2f36' : c.vaultDoor;
  ctx.fillRect(v.x, v.y, v.w, v.h);
  ctx.strokeStyle = c.vaultGold;
  ctx.lineWidth = 2;
  ctx.strokeRect(v.x + 4, v.y + 4, v.w - 8, v.h - 8);
  if (!vaultOpen) {
    const pulse = 0.6 + 0.4 * Math.sin(time * 3);
    ctx.fillStyle = `rgba(245, 197, 66, ${pulse})`;
    ctx.beginPath();
    ctx.arc(v.x + v.w / 2, v.y + v.h / 2, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1c22';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VAULT', v.x + v.w / 2, v.y - 10);
  } else {
    ctx.fillStyle = c.vaultGold;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OPEN', v.x + v.w / 2, v.y + v.h / 2 + 4);
  }
  // Exit door: green, glowing, labelled — the way out.
  const e = level.exit;
  const glow = vaultOpen ? 0.7 + 0.3 * Math.sin(time * 4) : 0.25;
  ctx.fillStyle = c.exitDoor;
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = `rgba(55, 214, 122, ${glow})`;
  ctx.fillRect(e.x + 4, e.y + 4, e.w - 8, e.h - 8);
  ctx.fillStyle = '#062b16';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', e.x + e.w / 2, e.y + e.h / 2 + 4);
  if (!vaultOpen) {
    ctx.fillStyle = 'rgba(232, 228, 216, 0.7)';
    ctx.font = '9px sans-serif';
    ctx.fillText('LOCKED — GRAB THE VAULT FIRST', e.x + e.w / 2 + 90, e.y + e.h / 2 + 3);
  }
}

function drawLootGems(ctx, level, time, rngSparkle) {
  const c = CONFIG.colors;
  for (const gem of level.loot) {
    if (gem.taken) continue;
    const bob = Math.sin(time * 3 + gem.x) * 3;
    const pulse = 0.7 + 0.3 * Math.sin(time * 5 + gem.y);
    ctx.save();
    ctx.translate(gem.x, gem.y + bob);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = `rgba(245, 197, 66, ${pulse})`;
    const s = 9 + (gem.value >= 400 ? 3 : 0);
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.strokeStyle = '#fff2b0';
    ctx.lineWidth = 1;
    ctx.strokeRect(-s / 2, -s / 2, s, s);
    ctx.restore();
    ctx.fillStyle = '#f5c542';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$' + gem.value, gem.x, gem.y + bob + 20);
  }
  // Sparkles drifting over the vault.
  for (let i = 0; i < 8; i++) {
    const sx = level.vault.x + rngSparkle[i * 2] * level.vault.w;
    const sy = level.vault.y + rngSparkle[i * 2 + 1] * level.vault.h;
    const tw = 0.3 + 0.7 * Math.abs(Math.sin(time * 2 + i));
    ctx.fillStyle = `rgba(255, 240, 170, ${tw})`;
    ctx.fillRect(sx - 1, sy - 1, 2, 2);
  }
}

// ---- actors --------------------------------------------------------
function drawThief(ctx, thief, time, moving) {
  const c = CONFIG.colors;
  const bob = moving ? Math.sin(time * 14) * 1.5 : Math.sin(time * 2) * 0.8;
  ctx.save();
  ctx.translate(thief.x, thief.y + bob);
  // Shadow.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body: dark coat, pale face, flat cap.
  ctx.fillStyle = '#23232c';
  ctx.beginPath();
  ctx.arc(0, 0, CONFIG.thiefRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.thief;
  ctx.beginPath();
  ctx.arc(0, -2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.thiefHat;
  ctx.beginPath();
  ctx.arc(0, -5, 8, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(-9, -6, 18, 2);
  // Loot sack when carrying the vault prize.
  if (thief.carrying) {
    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.arc(11, 8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a5c10';
    ctx.fillRect(8, 1, 6, 3);
  }
  ctx.restore();
}

function drawGuard(ctx, guard, time) {
  const c = CONFIG.colors;
  const coneFill = guard.state === 'alert' ? c.coneAlert
    : guard.state === 'suspicious' ? c.coneSuspicious : c.coneCalm;
  drawVisionCone(ctx, guard.x, guard.y, guard.facing,
    CONFIG.guardVisionRange, CONFIG.guardVisionHalfAngle, coneFill, c.coneEdge);
  const bob = Math.sin(guard.bobPhase) * 1.2;
  ctx.save();
  ctx.translate(guard.x, guard.y + bob);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 13, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Uniform body, cap, torch in the facing direction.
  ctx.fillStyle = c.guardUniform;
  ctx.beginPath();
  ctx.arc(0, 0, CONFIG.guardRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8c26a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, CONFIG.guardRadius - 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = c.guard;
  ctx.beginPath();
  ctx.arc(0, -3, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#16233d';
  ctx.beginPath();
  ctx.arc(0, -6, 8, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(-9, -7, 18, 2);
  // Torch beam dot ahead.
  ctx.fillStyle = '#ffe9a0';
  ctx.beginPath();
  ctx.arc(Math.cos(guard.facing) * 20, Math.sin(guard.facing) * 20, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // "?" while suspicious, "!" while alerting.
  if (guard.state !== 'patrol') {
    ctx.fillStyle = guard.state === 'alert' ? '#ff5040' : '#ffb020';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(guard.state === 'alert' ? '!' : '?', guard.x, guard.y - 24 + bob);
  }
}

function drawCamera(ctx, camera, time) {
  const c = CONFIG.colors;
  const alert = camera.suspicion > 8;
  drawVisionCone(ctx, camera.x, camera.y, camera.angle,
    camera.range, CONFIG.cameraVisionHalfAngle,
    alert ? c.coneSuspicious : c.coneCalm, c.coneEdge);
  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.rotate(camera.angle);
  ctx.fillStyle = c.cameraBody;
  ctx.fillRect(-4, -5, 14, 10);
  ctx.fillStyle = alert ? '#ff4030' : '#37d67a';
  ctx.beginPath();
  ctx.arc(11, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#5a6068';
  ctx.fillRect(camera.x - 6, camera.y - 6, 12, 4);
}

// ---- HUD and overlays ----------------------------------------------
function drawHud(ctx, state) {
  const c = CONFIG.colors;
  ctx.fillStyle = '#101218';
  ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.hudHeight);
  ctx.fillStyle = '#2a2f3a';
  ctx.fillRect(0, CONFIG.hudHeight, CONFIG.canvasWidth, 2);
  ctx.fillStyle = c.hudText;
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(state.level.name, 14, 20);
  ctx.font = '12px sans-serif';
  ctx.fillStyle = c.hudMuted;
  ctx.fillText(state.level.subtitle, 14, 37);

  ctx.textAlign = 'center';
  ctx.fillStyle = c.hudText;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('SCORE ' + state.score, 640, 20);
  ctx.font = '12px sans-serif';
  ctx.fillStyle = c.hudMuted;
  ctx.fillText('LOOT $' + state.lootValue + '  •  TIME ' + Math.max(0, Math.ceil(state.timeLeft)) + 's', 640, 37);

  // Alarm meter, right side: label + bar + percentage.
  const barX = 980; const barY = 12; const barW = 200; const barH = 14;
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = state.alarm > 60 ? '#ff5040' : c.hudText;
  ctx.fillText('ALARM', barX, barY + 11);
  ctx.fillStyle = '#262a33';
  ctx.fillRect(barX + 58, barY, barW - 58, barH);
  ctx.fillStyle = state.alarm > 60 ? '#ff5040' : state.alarm > 25 ? '#ffb020' : '#37d67a';
  ctx.fillRect(barX + 58, barY, (barW - 58) * (state.alarm / 100), barH);
  ctx.strokeStyle = '#4a5160';
  ctx.strokeRect(barX + 58, barY, barW - 58, barH);
  ctx.fillStyle = c.hudText;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(Math.round(state.alarm) + '%', barX + barW + 8, barY + 11);

  // HIDDEN / SPOTTED indicator under the alarm.
  ctx.textAlign = 'right';
  ctx.font = 'bold 12px sans-serif';
  if (state.spotted) {
    ctx.fillStyle = '#ff5040';
    ctx.fillText('SPOTTED!', 1266, 40);
  } else {
    ctx.fillStyle = '#37d67a';
    ctx.fillText('HIDDEN', 1266, 40);
  }
  ctx.fillStyle = c.hudMuted;
  ctx.font = '11px sans-serif';
  ctx.fillText('P pause • M mute' + (state.muted ? ' (muted)' : ''), 1266, 20);
}

function drawFootsteps(ctx, footsteps) {
  for (const f of footsteps) {
    ctx.fillStyle = `rgba(232, 228, 216, ${f.alpha})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPopups(ctx, popups) {
  ctx.textAlign = 'center';
  for (const p of popups) {
    ctx.fillStyle = `rgba(245, 197, 66, ${p.alpha})`;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(p.text, p.x, p.y);
  }
}

function drawConfetti(ctx, confetti) {
  for (const p of confetti) {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }
}

function drawAlarmVignette(ctx, alarm, time) {
  if (alarm < 25) return;
  const pulse = 0.25 + 0.35 * Math.abs(Math.sin(time * 5));
  const strength = (alarm / 100) * pulse;
  const grad = ctx.createRadialGradient(640, 240, 180, 640, 240, 700);
  grad.addColorStop(0, 'rgba(255, 40, 40, 0)');
  grad.addColorStop(1, `rgba(255, 40, 40, ${strength})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1280, 480);
}

// ---- screens --------------------------------------------------------
function drawTitleScreen(ctx, time) {
  const c = CONFIG.colors;
  ctx.fillStyle = '#0d0f14';
  ctx.fillRect(0, 0, 1280, 480);
  // Museum silhouette: columns and a moon.
  ctx.fillStyle = '#f5e9c8';
  ctx.beginPath();
  ctx.arc(1080, 90, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1d26';
  for (let i = 0; i < 7; i++) {
    ctx.fillRect(120 + i * 160, 300, 46, 180);
    ctx.fillRect(108 + i * 160, 280, 70, 22);
  }
  ctx.fillRect(80, 270, 1120, 14);
  ctx.fillStyle = c.vaultGold;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('MIDNIGHT HEIST', 640, 130);
  ctx.fillStyle = c.hudText;
  ctx.font = '20px Georgia, serif';
  ctx.fillText('— The Marlow Museum Job —', 640, 168);
  ctx.font = '15px sans-serif';
  ctx.fillStyle = c.hudMuted;
  ctx.fillText('Three rooms. One diamond, one sapphire, one crown. Lift them all,', 640, 210);
  ctx.fillText('dodge the guards and the cameras, and be out before the alarm hits 100%.', 640, 232);
  ctx.fillStyle = c.hudText;
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('WASD / ARROWS — move      SHIFT — sneak      P — pause      M — mute', 640, 300);
  ctx.fillStyle = c.vaultGold;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('Grab the VAULT loot, then reach the green EXIT door.', 640, 330);
  const blink = 0.6 + 0.4 * Math.sin(time * 4);
  ctx.fillStyle = `rgba(245, 197, 66, ${blink})`;
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('PRESS ENTER TO START THE JOB', 640, 400);
  ctx.fillStyle = c.hudMuted;
  ctx.font = '12px sans-serif';
  ctx.fillText('A complete heist game — guards with vision cones, cameras, lasers, loot and an alarm.', 640, 440);
}

function drawCaughtScreen(ctx, state) {
  ctx.fillStyle = 'rgba(10, 8, 10, 0.82)';
  ctx.fillRect(0, 0, 1280, 480);
  ctx.fillStyle = '#ff5040';
  ctx.font = 'bold 56px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('CAUGHT!', 640, 190);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = '18px sans-serif';
  ctx.fillText(state.caughtReason, 640, 230);
  ctx.fillStyle = '#9aa3b2';
  ctx.font = '15px sans-serif';
  ctx.fillText('Score this run: ' + state.score + '   •   Attempts: ' + state.attempts, 640, 262);
  ctx.fillStyle = '#f5c542';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Press R to try the room again', 640, 320);
}

function drawLevelClearScreen(ctx, state) {
  ctx.fillStyle = 'rgba(10, 14, 10, 0.82)';
  ctx.fillRect(0, 0, 1280, 480);
  ctx.fillStyle = '#37d67a';
  ctx.font = 'bold 48px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('CLEAN GETAWAY!', 640, 180);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = '18px sans-serif';
  ctx.fillText('Room cleared — loot $' + state.lootValue + '  •  time bonus +' + state.lastTimeBonus, 640, 224);
  ctx.fillStyle = '#9aa3b2';
  ctx.font = '15px sans-serif';
  ctx.fillText('Total score: ' + state.score, 640, 254);
  ctx.fillStyle = '#f5c542';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Press ENTER for the next room', 640, 320);
}

function drawWinScreen(ctx, state, time) {
  ctx.fillStyle = '#0d0f14';
  ctx.fillRect(0, 0, 1280, 480);
  drawConfetti(ctx, state.confetti);
  // Getaway van, drawn in code: body, cabin, wheels, loot sacks.
  ctx.fillStyle = '#1e6b3a';
  roundRectPath(ctx, 420, 250, 440, 110, 18);
  ctx.fill();
  ctx.fillStyle = '#2c8a4f';
  roundRectPath(ctx, 740, 220, 120, 140, 14);
  ctx.fill();
  ctx.fillStyle = '#bfe8ff';
  ctx.fillRect(760, 236, 84, 54);
  ctx.fillStyle = '#c9a227';
  ctx.beginPath();
  ctx.arc(500, 300, 22, 0, Math.PI * 2);
  ctx.arc(560, 305, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#14161c';
  ctx.beginPath();
  ctx.arc(500, 366, 30, 0, Math.PI * 2);
  ctx.arc(780, 366, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a8f98';
  ctx.beginPath();
  ctx.arc(500, 366, 14, 0, Math.PI * 2);
  ctx.arc(780, 366, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5c542';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('THE MARLOW JOB IS DONE', 640, 120);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = '20px sans-serif';
  ctx.fillText('Diamond, sapphire and crown — all lifted, nobody caught you.', 640, 160);
  ctx.fillStyle = '#37d67a';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('FINAL SCORE  ' + state.score, 640, 200);
  ctx.fillStyle = '#9aa3b2';
  ctx.font = '15px sans-serif';
  ctx.fillText('Attempts: ' + state.attempts + '   •   Press ENTER to run it again', 640, 430);
}

function drawPausedScreen(ctx) {
  ctx.fillStyle = 'rgba(10, 10, 14, 0.7)';
  ctx.fillRect(0, 0, 1280, 480);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', 640, 220);
  ctx.fillStyle = '#9aa3b2';
  ctx.font = '16px sans-serif';
  ctx.fillText('Press P to keep casing the joint', 640, 258);
}
