/* ═══════════════════════════════════════════════════════════
   Anuloma Quest — src/app/setup/page.tsx
   Исправлено: JSX структура, цвета цитаты (#334155/#1E293B
   → читаемые), 100dvh, стили вынесены читаемо.
═══════════════════════════════════════════════════════════ */

'use client';

import { useState }                                           from 'react';
import { useRouter }                                          from 'next/navigation';
import { usePracticeSettings, useProfileStore }               from '@/store';
import { BREATHING_CYCLES, LOCATIONS, formatDuration, calcTotalSeconds } from '@/constants';
import PageTransition                                         from '@/components/PageTransition';

export default function SetupPage() {
  const router = useRouter();
  const {
    rounds, cycle, cycleIndex, startLocationId,
    setRounds, setCycleIndex, setStartLocation,
  } = usePracticeSettings();
  const { profile }  = useProfileStore();
  const total        = calcTotalSeconds(cycle, rounds);
  const [hovered, setHovered] = useState(false);

  return (
    <PageTransition>
      <main style={styles.page}>
        <div style={styles.container}>

          {/* ШАПКА */}
          <button onClick={() => router.back()} style={styles.backBtn}>← Назад</button>
          <p style={styles.eyebrow}>НАСТРОЙКА ПРАКТИКИ</p>
          <h1 style={styles.title}>Выбери свой путь</h1>
          <p style={styles.sub}>Каждое дыхание — шаг. Каждый раунд — квест.</p>

          {/* РАУНДЫ */}
          <div style={styles.card}>
            <p style={styles.cardLabel}>Количество раундов</p>
            <div style={styles.selectorRow}>
              <button
                style={styles.arrow}
                onClick={() => setRounds(Math.max(1, rounds - 1))}
              >◀</button>
              <div style={styles.selectorValue}>
                <span style={styles.bigNumber}>{rounds}</span>
              </div>
              <button
                style={styles.arrow}
                onClick={() => setRounds(Math.min(100, rounds + 1))}
              >▶</button>
            </div>
            <p style={styles.hint}>
              Один раунд = 6 полных циклов дыхания обеими ноздрями
            </p>
          </div>

          {/* ЦИКЛ ДЫХАНИЯ */}
          <div style={styles.card}>
            <p style={styles.cardLabel}>Цикл дыхания (вдох – задержка – выдох)</p>
            <div style={styles.selectorRow}>
              <button
                style={styles.arrow}
                onClick={() => setCycleIndex(Math.max(0, cycleIndex - 1))}
              >◀</button>
              <div style={styles.selectorValue}>
                <span style={styles.bigNumber}>{cycle.label}</span>
              </div>
              <button
                style={styles.arrow}
                onClick={() => setCycleIndex(Math.min(BREATHING_CYCLES.length - 1, cycleIndex + 1))}
              >▶</button>
            </div>
            <p style={styles.hint}>
              {cycle.inhale} сек вдох · {cycle.hold} сек задержка · {cycle.exhale} сек выдох
            </p>
            <div style={styles.preview}>
              <PhaseBar
                label="Вдох"     seconds={cycle.inhale} color="#60A5FA"
                total={cycle.inhale + cycle.hold + cycle.exhale}
              />
              <PhaseBar
                label="Задержка" seconds={cycle.hold}   color="#A78BFA"
                total={cycle.inhale + cycle.hold + cycle.exhale}
              />
              <PhaseBar
                label="Выдох"    seconds={cycle.exhale} color="#FBBF24"
                total={cycle.inhale + cycle.hold + cycle.exhale}
              />
            </div>
          </div>

          {/* ВЫБОР ЛОКАЦИИ */}
          {profile && profile.locationsUnlocked.length > 1 && (
            <div style={styles.card}>
              <p style={styles.cardLabel}>НАЧАТЬ С ЛОКАЦИИ</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {LOCATIONS.filter(loc => profile.locationsUnlocked.includes(loc.id)).map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => setStartLocation(loc.id)}
                    style={{
                      background:   startLocationId === loc.id
                        ? 'rgba(167,139,250,0.2)'
                        : 'rgba(255,255,255,0.04)',
                      border:       `1px solid ${startLocationId === loc.id
                        ? 'rgba(167,139,250,0.5)'
                        : 'rgba(255,255,255,0.08)'}`,
                      color:        startLocationId === loc.id ? '#C4B5FD' : '#64748B',
                      borderRadius: '0.75rem',
                      padding:      '0.5rem 0.75rem',
                      fontSize:     '0.82rem',
                      cursor:       'pointer',
                      transition:   'all 0.2s',
                    }}
                  >
                    {loc.emoji} {loc.nameRu}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ОБЩЕЕ ВРЕМЯ */}
          <div style={styles.timeBox}>
            <span style={{ fontSize: '1.5rem' }}>⏳</span>
            <div>
              <p style={{ color: '#64748B', fontSize: '0.8rem', marginBottom: '0.15rem' }}>
                Общее время сессии
              </p>
              <p style={{
                color:      '#FBBF24',
                fontSize:   '1.4rem',
                fontFamily: 'Georgia, serif',
                fontWeight: 700,
              }}>
                {formatDuration(total)}
              </p>
            </div>
          </div>

          {/* ПРЕДУПРЕЖДЕНИЕ */}
          {cycle.hold > 30 && (
            <div style={styles.warning}>
              ⚠️ Длинная задержка — практикуй осознанно и не превозмогай себя
            </div>
          )}

          {/* КНОПКА СТАРТ */}
          <button
            style={{
              ...styles.btnStart,
              transform:  hovered ? 'scale(1.03)' : 'scale(1)',
              boxShadow:  hovered
                ? '0 0 40px 12px rgba(251,191,36,0.45)'
                : '0 0 20px 4px rgba(251,191,36,0.25)',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => router.push('/practice')}
          >
            🌬️ Начать практику
          </button>

          {/* ЦИТАТА */}
          <div style={styles.quoteBox}>
            <p style={styles.quoteText}>
              «Пранаяма — это не контроль дыхания.<br />
              Это контроль жизненной силы.»
            </p>
            <p style={styles.quoteSource}>— Йога-сутры Патанджали 2.49</p>
          </div>

        </div>
      </main>
    </PageTransition>
  );
}

/* ─── ПОЛОСА ФАЗЫ ДЫХАНИЯ ───────────────────────────────── */
function PhaseBar({ label, seconds, color, total }: {
  label:   string;
  seconds: number;
  color:   string;
  total:   number;
}) {
  const pct = Math.round((seconds / total) * 100);
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{
        height:       '6px',
        borderRadius: '3px',
        background:   `${color}33`,
        marginBottom: '6px',
        position:     'relative',
        overflow:     'hidden',
      }}>
        <div style={{
          position:     'absolute',
          left: 0, top: 0, bottom: 0,
          width:        `${pct}%`,
          background:   color,
          borderRadius: '3px',
        }} />
      </div>
      <p style={{ color,      fontSize: '0.7rem',  marginBottom: '2px' }}>{label}</p>
      <p style={{ color: '#64748B', fontSize: '0.75rem' }}>{seconds}с</p>
    </div>
  );
}

/* ─── STYLES ────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight:      '100dvh',
    background:     `
      radial-gradient(ellipse at 30% 40%, rgba(96,165,250,0.06)  0%, transparent 50%),
      radial-gradient(ellipse at 70% 60%, rgba(167,139,250,0.05) 0%, transparent 50%),
      #030712
    `,
    display:        'flex',
    alignItems:     'flex-start',
    justifyContent: 'center',
    padding:        'clamp(1.5rem, 4vw, 2rem) 1rem 3rem',
  } as React.CSSProperties,

  container: {
    width:     '100%',
    maxWidth:  '480px',
    textAlign: 'center' as const,
  },

  backBtn: {
    background:   'none',
    border:       'none',
    color:        '#64748B',
    cursor:       'pointer',
    fontSize:     '0.9rem',
    marginBottom: '1.5rem',
    display:      'block',
    padding:      '0.5rem 0',
  } as React.CSSProperties,

  eyebrow: {
    color:         '#475569',
    letterSpacing: '0.2em',
    fontSize:      '0.75rem',
    marginBottom:  '0.5rem',
  },

  title: {
    fontFamily:           'Georgia, serif',
    fontSize:             'clamp(1.8rem, 4vw, 2.5rem)',
    background:           'linear-gradient(135deg, #818CF8, #A78BFA)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor:  'transparent',
    backgroundClip:       'text',
    marginBottom:         '0.5rem',
  } as React.CSSProperties,

  sub: {
    color:         '#64748B',
    fontSize:      '0.95rem',
    marginBottom:  '2rem',
  },

  card: {
    background:    'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    border:        '1px solid rgba(255,255,255,0.07)',
    borderRadius:  '1.25rem',
    padding:       '1.5rem',
    marginBottom:  '1rem',
  } as React.CSSProperties,

  cardLabel: {
    color:         '#64748B',
    fontSize:      '0.8rem',
    letterSpacing: '0.1em',
    marginBottom:  '1rem',
  },

  selectorRow: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '1.5rem',
    marginBottom:   '0.75rem',
  },

  arrow: {
    background:   'rgba(255,255,255,0.06)',
    border:       '1px solid rgba(255,255,255,0.1)',
    color:        '#94A3B8',
    fontSize:     '1rem',
    width:        '40px',
    height:       '40px',
    borderRadius: '50%',
    cursor:       'pointer',
    transition:   'background 0.2s',
  } as React.CSSProperties,

  selectorValue: {
    minWidth:  '120px',
    textAlign: 'center' as const,
  },

  bigNumber: {
    fontFamily: 'Georgia, serif',
    fontSize:   '2rem',
    color:      '#F1F5F9',
    fontWeight: 700,
  },

  hint: {
    color:    '#64748B',
    fontSize: '0.8rem',
  },

  preview: {
    display:    'flex',
    gap:        '0.75rem',
    marginTop:  '1.25rem',
    alignItems: 'flex-end',
  },

  timeBox: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '1rem',
    background:     'rgba(251,191,36,0.06)',
    border:         '1px solid rgba(251,191,36,0.15)',
    borderRadius:   '1rem',
    padding:        '1rem 1.5rem',
    marginBottom:   '1.25rem',
  } as React.CSSProperties,

  warning: {
    color:         '#F59E0B',
    fontSize:      '0.8rem',
    background:    'rgba(245,158,11,0.08)',
    border:        '1px solid rgba(245,158,11,0.2)',
    borderRadius:  '0.75rem',
    padding:       '0.75rem 1rem',
    marginBottom:  '1rem',
  },

  btnStart: {
    background:   'linear-gradient(135deg, #F59E0B, #FBBF24)',
    color:        '#0a0a0a',
    fontWeight:   700,
    fontSize:     '1.1rem',
    padding:      '1rem 3rem',
    borderRadius: '999px',
    border:       'none',
    cursor:       'pointer',
    width:        '100%',
    transition:   'transform 0.25s ease, box-shadow 0.25s ease',
    marginBottom: '1.5rem',
  } as React.CSSProperties,

  quoteBox: {
    borderTop:  '1px solid rgba(255,255,255,0.06)',
    paddingTop: '1.5rem',
    marginTop:  '0.5rem',
  },

  /* ↓ БЫЛО: #334155 — почти чёрное на тёмном фоне. СТАЛО: #94A3B8 */
  quoteText: {
    color:         '#94A3B8',
    fontStyle:     'italic',
    fontSize:      '0.85rem',
    lineHeight:    1.7,
    marginBottom:  '0.4rem',
  },

  /* ↓ БЫЛО: #1E293B — совсем чёрное. СТАЛО: #64748B */
  quoteSource: {
    color:    '#64748B',
    fontSize: '0.75rem',
  },
};
