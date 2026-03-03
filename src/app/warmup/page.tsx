'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter }                   from 'next/navigation';
import { motion, AnimatePresence }     from 'framer-motion';
import PageTransition                  from '@/components/PageTransition';
import AudioPanel                      from '@/components/AudioPanel';
import { usePracticeSettings }         from '@/store';

type Technique = 'kapalabhati' | 'bhastrika';

const TECHNIQUES = {
  kapalabhati: {
    name:      'Капалабхати',
    emoji:     '💨',
    sanskrit:  'Kapalabhati Pranayama',
    tagline:   'Очищение. Пробуждение энергии.',
    color:     '#60A5FA',
    glow:      'rgba(96,165,250,0.5)',
    inhale: 2,
    exhale:    0.5,  // секунд — резкий выдох
    desc:      'Ритмичные резкие выдохи через нос. Вдох пассивный, выдох — резкое сокращение живота.',
    details: [
      '🧘 Сядь удобно, спина прямая. Руки на коленях. Язык плотно прижат к верхнему нёбу.',
      '💨 Делай резкие короткие выдохи через нос — живот резко втягивается.',
      '🌬️ Вдох происходит сам — пассивно, без усилий.',
      '⚡ Ритм: примерно 1 выдох в секунду. Начни с 30 выдохов.',
      '⚠️ Не практикуй при беременности, высоком давлении и на полный желудок.',
      '✨ Эффект: очищает лёгкие, активирует нервную систему, пробуждает энергию.',
    ],
    breathLabel: { in: 'Вдох (пассивно)', out: 'Выдох (резко!)' },
  },
  bhastrika: {
    name:      'Бхастрика',
    emoji:     '🔥',
    sanskrit:  'Bhastrika Pranayama',
    tagline:   'Огонь. Сила. Жизненная энергия.',
    color:     '#F59E0B',
    glow:      'rgba(251,191,36,0.5)',
    inhale:    1.5,
    exhale:    1.5,
    desc:      'Мощные глубокие вдохи и выдохи через нос. Как кузнечные меха — полное раскрытие лёгких.',
    details: [
      '🧘 Сядь прямо. Расслабь плечи. Язык плотно прижат к верхнему нёбу.',
      '🔥 Делай глубокий вдох через нос — грудь и живот полностью расширяются.',
      '💪 Мощный выдох через нос — живот резко уходит внутрь.',
      '⚡ Ритм: примерно 1 цикл за 3 секунды. Начни с 10 циклов.',
      '⚠️ Не практикуй при сердечных заболеваниях и головокружении.',
      '✨ Эффект: разжигает внутренний огонь, заряжает энергией, готовит к пранаяме.',
    ],
    breathLabel: { in: 'Вдох (мощно)', out: 'Выдох (мощно)' },
  }, 
  
};

type Phase = 'idle' | 'inhale' | 'exhale';

export default function WarmupPage() {
  const router = useRouter();
  const { startLocationId } = usePracticeSettings();

  const [tech,       setTech]       = useState<Technique>('kapalabhati');
  const [phase,      setPhase]      = useState<Phase>('idle');
  const [cycles,     setCycles]     = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [inhaleSpeed, setInhaleSpeed] = useState(2); // секунд на вдох: 1-4
  const [hasStarted, setHasStarted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const t = {
  ...TECHNIQUES[tech],
  ...(tech === 'kapalabhati' ? { inhale: inhaleSpeed } : {}),
};

  // Сброс при смене техники
  useEffect(() => {
    stopBreathing();
    setCycles(0);
    setPhase('idle');
    setHasStarted(false);
    setShowDetail(false);
  }, [tech]);

  function startBreathing() {
    setHasStarted(true);
    runCycle();
  }

  function runCycle() {
    setPhase('inhale');
    timerRef.current = setTimeout(() => {
      setPhase('exhale');
      timerRef.current = setTimeout(() => {
        setCycles(c => c + 1);
        runCycle(); // следующий цикл
      }, t.exhale * 1000);
    }, t.inhale * 1000);
  }

  function stopBreathing() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setPhase('idle');
  }

  function toggleBreathing() {
    if (phase !== 'idle') {
      stopBreathing();
    } else {
      startBreathing();
    }
  }

  // Очистка при уходе
  useEffect(() => () => stopBreathing(), []);

  const isRunning = phase !== 'idle';

  return (
    <PageTransition>
      <main style={styles.page}>
        <div style={styles.container}>

          {/* Шапка */}
          <div style={styles.header}>
            <button onClick={() => { stopBreathing(); router.back(); }} style={styles.backBtn}>
              ← Назад
            </button>
            <div style={{ textAlign: 'center' }}>
              <p style={styles.eyebrow}>РАЗМИНКА</p>
              <p style={{ color: '#475569', fontSize: '0.78rem' }}>Подготовь дыхательную систему</p>
            </div>
            <div style={{ width: '60px' }} />
          </div>

          {/* Карточки выбора техники */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {(Object.keys(TECHNIQUES) as Technique[]).map(key => {
              const tc      = TECHNIQUES[key];
              const active  = tech === key;
              return (
                <div
                  key={key}
                  onClick={() => setTech(key)}
                  style={{
                    flex:         1,
                    background:   active ? `rgba(${key === 'kapalabhati' ? '96,165,250' : '251,191,36'},0.1)` : 'rgba(255,255,255,0.03)',
                    border:       `1px solid ${active ? tc.color : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '1.25rem',
                    padding:      '0.85rem 0.75rem',
                    cursor:       'pointer',
                    transition:   'all 0.25s',
                    textAlign:    'center' as const,
                    boxShadow:    active ? `0 0 20px ${tc.glow}` : 'none',
                  }}
                >
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>{tc.emoji}</div>
                  <p style={{ color: active ? tc.color : '#64748B', fontSize: '0.82rem', fontWeight: active ? 700 : 400, fontFamily: 'Georgia, serif' }}>
                    {tc.name}
                  </p>
                  <p style={{ color: '#475569', fontSize: '0.65rem', marginTop: '0.2rem' }}>{tc.tagline}</p>
                </div>
              );
            })}
          </div>

          {/* Описание техники */}
          <div style={{
            background:   'rgba(255,255,255,0.03)',
            border:       `1px solid rgba(255,255,255,0.07)`,
            borderRadius: '1.25rem',
            padding:      '1rem 1.25rem',
            marginBottom: '1rem',
          }}>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              {t.desc}
            </p>
{/* Скорость вдоха — только для Капалабхати */}
            {tech === 'kapalabhati' && (
              <div style={{
                background:   'rgba(96,165,250,0.06)',
                border:       '1px solid rgba(96,165,250,0.15)',
                borderRadius: '0.85rem',
                padding:      '0.75rem 1rem',
                marginBottom: '0.75rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                    🌬️ Длительность вдоха
                  </span>
                  <span style={{ color: '#60A5FA', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Georgia, serif' }}>
                    {inhaleSpeed} сек
                  </span>
                </div>
                <input
                  type="range" min={1} max={4} step={1}
                  value={inhaleSpeed}
                  onChange={e => {
                    stopBreathing();
                    setInhaleSpeed(Number(e.target.value));
                  }}
                  style={{ width: '100%', accentColor: '#60A5FA' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                  {[1, 2, 3, 4].map(v => (
                    <span key={v} style={{
                      fontSize: '0.65rem',
                      color:    inhaleSpeed === v ? '#60A5FA' : '#334155',
                      fontWeight: inhaleSpeed === v ? 700 : 400,
                    }}>
                      {v === 1 ? '⚡ Быстро' : v === 2 ? 'Умеренно' : v === 3 ? 'Медленно' : '🧘 Глубоко'}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Кнопка подробнее */}
            <button
              onClick={() => setShowDetail(d => !d)}
              style={{
                background:   'none',
                border:       `1px solid rgba(255,255,255,0.08)`,
                color:        '#64748B',
                fontSize:     '0.78rem',
                padding:      '0.4rem 0.85rem',
                borderRadius: '999px',
                cursor:       'pointer',
                transition:   'all 0.2s',
              }}
            >
              {showDetail ? '▲ Скрыть' : '▼ Подробнее — как выполнять'}
            </button>

            {/* Детали */}
            <AnimatePresence>
              {showDetail && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{    opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {t.details.map((line, i) => (
                      <p key={i} style={{ color: '#94A3B8', fontSize: '0.82rem', lineHeight: 1.65 }}>
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Анимация дыхания */}
          <div style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        '1.5rem 0',
            position:       'relative',
          }}>
            {/* Пульсирующий круг */}
            <motion.div
              animate={{
                scale:     isRunning ? (phase === 'inhale' ? 1.25 : 0.85) : 1,
                boxShadow: isRunning
                  ? phase === 'inhale'
                    ? `0 0 50px 15px ${t.glow}`
                    : `0 0 20px 5px ${t.glow}`
                  : '0 0 20px 8px rgba(100,116,139,0.3)',
              }}
              transition={{
                duration: isRunning
                  ? phase === 'inhale' ? t.inhale : t.exhale
                  : 0.5,
                ease: 'easeInOut',
              }}
              style={{
                width:        '140px',
                height:       '140px',
                borderRadius: '50%',
                background:   isRunning
                  ? `radial-gradient(circle, ${t.color}33 0%, ${t.color}11 70%)`
                  : 'radial-gradient(circle, rgba(100,116,139,0.15) 0%, transparent 70%)',
                border:       `2px solid ${isRunning ? t.color : 'rgba(100,116,139,0.3)'}`,
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem' }}>{t.emoji}</div>
                {isRunning && (
                  <p style={{ color: t.color, fontSize: '0.72rem', marginTop: '0.25rem', fontWeight: 600 }}>
                    {phase === 'inhale' ? t.breathLabel.in : t.breathLabel.out}
                  </p>
                )}
                {!isRunning && (
                  <p style={{ color: '#475569', fontSize: '0.68rem', marginTop: '0.25rem' }}>нажми старт</p>
                )}
              </div>
            </motion.div>

            {/* Счётчик циклов */}
            {hasStarted && (
              <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                <p style={{ color: t.color, fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                  {cycles}
                </p>
                <p style={{ color: '#475569', fontSize: '0.72rem' }}>
                  {tech === 'kapalabhati' ? 'выдохов' : 'циклов'}
                </p>
              </div>
            )}

            {/* Кнопка старт/стоп */}
            <button
              onClick={toggleBreathing}
              style={{
                background:   isRunning
                  ? 'rgba(255,255,255,0.06)'
                  : `linear-gradient(135deg, ${tech === 'kapalabhati' ? '#3B82F6, #60A5FA' : '#F59E0B, #FBBF24'})`,
                color:        isRunning ? '#94A3B8' : '#0a0a0a',
                fontWeight:   700,
                fontSize:     '1rem',
                padding:      '0.85rem 2.5rem',
                borderRadius: '999px',
                border:       isRunning ? '1px solid rgba(255,255,255,0.1)' : 'none',
                cursor:       'pointer',
                minWidth:     '160px',
                boxShadow:    isRunning ? 'none' : `0 0 20px ${t.glow}`,
                transition:   'all 0.25s',
              }}
            >
              {isRunning ? '⏹ Стоп' : `▶ Старт ${t.name}`}
            </button>
          </div>

          {/* Аудио панель */}
          <AudioPanel locationId={startLocationId} />

          {/* Кнопки навигации */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem' }}>

            {/* Перейти к практике — активна всегда но выглядит иначе до старта */}
            <button
              onClick={() => { stopBreathing(); router.push('/practice'); }}
              style={{
                background:   hasStarted
                  ? 'linear-gradient(135deg, #F59E0B, #FBBF24)'
                  : 'rgba(255,255,255,0.06)',
                color:        hasStarted ? '#0a0a0a' : '#64748B',
                fontWeight:   700,
                fontSize:     '1rem',
                padding:      '0.9rem 2rem',
                borderRadius: '999px',
                border:       hasStarted ? 'none' : '1px solid rgba(255,255,255,0.08)',
                cursor:       'pointer',
                transition:   'all 0.3s',
                boxShadow:    hasStarted ? '0 0 25px rgba(251,191,36,0.35)' : 'none',
              }}
            >
              {hasStarted ? '🌬️ Перейти к практике →' : '🌬️ Перейти к практике'}
            </button>

            {/* БОЛЬШАЯ кнопка пропустить */}
            <button
              onClick={() => { stopBreathing(); router.push('/practice'); }}
              style={{
                background:   'transparent',
                border:       '1px solid rgba(255,255,255,0.06)',
                color:        '#475569',
                fontSize:     '0.9rem',
                padding:      '0.85rem 2rem',
                borderRadius: '999px',
                cursor:       'pointer',
                transition:   'color 0.2s',
              }}
            >
              Пропустить разминку →
            </button>
          </div>

        </div>
      </main>
    </PageTransition>
  );
}

const styles = {
  page: {
    minHeight:  '100dvh',
    background: 'radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.07) 0%, transparent 60%), #030712',
    padding:    '0 1rem 2rem',
  } as React.CSSProperties,

  container: {
    maxWidth:      '480px',
    margin:        '0 auto',
    display:       'flex',
    flexDirection: 'column' as const,
    minHeight:     '100dvh',
  },

  header: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingTop:     '1.5rem',
    marginBottom:   '1.5rem',
  },

  backBtn: {
    background: 'none', border: 'none',
    color: '#64748B', cursor: 'pointer',
    fontSize: '0.9rem', padding: '0.5rem 0',
    minWidth: '60px',
  } as React.CSSProperties,

  eyebrow: {
    color:         '#A78BFA',
    fontSize:      '0.75rem',
    letterSpacing: '0.2em',
    fontWeight:    600,
  },
};