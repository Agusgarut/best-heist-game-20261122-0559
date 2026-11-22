// MIDNIGHT HEIST — keyboard input. WASD or arrows to move, Shift to
// sneak, P pause, M mute, R retry, Enter to start. One shared key set
// so the loop and the menus read the same truth.
const keysDown = {};
let anyKeyPressed = false;

function setupKeyboardInput() {
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
      event.preventDefault();
    }
    if (!event.repeat) anyKeyPressed = true;
    keysDown[key] = true;
  });
  window.addEventListener('keyup', (event) => {
    keysDown[event.key.toLowerCase()] = false;
  });
  window.addEventListener('blur', () => {
    for (const k of Object.keys(keysDown)) keysDown[k] = false;
  });
}

function keyIsDown(key) {
  return !!keysDown[key.toLowerCase()];
}

// Movement vector from the keys, normalised so diagonals are not faster.
function readMoveDirection() {
  let dx = 0;
  let dy = 0;
  if (keyIsDown('a') || keyIsDown('arrowleft')) dx -= 1;
  if (keyIsDown('d') || keyIsDown('arrowright')) dx += 1;
  if (keyIsDown('w') || keyIsDown('arrowup')) dy -= 1;
  if (keyIsDown('s') || keyIsDown('arrowdown')) dy += 1;
  if (dx !== 0 && dy !== 0) {
    dx *= Math.SQRT1_2;
    dy *= Math.SQRT1_2;
  }
  return { dx, dy };
}

function thiefIsSneaking() {
  return keyIsDown('shift');
}

function consumeKeyPress(key) {
  const k = key.toLowerCase();
  if (keysDown[k]) {
    keysDown[k] = false;
    return true;
  }
  return false;
}
