'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter }                   from 'next/navigation';
import { motion, AnimatePresence }     from 'framer-motion';
import { useProfileStore, usePracticeSettings, useSessionStore, useSettingsStore } from '@/store';
import { LOCATIONS, getPhasesForCycle, CYCLES_PER_ROUND, ROUND_PAUSE_SECONDS, formatTime } from '@/constants';
import { playPhaseSound, playGong, playBgSound, stopBgSound, playBirds, stopBirds, playOm, stopOm } from '@/lib/audio';
import PageTransition from '@/components/PageTransition';
import AudioPanel     from '@/components/AudioPanel';

const BG_NAMES = ['city','forest','japanese','ocean','forest-path','riverside','spring','meadow','hilltop','mountain'];
function bgUrl(id: number) {
  const n = String(Math.min(10, Math.max(1, id))).padStart(2, '0');
  return `/images/bg-${n}-${BG_NAMES[id - 1]}.jpg`;
}

type AppScreen = 'countdown' | 'practice' | 'finish';

export default function PracticePage() {
  const router = useRouter();
  const { profile, addCompletedRound } = useProfileStore();
  const { rounds, cycle, startLocationId } = usePracticeSettings();
  const { session, start, pause, resume, stop, tick, nextPhase, advanceCycle, advanceRound } = useSessionStore();
  const { settings } = useSettingsStore();

  const [screen,     setScreen]     = useState<AppScreen>('countdown');
  const [countdown,  setCountdown]  = useState(3);
  const [roundPause, setRoundPause] = useState(false);
  const [pauseCount, setPauseCount] = useState(ROUND_PAUSE_SECONDS);

  // FIX: track total elapsed seconds in a ref so it's always current inside intervals
  const totalSecsRef    = useRef(0);
  // FIX: track when current round started (in session-seconds) to compute per-round duration
  const roundStartRef   = useRef(0);

  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loc = LOCATIONS.find(l => l.id === startLocationId) ?? LOCATIONS[0];
  const phases   = getPhasesForCycle(cycle);
  const phase    = phases[session.currentPhaseIndex];

  // ── Countdown 3-2-1 ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'countdown') return;
    playOm();
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          stopOm();
          setScreen('practice');
          start();
          if (settings.music.musicEnabled)       playBgSound(startLocationId, settings.music.musicVolume / 100);
          if (settings.music.natureSoundsEnabled) playBirds(settings.music.selectedBirdsTrack, settings.music.natureSoundsVolume / 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current!);
  }, [screen]);

  // ── Main tick ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'practice' || !session.isActive || session.isPaused || roundPause) return;
    timerRef.current = setInterval(() => {
      tick();
      totalSecsRef.current += 1;
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [screen, session.isActive, session.isPaused, roundPause]);

  // ── Phase logic ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'practice' || !session.isActive || session.isPaused || roundPause) return;
    if (session.secondsInPhase < phase.duration) return;

    const nextIndex = (session.currentPhaseIndex + 1) % 6;

    if (nextIndex === 0) {
      // Cycle complete
      if (session.currentCycle >= CYCLES_PER_ROUND) {
        // Round complete
        if (session.currentRound >= rounds) {
          // FIX A1: single call to addCompletedRound — only here for last round
          handleFinish();
        } else {
          // FIX A1: single call per intermediate round
          // FIX A2: pass CYCLES_PER_ROUND instead of hardcoded 6
          // FIX sessionSecs: pass per-round duration, not cumulative
          const roundDuration = totalSecsRef.current - roundStartRef.current;
          roundStartRef.current = totalSecsRef.current;
          addCompletedRound(roundDuration, CYCLES_PER_ROUND);
          playGong(0.35);
          setRoundPause(true);
          setPauseCount(ROUND_PAUSE_SECONDS);
        }
      } else {
        advanceCycle();
      }
    } else {
      nextPhase();
      const nextPhaseData = phases[nextIndex];
      if (settings.sound.voiceEnabled || settings.sound.drumEnabled || settings.sound.guitarEnabled) {
        playPhaseSound(nextPhaseData.phase, nextPhaseData.type, {
          guitar: settings.sound.guitarEnabled, drum: settings.sound.drumEnabled,
          guitarVolume: settings.sound.guitarVolume, drumVolume: settings.sound.drumVolume,
          voice: settings.sound.voiceEnabled, voiceVolume: settings.sound.voiceVolume,
          voiceLang: settings.sound.voiceLanguage === 'en' ? 'en' : 'ru',
        });
      }
    }
  }, [session.secondsInPhase]);

  // ── Round pause countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (!roundPause) return;
    pauseRef.current = setInterval(() => {
      setPauseCount(p => {
        if (p <= 1) {
          clearInterval(pauseRef.current!);
          setRoundPause(false);
          advanceRound(session.currentRound + 1);
          return ROUND_PAUSE_SECONDS;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(pauseRef.current!);
  }, [roundPause]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleFinish() {
    clearInterval(timerRef.current!);
    // FIX A1: this is the single call site for the last round
    // FIX A2: pass CYCLES_PER_ROUND instead of hardcoded 6
    // FIX sessionSecs: per-round duration
    const roundDuration = totalSecsRef.current - roundStartRef.current;
    addCompletedRound(roundDuration, CYCLES_PER_ROUND);
    stop(); stopBgSound(); stopBirds();
    setScreen('finish');
  }

  function handlePause() {
    if (session.isPaused) resume(); else pause();
  }

  function handleStop() {
    clearInterval(timerRef.current!);
    stop(); stopBgSound(); stopBirds();
    router.push('/');
  }

  function skipPause() {
    clearInterval(pauseRef.current!);
    setRoundPause(false);
    advanceRound(session.currentRound + 1);
  }

  const phaseProgress = phase ? Math.min(1, session.secondsInPhase / phase.duration) : 0;
  const glowMap = { low: '0 0 20px 4px', medium: '0 0 35px 8px', high: '0 0 55px 14px' };
  const glowSize = glowMap[settings.visual.glowIntensity] ?? glowMap.medium;

  // ── Countdown screen ─────────────────────────────────────────────────────────
  if (screen === 'countdown') {
    return (
      <main style={{ ...styles.page, backgroundImage: `url('${bgUrl(startLocationId)}')` }}>
        <div style={styles.bgOverlay} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', letterSpacing: '0.2em', marginBottom: '1rem' }}>
            {loc.emoji} {loc.nameRu}
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{    scale: 1.5,  opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                fontSize: '8rem', fontFamily: 'Georgia, serif', fontWeight: 700,
                background: 'linear-gradient(135deg, #818CF8, #A78BFA)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', lineHeight: 1,
              }}
            >
              {countdown}
            </motion.div>
          </AnimatePresence>
          <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '1.5rem' }}>
            Прими удобную позу. Расслабь плечи.
          </p>
          <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            {rounds} {rounds === 1 ? 'раунд' : rounds < 5 ? 'раунда' : 'раундов'} · {cycle.label}
          </p>
        </div>
      </main>
    );
  }

  // ── Finish screen ────────────────────────────────────────────────────────────
  if (screen === 'finish') {
    return (
      <FinishScreen
        rounds={rounds}
        totalSecs={totalSecsRef.current}
        location={loc}
        profile={profile}
        onHome={() => router.push('/')}
        onAgain={() => router.push('/setup')}
      />
    );
  }

  // ── Practice screen ──────────────────────────────────────────────────────────
  const phaseColors: Record<string, string> = {
    'inhale-left': '#60A5FA', 'hold-1':       '#A78BFA',
    'exhale-right': '#FBBF24', 'inhale-right': '#60A5FA',
    'hold-2':       '#A78BFA', 'exhale-left':  '#FBBF24',
  };
  const currentColor = phase ? phaseColors[phase.phase] ?? '#94A3B8' : '#94A3B8';
  const amplitude    = settings.visual.animationAmplitude === 'small' ? 1.03
    : settings.visual.animationAmplitude === 'large' ? 1.1 : 1.06;

  return (
    <PageTransition>
      <main style={{ ...styles.page, backgroundImage: `url('${bgUrl(startLocationId)}')` }}>
        <div style={styles.bgOverlay} />
        <div style={{
          position: 'relative', zIndex: 2, width: '100%', maxWidth: '480px',
          margin: '0 auto', padding: '0 1rem',
          display: 'flex', flexDirection: 'column', minHeight: '100dvh',
        }}>

          {/* Header */}
          <div style={styles.header}>
            <div>
              <p style={styles.locationName}>{loc.emoji} {loc.nameRu}</p>
              <p style={styles.roundInfo}>Раунд {session.currentRound} из {rounds}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={styles.timer}>{formatTime(session.totalSecondsElapsed)}</p>
              <p style={styles.cycleInfo}>Цикл {session.currentCycle} из {CYCLES_PER_ROUND}</p>
            </div>
          </div>

          {/* Round pause */}
          {roundPause && (
            <div style={styles.roundPauseBox}>
              <p style={{ color: '#A78BFA', fontSize: '1.3rem', marginBottom: '0.5rem' }}>✦ Раунд завершён</p>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Следующий раунд через <strong style={{ color: '#F1F5F9' }}>{pauseCount}</strong> сек
              </p>
              <p style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.85rem', marginBottom: '1rem' }}>
                «Почувствуй покой. Подготовься к следующему шагу.»
              </p>
              <button style={styles.skipBtn} onClick={skipPause}>Пропустить паузу →</button>
            </div>
          )}

          {/* Character */}
          {!roundPause && (
            <div style={styles.characterWrap}>
              {phase?.nostril === 'left' && (
                <div style={{ position: 'absolute', left: '5%', top: '50%', transform: 'translateY(-50%)', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(96,165,250,0.2)', border: '2px solid #60A5FA', boxShadow: `${glowSize} rgba(96,165,250,0.5)`, animation: 'pulse-soft 2s ease-in-out infinite' }} />
              )}
              {phase?.nostril === 'right' && (
                <div style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(251,191,36,0.2)', border: '2px solid #FBBF24', boxShadow: `${glowSize} rgba(251,191,36,0.5)`, animation: 'pulse-soft 2s ease-in-out infinite' }} />
              )}
              {phase?.nostril === 'both' && (
                <>
                  <div style={{ position: 'absolute', left: '5%', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(167,139,250,0.2)', border: '2px solid #A78BFA', boxShadow: `${glowSize} rgba(167,139,250,0.4)`, animation: 'pulse-soft 2s ease-in-out infinite' }} />
                  <div style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(167,139,250,0.2)', border: '2px solid #A78BFA', boxShadow: `${glowSize} rgba(167,139,250,0.4)`, animation: 'pulse-soft 2s ease-in-out infinite' }} />
                </>
              )}
              {settings.visual.characterAnimationEnabled ? (
                <motion.img
                  key={phase?.type}
                  src={profile?.character === 'female' ? '/images/chars/char-lila.png' : '/images/chars/char-arya.png'}
                  alt="персонаж"
                  animate={{ scale: phase?.type === 'inhale' ? amplitude : phase?.type === 'hold' ? amplitude * 0.97 : 1 }}
                  transition={{ duration: phase?.duration ?? 4, ease: 'easeInOut' }}
                  style={{ height: '160px', width: 'auto', filter: `drop-shadow(0 0 20px ${currentColor}66)`, position: 'relative', zIndex: 1 }}
                />
              ) : (
                <img
                  src={profile?.character === 'female' ? '/images/chars/char-lila.png' : '/images/chars/char-arya.png'}
                  alt="персонаж"
                  style={{ height: '160px', width: 'auto', filter: `drop-shadow(0 0 20px ${currentColor}66)`, position: 'relative', zIndex: 1 }}
                />
              )}
            </div>
          )}

          {/* Phase label */}
          {!roundPause && (
            <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
              <p style={{ color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.2em', marginBottom: '0.4rem' }}>СЕЙЧАС</p>
              <motion.h2
                key={phase?.phase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: currentColor, marginBottom: '0.5rem', fontWeight: 700 }}
              >
                {phase?.labelRu}
              </motion.h2>
              <p style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontFamily: 'Georgia, serif', fontWeight: 700, color: '#F1F5F9', lineHeight: 1 }}>
                {Math.max(0, phase ? phase.duration - session.secondsInPhase : 0)}
              </p>
              <p style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '0.2rem' }}>секунд</p>
            </div>
          )}

          {/* Progress bar */}
          {!roundPause && (
            <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginBottom: '1rem', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${phaseProgress * 100}%` }}
                transition={{ duration: 0.5, ease: 'linear' }}
                style={{ height: '100%', background: `linear-gradient(90deg, ${currentColor}88, ${currentColor})`, borderRadius: '2px' }}
              />
            </div>
          )}

          {/* Phase dots */}
          {!roundPause && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {phases.map((p, i) => {
                const active    = i === session.currentPhaseIndex;
                const done      = i < session.currentPhaseIndex;
                const dotColor  = phaseColors[p.phase] ?? '#475569';
                const dotStyle  = settings.visual.dotStyle;
                return (
                  <div key={i} style={{
                    width:        active ? '12px' : '9px',
                    height:       active ? '12px' : '9px',
                    borderRadius: dotStyle === 'circles' ? '50%' : dotStyle === 'stars' ? '2px' : '3px',
                    transform:    dotStyle === 'stars' ? 'rotate(45deg)' : 'none',
                    background:   active ? dotColor : done ? `${dotColor}55` : 'rgba(255,255,255,0.1)',
                    boxShadow:    active ? `0 0 8px 2px ${dotColor}88` : 'none',
                    transition:   'all 0.3s',
                  }} />
                );
              })}
            </div>
          )}

          {/* Phase labels */}
          {!roundPause && (
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
              {phases.map((p, i) => (
                <span key={i} style={{
                  fontSize: '0.7rem',
                  color:    i === session.currentPhaseIndex ? phaseColors[p.phase] : '#475569',
                  fontWeight: i === session.currentPhaseIndex ? 600 : 400,
                }}>
                  {p.labelRu} {p.duration}с{i < phases.length - 1 ? ' ·' : ''}
                </span>
              ))}
            </div>
          )}

          {/* Location quote */}
          {!roundPause && (
            <div style={{ textAlign: 'center', padding: '0.75rem 1rem', marginBottom: '0.75rem' }}>
              <p style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '0.25rem' }}>
                «{loc.quote}»
              </p>
              <p style={{ color: '#64748B', fontSize: '0.72rem' }}>— {loc.quoteSource}</p>
            </div>
          )}

          {/* Controls */}
          <div style={styles.controls}>
            <button style={styles.controlBtn} onClick={handlePause}>
              {session.isPaused ? '▶ Продолжить' : '⏸ Пауза'}
            </button>
            <button style={{ ...styles.controlBtn, color: '#475569' }} onClick={handleStop}>
              ✕ Стоп
            </button>
          </div>

          <AudioPanel locationId={startLocationId} />

        </div>
      </main>
    </PageTransition>
  );
}

// ── Finish screen ─────────────────────────────────────────────────────────────
function FinishScreen({ rounds, totalSecs, location, profile, onHome, onAgain }: {
  rounds: number; totalSecs: number; location: typeof LOCATIONS[0];
  profile: any; onHome: () => void; onAgain: () => void;
}) {
  const minutes     = Math.floor(totalSecs / 60);
  const secs        = totalSecs % 60;
  const totalCycles = rounds * CYCLES_PER_ROUND;
  const streak      = profile?.currentStreak ?? 0;

  return (
    <PageTransition>
      <main style={{ ...styles.page, backgroundImage: `url('${bgUrl(location.id)}')` }}>
        <div style={styles.bgOverlay} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '420px', margin: '0 auto', padding: '2rem 1rem', width: '100%' }}>

          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
            style={{ fontSize: '4rem', marginBottom: '1rem' }}>🕉️
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', background: 'linear-gradient(135deg, #FBBF24, #FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.5rem' }}>
            Практика завершена
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ color: '#64748B', marginBottom: '1.5rem' }}>
            {location.emoji} {location.nameRu}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { emoji: '⏱️', label: 'Время',   value: `${minutes}м ${secs}с`,  color: '#60A5FA' },
              { emoji: '🔄', label: 'Раундов', value: rounds,                   color: '#A78BFA' },
              { emoji: '🌬️', label: 'Циклов',  value: totalCycles,              color: '#34D399' },
              { emoji: '🔥', label: 'Серия',   value: `${streak} ${streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'}`, color: '#FBBF24' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>{s.emoji}</p>
                <p style={{ color: s.color, fontSize: '1.2rem', fontFamily: 'Georgia, serif', fontWeight: 700 }}>{s.value}</p>
                <p style={{ color: '#475569', fontSize: '0.7rem' }}>{s.label}</p>
              </div>
            ))}
          </motion.div>

          {streak > 1 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '1rem', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
              <p style={{ color: '#FBBF24', fontSize: '0.95rem', fontWeight: 600 }}>
                🔥 {streak} {streak < 5 ? 'дня' : 'дней'} подряд!
              </p>
              <p style={{ color: '#92400E', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                Продолжай — завтра серия станет длиннее
              </p>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '0.3rem' }}>
              «{location.quote}»
            </p>
            <p style={{ color: '#64748B', fontSize: '0.75rem' }}>— {location.quoteSource}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button onClick={onAgain} style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', color: '#0a0a0a', fontWeight: 700, fontSize: '1rem', padding: '0.9rem 2rem', borderRadius: '999px', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(251,191,36,0.3)' }}>
              🌬️ Ещё раз
            </button>
            <button onClick={onHome} style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: '0.95rem', padding: '0.85rem 2rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
              🏠 На главную
            </button>
          </motion.div>

        </div>
      </main>
    </PageTransition>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100dvh', backgroundSize: 'cover', backgroundPosition: 'center',
    backgroundAttachment: 'fixed', display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', position: 'relative' as const,
  },
  bgOverlay: {
    position: 'absolute' as const, inset: 0,
    background: 'linear-gradient(to bottom, rgba(3,7,18,0.7) 0%, rgba(3,7,18,0.5) 50%, rgba(3,7,18,0.8) 100%)',
    zIndex: 1,
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '0.75rem 1rem', marginBottom: '0.5rem', marginTop: '1rem',
    background: 'rgba(3,7,18,0.6)', backdropFilter: 'blur(12px)',
    borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.06)',
  } as React.CSSProperties,
  locationName: { color: '#F1F5F9', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.15rem' },
  roundInfo:    { color: '#64748B', fontSize: '0.75rem' },
  timer:        { color: '#A78BFA', fontSize: '1rem', fontFamily: 'Georgia, serif', fontWeight: 700, marginBottom: '0.15rem' },
  cycleInfo:    { color: '#475569', fontSize: '0.75rem' },
  characterWrap: {
    position: 'relative' as const, display: 'flex', justifyContent: 'center',
    alignItems: 'center', minHeight: '200px', marginBottom: '1rem',
  },
  roundPauseBox: {
    background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(167,139,250,0.2)', borderRadius: '1.5rem',
    padding: '2rem 1.5rem', textAlign: 'center' as const, marginBottom: '1rem',
  },
  skipBtn: {
    background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)',
    color: '#A78BFA', borderRadius: '999px', padding: '0.6rem 1.5rem',
    cursor: 'pointer', fontSize: '0.85rem',
  } as React.CSSProperties,
  controls: {
    display: 'flex', gap: '0.75rem', justifyContent: 'center',
    marginTop: 'auto', paddingBottom: '1rem', paddingTop: '0.5rem',
  },
  controlBtn: {
    background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8',
    borderRadius: '999px', padding: '0.75rem 1.75rem',
    cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s',
    minWidth: '120px',
  } as React.CSSProperties,
};