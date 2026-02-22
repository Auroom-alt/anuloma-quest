// ============================
// 🎵 Audio Engine v2
// Anuloma Quest
// ============================

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// ─── HTML AUDIO (для mp3 файлов) ─────────────────────
const audioCache: Record<string, HTMLAudioElement> = {};

function getAudio(src: string): HTMLAudioElement {
  if (!audioCache[src]) {
    audioCache[src] = new Audio(src);
  }
  return audioCache[src];
}

// ─── ОМ (старт сессии) ────────────────────────────────
let omAudio: HTMLAudioElement | null = null;

export function playOm() {
  try {
    omAudio = new Audio('/sounds/om.mp3');
    omAudio.volume = 0.7;
    omAudio.play().catch(() => {});
  } catch {}
}

export function stopOm() {
  if (omAudio) { omAudio.pause(); omAudio.currentTime = 0; }
}

// ─── БАРАБАН (реальные файлы) ─────────────────────────
export function playDrumInhale(volume = 0.8) {
  try {
    const a = new Audio('/sounds/drum-inhale.mp3');
    a.volume = volume;
    a.play().catch(() => {});
  } catch {}
}

export function playDrumHold(volume = 0.6) {
  try {
    const a = new Audio('/sounds/drum-hold.mp3');
    a.volume = volume;
    a.play().catch(() => {});
  } catch {}
}

export function playDrumExhale(volume = 0.8) {
  try {
    const a = new Audio('/sounds/drum-exhale.mp3');
    a.volume = volume;
    a.play().catch(() => {});
  } catch {}
}

// ─── ГИТАРНЫЙ АККОРД (Web Audio) ─────────────────────
function playGuitarChord(frequencies: number[], duration: number, volume = 0.18) {
  const c = getCtx();

  frequencies.forEach((freq, i) => {
    const osc  = c.createOscillator();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);

    // Пилообразная волна + фильтр = ближе к гитаре
    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.8;

    const delay = i * 0.04; // арпеджио — струны по очереди
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);

    gain.gain.setValueAtTime(0, c.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, c.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(volume * 0.3, c.currentTime + delay + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);

    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + duration);
  });
}

// F мажор — вдох (F3, A3, C4, F4)
export function playInhaleChord(volume = 0.18) {
  playGuitarChord([174.61, 220, 261.63, 349.23], 2.5, volume);
}

// A минор — выдох (A2, E3, A3, C4)
export function playExhaleChord(volume = 0.18) {
  playGuitarChord([110, 164.81, 220, 261.63], 2.5, volume);
}

// C мажор — задержка (C3, G3, C4, E4) — спокойный
export function playHoldChord(volume = 0.12) {
  playGuitarChord([130.81, 196, 261.63, 329.63], 3, volume);
}

// ─── ГОНГ (завершение раунда) ─────────────────────────
export function playGong(volume = 0.3) {
  const c = getCtx();
  [196, 246.94, 293.66, 392].forEach((freq, i) => {
    const osc  = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, c.currentTime + i * 0.1);
    gain.gain.setValueAtTime(volume - i * 0.05, c.currentTime + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.1 + 5);
    osc.start(c.currentTime + i * 0.1);
    osc.stop(c.currentTime + i * 0.1 + 5);
  });
}

// ─── ФОНОВЫЕ ЗВУКИ ───────────────────────────────────
let bgAudio: HTMLAudioElement | null = null;

const LOCATION_BG: Record<number, string> = {
  1:  '/sounds/bg-city.mp3',
  2:  '/sounds/bg-forest.mp3',
  3:  '/sounds/bg-forest.mp3',
  4:  '/sounds/bg-ocean.mp3',
  5:  '/sounds/bg-forest.mp3',
  6:  '/sounds/bg-ocean.mp3',
  7:  '/sounds/bg-forest.mp3',
  8:  '/sounds/bg-forest.mp3',
  9:  '/sounds/bg-wind.mp3',
  10: '/sounds/bg-mountain.mp3',
};

export function playBgSound(locationId: number, volume = 0.3) {
  stopBgSound();
  const src = LOCATION_BG[locationId];
  if (!src) return;
  try {
    bgAudio = new Audio(src);
    bgAudio.loop   = true;
    bgAudio.volume = volume;
    bgAudio.play().catch(() => {});
  } catch {}
}

export function stopBgSound() {
  if (bgAudio) {
    bgAudio.pause();
    bgAudio.currentTime = 0;
    bgAudio = null;
  }
}

export function setBgVolume(volume: number) {
  if (bgAudio) bgAudio.volume = volume;
}

// ─── ГОЛОС (Web Speech API) ───────────────────────────
const VOICE_TEXTS: Record<string, Record<string, string>> = {
  ru: {
    'inhale-left':  'Вдох левой ноздрёй',
    'hold-1':       'Задержка',
    'exhale-right': 'Выдох правой ноздрёй',
    'inhale-right': 'Вдох правой ноздрёй',
    'hold-2':       'Задержка',
    'exhale-left':  'Выдох левой ноздрёй',
  },
  en: {
    'inhale-left':  'Inhale through left nostril',
    'hold-1':       'Hold',
    'exhale-right': 'Exhale through right nostril',
    'inhale-right': 'Inhale through right nostril',
    'hold-2':       'Hold',
    'exhale-left':  'Exhale through left nostril',
  },
};

let preferredVoice: SpeechSynthesisVoice | null = null;

function getBestVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined') return null;
  const voices = window.speechSynthesis.getVoices();
  const langCode = lang === 'en' ? 'en' : 'ru';

  // Ищем Google-голос
  const google = voices.find(v =>
    v.name.toLowerCase().includes('google') &&
    v.lang.startsWith(langCode)
  );
  if (google) return google;

  // Любой голос нужного языка
  return voices.find(v => v.lang.startsWith(langCode)) ?? null;
}

export function speak(
  phaseKey: string,
  volume = 0.9,
  lang: 'ru' | 'en' = 'ru'
) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const text = VOICE_TEXTS[lang]?.[phaseKey] ?? phaseKey;

  window.speechSynthesis.cancel();
  const utt  = new SpeechSynthesisUtterance(text);
  utt.lang   = lang === 'en' ? 'en-US' : 'ru-RU';
  utt.volume = volume;
  utt.rate   = 0.82;
  utt.pitch  = 0.95;

  // Пробуем найти лучший голос
  const voice = getBestVoice(lang);
  if (voice) utt.voice = voice;

  window.speechSynthesis.speak(utt);
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// ─── ГЛАВНАЯ ФУНКЦИЯ ──────────────────────────────────
export function playPhaseSound(
  phaseKey: string,
  type: 'inhale' | 'hold' | 'exhale',
  options: {
    guitar: boolean;
    drum: boolean;
    guitarVolume: number;
    drumVolume: number;
    voice: boolean;
    voiceVolume: number;
    voiceLang: 'ru' | 'en';
  }
) {
  const gVol = options.guitarVolume / 100;
  const dVol = options.drumVolume / 100;

  if (type === 'inhale') {
    if (options.guitar) playInhaleChord(gVol * 0.2);
    if (options.drum)   playDrumInhale(dVol);
  } else if (type === 'hold') {
    if (options.guitar) playHoldChord(gVol * 0.15);
    if (options.drum)   playDrumHold(dVol * 0.7);
  } else if (type === 'exhale') {
    if (options.guitar) playExhaleChord(gVol * 0.2);
    if (options.drum)   playDrumExhale(dVol);
  }

  if (options.voice) {
    speak(phaseKey, options.voiceVolume / 100, options.voiceLang);
  }
}