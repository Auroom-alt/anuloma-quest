/* ═══════════════════════════════════════════════════════════
   Anuloma Quest — src/app/practice/page.tsx
   Исправлено:
   · URL фоновых картинок: bg-0${Math.min(9,id)} → правильный padStart(2,'0')
   · Цвета цитат: #1E293B / #0F172A → видимые #94A3B8 / #64748B
   · Прочие невидимые цвета (#334155, #1E293B в тексте)
   · FinishScreen кнопка "На главную": #334155 → #64748B
═══════════════════════════════════════════════════════════ */

'use client';

import { useEffect, useRef, useState }                              from 'react';
import { useRouter }                                                from 'next/navigation';
import { usePracticeSettings, useSessionStore, useProfileStore, useSettingsStore } from '@/store';
import { getPhasesForCycle, formatTime, CYCLES_PER_ROUND, ROUND_PAUSE_SECONDS, LOCATIONS } from '@/constants';
import { playPhaseSound, playGong, playOm, playBgSound, stopBgSound, stopSpeech, playBirds, stopBirds, BIRDS_TRACKS } from '@/lib/audio';
import { motion, AnimatePresence }                                  from 'framer-motion';

/* Имена фонов по порядку локаций */
const BG_NAMES = [
  'city', 'forest', 'garden', 'ocean', 'path',
  'gazebo', 'spring', 'meadow', 'hill', 'mountain',
];

/** Правильный URL фона — padStart гарантирует bg-01…bg-10 */
function bgUrl(locationId: number): string {
  const id   = Math.min(10, Math.max(1, locationId));
  const num  = String(id).padStart(2, '0');          // 1→"01", 10→"10"
  const name = BG_NAMES[id - 1];
  return `/images/bg-${num}-${name}.jpg`;
}

export default function PracticePage() {
  const router = useRouter();
  const { rounds, cycle, startLocationId }                                   = usePracticeSettings();
  const { session, start, pause, resume, stop, tick, nextPhase, advanceCycle, advanceRound } = useSessionStore();
  const { addCompletedRound, profile }                                       = useProfileStore();
  const { settings, updateMusic }                                            = useSettingsStore();

  const [roundPause, setRoundPause] = useState(false);
  const [pauseCount, setPauseCount] = useState(ROUND_PAUSE_SECONDS);
  const [finished,   setFinished]   = useState(false);
  const [audioOpen,  setAudioOpen]  = useState(false);

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phases        = getPhasesForCycle(cycle);
  const phase         = phases[session.currentPhaseIndex];
  const locationIndex = Math.min(9, (startLocationId - 1) + (session.currentRound - 1));
  const location      = LOCATIONS[locationIndex];

  /* ─── Старт ──────────────────────────────────────────── */
  useEffect(() => {
    start();
    playOm();
    if (settings.music.musicEnabled) {
      const idx = Math.min(9, (startLocationId - 1) + session.currentRound);
      playBgSound(LOCATIONS[idx].id, settings.music.musicVolume / 100);
    }
    if (settings.music.natureSoundsEnabled) {
      playBirds(settings.music.selectedBirdsTrack, settings.music.natureSoundsVolume / 100);
    }
    return () => {
      if (intervalRef.current)  clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      stopSpeech();
      stopBgSound();
      stopBirds();
    };
  }, []);

  /* ─── Тик таймера ────────────────────────────────────── */
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!session.isActive || session.isPaused || roundPause || finished) return;
    intervalRef.current = setInterval(() => tick(), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [session.isActive, session.isPaused, roundPause, finished]);

  /* ─── Конец фазы ─────────────────────────────────────── */
  useEffect(() => {
    if (!session.isActive || session.isPaused || !phase) return;
    if (session.secondsInPhase >= phase.duration) handlePhaseEnd();
  }, [session.secondsInPhase]);

  function handlePhaseEnd() {
    const isLastPhase   = session.currentPhaseIndex === 5;
    const nextIndex     = isLastPhase ? 0 : session.currentPhaseIndex + 1;
    const upcomingPhase = phases[nextIndex];

    try {
      playPhaseSound(upcomingPhase.phase, upcomingPhase.type, {
        guitar:       settings.sound.guitarEnabled,
        drum:         settings.sound.drumEnabled,
        guitarVolume: settings.sound.guitarVolume,
        drumVolume:   settings.sound.drumVolume,
        voice:        settings.sound.voiceEnabled,
        voiceVolume:  settings.sound.voiceVolume,
        voiceLang:    settings.sound.voiceLanguage === 'en' ? 'en' : 'ru',
      });
    } catch (e) {
      console.error('audio error:', e);
    }

    if (settings.accessibility.hapticFeedback && navigator.vibrate) {
      navigator.vibrate(upcomingPhase.type === 'hold' ? [100, 50, 100] : [80]);
    }

    if (isLastPhase) {
      session.currentCycle >= CYCLES_PER_ROUND ? handleRoundEnd() : advanceCycle();
    } else {
      nextPhase();
    }
  }

  function handleRoundEnd() {
    const roundSeconds = (cycle.inhale + cycle.hold + cycle.exhale) * 2 * CYCLES_PER_ROUND;
    addCompletedRound(roundSeconds);
    playGong();

    if (session.currentRound >= rounds) {
      setFinished(true);
      return;
    }

    if (settings.music.musicEnabled) {
      playBgSound(Math.min(10, session.currentRound + 1), settings.music.musicVolume / 100);
    }

    setRoundPause(true);
    setPauseCount(ROUND_PAUSE_SECONDS);

    countdownRef.current = setInterval(() => {
      setPauseCount(p => {
        if (p <= 1) {
          clearInterval(countdownRef.current!);
          setRoundPause(false);
          advanceRound(session.currentRound + 1);
          return ROUND_PAUSE_SECONDS;
        }
        return p - 1;
      });
    }, 1000);
  }

  function handlePause() { session.isPaused ? resume() : pause(); }

  function handleStop() {
    stop(); stopSpeech(); stopBgSound(); stopBirds();
    router.push('/');
  }

  function skipPause() {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setRoundPause(false);
    advanceRound(session.currentRound + 1);
  }

  const phaseProgress   = phase ? Math.min(1, session.secondsInPhase / phase.duration) : 0;
  const remaining       = phase ? Math.max(0, phase.duration - session.secondsInPhase) : 0;
  const locationGradient = location.gradient ?? '';
  const glowColor =
    phase?.type === 'hold'           ? '#A78BFA' :
    phase?.nostril === 'left'        ? '#60A5FA' : '#FBBF24';

  /* ─── ФИНИШ ──────────────────────────────────────────── */
  if (finished) return (
    <FinishScreen
      heroName={profile?.heroName ?? 'Герой'}
      rounds={rounds}
      onRepeat={() => { stop(); router.push('/setup'); }}
      onHome={()   => { stop(); router.push('/');      }}
      onMap={()    => { stop(); router.push('/map');   }}
      currentLocationId={startLocationId}
    />
  );

  /* ─── ОСНОВНОЙ ЭКРАН ─────────────────────────────────── */
  return (
    <main style={styles.page}>

      {/* Фон локации — ИСПРАВЛЕНО: bgUrl() вместо bg-0${Math.min(9,...)} */}
      <div style={{
        position:         'fixed',
        inset:            0,
        backgroundImage:  `url('${bgUrl(location.id)}')`,
        backgroundSize:   'cover',
        backgroundPosition: 'center',
        opacity:          0.15,
        zIndex:           0,
        transition:       'background-image 1.5s ease',
      }} />

      {/* Градиент поверх фона */}
      <div style={{
        position:   'fixed',
        inset:      0,
        background: `${locationGradient}, rgba(3,7,18,0.75)`,
        zIndex:     1,
      }} />

      {/* Контент */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <AudioPanel
          settings={settings}
          updateMusic={updateMusic}
          open={audioOpen}
          setOpen={setAudioOpen}
          locationId={Math.min(10, session.currentRound)}
          onPause={handlePause}
          isPaused={session.isPaused}
        />

        {/* Шапка */}
        <div style={styles.header}>
          <div>
            <p style={styles.locationName}>{location.emoji} {location.nameRu}</p>
            <p style={styles.roundInfo}>Раунд {session.currentRound} из {rounds}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={styles.timer}>{formatTime(session.totalSecondsElapsed)}</p>
            <p style={styles.cycleInfo}>Цикл {session.currentCycle} из {CYCLES_PER_ROUND}</p>
          </div>
        </div>

        {/* Пауза между раундами */}
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

        {/* Персонаж */}
        {!roundPause && (
          <div style={styles.characterWrap}>
            {phase?.nostril === 'left' && (
              <img
                src="/images/ui/lung-left.png" alt="левая ноздря"
                style={{
                  position: 'absolute', left: '5%', height: '80px', opacity: 0.6,
                  filter: 'drop-shadow(0 0 12px #60A5FA)',
                  animation: 'pulse-soft 2s ease-in-out infinite',
                }}
              />
            )}
            <img
              src={profile?.character === 'female'
                ? '/images/chars/char-lila.png'
                : '/images/chars/char-arya.png'}
              alt="персонаж"
              style={{
                height:    '160px',
                width:     'auto',
                filter:    `drop-shadow(0 0 24px ${glowColor}90)`,
                animation: phase?.type === 'hold'
                  ? 'pulse-soft 2s ease-in-out infinite'
                  : 'breathe 4s ease-in-out infinite',
                transition: 'filter 0.8s ease',
              }}
            />
            {phase?.nostril === 'right' && (
              <img
                src="/images/ui/lung-right.png" alt="правая ноздря"
                style={{
                  position: 'absolute', right: '5%', height: '80px', opacity: 0.6,
                  filter: 'drop-shadow(0 0 12px #FBBF24)',
                  animation: 'pulse-soft 2s ease-in-out infinite',
                }}
              />
            )}
          </div>
        )}

        {/* Фаза и таймер */}
        {!roundPause && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <p style={{ color: '#475569', fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: '0.4rem' }}>
                СЕЙЧАС
              </p>

              <AnimatePresence mode="wait">
                <motion.p
                  key={phase?.labelRu}
                  initial={{ opacity: 0, y: 8  }}
                  animate={{ opacity: 1, y: 0  }}
                  exit={{    opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    fontFamily:   'Georgia, serif',
                    fontSize:     '1.8rem',
                    fontWeight:   700,
                    color:        glowColor,
                    marginBottom: '0.25rem',
                  }}
                >
                  {phase?.labelRu}
                </motion.p>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.p
                  key={remaining}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1   }}
                  exit={{    opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize:   '4rem',
                    fontWeight: 700,
                    color:      '#F1F5F9',
                    lineHeight: 1,
                  }}
                >
                  {remaining}
                </motion.p>
              </AnimatePresence>

              {/* ИСПРАВЛЕНО: #334155 → #64748B */}
              <p style={{ color: '#64748B', fontSize: '0.8rem' }}>секунд</p>
            </div>

            {/* Прогресс-бар */}
            <div style={styles.progressWrap}>
              <div style={{
                ...styles.progressBar,
                width:      `${phaseProgress * 100}%`,
                background: `linear-gradient(90deg, ${glowColor}66, ${glowColor})`,
              }} />
            </div>

            {/* Точки фаз */}
            <div style={styles.dots}>
              {phases.map((p, i) => {
                const isActive = i === session.currentPhaseIndex;
                const isDone   = i < session.currentPhaseIndex;
                const c = p.type === 'hold' ? '#A78BFA' : p.nostril === 'left' ? '#60A5FA' : '#FBBF24';
                return (
                  <div key={i} style={{
                    width:      isActive ? '14px' : '10px',
                    height:     isActive ? '14px' : '10px',
                    borderRadius: '50%',
                    background: isActive ? c : isDone ? `${c}44` : 'rgba(255,255,255,0.08)',
                    boxShadow:  isActive ? `0 0 12px 4px ${c}99` : 'none',
                    transition: 'all 0.4s ease',
                  }} />
                );
              })}
            </div>

            {/* Подписи фаз — ИСПРАВЛЕНО: #1E293B / #0F172A → читаемые */}
            <div style={styles.phaseHints}>
              {phases.map((p, i) => {
                const c = p.type === 'hold' ? '#A78BFA' : p.nostril === 'left' ? '#60A5FA' : '#FBBF24';
                const isActive = i === session.currentPhaseIndex;
                return (
                  <span key={i} style={{
                    fontSize:   '0.72rem',
                    color:      isActive ? c : '#475569',
                    transition: 'color 0.3s',
                  }}>
                    {p.labelRu} {p.duration}с
                    {i < phases.length - 1 && (
                      <span style={{ color: '#334155', margin: '0 4px' }}>·</span>
                    )}
                  </span>
                );
              })}
            </div>
          </>
        )}

        {/* Цитата локации — ИСПРАВЛЕНО: #1E293B/#0F172A → #94A3B8/#64748B */}
        <div style={styles.quoteBox}>
          <p style={styles.quoteText}>«{location.quote}»</p>
          <p style={styles.quoteSource}>— {location.quoteSource}</p>
        </div>

        {/* Управление */}
        <div style={styles.controls}>
          <button style={styles.controlBtn} onClick={handlePause}>
            {session.isPaused ? '▶ Продолжить' : '⏸ Пауза'}
          </button>
          <button style={{ ...styles.controlBtn, color: '#475569' }} onClick={handleStop}>
            ✕ Стоп
          </button>
        </div>

      </div>
    </main>
  );
}

/* ─── АУДИО ПАНЕЛЬ ──────────────────────────────────────── */
const btnSmall: React.CSSProperties = {
  background:   'rgba(255,255,255,0.06)',
  border:       '1px solid rgba(255,255,255,0.1)',
  color:        '#94A3B8',
  borderRadius: '0.5rem',
  padding:      '0.3rem 0.75rem',
  fontSize:     '0.78rem',
  cursor:       'pointer',
  flex:         1,
  textAlign:    'center',
};

function AudioPanel({ settings, updateMusic, open, setOpen, locationId, onPause, isPaused }: {
  settings:     any;
  updateMusic:  (data: any) => void;
  open:         boolean;
  setOpen:      (v: boolean | ((prev: boolean) => boolean)) => void;
  locationId:   number;
  onPause:      () => void;
  isPaused:     boolean;
}) {
  const { music }       = settings;
  const currentIndex    = BIRDS_TRACKS.findIndex((t: any) => t.id === music.selectedBirdsTrack);
  const currentTrack    = BIRDS_TRACKS[currentIndex];

  function prevTrack() {
    const i     = currentIndex <= 0 ? BIRDS_TRACKS.length - 1 : currentIndex - 1;
    const track = BIRDS_TRACKS[i];
    updateMusic({ selectedBirdsTrack: track.id });
    if (music.natureSoundsEnabled) playBirds(track.id, music.natureSoundsVolume / 100);
  }

  function nextTrack() {
    const i     = currentIndex >= BIRDS_TRACKS.length - 1 ? 0 : currentIndex + 1;
    const track = BIRDS_TRACKS[i];
    updateMusic({ selectedBirdsTrack: track.id });
    if (music.natureSoundsEnabled) playBirds(track.id, music.natureSoundsVolume / 100);
  }

  function toggleBirds() {
    if (music.natureSoundsEnabled) {
      stopBirds();
      updateMusic({ natureSoundsEnabled: false });
    } else {
      updateMusic({ natureSoundsEnabled: true });
      playBirds(music.selectedBirdsTrack, music.natureSoundsVolume / 100);
    }
  }

  function toggleLocationSound() {
    if (music.musicEnabled) {
      stopBgSound();
      updateMusic({ musicEnabled: false });
    } else {
      updateMusic({ musicEnabled: true });
      playBgSound(locationId, music.musicVolume / 100);
    }
  }

  function toggleAllSound() {
    const allOff = !music.musicEnabled && !music.natureSoundsEnabled;
    if (allOff) {
      updateMusic({ musicEnabled: true, natureSoundsEnabled: true });
      playBgSound(locationId, music.musicVolume / 100);
      playBirds(music.selectedBirdsTrack, music.natureSoundsVolume / 100);
    } else {
      stopBgSound(); stopBirds();
      updateMusic({ musicEnabled: false, natureSoundsEnabled: false });
    }
  }

  const allOff = !music.musicEnabled && !music.natureSoundsEnabled;

  return (
    <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 100 }}>

      {/* Кнопка открытия */}
      <button
        onClick={() => setOpen((o: boolean) => !o)}
        style={{
          background:    open ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.06)',
          border:        `1px solid ${open ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius:  '999px',
          padding:       '0.4rem 0.9rem',
          color:         open ? '#A78BFA' : '#64748B',
          cursor:        'pointer',
          fontSize:      '0.8rem',
          backdropFilter: 'blur(12px)',
          transition:    'all 0.2s',
        }}
      >
        🎵 {open ? '✕' : 'Звук'}
      </button>

      {/* Панель */}
      {open && (
        <div style={{
          marginTop:    '0.5rem',
          background:   'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(20px)',
          border:       '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.25rem',
          padding:      '1rem',
          width:        '260px',
          boxShadow:    '0 8px 32px rgba(0,0,0,0.5)',
        }}>

          {/* Пауза/Продолжить */}
          <button onClick={onPause} style={{
            width:        '100%',
            background:   isPaused ? 'rgba(52,211,153,0.12)' : 'rgba(167,139,250,0.1)',
            border:       `1px solid ${isPaused ? 'rgba(52,211,153,0.3)' : 'rgba(167,139,250,0.25)'}`,
            color:        isPaused ? '#34D399' : '#A78BFA',
            borderRadius: '0.75rem',
            padding:      '0.55rem',
            fontSize:     '0.85rem',
            cursor:       'pointer',
            marginBottom: '0.75rem',
            fontWeight:   600,
          }}>
            {isPaused ? '▶ Продолжить практику' : '⏸ Пауза практики'}
          </button>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.75rem' }} />

          {/* Природа */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: '#64748B', fontSize: '0.75rem' }}>🌿 ПРИРОДА</span>
              <button onClick={toggleBirds} style={{
                background:   music.natureSoundsEnabled ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
                border:       `1px solid ${music.natureSoundsEnabled ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color:        music.natureSoundsEnabled ? '#34D399' : '#64748B',
                borderRadius: '999px', padding: '0.2rem 0.6rem',
                fontSize:     '0.72rem', cursor: 'pointer',
              }}>
                {music.natureSoundsEnabled ? '● вкл' : '○ выкл'}
              </button>
            </div>

            <p style={{
              color:         music.natureSoundsEnabled ? '#94A3B8' : '#475569',
              fontSize:      '0.78rem',
              textAlign:     'center',
              marginBottom:  '0.5rem',
              overflow:      'hidden',
              textOverflow:  'ellipsis',
              whiteSpace:    'nowrap',
            }}>
              {currentTrack?.label ?? '—'}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={prevTrack} style={btnSmall}>◀ Пред</button>
              <button onClick={nextTrack} style={btnSmall}>След ▶</button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0.75rem 0' }} />

          {/* Локация */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: '#64748B', fontSize: '0.75rem' }}>🌆 Звук локации</span>
            <button onClick={toggleLocationSound} style={{
              background:   music.musicEnabled ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.05)',
              border:       `1px solid ${music.musicEnabled ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color:        music.musicEnabled ? '#60A5FA' : '#64748B',
              borderRadius: '999px', padding: '0.2rem 0.6rem',
              fontSize:     '0.72rem', cursor: 'pointer',
            }}>
              {music.musicEnabled ? '● вкл' : '○ выкл'}
            </button>
          </div>

          {/* Выключить всё */}
          <button onClick={toggleAllSound} style={{
            width:        '100%',
            background:   allOff ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
            border:       `1px solid ${allOff ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)'}`,
            color:        allOff ? '#F87171' : '#64748B',
            borderRadius: '0.75rem', padding: '0.5rem',
            fontSize:     '0.8rem', cursor: 'pointer', marginBottom: '0.75rem',
          }}>
            {allOff ? '🔊 Включить всё' : '🔇 Выключить всё'}
          </button>

          {/* Подсказка — ИСПРАВЛЕНО: #1E293B → #475569 */}
          <p style={{ color: '#475569', fontSize: '0.68rem', textAlign: 'center' }}>
            Подробные настройки → Главная → ⚙️
          </p>

        </div>
      )}
    </div>
  );
}

/* ─── ЭКРАН ЗАВЕРШЕНИЯ ──────────────────────────────────── */
function FinishScreen({ heroName, rounds, onRepeat, onHome, onMap, currentLocationId }: {
  heroName:          string;
  rounds:            number;
  onRepeat:          () => void;
  onHome:            () => void;
  onMap:             () => void;
  currentLocationId: number;
}) {
  const { setStartLocation } = usePracticeSettings();
  const { profile }          = useProfileStore();
  const nextLocation  = LOCATIONS.find(l => l.id === currentLocationId + 1);
  const nextUnlocked  = nextLocation && profile?.locationsUnlocked.includes(nextLocation.id);

  return (
    <main style={{
      minHeight:      '100dvh',
      background:     '#030712',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '2rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '360px' }}>

        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🕉️</div>

        <h1 style={{
          fontFamily:   'Georgia, serif',
          fontSize:     '2rem',
          color:        '#FBBF24',
          marginBottom: '1rem',
        }}>
          Путь завершён
        </h1>

        <p style={{ color: '#94A3B8', lineHeight: 1.8, marginBottom: '0.5rem' }}>
          {heroName} завершил {rounds} раундов дыхания.
        </p>

        {/* Следующая локация открыта */}
        {nextUnlocked && nextLocation && (
          <div style={{
            background:   'rgba(167,139,250,0.08)',
            border:       '1px solid rgba(167,139,250,0.2)',
            borderRadius: '1rem',
            padding:      '1rem',
            margin:       '1rem auto',
            maxWidth:     '280px',
          }}>
            <p style={{ color: '#A78BFA', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              ✦ Следующая локация открыта
            </p>
            <p style={{ color: '#F1F5F9', fontSize: '1rem', marginBottom: '0.75rem' }}>
              {nextLocation.emoji} {nextLocation.nameRu}
            </p>
            <button
              onClick={() => { setStartLocation(nextLocation.id); onRepeat(); }}
              style={{
                background:   'linear-gradient(135deg, #818CF8, #A78BFA)',
                color:        '#fff',
                fontWeight:   700,
                fontSize:     '0.9rem',
                padding:      '0.6rem 1.5rem',
                borderRadius: '999px',
                border:       'none',
                cursor:       'pointer',
              }}
            >
              → Перейти к {nextLocation.nameRu}
            </button>
          </div>
        )}

        <p style={{
          color:         '#64748B',
          fontStyle:     'italic',
          fontSize:      '0.95rem',
          lineHeight:    1.7,
          marginBottom:  '2rem',
        }}>
          «Пусть вдох соединяет тебя с жизнью,<br />а выдох — возвращает покой.»
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '260px', margin: '0 auto' }}>
          <button onClick={onRepeat} style={{
            background:   'linear-gradient(135deg, #F59E0B, #FBBF24)',
            color:        '#0a0a0a', fontWeight: 700,
            fontSize:     '1rem', padding: '0.85rem 2rem',
            borderRadius: '999px', border: 'none', cursor: 'pointer',
          }}>
            🔄 Повторить практику
          </button>
          <button onClick={onMap} style={{
            background:   'rgba(255,255,255,0.05)',
            color:        '#A78BFA', fontSize: '1rem',
            padding:      '0.85rem 2rem', borderRadius: '999px',
            border:       '1px solid rgba(167,139,250,0.2)', cursor: 'pointer',
          }}>
            🗺️ Карта пути
          </button>
          {/* ИСПРАВЛЕНО: #334155 → #64748B */}
          <button onClick={onHome} style={{
            background: 'none', color: '#64748B',
            fontSize: '0.9rem', padding: '0.5rem',
            border: 'none', cursor: 'pointer',
          }}>
            🏠 На главную
          </button>
        </div>

      </div>
    </main>
  );
}

/* ─── STYLES ────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight:      '100dvh',
    display:        'flex',
    flexDirection:  'column' as const,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        'clamp(1rem, 4vw, 1.5rem) 1rem',
    transition:     'background 1s ease',
    position:       'relative' as const,
    background:     '#030712',
  },

  header: {
    display:        'flex',
    justifyContent: 'space-between',
    width:          '100%',
    maxWidth:       '480px',
    marginBottom:   'clamp(0.75rem, 2vw, 1.5rem)',
    padding:        '0.6rem 1rem',
    background:     'rgba(255,255,255,0.03)',
    borderRadius:   '1rem',
    border:         '1px solid rgba(255,255,255,0.06)',
  } as React.CSSProperties,

  locationName: { color: '#94A3B8', fontSize: '0.9rem', marginBottom: '0.2rem' },
  roundInfo:    { color: '#64748B', fontSize: '0.78rem' },
  timer:        { color: '#FBBF24', fontFamily: 'Georgia, serif', fontSize: '1.1rem' },
  /* ИСПРАВЛЕНО: cycleInfo был #334155 */
  cycleInfo:    { color: '#475569', fontSize: '0.75rem' },

  characterWrap: {
    position:       'relative' as const,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   '1.5rem',
    height:         '140px',
    width:          '300px',
  },

  progressWrap: {
    width:        '100%',
    maxWidth:     '380px',
    height:       '4px',
    background:   'rgba(255,255,255,0.06)',
    borderRadius: '2px',
    marginBottom: '1.5rem',
    overflow:     'hidden',
  },

  progressBar: {
    height:       '100%',
    borderRadius: '2px',
    transition:   'width 0.95s linear',
  },

  dots: {
    display:        'flex',
    gap:            '0.75rem',
    justifyContent: 'center',
    alignItems:     'center',
    marginBottom:   '0.75rem',
  },

  phaseHints: {
    display:        'flex',
    flexWrap:       'wrap' as const,
    justifyContent: 'center',
    marginBottom:   '1.5rem',
    maxWidth:       '400px',
    gap:            '0.1rem',
  },

  quoteBox: {
    textAlign:    'center' as const,
    marginBottom: '1.5rem',
    maxWidth:     '360px',
    padding:      '0 1rem',
  },
  /* ИСПРАВЛЕНО: было #1E293B (невидимый) */
  quoteText:   { color: '#94A3B8', fontStyle: 'italic', fontSize: '0.82rem', lineHeight: 1.6 },
  /* ИСПРАВЛЕНО: было #0F172A (совсем чёрный) */
  quoteSource: { color: '#64748B', fontSize: '0.72rem', marginTop: '0.25rem' },

  controls: {
    display:        'flex',
    gap:            '1rem',
    justifyContent: 'center',
  },

  controlBtn: {
    background:   'rgba(255,255,255,0.05)',
    border:       '1px solid rgba(255,255,255,0.08)',
    color:        '#64748B',
    fontSize:     '0.9rem',
    padding:      '0.6rem 1.5rem',
    borderRadius: '999px',
    cursor:       'pointer',
  } as React.CSSProperties,

  roundPauseBox: {
    textAlign:    'center' as const,
    padding:      '2rem',
    background:   'rgba(167,139,250,0.06)',
    border:       '1px solid rgba(167,139,250,0.15)',
    borderRadius: '1.5rem',
    maxWidth:     '380px',
    marginBottom: '1.5rem',
  },

  skipBtn: {
    background: 'none',
    border:     'none',
    color:      '#64748B',
    cursor:     'pointer',
    fontSize:   '0.85rem',
  } as React.CSSProperties,
};
