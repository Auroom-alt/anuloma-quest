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
function pluckString(frequency: number, duration: number, volume = 0.3, delay = 0) {
  const c = getCtx();
  const bufferSize = Math.round(c.sampleRate / frequency);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);

  // Заполняем шумом — имитация удара по струне
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = c.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Фильтр усредняет — струна затухает
  const filter = c.createIIRFilter([0.5, 0.5], [1]);
  const gain   = c.createGain();

  source.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);

  gain.gain.setValueAtTime(volume, c.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);

  source.start(c.currentTime + delay);
  source.stop(c.currentTime + delay + duration);
}

function playGuitarChord(frequencies: number[], duration: number, volume = 0.25) {
  frequencies.forEach((freq, i) => {
    pluckString(freq, duration, volume, i * 0.05);
  });
}
// F мажор — вдох
export function playInhaleChord(volume = 0.25) {
  playGuitarChord([174.61, 220, 261.63, 349.23], 2.5, volume);
}

// A минор — выдох
export function playExhaleChord(volume = 0.25) {
  playGuitarChord([110, 164.81, 220, 261.63], 2.5, volume);
}

// C мажор — задержка
export function playHoldChord(volume = 0.18) {
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
let birdsAudio: HTMLAudioElement | null = null;

const LOCATION_BG: Record<number, string> = {
  1:  '/sounds/bg-city.mp3',      // Мегаполис
  2:  '/sounds/bg-forest.mp3',    // Лес
  3:  '/sounds/bg-forest.mp3',    // Японский сад
  4:  '/sounds/bg-ocean.mp3',     // Берег океана
  5:  '/sounds/bg-forest.mp3',    // Лесная тропинка
  6:  '/sounds/bg-ocean.mp3',     // Беседка у реки
  7:  '/sounds/bg-forest.mp3',    // Весенний лес
  8:  '/sounds/bg-forest.mp3',    // Цветочная поляна
  9:  '/sounds/bg-wind.mp3',      // Вершина холма
  10: '/sounds/bg-mountain.mp3',  // Вершина горы
};

export const BIRDS_TRACKS = [
  { id: 'forest-atmosphere',  label: '🌲 Атмосфера леса' },
  { id: 'forest-birds-day',   label: '☀️ Лес днём' },
  { id: 'forest-birds-night', label: '🌙 Лес ночью' },
  { id: 'forest-spring',      label: '🌸 Весенний лес' },
  { id: 'morning-birds',      label: '🌅 Утро, птицы' },
  { id: 'morning-village',    label: '🏡 Утро в деревне' },
  { id: 'birds-soft',         label: '🎵 Тихие птицы' },
  { id: 'birds-rain',         label: '🌧️ Птицы в дождь' },
  { id: 'nightingale-1',      label: '🎶 Соловей 1' },
  { id: 'nightingale-2',      label: '🎶 Соловей 2' },
  { id: 'nightingale-3',      label: '🎶 Соловей 3' },
  { id: 'nightingale-crickets', label: '🦗 Соловей + сверчки' },
  { id: 'city-birds',         label: '🏙️ Городские птицы' },
  { id: 'city-birds-noise',   label: '🚗 Птицы + город' },
  { id: 'frogs-nightingale',  label: '🐸 Лягушки + соловей' },
  { id: 'birds-night',        label: '🌑 Птицы ночью' },
  { id: 'jungle-night',       label: '🌴 Джунгли ночью' },
  { id: 'wryneck',            label: '🐦 Вертишейка' },
  { id: 'owl',                label: '🦉 Сова' },
];

export function playBgSound(locationId: number, volume = 0.3) {
  stopBgSound();
  const src = LOCATION_BG[locationId];
  if (!src) return;
  try {
    bgAudio = new Audio(src);
    bgAudio.loop   = true;
    bgAudio.volume = Math.min(1, Math.max(0, volume));
    bgAudio.play().catch(() => {});
  } catch {}
}

export function stopBgSound() {
  if (bgAudio) { bgAudio.pause(); bgAudio.currentTime = 0; bgAudio = null; }
}

export function setBgVolume(volume: number) {
  if (bgAudio) bgAudio.volume = volume;
}

export function playBirds(trackId: string, volume = 0.4) {
  stopBirds();
  if (!trackId) return;
  try {
    const src = `/sounds/birds/${trackId}.mp3`;
    birdsAudio = new Audio(src);
    birdsAudio.loop   = true;
    birdsAudio.volume = Math.min(1, Math.max(0, volume));
    birdsAudio.play().catch((e) => {
      console.warn('birds play failed:', e);
    });
  } catch (e) {
    console.warn('birds error:', e);
  }
}

export function stopBirds() {
  if (birdsAudio) { birdsAudio.pause(); birdsAudio.currentTime = 0; birdsAudio = null; }
}

export function setBirdsVolume(volume: number) {
  if (birdsAudio) birdsAudio.volume = volume;
}

// ─── ГОЛОС (Web Speech API) ───────────────────────────
const VOICE_TEXTS: Record<string, Record<string, string>> = {
  ru: {
    'inhale-left':  'Вдох левой ',
    'hold-1':       'Задержка',
    'exhale-right': 'Выдох правой ',
    'inhale-right': 'Вдох правой ',
    'hold-2':       'Задержка',
    'exhale-left':  'Выдох левой ',
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

  const trySpeak = () => {
    const utt  = new SpeechSynthesisUtterance(text);
    utt.lang   = lang === 'en' ? 'en-US' : 'ru-RU';
    utt.volume = volume;
    utt.rate   = 0.82;
    utt.pitch  = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const langCode = lang === 'en' ? 'en' : 'ru';
    const best = voices.find(v =>
      v.name.toLowerCase().includes('google') && v.lang.startsWith(langCode)
    ) ?? voices.find(v => v.lang.startsWith(langCode));

    if (best) utt.voice = best;
    window.speechSynthesis.speak(utt);
  };

  // Голоса могут ещё не загрузиться
  if (window.speechSynthesis.getVoices().length > 0) {
    trySpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      trySpeak();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }
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