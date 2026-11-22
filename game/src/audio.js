// MIDNIGHT HEIST — tiny WebAudio synth. No sound files, no network:
// every blip is an oscillator shaped in code. Created lazily on the
// first key press (browsers block audio before a gesture), M mutes.
const HeistAudio = {
  ctx: null,
  muted: false,

  ensure() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  },

  blip(freq, duration, type, volume, slideTo) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume || 0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  },

  pickupLoot() {
    this.blip(880, 0.12, 'sine', 0.09, 1320);
    setTimeout(() => this.blip(1320, 0.14, 'sine', 0.07, 1760), 60);
  },

  vaultOpen() {
    this.blip(220, 0.25, 'triangle', 0.1, 440);
    setTimeout(() => this.blip(440, 0.2, 'triangle', 0.09, 660), 120);
    setTimeout(() => this.blip(660, 0.3, 'sine', 0.09, 880), 240);
  },

  spottedSting() {
    this.blip(160, 0.28, 'sawtooth', 0.07, 90);
  },

  alarmTick() {
    this.blip(1150, 0.07, 'square', 0.035);
  },

  laserTrip() {
    this.blip(1800, 0.16, 'square', 0.06, 300);
  },

  caughtSting() {
    this.blip(320, 0.5, 'sawtooth', 0.09, 70);
    setTimeout(() => this.blip(180, 0.6, 'sawtooth', 0.08, 55), 180);
  },

  getawayFanfare() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => setTimeout(() => this.blip(n, 0.22, 'triangle', 0.09), i * 130));
  },
};
