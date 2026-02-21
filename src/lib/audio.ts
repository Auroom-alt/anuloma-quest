// ============================
// 🎵 Web Audio Engine
// Anuloma Quest
// ============================

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// ─── БАЗОВЫЙ ОСЦИЛЛЯТОР ───────────────────────────────
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  startDelay = 0,
) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.connect(gain);
  gain.connect(c.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, c.currentTime + startDelay);

  gain.gain.setValueAtTime(0, c.currentTime + startDelay);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + startDelay + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + startDelay + duration);

  osc.start(c.currentTime + startDelay);
  osc.stop(c.currentTime + startDelay + duration);
}

// ─── АККОРД ───────────────────────────────────────────
function playChord(frequencies: number[], duration: number, volume = 0.15) {
  frequencies.forEach(f => playTone(f, duration, 'sine', volume));
}

// ─── F МАЖОР (вдох) ───────────────────────────────────
// F3, A3, C4
export function playInhaleChord(volume = 0.15) {
  playChord([174.61, 220, 261.63], 1.5, volume);
}

// ─── A МИНОР (выдох) ──────────────────────────────────
// A3, C4, E4
export function playExhaleChord(volume = 0.15) {
  playChord([220, 261.63, 329.63], 1.5, volume);
}

// ─── КОЛОКОЛЬЧИК (задержка) ───────────────────────────
export function playBellTone(volume = 0.2) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.connect(gain);
  gain.connect(c.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(528, c.currentTime);          // 528 Hz — «частота исцеления»
  osc.frequency.exponentialRampToValueAtTime(440, c.currentTime + 2);

  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 3);

  osc.start(c.currentTime);
  osc.stop(c.currentTime + 3);
}

// ─── БАРАБАН (вдох) ───────────────────────────────────
export function playDrumBeat(volume = 0.3) {
  const c = getCtx();

  // Низкий удар
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.3);
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.4);
}

// ─── ДВОЙНОЙ УДАР (выдох) ─────────────────────────────
export function playDrumDouble(volume = 0.3) {
  playDrumBeat(volume);
  setTimeout(() => playDrumBeat(volume * 0.7), 180);
}

// ─── ГОНГ (завершение раунда) ─────────────────────────
export function playGong(volume = 0.25) {
  const c = getCtx();
  [196, 246.94, 293.66].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, c.currentTime + i * 0.08);
    gain.gain.setValueAtTime(volume, c.currentTime + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.08 + 4);
    osc.start(c.currentTime + i * 0.08);
    osc.stop(c.currentTime + i * 0.08 + 4);
  });
}

// ─── ОМ (начало сессии) ───────────────────────────────
export function playOm(volume = 0.2) {
  // A2 → глубокий медитативный звук
  playTone(110, 4, 'sine', volume);
  playTone(220, 4, 'sine', volume * 0.5);
  playTone(165, 4, 'sine', volume * 0.3);
}

// ─── ГЛАВНАЯ ФУНКЦИЯ — звук по фазе ──────────────────
export function playPhaseSound(
  type: 'inhale' | 'hold' | 'exhale',
  options: {
    guitar: boolean;
    drum: boolean;
    guitarVolume: number;
    drumVolume: number;
  }
) {
  if (type === 'inhale') {
    if (options.guitar) playInhaleChord(options.guitarVolume / 100 * 0.2);
    if (options.drum)   playDrumBeat(options.drumVolume / 100 * 0.4);
  } else if (type === 'exhale') {
    if (options.guitar) playExhaleChord(options.guitarVolume / 100 * 0.2);
    if (options.drum)   playDrumDouble(options.drumVolume / 100 * 0.4);
  } else if (type === 'hold') {
    if (options.guitar) playBellTone(options.guitarVolume / 100 * 0.25);
  }
}

// ─── ГОЛОСОВЫЕ ПОДСКАЗКИ (Web Speech API) ────────────
export function speak(text: string, volume = 1, lang = 'ru-RU') {
  if (typeof window === 'undefined') return;
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.volume = volume;
  utt.rate = 0.85;
  utt.pitch = 0.9;
  window.speechSynthesis.speak(utt);
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}