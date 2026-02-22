'use client';

import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/store';
import { LOCATIONS } from '@/constants';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';



export default function MapPage() {
  const router = useRouter();
  const { profile } = useProfileStore();

  if (!profile) {
    router.push('/');
    return null;
  }

  const totalRounds = profile.totalRoundsCompleted;
  const totalMinutes = Math.floor(profile.totalTimeSeconds / 60);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
         (
  <PageTransition>
    <main style={styles.page}>
      
    </main>
  </PageTransition>
)

        {/* ШАПКА */}
        <button onClick={() => router.push('/')} style={styles.backBtn}>← Назад</button>

        <p style={styles.eyebrow}>ПУТЬ ДЫХАНИЯ</p>
        <h1 style={styles.title}>Карта локаций</h1>
        <p style={styles.sub}>
          {profile.heroName} · {totalRounds} раундов · {totalMinutes} минут практики
        </p>

        {/* СТАТИСТИКА */}
        <div style={styles.statsRow}>
          <StatBox emoji="🌬️" value={totalRounds} label="Раундов" color="#60A5FA" />
          <StatBox emoji="⏱️" value={totalMinutes + 'м'} label="Времени" color="#A78BFA" />
          <StatBox emoji="🔥" value={profile.totalBreathCycles ?? totalRounds * 6} label="Циклов" color="#FBBF24" />
        </div>

        {/* ЛОКАЦИИ */}
        <div style={styles.locationsGrid}>
          {LOCATIONS.map((loc, i) => {
            const isUnlocked = profile.locationsUnlocked.includes(loc.id);
            const isCurrent  = loc.id === Math.min(10, totalRounds + 1);
            const isCompleted = totalRounds >= loc.id;

            return (
              <LocationCard
                key={loc.id}
                loc={loc}
                index={i}
                isUnlocked={isUnlocked}
                isCurrent={isCurrent}
                isCompleted={isCompleted}
              />
            );
          })}
        </div>

        {/* ДОСТИЖЕНИЯ */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>✦ Достижения</p>
          <div style={styles.achievementsRow}>
            <AchievementBadge emoji="🌱" label="Первый вдох"     unlocked={totalRounds >= 1}   />
            <AchievementBadge emoji="🌿" label="Ученик дыхания"  unlocked={totalRounds >= 10}  />
            <AchievementBadge emoji="🪷" label="Адепт потока"    unlocked={totalRounds >= 50}  />
            <AchievementBadge emoji="🕉️" label="Мастер тишины"  unlocked={totalRounds >= 100} />
            <AchievementBadge emoji="🏔️" label="Полный путь"    unlocked={totalRounds >= 10}  />
          </div>
        </div>

        {/* КНОПКА ПРАКТИКИ */}
        <button style={styles.btnStart} onClick={() => router.push('/setup')}>
          🌬️ Продолжить практику
        </button>

      </div>
    </main>
  );
}

// ─── КАРТОЧКА ЛОКАЦИИ ─────────────────────────────────
function LocationCard({ loc, index, isUnlocked, isCurrent, isCompleted }: {
  loc: typeof LOCATIONS[0];
  index: number;
  isUnlocked: boolean;
  isCurrent: boolean;
  isCompleted: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.04, transition: { duration: 0.15 } }}
      style={{
        ...styles.locCard,
        opacity: isUnlocked ? 1 : 0.35,
        border: isCurrent
          ? '1px solid rgba(167,139,250,0.5)'
          : isCompleted
          ? '1px solid rgba(251,191,36,0.25)'
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isCurrent ? '0 0 20px 4px rgba(167,139,250,0.2)' : 'none',
        background: isCompleted
          ? 'rgba(251,191,36,0.05)'
          : isCurrent
          ? 'rgba(167,139,250,0.07)'
          : 'rgba(255,255,255,0.03)',
      }}
    >
      {/* Номер и статус */}
      <div style={styles.locHeader}>
        <span style={{ color: '#334155', fontSize: '0.75rem' }}>#{loc.id}</span>
        {isCompleted && <span style={{ color: '#FBBF24', fontSize: '0.7rem' }}>✦ Пройдено</span>}
        {isCurrent && !isCompleted && <span style={{ color: '#A78BFA', fontSize: '0.7rem' }}>● Текущая</span>}
        {!isUnlocked && <span style={{ color: '#1E293B', fontSize: '0.7rem' }}>🔒</span>}
      </div>

      {/* Эмодзи и название */}
      <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>{loc.emoji}</div>
      <p style={{
        fontFamily: 'Georgia, serif',
        fontSize: '0.9rem',
        color: isCompleted ? '#FBBF24' : isCurrent ? '#A78BFA' : '#64748B',
        marginBottom: '0.3rem',
        fontWeight: 600,
      }}>
        {loc.nameRu}
      </p>
      <p style={{ color: '#334155', fontSize: '0.72rem', lineHeight: 1.4 }}>
        {loc.symbolRu}
      </p>

      {/* Цитата — только для пройденных */}
      {isCompleted && (
        <p style={{
          color: '#1E293B',
          fontSize: '0.68rem',
          fontStyle: 'italic',
          marginTop: '0.5rem',
          lineHeight: 1.4,
          borderTop: '1px solid rgba(255,255,255,0.04)',
          paddingTop: '0.5rem',
        }}>
          «{loc.quote}»
        </p>
      )}
    </motion.div>
  );
}

// ─── СТАТИСТИКА ───────────────────────────────────────
function StatBox({ emoji, value, label, color }: {
  emoji: string; value: string | number; label: string; color: string;
}) {
  return (
    <div style={styles.statBox}>
      <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color, fontWeight: 700 }}>
        {value}
      </p>
      <p style={{ color: '#334155', fontSize: '0.75rem' }}>{label}</p>
    </div>
  );
}

// ─── ДОСТИЖЕНИЕ ───────────────────────────────────────
function AchievementBadge({ emoji, label, unlocked }: {
  emoji: string; label: string; unlocked: boolean;
}) {
  return (
    <div style={{
      ...styles.badge,
      opacity: unlocked ? 1 : 0.25,
      border: unlocked ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.05)',
      boxShadow: unlocked ? '0 0 12px 2px rgba(251,191,36,0.15)' : 'none',
    }}>
      <span style={{ fontSize: '1.8rem' }}>{emoji}</span>
      <p style={{ color: unlocked ? '#FBBF24' : '#1E293B', fontSize: '0.68rem', marginTop: '0.3rem', lineHeight: 1.3 }}>
        {label}
      </p>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 20% 20%, rgba(167,139,250,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(251,191,36,0.04) 0%, transparent 50%), #030712',
    padding: '2rem 1rem',
  } as React.CSSProperties,

  container: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center' as const,
  },

  backBtn: {
    background: 'none', border: 'none', color: '#475569',
    cursor: 'pointer', fontSize: '0.9rem',
    marginBottom: '1.5rem', display: 'block',
  } as React.CSSProperties,

  eyebrow: {
    color: '#334155', letterSpacing: '0.2em',
    fontSize: '0.75rem', marginBottom: '0.4rem',
  },

  title: {
    fontFamily: 'Georgia, serif',
    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
    background: 'linear-gradient(135deg, #FBBF24, #FCD34D)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '0.5rem',
  } as React.CSSProperties,

  sub: { color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem' },

  statsRow: {
    display: 'flex', gap: '0.75rem',
    justifyContent: 'center', marginBottom: '2rem',
    flexWrap: 'wrap' as const,
  },

  statBox: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '1rem', padding: '1rem 1.5rem',
    textAlign: 'center' as const, minWidth: '100px',
  },

  locationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '0.75rem',
    marginBottom: '2rem',
    textAlign: 'left' as const,
  },

  locCard: {
    borderRadius: '1rem',
    padding: '1rem',
    transition: 'all 0.3s ease',
    cursor: 'default',
  } as React.CSSProperties,

  locHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '0.5rem',
  },

  section: { marginBottom: '2rem' },

  sectionTitle: {
    fontFamily: 'Georgia, serif',
    color: '#475569', fontSize: '0.85rem',
    letterSpacing: '0.1em', marginBottom: '1rem',
  },

  achievementsRow: {
    display: 'flex', gap: '0.75rem',
    justifyContent: 'center', flexWrap: 'wrap' as const,
  },

  badge: {
    borderRadius: '1rem', padding: '0.75rem 0.5rem',
    textAlign: 'center' as const, minWidth: '80px',
    background: 'rgba(255,255,255,0.03)',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,

  btnStart: {
    background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
    color: '#0a0a0a', fontWeight: 700,
    fontSize: '1rem', padding: '0.85rem 2.5rem',
    borderRadius: '999px', border: 'none',
    cursor: 'pointer', width: '100%',
    marginBottom: '2rem',
    boxShadow: '0 0 20px 4px rgba(251,191,36,0.2)',
  } as React.CSSProperties,
};