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
}

export interface UserProfile {
  totalBreathCycles: number;
  heroName: string;
  character: CharacterGender;
  totalRoundsCompleted: number;
  totalTimeSeconds: number;
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