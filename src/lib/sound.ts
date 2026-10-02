// Tiny synthesized sound engine for HACKFORGE.
// Every sound is a mechanical "tick" (old typewriter style) generated at runtime
// with the Web Audio API — no audio files, no external assets, no music. Just
// short filtered-noise clicks of varying weight. A global mute flag persists in
// localStorage and is broadcast to listeners (for the mute button UI).

const KEY = "hackforge.muted.v1";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

try {
  muted = localStorage.getItem(KEY) === "1";
} catch {
  /* ignore */
}

const listeners = new Set<(m: boolean) => void>();

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// A single mechanical tick: a very short decaying noise burst passed through a
// band of filters so it sounds like a typewriter key striking. `weight` scales
// loudness/length/tone so different events feel heavier or lighter, but they're
// all the same family of click.
function tickSound(weight = 1) {
  if (muted) return;
  const ac = ensure();
  if (!ac || !master) return;
  const now = ac.currentTime;

  const dur = 0.012 + 0.006 * weight; // 12–~24ms
  const frames = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    // sharp attack, fast exponential-ish decay
    const env = Math.pow(1 - i / frames, 2.2);
    data[i] = (Math.random() * 2 - 1) * env;
  }

  const src = ac.createBufferSource();
  src.buffer = buf;

  // body resonance of the "strike"
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1700 - weight * 120 + (Math.random() * 500 - 250);
  bp.Q.value = 0.8;

  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 700;

  const g = ac.createGain();
  g.gain.value = Math.min(0.12, 0.035 * weight);

  src.connect(bp);
  bp.connect(hp);
  hp.connect(g);
  g.connect(master);
  src.start(now);
  src.stop(now + dur + 0.02);
}

// A short run of ticks — used to make "events" feel bigger while staying on the
// same typewriter palette (like a carriage of keys striking in sequence).
function tickRun(count: number, weight = 1, gap = 55) {
  if (muted) return;
  for (let i = 0; i < count; i++) {
    setTimeout(() => tickSound(weight), i * gap);
  }
}

// ---------------- public API ----------------

export const sound = {
  isMuted: () => muted,

  setMuted(m: boolean) {
    muted = m;
    try {
      localStorage.setItem(KEY, m ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (!m) ensure();
    listeners.forEach((fn) => fn(m));
  },

  toggle() {
    sound.setMuted(!muted);
  },

  onChange(fn: (m: boolean) => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  unlock() {
    ensure();
  },

  // ---- keystrokes & terminal ----
  key() {
    tickSound(1);
  },
  space() {
    tickSound(1.3);
  },
  enter() {
    // carriage-return: a slightly heavier double tick
    tickSound(1.6);
    setTimeout(() => tickSound(1.2), 40);
  },
  tick() {
    // per-output-line, light
    tickSound(0.7);
  },
  tab() {
    tickSound(0.9);
  },
  nav() {
    tickSound(0.9);
  },
  error() {
    // low, dull single clack
    tickSound(1.8);
  },

  // ---- events (all rendered as tick runs, no melody) ----
  taskDone() {
    tickRun(2, 1.2, 60);
  },
  challengeDone() {
    tickRun(3, 1.3, 60);
  },
  moduleComplete() {
    tickRun(5, 1.4, 55);
  },
  levelUp() {
    tickRun(4, 1.3, 55);
  },
  badge() {
    tickRun(3, 1.2, 65);
  },
  flag() {
    tickRun(2, 1.1, 70);
  },
  correct() {
    tickRun(2, 1.1, 55);
  },
  wrong() {
    tickSound(1.8);
  },
  popup() {
    tickSound(1.1);
  },
};
