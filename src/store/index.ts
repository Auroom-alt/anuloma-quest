import { create }  from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, CharacterGender, SessionState, BreathingCycle, AppSettings } from '@/types';
import { BREATHING_CYCLES, DEFAULT_CYCLE_INDEX, DEFAULT_ROUNDS, calcTotalSeconds, DEFAULT_SETTINGS } from '@/constants';

function calcStreak(history: string[]): number {
  if (!history.length) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const unique = [...new Set(history)].sort().reverse();
  let streak = 0;
  for (let i = 0; i < unique.length; i++) {
    const d = new Date(unique[i]);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === i) { streak++; } else { break; }
  }
  return streak;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

interface ProfileStore {
  profile: UserProfile | null;
  createProfile:     (heroName: string, character: CharacterGender) => void;
  addCompletedRound: (seconds: number) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: null,
      createProfile: (heroName, character) => set({
        profile: {
          heroName, character,
          totalRoundsCompleted: 0, totalTimeSeconds: 0, totalBreathCycles: 0,
          locationsUnlocked: [1,2,3,4,5,6,7,8,9,10],
          createdAt: new Date().toISOString(),
          practiceHistory: [], currentStreak: 0,
          longestStreak: 0, lastPracticeDate: null,
        },
      }),
      addCompletedRound: (seconds) => {
        const p = get().profile;
        if (!p) return;
        const today      = todayISO();
        const history    = p.practiceHistory ?? [];
        const newHistory = history.includes(today) ? history : [...history, today];
        const streak     = calcStreak(newHistory);
        const longest    = Math.max(p.longestStreak ?? 0, streak);
        set({
          profile: {
            ...p,
            totalRoundsCompleted: p.totalRoundsCompleted + 1,
            totalTimeSeconds:     p.totalTimeSeconds + seconds,
            totalBreathCycles:    (p.totalBreathCycles ?? 0) + 6,
            practiceHistory:      newHistory,
            currentStreak:        streak,
            longestStreak:        longest,
            lastPracticeDate:     today,
          },
        });
      },
      reset: () => set({ profile: null }),
    }),
    { name: 'anuloma-profile' }
  )
);

interface SettingsStore {
  rounds: number; cycleIndex: number; cycle: BreathingCycle;
  totalSeconds: number; startLocationId: number;
  setRounds:        (n: number)  => void;
  setCycleIndex:    (i: number)  => void;
  setStartLocation: (id: number) => void;
}

export const usePracticeSettings = create<SettingsStore>()((set) => ({
  rounds: DEFAULT_ROUNDS, cycleIndex: DEFAULT_CYCLE_INDEX,
  cycle: BREATHING_CYCLES[DEFAULT_CYCLE_INDEX],
  totalSeconds: calcTotalSeconds(BREATHING_CYCLES[DEFAULT_CYCLE_INDEX], DEFAULT_ROUNDS),
  startLocationId: 1,
  setRounds:        (n) => set((s) => ({ rounds: n, totalSeconds: calcTotalSeconds(s.cycle, n) })),
  setCycleIndex:    (i) => set((s) => ({ cycleIndex: i, cycle: BREATHING_CYCLES[i], totalSeconds: calcTotalSeconds(BREATHING_CYCLES[i], s.rounds) })),
  setStartLocation: (id) => set({ startLocationId: id }),
}));

const blank: SessionState = {
  isActive: false, isPaused: false, currentRound: 1, currentCycle: 1,
  currentPhaseIndex: 0, currentPhase: 'inhale-left',
  secondsInPhase: 0, totalSecondsElapsed: 0,
};

interface SessionStore {
  session: SessionState;
  start: () => void; pause: () => void; resume: () => void; stop: () => void;
  tick: () => void; nextPhase: () => void; advanceCycle: () => void; advanceRound: (n: number) => void;
}

export const useSessionStore = create<SessionStore>()((set) => ({
  session: blank,
  start:        () => set({ session: { ...blank, isActive: true } }),
  pause:        () => set((s) => ({ session: { ...s.session, isPaused: true  } })),
  resume:       () => set((s) => ({ session: { ...s.session, isPaused: false } })),
  stop:         () => set({ session: blank }),
  tick:         () => set((s) => ({ session: { ...s.session, secondsInPhase: s.session.secondsInPhase + 1, totalSecondsElapsed: s.session.totalSecondsElapsed + 1 } })),
  nextPhase:    () => set((s) => ({ session: { ...s.session, currentPhaseIndex: (s.session.currentPhaseIndex + 1) % 6, secondsInPhase: 0 } })),
  advanceCycle: () => set((s) => ({ session: { ...s.session, currentCycle: s.session.currentCycle + 1, currentPhaseIndex: 0, secondsInPhase: 0 } })),
  advanceRound: (n) => set((s) => ({ session: { ...s.session, currentRound: n, currentCycle: 1, currentPhaseIndex: 0, secondsInPhase: 0 } })),
}));

interface AppSettingsStore {
  settings: AppSettings;
  updateSound:         (d: Partial<AppSettings['sound']>)         => void;
  updateMusic:         (d: Partial<AppSettings['music']>)         => void;
  updateVisual:        (d: Partial<AppSettings['visual']>)        => void;
  updateAccessibility: (d: Partial<AppSettings['accessibility']>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<AppSettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSound:         (d) => set(s => ({ settings: { ...s.settings, sound:         { ...s.settings.sound,         ...d } } })),
      updateMusic:         (d) => set(s => ({ settings: { ...s.settings, music:         { ...s.settings.music,         ...d } } })),
      updateVisual:        (d) => set(s => ({ settings: { ...s.settings, visual:        { ...s.settings.visual,        ...d } } })),
      updateAccessibility: (d) => set(s => ({ settings: { ...s.settings, accessibility: { ...s.settings.accessibility, ...d } } })),
      resetSettings:       ()  => set({ settings: DEFAULT_SETTINGS }),
    }),
    { name: 'anuloma-settings' }
  )
);