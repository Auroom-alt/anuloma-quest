import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, CharacterGender, SessionState, BreathingCycle, AppSettings } from '@/types';
import { BREATHING_CYCLES, DEFAULT_CYCLE_INDEX, DEFAULT_ROUNDS, calcTotalSeconds, DEFAULT_SETTINGS } from '@/constants';

// ── PROFILE ──────────────────────────────────────────
interface ProfileStore {
  profile: UserProfile | null;
  createProfile: (heroName: string, character: CharacterGender) => void;
  addCompletedRound: (seconds: number) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: null,

      createProfile: (heroName, character) => set({
        profile: {
          heroName,
          character,
          totalRoundsCompleted: 0,
          totalTimeSeconds: 0,
          totalBreathCycles: 0,
          locationsUnlocked: [1],
          createdAt: new Date().toISOString(),
        },
      }),

      addCompletedRound: (seconds) => {
  const p = get().profile;
  if (!p) return;
  const newRounds = p.totalRoundsCompleted + 1;
  const locationId = Math.min(10, newRounds);
  set({
    profile: {
      ...p,
      totalRoundsCompleted: newRounds,
      totalTimeSeconds: p.totalTimeSeconds + seconds,
      totalBreathCycles: (p.totalBreathCycles ?? 0) + 6,
      locationsUnlocked: p.locationsUnlocked.includes(locationId)
        ? p.locationsUnlocked
        : [...p.locationsUnlocked, locationId],
    },
  });
},

      reset: () => set({ profile: null }),
    }),
    { name: 'anuloma-profile' }
  )
);

// ── PRACTICE SETTINGS ────────────────────────────────
interface SettingsStore {
  rounds: number;
  cycleIndex: number;
  cycle: BreathingCycle;
  totalSeconds: number;
  setRounds: (n: number) => void;
  setCycleIndex: (i: number) => void;
}

export const usePracticeSettings = create<SettingsStore>()((set) => ({
  rounds:       DEFAULT_ROUNDS,
  cycleIndex:   DEFAULT_CYCLE_INDEX,
  cycle:        BREATHING_CYCLES[DEFAULT_CYCLE_INDEX],
  totalSeconds: calcTotalSeconds(BREATHING_CYCLES[DEFAULT_CYCLE_INDEX], DEFAULT_ROUNDS),

  setRounds: (n) => set((s) => ({
    rounds: n,
    totalSeconds: calcTotalSeconds(s.cycle, n),
  })),

  setCycleIndex: (i) => set((s) => ({
    cycleIndex: i,
    cycle: BREATHING_CYCLES[i],
    totalSeconds: calcTotalSeconds(BREATHING_CYCLES[i], s.rounds),
  })),
}));

// ── SESSION ───────────────────────────────────────────
interface SessionStore {
  session: SessionState;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  tick: () => void;
  nextPhase: () => void;
  advanceCycle: () => void;
  advanceRound: (nextRound: number) => void;
}

const blank: SessionState = {
  isActive: false,
  isPaused: false,
  currentRound: 1,
  currentCycle: 1,
  currentPhaseIndex: 0,
  currentPhase: 'inhale-left',
  secondsInPhase: 0,
  totalSecondsElapsed: 0,
};

export const useSessionStore = create<SessionStore>()((set) => ({
  session: blank,
  start:  () => set({ session: { ...blank, isActive: true } }),
  pause:  () => set((s) => ({ session: { ...s.session, isPaused: true  } })),
  resume: () => set((s) => ({ session: { ...s.session, isPaused: false } })),
  stop:   () => set({ session: blank }),
  tick:   () => set((s) => ({
    session: {
      ...s.session,
      secondsInPhase:      s.session.secondsInPhase + 1,
      totalSecondsElapsed: s.session.totalSecondsElapsed + 1,
    },
  })),
  nextPhase: () => set((s) => ({
    session: {
      ...s.session,
      currentPhaseIndex: (s.session.currentPhaseIndex + 1) % 6,
      secondsInPhase: 0,
    },
  })),
  advanceCycle: () => set((s) => ({
    session: {
      ...s.session,
      currentCycle: s.session.currentCycle + 1,
      currentPhaseIndex: 0,
      secondsInPhase: 0,
    },
  })),
  advanceRound: (nextRound: number) => set((s) => ({
    session: {
      ...s.session,
      currentRound: nextRound,
      currentCycle: 1,
      currentPhaseIndex: 0,
      secondsInPhase: 0,
    },
  })),
}));
// ── SETTINGS ──────────────────────────────────────────


interface AppSettingsStore {
  settings: AppSettings;
  updateSound: (data: Partial<AppSettings['sound']>) => void;
  updateMusic: (data: Partial<AppSettings['music']>) => void;
  updateVisual: (data: Partial<AppSettings['visual']>) => void;
  updateAccessibility: (data: Partial<AppSettings['accessibility']>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<AppSettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSound: (data) => set(s => ({ settings: { ...s.settings, sound: { ...s.settings.sound, ...data } } })),
      updateMusic: (data) => set(s => ({ settings: { ...s.settings, music: { ...s.settings.music, ...data } } })),
      updateVisual: (data) => set(s => ({ settings: { ...s.settings, visual: { ...s.settings.visual, ...data } } })),
      updateAccessibility: (data) => set(s => ({ settings: { ...s.settings, accessibility: { ...s.settings.accessibility, ...data } } })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    { name: 'anuloma-settings' }
  )
);