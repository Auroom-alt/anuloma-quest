export type CharacterGender = 'male' | 'female';

export interface BreathingCycle {
  inhale: number;
  hold: number;
  exhale: number;
  label: string;
}

export type BreathPhase =
  | 'inhale-left'
  | 'hold-1'
  | 'exhale-right'
  | 'inhale-right'
  | 'hold-2'
  | 'exhale-left';

export interface Location {
  id: number;
  slug: string;
  nameRu: string;
  emoji: string;
  symbolRu: string;
  bgFrom: string;
  bgTo: string;
  quote: string;
  quoteSource: string;
  gradient: string; 
}

export interface UserProfile {
  heroName: string;
  character: CharacterGender;
  totalRoundsCompleted: number;
  totalTimeSeconds: number;
  totalBreathCycles: number;   // ← добавь эту строку
  locationsUnlocked: number[];
  createdAt: string;
}

export interface PracticeSettings {
  rounds: number;
  cycle: BreathingCycle;
  totalSeconds: number;
}

export interface SessionState {
  isActive: boolean;
  isPaused: boolean;
  currentRound: number;
  currentCycle: number;
  currentPhaseIndex: number;
  currentPhase: BreathPhase | null;
  secondsInPhase: number;
  totalSecondsElapsed: number;
}
// ── APP SETTINGS ──────────────────────────────────────
export interface SoundSettings {
  voiceEnabled: boolean;
  voiceLanguage: 'ru' | 'en' | 'sanskrit';
  voiceStyle: 'short' | 'detailed';
  voiceVolume: number;
  drumEnabled: boolean;
  drumVolume: number;
  guitarEnabled: boolean;
  guitarVolume: number;
}

export interface MusicSettings {
  musicEnabled: boolean;
  musicVolume: number;
  syncWithBreath: boolean;
  natureSoundsEnabled: boolean;
  natureSoundsVolume: number;
  selectedBirdsTrack: string;  // ← добавь
}

export interface VisualSettings {
  colorTheme: 'dark' | 'light' | 'auto';
  glowIntensity: 'low' | 'medium' | 'high';
  dotStyle: 'circles' | 'crystals' | 'stars';
  characterAnimationEnabled: boolean;
  animationAmplitude: 'small' | 'medium' | 'large';
  transitionSpeed: 'soft' | 'fast';
}

export interface AccessibilitySettings {
  subtitlesEnabled: boolean;
  highContrastMode: boolean;
  hapticFeedback: boolean;
  largeFontMode: boolean;
  eyesClosedMode: boolean;
}

export interface AppSettings {
  sound: SoundSettings;
  music: MusicSettings;
  visual: VisualSettings;
  accessibility: AccessibilitySettings;
}