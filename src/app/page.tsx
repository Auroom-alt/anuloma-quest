'use client';

import { useState }             from 'react';
import { useRouter }            from 'next/navigation';
import type { CharacterGender } from '@/types';
import { useProfileStore }      from '@/store';
import { useAuth }              from '@/hooks/useAuth';

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function Home() {
  const [screen,   setScreen]   = useState<'welcome' | 'character' | 'name'>('welcome');
  const [selected, setSelected] = useState<CharacterGender | null>(null);
  const [heroName, setHeroName] = useState('');
  const { createProfile, profile } = useProfileStore();

  if (profile) return <MainMenu />;
  if (screen === 'welcome')   return <WelcomeScreen   onContinue={() => setScreen('character')} />;
  if (screen === 'character') return (
    <CharacterScreen
      selected={selected}
      onSelect={(g) => { setSelected(g); setScreen('name'); }}
    />
  );
  return (
    <NameScreen
      character={selected!} heroName={heroName} onChange={setHeroName}
      onStart={() => { if (heroName.trim()) createProfile(heroName.trim(), selected!); }}
    />
  );
}

// ─── Welcome ──────────────────────────────────────────────────────────────────

function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <main style={styles.page}>
      <div style={styles.center}>
        <div style={{ fontSize: '5rem', animation: 'spin 25s linear infinite', display: 'inline-block', marginBottom: '1.5rem' }}>🕉️</div>
        <h1 style={styles.titleGold}>Anuloma Quest</h1>
        <p style={styles.subtitle}>
          Путь дыхания.<br />
          <span style={{ color: '#64748B', fontSize: '0.95rem' }}>Медитативное путешествие через 10 миров.</span>
        </p>
        <div style={styles.quoteBox}>
          <p style={styles.quoteText}>«Ты стоишь на пороге внутреннего Пути.<br />Твоё дыхание — мост между мирами.»</p>
          <p style={styles.quoteSource}>— Хатха-йога Прадипика</p>
        </div>
        <button style={styles.btnGold} onClick={onContinue}>Начать путь →</button>
      </div>
    </main>
  );
}

// ─── Character ────────────────────────────────────────────────────────────────

function CharacterScreen({ selected, onSelect }: {
  selected: CharacterGender | null;
  onSelect: (g: CharacterGender) => void;
}) {
  return (
    <main style={styles.page}>
      <div style={styles.center}>
        <p style={{ color: '#64748B', letterSpacing: '0.2em', fontSize: '0.8rem', marginBottom: '0.5rem' }}>ШАГ 1 ИЗ 2</p>
        <h2 style={styles.titleSacred}>Выбери своего героя</h2>
        <p style={{ color: '#64748B', marginBottom: '2.5rem' }}>Кто отправится в путешествие дыхания?</p>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <CharacterCard gender="male"   name="Арья" desc="Воин духа"  emoji="🧘"    selected={selected === 'male'}   glowColor="rgba(96,165,250,0.6)"  onClick={() => onSelect('male')} />
          <CharacterCard gender="female" name="Лила" desc="Дочь света" emoji="🧘‍♀️" selected={selected === 'female'} glowColor="rgba(251,191,36,0.6)"  onClick={() => onSelect('female')} />
        </div>
        <p style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '2rem' }}>Оба персонажа проходят одинаковый путь дыхания</p>
      </div>
    </main>
  );
}

function CharacterCard({ name, desc, emoji, selected, glowColor, onClick }: {
  gender: CharacterGender; name: string; desc: string; emoji: string;
  selected: boolean; glowColor: string; onClick: () => void;
}) {
  return (
    <div onClick={onClick} style={{
      ...styles.card,
      border:     selected ? `2px solid ${glowColor}` : '2px solid rgba(255,255,255,0.07)',
      boxShadow:  selected ? `0 0 30px 8px ${glowColor}` : 'none',
      transform:  selected ? 'scale(1.04)' : 'scale(1)',
      cursor: 'pointer', transition: 'all 0.3s ease',
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'breathe 4s ease-in-out infinite', display: 'inline-block' }}>{emoji}</div>
      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#F1F5F9', marginBottom: '0.25rem' }}>{name}</h3>
      <p style={{ color: '#64748B', fontSize: '0.9rem' }}>{desc}</p>
      {selected && <div style={{ marginTop: '1rem', color: glowColor, fontSize: '0.85rem' }}>✦ Выбран</div>}
    </div>
  );
}

// ─── Name ─────────────────────────────────────────────────────────────────────

function NameScreen({ character, heroName, onChange, onStart }: {
  character: CharacterGender; heroName: string;
  onChange: (v: string) => void; onStart: () => void;
}) {
  return (
    <main style={styles.page}>
      <div style={styles.center}>
        <p style={{ color: '#64748B', letterSpacing: '0.2em', fontSize: '0.8rem', marginBottom: '0.5rem' }}>ШАГ 2 ИЗ 2</p>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{character === 'male' ? '🧘' : '🧘‍♀️'}</div>
        <h2 style={styles.titleSacred}>Как зовут героя?</h2>
        <p style={{ color: '#64748B', marginBottom: '2rem' }}>Это имя будет сопровождать тебя в пути</p>
        <input
          type="text"
          placeholder={character === 'male' ? 'Арья' : 'Лила'}
          value={heroName}
          onChange={(e) => onChange(e.target.value)}
          maxLength={20}
          style={styles.input}
          onKeyDown={(e) => e.key === 'Enter' && heroName.trim() && onStart()}
        />
        <div style={styles.quoteBox}>
          <p style={styles.quoteText}>«Пусть дыхание станет твоим учителем.<br />Каждый вдох — шаг вперёд.»</p>
        </div>
        <button
          style={{ ...styles.btnGold, opacity: heroName.trim() ? 1 : 0.4 }}
          onClick={onStart}
          disabled={!heroName.trim()}
        >
          Вступить на путь →
        </button>
      </div>
    </main>
  );
}

// ─── Main Menu ────────────────────────────────────────────────────────────────

function MainMenu() {
  const { profile, reset } = useProfileStore();
  const { user, loading: authLoading, signInWithEmail, signOut } = useAuth();
  const router = useRouter();

  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [email,         setEmail]         = useState('');
  const [emailSent,     setEmailSent]     = useState(false);
  const [authLoading2,  setAuthLoading2]  = useState(false);
  const [authError,     setAuthError]     = useState<string | null>(null);

  if (!profile) return null;

  const emoji        = profile.character === 'male' ? '🧘' : '🧘‍♀️';
  const streak       = profile.currentStreak   ?? 0;
  const longest      = profile.longestStreak   ?? 0;
  const history      = profile.practiceHistory ?? [];
  const totalMinutes = Math.floor(profile.totalTimeSeconds / 60);
  const lastDate     = profile.lastPracticeDate ? formatRelativeDate(profile.lastPracticeDate) : null;

  async function handleSendMagicLink() {
    if (!email.trim()) return;
    setAuthLoading2(true);
    setAuthError(null);
    const { error } = await signInWithEmail(email.trim());
    setAuthLoading2(false);
    if (error) {
      setAuthError('Не удалось отправить ссылку. Проверь email.');
    } else {
      setEmailSent(true);
    }
  }

  return (
    <main style={{ ...styles.page, alignItems: 'flex-start' }}>
      <div style={{ ...styles.center, paddingTop: '1.5rem', paddingBottom: '2.5rem' }}>

        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem', animation: 'breathe 4s ease-in-out infinite', display: 'inline-block' }}>
          {emoji}
        </div>
        <h1 style={styles.titleGold}>Anuloma Quest</h1>
        <p style={{ color: '#94A3B8', marginBottom: '1.5rem' }}>
          С возвращением,{' '}
          <span style={{ color: '#FBBF24', fontFamily: 'Georgia, serif' }}>{profile.heroName}</span>
        </p>

        {/* ── Cloud backup banner ── */}
        <CloudBanner
          user={user}
          authLoading={authLoading}
          showAuthPanel={showAuthPanel}
          setShowAuthPanel={setShowAuthPanel}
          onSignOut={signOut}
        />

        {/* ── Magic Link panel ── */}
        {showAuthPanel && !user && (
          <div style={styles.authPanel}>
            {emailSent ? (
              <>
                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📬</p>
                <p style={{ color: '#F1F5F9', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Проверь почту!
                </p>
                <p style={{ color: '#64748B', fontSize: '0.82rem' }}>
                  Отправили ссылку на <strong style={{ color: '#94A3B8' }}>{email}</strong>.<br />
                  Нажми её — войдёшь автоматически.
                </p>
                <button
                  onClick={() => { setEmailSent(false); setEmail(''); }}
                  style={{ ...styles.btnGlassSmall, marginTop: '0.75rem' }}
                >
                  Отправить другой email
                </button>
              </>
            ) : (
              <>
                <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                  Введи email — пришлём магическую ссылку.<br />
                  Пароль не нужен. Данные сохранятся в облаке.
                </p>
                <input
                  type="email"
                  placeholder="твой@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setAuthError(null); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMagicLink()}
                  style={styles.authInput}
                />
                {authError && (
                  <p style={{ color: '#F87171', fontSize: '0.78rem', marginBottom: '0.5rem' }}>{authError}</p>
                )}
                <button
                  onClick={handleSendMagicLink}
                  disabled={!email.trim() || authLoading2}
                  style={{ ...styles.btnGold, opacity: email.trim() && !authLoading2 ? 1 : 0.4, fontSize: '0.9rem', padding: '0.7rem 1.5rem' }}
                >
                  {authLoading2 ? 'Отправляем...' : '✉️ Получить ссылку'}
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Streak card ── */}
        <div style={streakCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: '#64748B', fontSize: '0.7rem', letterSpacing: '0.12em', marginBottom: '0.2rem' }}>СЕРИЯ ДНЕЙ</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ fontSize: '2.8rem', fontFamily: 'Georgia, serif', fontWeight: 700, color: streak > 0 ? '#FBBF24' : '#475569', lineHeight: 1 }}>
                  {streak}
                </span>
                <span style={{ color: '#64748B', fontSize: '0.85rem' }}>
                  {streak === 1 ? 'день' : streak >= 2 && streak <= 4 ? 'дня' : 'дней'}
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', marginTop: '0.2rem', color: streak > 0 ? '#F59E0B' : '#475569' }}>
                {streak > 0 ? '🔥 Продолжай!' : 'Начни серию сегодня'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#64748B', fontSize: '0.7rem', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>РЕКОРД</p>
              <p style={{ color: '#A78BFA', fontFamily: 'Georgia, serif', fontSize: '1.6rem', fontWeight: 700, lineHeight: 1 }}>
                🏆 {longest}
              </p>
              {lastDate && (
                <p style={{ color: '#475569', fontSize: '0.68rem', marginTop: '0.35rem' }}>Практика: {lastDate}</p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              { label: 'Раундов', value: profile.totalRoundsCompleted, color: '#60A5FA' },
              { label: 'Минут',   value: totalMinutes,                  color: '#A78BFA' },
              { label: 'Дней',    value: history.length,                color: '#34D399' },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '0.75rem', padding: '0.5rem 0.25rem', textAlign: 'center',
              }}>
                <p style={{ color: s.color, fontSize: '1.15rem', fontWeight: 700, fontFamily: 'Georgia, serif', lineHeight: 1 }}>{s.value}</p>
                <p style={{ color: '#475569', fontSize: '0.62rem', marginTop: '0.2rem' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <CalendarWidget history={history} />
        </div>

        {/* ── Nav buttons ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '300px', margin: '0 auto 1rem' }}>
          <button style={styles.btnGold}  onClick={() => router.push('/setup')}>🌬️ Начать практику</button>
          <button style={styles.btnGlass} onClick={() => router.push('/map')}>🗺️ Карта пути</button>
          <button style={styles.btnGlass} onClick={() => router.push('/settings')}>⚙️ Настройки</button>
          <button style={styles.btnGlass} onClick={() => router.push('/about')}>ℹ️ О практике</button>
        </div>

        <button onClick={reset} style={{ color: '#475569', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          Начать заново
        </button>

      </div>
    </main>
  );
}

// ─── Cloud Banner ─────────────────────────────────────────────────────────────

function CloudBanner({ user, authLoading, showAuthPanel, setShowAuthPanel, onSignOut }: {
  user: any; authLoading: boolean;
  showAuthPanel: boolean; setShowAuthPanel: (v: boolean) => void;
  onSignOut: () => void;
}) {
  if (authLoading) return null;

  if (user) {
    return (
      <div style={styles.cloudBannerSaved}>
        <span style={{ fontSize: '1rem' }}>☁️</span>
        <span style={{ color: '#34D399', fontSize: '0.8rem' }}>
          Данные сохраняются · {user.email}
        </span>
        <button onClick={onSignOut} style={styles.btnGlassSmall}>Выйти</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowAuthPanel(!showAuthPanel)}
      style={styles.cloudBannerGuest}
    >
      <span style={{ fontSize: '1rem' }}>☁️</span>
      <span style={{ color: '#64748B', fontSize: '0.8rem' }}>
        Войди — прогресс не потеряется
      </span>
      <span style={{ color: '#A78BFA', fontSize: '0.75rem' }}>{showAuthPanel ? '▲' : '▼'}</span>
    </button>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function CalendarWidget({ history }: { history: string[] }) {
  const today = new Date();
  const days: { iso: string; practiced: boolean; isToday: boolean; num: number; dow: number }[] = [];

  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({ iso, practiced: history.includes(iso), isToday: i === 0, num: d.getDate(), dow: d.getDay() });
  }

  const DOW_LABELS = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];

  return (
    <div>
      <p style={{ color: '#64748B', fontSize: '0.68rem', letterSpacing: '0.1em', marginBottom: '0.5rem', textAlign: 'left' }}>
        ПОСЛЕДНИЕ 28 ДНЕЙ
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '2px' }}>
        {DOW_LABELS.map(d => (
          <div key={d} style={{ textAlign: 'center', color: '#334155', fontSize: '0.55rem', padding: '0 0 2px' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {Array.from({ length: days[0].dow }).map((_, i) => <div key={`e${i}`} />)}
        {days.map(day => (
          <div key={day.iso} title={day.iso} style={{
            aspectRatio:  '1',
            borderRadius: '5px',
            background:   day.practiced ? 'linear-gradient(135deg, #7C3AED, #A78BFA)' : 'rgba(255,255,255,0.04)',
            border:       day.isToday ? '2px solid #FBBF24' : day.practiced ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.05)',
            display:      'flex', alignItems: 'center', justifyContent: 'center',
            fontSize:     '0.55rem',
            color:        day.practiced ? '#fff' : '#334155',
            fontWeight:   day.isToday ? 700 : 400,
            boxShadow:    day.practiced ? '0 0 5px rgba(167,139,250,0.35)' : 'none',
          }}>
            {day.num}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
        {[
          { bg: 'linear-gradient(135deg,#7C3AED,#A78BFA)', label: 'Практика' },
          { bg: 'transparent', border: '2px solid #FBBF24', label: 'Сегодня' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: l.bg, border: (l as any).border }} />
            <span style={{ color: '#475569', fontSize: '0.62rem' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatRelativeDate(iso: string): string {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d     = new Date(iso); d.setHours(0, 0, 0, 0);
  const diff  = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'сегодня';
  if (diff === 1) return 'вчера';
  if (diff < 7)  return `${diff} дня назад`;
  return iso;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const streakCardStyle: React.CSSProperties = {
  width: '100%', maxWidth: '380px',
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '1.5rem', padding: '1.25rem',
  marginBottom: '1.5rem',
};

const styles = {
  page: {
    minHeight: '100dvh',
    background: 'radial-gradient(ellipse at 30% 40%, rgba(96,165,250,0.07) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(251,191,36,0.05) 0%, transparent 50%), #030712',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem',
  } as React.CSSProperties,
  center: { textAlign: 'center' as const, maxWidth: '420px', width: '100%' },
  titleGold: {
    fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 700,
    background: 'linear-gradient(135deg, #FBBF24, #FCD34D, #F59E0B)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text', marginBottom: '0.75rem',
  } as React.CSSProperties,
  titleSacred: {
    fontFamily: 'Georgia, serif', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700,
    background: 'linear-gradient(135deg, #818CF8, #A78BFA, #60A5FA)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text', marginBottom: '0.5rem',
  } as React.CSSProperties,
  subtitle: { color: '#94A3B8', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' },
  quoteBox: {
    background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem',
    padding: '1.25rem 1.5rem', margin: '1.5rem auto', maxWidth: '400px',
  } as React.CSSProperties,
  quoteText:   { color: '#CBD5E1', fontStyle: 'italic', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '0.5rem' },
  quoteSource: { color: '#475569', fontSize: '0.8rem' },
  card: {
    background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
    borderRadius: '1.5rem', padding: '2rem 2.5rem', minWidth: '180px', textAlign: 'center' as const,
  },
  input: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,139,250,0.3)',
    borderRadius: '0.75rem', padding: '0.85rem 1.25rem', color: '#F1F5F9',
    fontSize: '1.1rem', textAlign: 'center' as const, width: '260px',
    outline: 'none', marginBottom: '1.5rem', fontFamily: 'Georgia, serif',
  } as React.CSSProperties,
  authInput: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,139,250,0.2)',
    borderRadius: '0.75rem', padding: '0.7rem 1rem', color: '#F1F5F9',
    fontSize: '0.9rem', width: '100%', outline: 'none',
    marginBottom: '0.75rem', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  authPanel: {
    width: '100%', maxWidth: '380px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(167,139,250,0.2)',
    borderRadius: '1.25rem', padding: '1.25rem',
    marginBottom: '1rem', textAlign: 'center' as const,
  } as React.CSSProperties,
  cloudBannerSaved: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.5rem', width: '100%', maxWidth: '380px',
    background: 'rgba(52,211,153,0.06)',
    border: '1px solid rgba(52,211,153,0.2)',
    borderRadius: '999px', padding: '0.5rem 1rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  cloudBannerGuest: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.5rem', width: '100%', maxWidth: '380px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '999px', padding: '0.5rem 1rem',
    marginBottom: '1rem', cursor: 'pointer',
  } as React.CSSProperties,
  btnGold: {
    background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', color: '#0a0a0a',
    fontWeight: 700, fontSize: '1rem', padding: '0.85rem 2.5rem',
    borderRadius: '999px', border: 'none', cursor: 'pointer',
    width: '100%', boxShadow: '0 0 20px rgba(251,191,36,0.3)', transition: 'all 0.2s ease',
  } as React.CSSProperties,
  btnGlass: {
    background: 'rgba(255,255,255,0.05)', color: '#94A3B8',
    fontWeight: 500, fontSize: '1rem', padding: '0.85rem 2.5rem',
    borderRadius: '999px', border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer', width: '100%', transition: 'all 0.2s ease',
  } as React.CSSProperties,
  btnGlassSmall: {
    background: 'rgba(255,255,255,0.05)', color: '#64748B',
    fontSize: '0.75rem', padding: '0.3rem 0.75rem',
    borderRadius: '999px', border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer', transition: 'all 0.2s ease',
  } as React.CSSProperties,
};