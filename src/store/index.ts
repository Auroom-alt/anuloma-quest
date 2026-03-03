import { create }  from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, CharacterGender, SessionState, BreathingCycle, AppSettings } from '@/types';
import { BREATHING_CYCLES, DEFAULT_CYCLE_INDEX, DEFAULT_ROUNDS, calcTotalSeconds, DEFAULT_SETTINGS } from '@/constants';

// ─── Utils ────────────────────────────────────────────────────────────────────

/**
 * FIX A4: Returns today as YYYY-MM-DD in LOCAL timezone.
 * new Date().toISOString() returns UTC — wrong for users in UTC+N after midnight.
 */
function localDateISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * FIX A4: Calculates streak using local-time date strings only.
 * Avoids the UTC-parse bug of new Date("2026-03-03") → midnight UTC.
 */
function calcStreak(history: string[]): number {
  if (!history.length) return 0;
  const unique = [...new Set(history)].sort().reverse(); // newest first
  let streak = 0;
  for (let i = 0; i < unique.length; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (unique[i] === expected) streak++;
    else break;
  }
  return streak;
}

/**
 * Merges local and cloud profiles — takes the best of each field.
 * Strategy: identity from local, stats = max, history = union.
 */
function mergeProfiles(local: UserProfile, cloud: UserProfile): UserProfile {
  const history = [...new Set([...local.practiceHistory, ...cloud.practiceHistory])].sort();
  const streak  = calcStreak(history);
  return {
    heroName:             local.heroName,
    character:            local.character,
    createdAt:            local.createdAt < cloud.createdAt ? local.createdAt : cloud.createdAt,
    totalRoundsCompleted: Math.max(local.totalRoundsCompleted, cloud.totalRoundsCompleted),
    totalTimeSeconds:     Math.max(local.totalTimeSeconds,     cloud.totalTimeSeconds),
    totalBreathCycles:    Math.max(local.totalBreathCycles ?? 0, cloud.totalBreathCycles ?? 0),
    locationsUnlocked:    [...new Set([...local.locationsUnlocked, ...cloud.locationsUnlocked])].sort((a, b) => a - b),
    practiceHistory:      history,
    currentStreak:        streak,
    longestStreak:        Math.max(local.longestStreak ?? 0, cloud.longestStreak ?? 0, streak),
    lastPracticeDate:     history.length ? history[history.length - 1] : null,
  };
}

/** Fire-and-forget upsert to Supabase — never throws, safe to call from sync store. */
async function upsertCloud(userId: string, profile: UserProfile): Promise<void> {
  try {
    const { supabase } = await import('@/lib/supabase');
    await supabase.from('profiles').upsert({
      id:         userId,
      data:       profile,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('[sync] backup failed silently:', e);
  }
}

// ─── Profile Store ────────────────────────────────────────────────────────────

interface ProfileStore {
  profile: UserProfile | null;
  createProfile:     (heroName: string, character: CharacterGender) => void;
  /**
   * FIX A1: Call exactly once per round (not once per session).
   * FIX A2: seconds = duration of THIS round only (not cumulative session time).
   *         cycles  = actual breath cycles completed (use CYCLES_PER_ROUND).
   */
  addCompletedRound: (seconds: number, cycles: number) => void;
  backupToCloud:     (userId: string) => Promise<void>;
  restoreFromCloud:  (userId: string) => Promise<void>;
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
          locationsUnlocked: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          createdAt: new Date().toISOString(),
          practiceHistory: [], currentStreak: 0,
          longestStreak: 0, lastPracticeDate: null,
        },
      }),

      addCompletedRound: (seconds, cycles) => {
        const p = get().profile;
        if (!p) return;
        const today      = localDateISO();
        const history    = p.practiceHistory ?? [];
        const newHistory = history.includes(today) ? history : [...history, today];
        const streak     = calcStreak(newHistory);
        const newProfile: UserProfile = {
          ...p,
          totalRoundsCompleted: p.totalRoundsCompleted + 1,
          totalTimeSeconds:     p.totalTimeSeconds + seconds,
          totalBreathCycles:    (p.totalBreathCycles ?? 0) + cycles,
          practiceHistory:      newHistory,
          currentStreak:        streak,
          longestStreak:        Math.max(p.longestStreak ?? 0, streak),
          lastPracticeDate:     today,
        };
        set({ profile: newProfile });
        // Fire-and-forget cloud backup after each round (no-op if not logged in)
        import('@/lib/supabase')
          .then(({ supabase }) => supabase.auth.getUser())
          .then(({ data: { user } }) => { if (user) upsertCloud(user.id, newProfile); })
          .catch(() => {/* offline — no problem */});
      },

      backupToCloud: async (userId) => {
        const p = get().profile;
        if (!p) return;
        await upsertCloud(userId, p);
      },

      restoreFromCloud: async (userId) => {
        try {
          const { supabase } = await import('@/lib/supabase');
          const { data, error } = await supabase
            .from('profiles')
            .select('data')
            .eq('id', userId)
            .single();
          if (error || !data?.data) return;
          const cloud  = data.data as UserProfile;
          const local  = get().profile;
          const merged = local ? mergeProfiles(local, cloud) : cloud;
          set({ profile: merged });
          await upsertCloud(userId, merged); // write merged version back to cloud
        } catch (e) {
          console.warn('[sync] restore failed silently:', e);
        }
      },

      reset: () => set({ profile: null }),
    }),
    { name: 'anuloma-profile' }
  )
);

// ─── Practice Settings Store ──────────────────────────────────────────────────
// FIX A3: added persist so settings survive page reload

interface PracticeSettingsStore {
  rounds: number; cycleIndex: number; cycle: BreathingCycle;
  totalSeconds: number; startLocationId: number;
  setRounds:        (n: number)  => void;
  setCycleIndex:    (i: number)  => void;
  setStartLocation: (id: number) => void;
}

export const usePracticeSettings = create<PracticeSettingsStore>()(
  persist(
    (set) => ({
      rounds:          DEFAULT_ROUNDS,
      cycleIndex:      DEFAULT_CYCLE_INDEX,
      cycle:           BREATHING_CYCLES[DEFAULT_CYCLE_INDEX],
      totalSeconds:    calcTotalSeconds(BREATHING_CYCLES[DEFAULT_CYCLE_INDEX], DEFAULT_ROUNDS),
      startLocationId: 1,
      setRounds:        (n) => set((s) => ({ rounds: n, totalSeconds: calcTotalSeconds(s.cycle, n) })),
      setCycleIndex:    (i) => set((s) => ({ cycleIndex: i, cycle: BREATHING_CYCLES[i], totalSeconds: calcTotalSeconds(BREATHING_CYCLES[i], s.rounds) })),
      setStartLocation: (id) => set({ startLocationId: id }),
    }),
    { name: 'anuloma-practice-settings' }
  )
);

// ─── Session Store ────────────────────────────────────────────────────────────
// Intentionally NOT persisted — session resets on reload

const blank: SessionState = {
  isActive: false, isPaused: false,
  currentRound: 1, currentCycle: 1,
  currentPhaseIndex: 0, currentPhase: 'inhale-left',
  secondsInPhase: 0, totalSecondsElapsed: 0,
};

interface SessionStore {
  session: SessionState;
  start:        () => void;
  pause:        () => void;
  resume:       () => void;
  stop:         () => void;
  tick:         () => void;
  nextPhase:    () => void;
  advanceCycle: () => void;
  advanceRound: (n: number) => void;
}

export const useSessionStore = create<SessionStore>()((set) => ({
  session: blank,
  start:        () => set({ session: { ...blank, isActive: true } }),
  pause:        () => set((s) => ({ session: { ...s.session, isPaused: true  } })),
  resume:       () => set((s) => ({ session: { ...s.session, isPaused: false } })),
  stop:         () => set({ session: blank }),
  tick:         () => set((s) => ({ session: {
    ...s.session,
    secondsInPhase:      s.session.secondsInPhase + 1,
    totalSecondsElapsed: s.session.totalSecondsElapsed + 1,
  }})),
  nextPhase:    () => set((s) => ({ session: {
    ...s.session,
    currentPhaseIndex: (s.session.currentPhaseIndex + 1) % 6,
    secondsInPhase: 0,
  }})),
  advanceCycle: () => set((s) => ({ session: {
    ...s.session,
    currentCycle:      s.session.currentCycle + 1,
    currentPhaseIndex: 0,
    secondsInPhase:    0,
  }})),
  advanceRound: (n) => set((s) => ({ session: {
    ...s.session,
    currentRound:      n,
    currentCycle:      1,
    currentPhaseIndex: 0,
    secondsInPhase:    0,
  }})),
}));

// ─── App Settings Store ───────────────────────────────────────────────────────

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
      updateSound:         (d) => set((s) => ({ settings: { ...s.settings, sound:         { ...s.settings.sound,         ...d } } })),
      updateMusic:         (d) => set((s) => ({ settings: { ...s.settings, music:         { ...s.settings.music,         ...d } } })),
      updateVisual:        (d) => set((s) => ({ settings: { ...s.settings, visual:        { ...s.settings.visual,        ...d } } })),
      updateAccessibility: (d) => set((s) => ({ settings: { ...s.settings, accessibility: { ...s.settings.accessibility, ...d } } })),
      resetSettings:       ()  => set({ settings: DEFAULT_SETTINGS }),
    }),
    { name: 'anuloma-settings' }
  )
);