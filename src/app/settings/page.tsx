'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore, useSettingsStore } from '@/store';
import { BIRDS_TRACKS, playBirds, stopBirds } from '@/lib/audio';
import PageTransition from '@/components/PageTransition';




type Tab = 'sound' | 'visual' | 'profile';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('sound');
  const { profile, reset } = useProfileStore();

  if (!profile) { router.push('/'); return null; }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        // в return:
return (
  <PageTransition>
    <main style={styles.page}>
      ...
    </main>
  </PageTransition>
);

        {/* ШАПКА */}
        <button onClick={() => router.push('/')} style={styles.backBtn}>← Назад</button>
        <p style={styles.eyebrow}>ПЕРСОНАЛИЗАЦИЯ</p>
        <h1 style={styles.title}>Настройки</h1>
        <p style={styles.sub}>
          {profile.character === 'male' ? '🧘' : '🧘‍♀️'} {profile.heroName}
        </p>

        {/* ВКЛАДКИ */}
        <div style={styles.tabs}>
          {(['sound', 'visual', 'profile'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tab,
                background: activeTab === tab ? 'rgba(167,139,250,0.15)' : 'transparent',
                color: activeTab === tab ? '#A78BFA' : '#475569',
                borderBottom: activeTab === tab ? '2px solid #A78BFA' : '2px solid transparent',
              }}
            >
              {tab === 'sound' ? '🔊 Звук' : tab === 'visual' ? '🎨 Визуал' : '👤 Профиль'}
            </button>
          ))}
        </div>

        {/* КОНТЕНТ */}
        <div style={styles.content}>
          {activeTab === 'sound'   && <SoundTab />}
          {activeTab === 'visual'  && <VisualTab />}
          {activeTab === 'profile' && <ProfileTab profile={profile} onReset={reset} />}
        </div>

      </div>
    </main>
  );
}

// ─── ЗВУК ─────────────────────────────────────────────
function SoundTab() {
  const { settings, updateSound, updateMusic } = useSettingsStore();
  const { sound, music } = settings;

  return (
    <div style={styles.tabContent}>

      <Section title="🎙️ Голосовые подсказки">
        <Toggle
          label="Голосовое сопровождение"
          value={sound.voiceEnabled}
          onChange={v => updateSound({ voiceEnabled: v })}
        />
        {sound.voiceEnabled && (
          <>
            <Select
              label="Язык"
              value={sound.voiceLanguage}
              options={[
                { value: 'ru', label: 'Русский' },
                { value: 'en', label: 'English' },
                { value: 'sanskrit', label: 'Санскрит' },
              ]}
              onChange={v => updateSound({ voiceLanguage: v as any })}
            />
            <Select
              label="Стиль"
              value={sound.voiceStyle}
              options={[
                { value: 'short', label: 'Короткий' },
                { value: 'detailed', label: 'Подробный' },
              ]}
              onChange={v => updateSound({ voiceStyle: v as any })}
            />
            <Slider
              label="Громкость голоса"
              value={sound.voiceVolume}
              onChange={v => updateSound({ voiceVolume: v })}
            />
          </>
        )}
      </Section>

      <Section title="🥁 Барабан">
        <Toggle
          label="Звуки барабана"
          value={sound.drumEnabled}
          onChange={v => updateSound({ drumEnabled: v })}
        />
        {sound.drumEnabled && (
          <Slider
            label="Громкость"
            value={sound.drumVolume}
            onChange={v => updateSound({ drumVolume: v })}
          />
        )}
      </Section>

      <Section title="🎸 Гитарные аккорды">
        <Toggle
          label="Аккорды (F maj / A min)"
          value={sound.guitarEnabled}
          onChange={v => updateSound({ guitarEnabled: v })}
        />
        {sound.guitarEnabled && (
          <Slider
            label="Громкость"
            value={sound.guitarVolume}
            onChange={v => updateSound({ guitarVolume: v })}
          />
        )}
      </Section>

      <Section title="🌿 Музыка и природа">
  <Toggle
    label="Фоновая музыка локации"
    value={music.musicEnabled}
    onChange={v => updateMusic({ musicEnabled: v })}
  />
  {music.musicEnabled && (
    <Slider
      label="Громкость музыки"
      value={music.musicVolume}
      onChange={v => updateMusic({ musicVolume: v })}
    />
  )}
  <Toggle
    label="Звуки природы"
    value={music.natureSoundsEnabled}
    onChange={v => updateMusic({ natureSoundsEnabled: v })}
  />
  {music.natureSoundsEnabled && (
    <>
      <Slider
        label="Громкость природы"
        value={music.natureSoundsVolume}
        onChange={v => updateMusic({ natureSoundsVolume: v })}
      />
      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '0.6rem' }}>
          🐦 Звук природы
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.4rem', maxHeight: '220px', overflowY: 'auto' as const }}>
          {BIRDS_TRACKS.map(track => (
            <div
              key={track.id}
              onClick={() => {
  updateMusic({ selectedBirdsTrack: track.id });
  playBirds(track.id, music.natureSoundsVolume / 100);
}}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.6rem',
                cursor: 'pointer',
                background: music.selectedBirdsTrack === track.id
                  ? 'rgba(167,139,250,0.15)'
                  : 'rgba(255,255,255,0.03)',
                border: music.selectedBirdsTrack === track.id
                  ? '1px solid rgba(167,139,250,0.4)'
                  : '1px solid rgba(255,255,255,0.05)',
                color: music.selectedBirdsTrack === track.id ? '#A78BFA' : '#64748B',
                fontSize: '0.82rem',
                transition: 'all 0.2s',
              }}
            >
              {track.label}
              {music.selectedBirdsTrack === track.id && (
                <span style={{ float: 'right', fontSize: '0.7rem' }}>▶ играет</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )}
  <Toggle
    label="Синхронизация с дыханием"
    value={music.syncWithBreath}
    onChange={v => updateMusic({ syncWithBreath: v })}
  />
</Section>

    </div>
  );
}

// ─── ВИЗУАЛ ───────────────────────────────────────────
function VisualTab() {
  const { settings, updateVisual, updateAccessibility } = useSettingsStore();
  const { visual, accessibility } = settings;

  return (
    <div style={styles.tabContent}>

      <Section title="🌈 Цвета и свечение">
        <Select
          label="Цветовая тема"
          value={visual.colorTheme}
          options={[
            { value: 'dark',  label: '🌑 Тёмная' },
            { value: 'light', label: '☀️ Светлая' },
            { value: 'auto',  label: '🔄 Авто' },
          ]}
          onChange={v => updateVisual({ colorTheme: v as any })}
        />
        <Select
          label="Интенсивность свечения"
          value={visual.glowIntensity}
          options={[
            { value: 'low',    label: 'Низкая' },
            { value: 'medium', label: 'Средняя' },
            { value: 'high',   label: 'Высокая' },
          ]}
          onChange={v => updateVisual({ glowIntensity: v as any })}
        />
        <Select
          label="Стиль точек фаз"
          value={visual.dotStyle}
          options={[
            { value: 'circles',  label: '● Круги' },
            { value: 'crystals', label: '◆ Кристаллы' },
            { value: 'stars',    label: '★ Звёзды' },
          ]}
          onChange={v => updateVisual({ dotStyle: v as any })}
        />
      </Section>

      <Section title="🧘 Анимация персонажа">
        <Toggle
          label="Анимация дыхания"
          value={visual.characterAnimationEnabled}
          onChange={v => updateVisual({ characterAnimationEnabled: v })}
        />
        {visual.characterAnimationEnabled && (
          <Select
            label="Амплитуда"
            value={visual.animationAmplitude}
            options={[
              { value: 'small',  label: 'Малая' },
              { value: 'medium', label: 'Средняя' },
              { value: 'large',  label: 'Выраженная' },
            ]}
            onChange={v => updateVisual({ animationAmplitude: v as any })}
          />
        )}
        <Select
          label="Скорость переходов"
          value={visual.transitionSpeed}
          options={[
            { value: 'soft', label: '🌊 Плавная (800мс)' },
            { value: 'fast', label: '⚡ Быстрая (300мс)' },
          ]}
          onChange={v => updateVisual({ transitionSpeed: v as any })}
        />
      </Section>

      <Section title="♿ Доступность">
        <Toggle
          label="Субтитры голоса"
          value={accessibility.subtitlesEnabled}
          onChange={v => updateAccessibility({ subtitlesEnabled: v })}
        />
        <Toggle
          label="Высокий контраст"
          value={accessibility.highContrastMode}
          onChange={v => updateAccessibility({ highContrastMode: v })}
        />
        <Toggle
          label="Крупный шрифт"
          value={accessibility.largeFontMode}
          onChange={v => updateAccessibility({ largeFontMode: v })}
        />
        <Toggle
          label="Режим закрытых глаз"
          value={accessibility.eyesClosedMode}
          onChange={v => updateAccessibility({ eyesClosedMode: v })}
        />
        <Toggle
          label="Вибрация при смене фазы"
          value={accessibility.hapticFeedback}
          onChange={v => updateAccessibility({ hapticFeedback: v })}
        />
      </Section>

    </div>
  );
}

// ─── ПРОФИЛЬ ──────────────────────────────────────────
function ProfileTab({ profile, onReset }: { profile: any; onReset: () => void }) {
  const router = useRouter();
  const totalMinutes = Math.floor(profile.totalTimeSeconds / 60);

  return (
    <div style={styles.tabContent}>

      <Section title="📊 Статистика">
        <div style={styles.statGrid}>
          <StatItem label="Раундов" value={profile.totalRoundsCompleted} color="#60A5FA" />
          <StatItem label="Минут"   value={totalMinutes}                 color="#A78BFA" />
          <StatItem label="Циклов"  value={profile.totalBreathCycles ?? 0} color="#FBBF24" />
          <StatItem label="Локаций" value={profile.locationsUnlocked.length} color="#34D399" />
        </div>
      </Section>

      <Section title="🏆 Достижения">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <AchievRow emoji="🌱" label="Первый вдох"    desc="1 раунд"    done={profile.totalRoundsCompleted >= 1}   />
          <AchievRow emoji="🌿" label="Ученик дыхания" desc="10 раундов" done={profile.totalRoundsCompleted >= 10}  />
          <AchievRow emoji="🪷" label="Адепт потока"   desc="50 раундов" done={profile.totalRoundsCompleted >= 50}  />
          <AchievRow emoji="🕉️" label="Мастер тишины" desc="100 раундов" done={profile.totalRoundsCompleted >= 100} />
        </div>
      </Section>

      <Section title="⚠️ Сброс">
        <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Сброс удалит весь прогресс, историю практик и достижения. Это действие необратимо.
        </p>
        <button
          onClick={() => { onReset(); router.push('/'); }}
          style={styles.btnDanger}
        >
          Начать путь заново
        </button>
      </Section>

    </div>
  );
}

// ─── UI КОМПОНЕНТЫ ────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={styles.section}>
      <p style={styles.sectionTitle}>{title}</p>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: '44px', height: '24px', borderRadius: '12px',
          background: value ? '#A78BFA' : 'rgba(255,255,255,0.1)',
          position: 'relative', cursor: 'pointer', transition: 'background 0.3s',
          flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: '3px',
          left: value ? '23px' : '3px',
          width: '18px', height: '18px',
          borderRadius: '50%', background: '#fff',
          transition: 'left 0.3s',
        }} />
      </div>
    </div>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={styles.rowLabel}>{label}</span>
        <span style={{ color: '#A78BFA', fontSize: '0.8rem' }}>{value}%</span>
      </div>
      <input
        type="range" min={0} max={100} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#A78BFA' }}
      />
    </div>
  );
}

function Select({ label, value, options, onChange }: {
  label: string; value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={styles.select}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={styles.statItem}>
      <p style={{ color, fontSize: '1.5rem', fontFamily: 'Georgia, serif', fontWeight: 700 }}>{value}</p>
      <p style={{ color: '#334155', fontSize: '0.75rem' }}>{label}</p>
    </div>
  );
}

function AchievRow({ emoji, label, desc, done }: { emoji: string; label: string; desc: string; done: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.6rem 0.75rem', borderRadius: '0.75rem',
      background: done ? 'rgba(251,191,36,0.06)' : 'rgba(255,255,255,0.02)',
      border: done ? '1px solid rgba(251,191,36,0.2)' : '1px solid rgba(255,255,255,0.04)',
      opacity: done ? 1 : 0.4,
    }}>
      <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <p style={{ color: done ? '#FBBF24' : '#475569', fontSize: '0.85rem', fontWeight: 600 }}>{label}</p>
        <p style={{ color: '#334155', fontSize: '0.75rem' }}>{desc}</p>
      </div>
      {done && <span style={{ color: '#FBBF24', fontSize: '0.8rem' }}>✦</span>}
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 30% 20%, rgba(167,139,250,0.06) 0%, transparent 50%), #030712',
    padding: '2rem 1rem',
  } as React.CSSProperties,

  container: { maxWidth: '520px', margin: '0 auto' },

  backBtn: {
    background: 'none', border: 'none', color: '#475569',
    cursor: 'pointer', fontSize: '0.9rem',
    marginBottom: '1.5rem', display: 'block',
  } as React.CSSProperties,

  eyebrow: { color: '#334155', letterSpacing: '0.2em', fontSize: '0.75rem', marginBottom: '0.4rem' },

  title: {
    fontFamily: 'Georgia, serif',
    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
    background: 'linear-gradient(135deg, #818CF8, #A78BFA)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '0.25rem',
  } as React.CSSProperties,

  sub: { color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem' },

  tabs: {
    display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)',
    marginBottom: '1.5rem',
  },

  tab: {
    flex: 1, padding: '0.75rem 0.5rem',
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '0.85rem', transition: 'all 0.2s',
  } as React.CSSProperties,

  content: {},

  tabContent: { display: 'flex', flexDirection: 'column' as const, gap: '1rem' },

  section: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '1.25rem', overflow: 'hidden',
  },

  sectionTitle: {
    padding: '0.9rem 1.25rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: '#64748B', fontSize: '0.8rem', letterSpacing: '0.05em',
  },

  sectionBody: { padding: '1rem 1.25rem' },

  row: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '0.75rem',
  },

  rowLabel: { color: '#94A3B8', fontSize: '0.875rem' },

  select: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#F1F5F9', borderRadius: '0.5rem',
    padding: '0.35rem 0.6rem', fontSize: '0.82rem',
    cursor: 'pointer',
  } as React.CSSProperties,

  statGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },

  statItem: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.75rem', padding: '0.75rem',
    textAlign: 'center' as const,
  },

  btnDanger: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#F87171', borderRadius: '0.75rem',
    padding: '0.75rem 1.5rem', cursor: 'pointer',
    fontSize: '0.9rem', width: '100%',
  } as React.CSSProperties,
};