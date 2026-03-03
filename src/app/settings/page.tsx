'use client';

import { useState, useEffect }        from 'react';
import { useRouter }       from 'next/navigation';
import { useProfileStore, useSettingsStore } from '@/store';
import {
  BIRDS_TRACKS,
  playBirds, stopBirds, setBirdsVolume,
  playBgSound, stopBgSound, setBgVolume,
} from '@/lib/audio';
import PageTransition from '@/components/PageTransition';

type Tab = 'sound' | 'visual' | 'profile';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('sound');
  const { profile, reset } = useProfileStore();

  // FIX: never call router.push during render — use useEffect instead
  useEffect(() => {
    if (!profile) router.push('/');
  }, [profile]);

  if (!profile) return null;

  return (
    <PageTransition>
      <main style={styles.page}>
        <div style={styles.container}>

          <button onClick={() => router.push('/')} style={styles.backBtn}>← Назад</button>
          <p style={styles.eyebrow}>ПЕРСОНАЛИЗАЦИЯ</p>
          <h1 style={styles.title}>Настройки</h1>
          <p style={styles.sub}>
            {profile.character === 'male' ? '🧘' : '🧘‍♀️'} {profile.heroName}
          </p>

          <div style={styles.tabs}>
            {(['sound', 'visual', 'profile'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...styles.tab,
                  background:   activeTab === tab ? 'rgba(167,139,250,0.15)' : 'transparent',
                  color:        activeTab === tab ? '#A78BFA' : '#64748B',
                  borderBottom: activeTab === tab ? '2px solid #A78BFA' : '2px solid transparent',
                }}
              >
                {tab === 'sound' ? '🔊 Звук' : tab === 'visual' ? '🎨 Визуал' : '👤 Профиль'}
              </button>
            ))}
          </div>

          <div style={styles.content}>
            {activeTab === 'sound'   && <SoundTab />}
            {activeTab === 'visual'  && <VisualTab />}
            {activeTab === 'profile' && <ProfileTab profile={profile} onReset={reset} />}
          </div>

        </div>
      </main>
    </PageTransition>
  );
}

function SoundTab() {
  const { settings, updateSound, updateMusic } = useSettingsStore();
  const { sound, music } = settings;

  function handleToggleBirds(enabled: boolean) {
    updateMusic({ natureSoundsEnabled: enabled });
    if (enabled) playBirds(music.selectedBirdsTrack, music.natureSoundsVolume / 100);
    else stopBirds();
  }

  function handleBirdsVolume(v: number) {
    updateMusic({ natureSoundsVolume: v });
    setBirdsVolume(v / 100);
  }

  function handleSelectTrack(trackId: string) {
    updateMusic({ selectedBirdsTrack: trackId });
    if (music.natureSoundsEnabled) playBirds(trackId, music.natureSoundsVolume / 100);
  }

  function handleToggleMusic(enabled: boolean) {
    updateMusic({ musicEnabled: enabled });
    if (!enabled) stopBgSound();
  }

  function handleMusicVolume(v: number) {
    updateMusic({ musicVolume: v });
    setBgVolume(v / 100);
  }

  return (
    <div style={styles.tabContent}>
      <Section title="🎙️ Голосовые подсказки">
        <Toggle label="Голосовое сопровождение" value={sound.voiceEnabled} onChange={v => updateSound({ voiceEnabled: v })} />
        {sound.voiceEnabled && (
          <>
            <Select label="Язык" value={sound.voiceLanguage}
              options={[{ value: 'ru', label: 'Русский' }, { value: 'en', label: 'English' }, { value: 'sanskrit', label: 'Санскрит' }]}
              onChange={v => updateSound({ voiceLanguage: v as any })} />
            <Select label="Стиль" value={sound.voiceStyle}
              options={[{ value: 'short', label: 'Короткий' }, { value: 'detailed', label: 'Подробный' }]}
              onChange={v => updateSound({ voiceStyle: v as any })} />
            <Slider label="Громкость голоса" value={sound.voiceVolume} onChange={v => updateSound({ voiceVolume: v })} />
          </>
        )}
      </Section>

      <Section title="🥁 Барабан">
        <Toggle label="Звуки барабана" value={sound.drumEnabled} onChange={v => updateSound({ drumEnabled: v })} />
        {sound.drumEnabled && <Slider label="Громкость" value={sound.drumVolume} onChange={v => updateSound({ drumVolume: v })} />}
      </Section>

      <Section title="🎸 Гитарные аккорды">
        <Toggle label="Аккорды (F maj / A min)" value={sound.guitarEnabled} onChange={v => updateSound({ guitarEnabled: v })} />
        {sound.guitarEnabled && <Slider label="Громкость" value={sound.guitarVolume} onChange={v => updateSound({ guitarVolume: v })} />}
      </Section>

      <Section title="🌆 Музыка локации">
        <Toggle label="Фоновая музыка локации" value={music.musicEnabled} onChange={handleToggleMusic} />
        {music.musicEnabled && <Slider label="Громкость музыки" value={music.musicVolume} onChange={handleMusicVolume} />}
        <Toggle label="Синхронизация с дыханием" value={music.syncWithBreath} onChange={v => updateMusic({ syncWithBreath: v })} />
      </Section>

      <Section title="🌿 Звуки природы">
        <Toggle label="Звуки природы (птицы)" value={music.natureSoundsEnabled} onChange={handleToggleBirds} />
        {music.natureSoundsEnabled && (
          <>
            <Slider label="Громкость природы" value={music.natureSoundsVolume} onChange={handleBirdsVolume} />
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ color: '#64748B', fontSize: '0.78rem', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>🐦 ВЫБОР ТРЕКА</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '260px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {BIRDS_TRACKS.map((track: any) => {
                  const active = music.selectedBirdsTrack === track.id;
                  return (
                    <div key={track.id} onClick={() => handleSelectTrack(track.id)} style={{
                      padding: '0.5rem 0.75rem', borderRadius: '0.6rem', cursor: 'pointer',
                      background: active ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)',
                      border: active ? '1px solid rgba(167,139,250,0.4)' : '1px solid rgba(255,255,255,0.05)',
                      color: active ? '#A78BFA' : '#64748B', fontSize: '0.82rem', transition: 'all 0.18s',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      {track.label}
                      {active && <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>▶ играет</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </Section>
    </div>
  );
}

function VisualTab() {
  const { settings, updateVisual } = useSettingsStore();
  const { visual } = settings;
  return (
    <div style={styles.tabContent}>
      <Section title="🌈 Цвета и свечение">
        <Select label="Цветовая тема" value={visual.colorTheme}
          options={[{ value: 'dark', label: '🌑 Тёмная' }, { value: 'light', label: '☀️ Светлая' }, { value: 'auto', label: '🔄 Авто' }]}
          onChange={v => updateVisual({ colorTheme: v as any })} />
        <Select label="Интенсивность свечения" value={visual.glowIntensity}
          options={[{ value: 'low', label: '🌑 Слабое' }, { value: 'medium', label: '✨ Среднее' }, { value: 'high', label: '💫 Яркое' }]}
          onChange={v => updateVisual({ glowIntensity: v as any })} />
        <Note text="Цветовая тема и свечение применяются во время практики" />
      </Section>
      <Section title="✨ Анимации">
        <Toggle label="Анимация персонажа" value={visual.characterAnimationEnabled} onChange={v => updateVisual({ characterAnimationEnabled: v })} />
        <Select label="Амплитуда дыхания" value={visual.animationAmplitude}
          options={[{ value: 'small', label: 'Мягкая' }, { value: 'medium', label: 'Средняя' }, { value: 'large', label: 'Сильная' }]}
          onChange={v => updateVisual({ animationAmplitude: v as any })} />
        <Select label="Скорость переходов" value={visual.transitionSpeed}
          options={[{ value: 'soft', label: '🌊 Плавно' }, { value: 'fast', label: '⚡ Быстро' }]}
          onChange={v => updateVisual({ transitionSpeed: v as any })} />
      </Section>
      <Section title="💎 Стиль точек">
        <Select label="Точки фаз дыхания" value={visual.dotStyle}
          options={[{ value: 'circles', label: '⬤ Круги' }, { value: 'crystals', label: '💎 Кристаллы' }, { value: 'stars', label: '✦ Звёзды' }]}
          onChange={v => updateVisual({ dotStyle: v as any })} />
      </Section>
    </div>
  );
}

function ProfileTab({ profile, onReset }: { profile: any; onReset: () => void }) {
  const router = useRouter();
  const { settings, updateAccessibility } = useSettingsStore();
  const { accessibility } = settings;
  const totalMinutes = Math.floor(profile.totalTimeSeconds / 60);
  return (
    <div style={styles.tabContent}>
      <Section title="📊 Статистика">
        <div style={styles.statGrid}>
          <StatItem label="Раундов" value={profile.totalRoundsCompleted}    color="#60A5FA" />
          <StatItem label="Минут"   value={totalMinutes}                     color="#A78BFA" />
          <StatItem label="Циклов"  value={profile.totalBreathCycles ?? 0}   color="#FBBF24" />
          <StatItem label="Локаций" value={profile.locationsUnlocked.length} color="#34D399" />
        </div>
      </Section>
      <Section title="♿ Доступность">
        <Toggle label="Субтитры"                    value={accessibility.subtitlesEnabled}  onChange={v => updateAccessibility({ subtitlesEnabled: v })} />
        <Toggle label="Режим закрытых глаз"         value={accessibility.eyesClosedMode}    onChange={v => updateAccessibility({ eyesClosedMode: v })} />
        <Toggle label="Вибрация / тактильный отклик" value={accessibility.hapticFeedback}   onChange={v => updateAccessibility({ hapticFeedback: v })} />
        <Toggle label="Высокий контраст"            value={accessibility.highContrastMode}  onChange={v => updateAccessibility({ highContrastMode: v })} />
        <Toggle label="Крупный шрифт"               value={accessibility.largeFontMode}     onChange={v => updateAccessibility({ largeFontMode: v })} />
      </Section>
      <Section title="🏆 Достижения">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <AchievRow emoji="🌱" label="Первый вдох"    desc="1 раунд"     done={profile.totalRoundsCompleted >= 1}   />
          <AchievRow emoji="🌿" label="Ученик дыхания" desc="10 раундов"  done={profile.totalRoundsCompleted >= 10}  />
          <AchievRow emoji="🪷" label="Адепт потока"   desc="50 раундов"  done={profile.totalRoundsCompleted >= 50}  />
          <AchievRow emoji="🕉️" label="Мастер тишины" desc="100 раундов" done={profile.totalRoundsCompleted >= 100} />
          <AchievRow emoji="🏔️" label="Полный путь"   desc="200 раундов" done={profile.totalRoundsCompleted >= 200} />
        </div>
      </Section>
      <Section title="⚠️ Сброс прогресса">
        <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Сброс удалит весь прогресс, историю практик и достижения. Это действие необратимо.
        </p>
        <button onClick={() => { onReset(); router.push('/'); }} style={styles.btnDanger}>
          Начать путь заново
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={styles.section}>
      <p style={styles.sectionTitle}>{title}</p>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function Note({ text }: { text: string }) {
  return <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.5rem', fontStyle: 'italic' }}>ℹ️ {text}</p>;
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <div onClick={() => onChange(!value)} style={{
        width: '44px', height: '24px', borderRadius: '12px',
        background: value ? '#A78BFA' : 'rgba(255,255,255,0.1)',
        position: 'relative', cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', top: '3px', left: value ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.3s' }} />
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
      <input type="range" min={0} max={100} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: '#A78BFA' }} />
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} style={styles.select}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={styles.statItem}>
      <p style={{ color, fontSize: '1.5rem', fontFamily: 'Georgia, serif', fontWeight: 700 }}>{value}</p>
      <p style={{ color: '#64748B', fontSize: '0.75rem' }}>{label}</p>
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
      opacity: done ? 1 : 0.45,
    }}>
      <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <p style={{ color: done ? '#FBBF24' : '#94A3B8', fontSize: '0.85rem', fontWeight: 600 }}>{label}</p>
        <p style={{ color: '#64748B', fontSize: '0.75rem' }}>{desc}</p>
      </div>
      {done && <span style={{ color: '#FBBF24', fontSize: '0.8rem' }}>✦</span>}
    </div>
  );
}

const styles = {
  page:      { minHeight: '100dvh', background: 'radial-gradient(ellipse at 30% 20%, rgba(167,139,250,0.06) 0%, transparent 50%), #030712', padding: 'clamp(1.5rem, 4vw, 2rem) 1rem' } as React.CSSProperties,
  container: { maxWidth: '520px', margin: '0 auto' },
  backBtn:   { background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'block', padding: '0.5rem 0' } as React.CSSProperties,
  eyebrow:   { color: '#475569', letterSpacing: '0.2em', fontSize: '0.75rem', marginBottom: '0.4rem' },
  title:     { fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', background: 'linear-gradient(135deg, #818CF8, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.25rem' } as React.CSSProperties,
  sub:       { color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' },
  tabs:      { display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.5rem' },
  tab:       { flex: 1, padding: '0.75rem 0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' } as React.CSSProperties,
  content:   {},
  tabContent:   { display: 'flex', flexDirection: 'column' as const, gap: '1rem' },
  section:      { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1.25rem', overflow: 'hidden' },
  sectionTitle: { padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#64748B', fontSize: '0.8rem', letterSpacing: '0.05em' },
  sectionBody:  { padding: '1rem 1.25rem' },
  row:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  rowLabel:     { color: '#94A3B8', fontSize: '0.875rem' },
  select:       { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F1F5F9', borderRadius: '0.5rem', padding: '0.35rem 0.6rem', fontSize: '0.82rem', cursor: 'pointer' } as React.CSSProperties,
  statGrid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  statItem:     { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '0.75rem', textAlign: 'center' as const },
  btnDanger:    { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', borderRadius: '0.75rem', padding: '0.75rem 1.5rem', cursor: 'pointer', fontSize: '0.9rem', width: '100%' } as React.CSSProperties,
};