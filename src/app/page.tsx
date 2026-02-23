/* ═══════════════════════════════════════════════════════════
   Anuloma Quest — src/app/page.tsx
   Исправлено:
   · alt у иконки настроек → простое "настройки"
   · Кнопка настроек — добавлен текст "⚙️ Настройки"
   · #334155 везде → читаемые цвета
   · minHeight 100dvh
   · Кнопка "Начать заново" — цвет исправлен
═══════════════════════════════════════════════════════════ */

'use client';

import { useState }           from 'react';
import type { CharacterGender } from '@/types';
import { useProfileStore }    from '@/store';
import { useRouter }          from 'next/navigation';

export default function Home() {
  const [screen,   setScreen]   = useState<'welcome' | 'character' | 'name'>('welcome');
  const [selected, setSelected] = useState<CharacterGender | null>(null);
  const [heroName, setHeroName] = useState('');
  const { createProfile, profile } = useProfileStore();

  if (profile) {
    return <MainMenu heroName={profile.heroName} character={profile.character} />;
  }

  if (screen === 'welcome') {
    return <WelcomeScreen onContinue={() => setScreen('character')} />;
  }

  if (screen === 'character') {
    return (
      <CharacterScreen
        selected={selected}
        onSelect={(g) => { setSelected(g); setScreen('name'); }}
      />
    );
  }

  return (
    <NameScreen
      character={selected!}
      heroName={heroName}
      onChange={setHeroName}
      onStart={() => {
        if (heroName.trim()) createProfile(heroName.trim(), selected!);
      }}
    />
  );
}

/* ─── WELCOME ───────────────────────────────────────────── */
function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <main style={styles.page}>
      <div style={styles.center}>

        <div style={{
          fontSize:   '5rem',
          animation:  'spin 25s linear infinite',
          display:    'inline-block',
          marginBottom: '1.5rem',
        }}>
          🕉️
        </div>

        <h1 style={styles.titleGold}>Anuloma Quest</h1>

        <p style={styles.subtitle}>
          Путь дыхания.<br />
          <span style={{ color: '#64748B', fontSize: '0.95rem' }}>
            Медитативное путешествие через 10 миров.
          </span>
        </p>

        <div style={styles.quoteBox}>
          <p style={styles.quoteText}>
            «Ты стоишь на пороге внутреннего Пути.<br />
            Твоё дыхание — мост между мирами.»
          </p>
          <p style={styles.quoteSource}>— Хатха-йога Прадипика</p>
        </div>

        <button style={styles.btnGold} onClick={onContinue}>
          Начать путь →
        </button>

      </div>
    </main>
  );
}

/* ─── CHARACTER SELECT ──────────────────────────────────── */
function CharacterScreen({ selected, onSelect }: {
  selected: CharacterGender | null;
  onSelect: (g: CharacterGender) => void;
}) {
  return (
    <main style={styles.page}>
      <div style={styles.center}>

        <p style={{ color: '#64748B', letterSpacing: '0.2em', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          ШАГ 1 ИЗ 2
        </p>
        <h2 style={styles.titleSacred}>Выбери своего героя</h2>
        <p style={{ color: '#64748B', marginBottom: '2.5rem' }}>
          Кто отправится в путешествие дыхания?
        </p>

        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <CharacterCard
            gender="male"
            name="Арья"
            desc="Воин духа"
            emoji="🧘"
            selected={selected === 'male'}
            glowColor="rgba(96,165,250,0.6)"
            onClick={() => onSelect('male')}
          />
          <CharacterCard
            gender="female"
            name="Лила"
            desc="Дочь света"
            emoji="🧘‍♀️"
            selected={selected === 'female'}
            glowColor="rgba(251,191,36,0.6)"
            onClick={() => onSelect('female')}
          />
        </div>

        {/* ИСПРАВЛЕНО: #334155 → #64748B */}
        <p style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '2rem' }}>
          Оба персонажа проходят одинаковый путь дыхания
        </p>

      </div>
    </main>
  );
}

function CharacterCard({ name, desc, emoji, selected, glowColor, onClick }: {
  gender:    CharacterGender;
  name:      string;
  desc:      string;
  emoji:     string;
  selected:  boolean;
  glowColor: string;
  onClick:   () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        ...styles.card,
        border:     selected ? `2px solid ${glowColor}` : '2px solid rgba(255,255,255,0.07)',
        boxShadow:  selected ? `0 0 30px 8px ${glowColor}` : 'none',
        transform:  selected ? 'scale(1.04)' : 'scale(1)',
        cursor:     'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{
        fontSize:    '5rem',
        marginBottom: '1rem',
        animation:   'breathe 4s ease-in-out infinite',
        display:     'inline-block',
      }}>
        {emoji}
      </div>
      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#F1F5F9', marginBottom: '0.25rem' }}>
        {name}
      </h3>
      <p style={{ color: '#64748B', fontSize: '0.9rem' }}>{desc}</p>
      {selected && (
        <div style={{ marginTop: '1rem', color: glowColor, fontSize: '0.85rem' }}>✦ Выбран</div>
      )}
    </div>
  );
}

/* ─── NAME INPUT ────────────────────────────────────────── */
function NameScreen({ character, heroName, onChange, onStart }: {
  character: CharacterGender;
  heroName:  string;
  onChange:  (v: string) => void;
  onStart:   () => void;
}) {
  const emoji       = character === 'male' ? '🧘' : '🧘‍♀️';
  const defaultName = character === 'male' ? 'Арья' : 'Лила';

  return (
    <main style={styles.page}>
      <div style={styles.center}>

        <p style={{ color: '#64748B', letterSpacing: '0.2em', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          ШАГ 2 ИЗ 2
        </p>

        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{emoji}</div>

        <h2 style={styles.titleSacred}>Как зовут героя?</h2>

        <p style={{ color: '#64748B', marginBottom: '2rem' }}>
          Это имя будет сопровождать тебя в пути
        </p>

        <input
          type="text"
          placeholder={defaultName}
          value={heroName}
          onChange={(e) => onChange(e.target.value)}
          maxLength={20}
          style={styles.input}
          onKeyDown={(e) => e.key === 'Enter' && heroName.trim() && onStart()}
        />

        <div style={styles.quoteBox}>
          <p style={styles.quoteText}>
            «Пусть дыхание станет твоим учителем.<br />
            Каждый вдох — шаг вперёд.»
          </p>
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

/* ─── MAIN MENU ─────────────────────────────────────────── */
function MainMenu({ heroName, character }: { heroName: string; character: CharacterGender }) {
  const { reset } = useProfileStore();
  const router    = useRouter();
  const emoji     = character === 'male' ? '🧘' : '🧘‍♀️';

  return (
    <main style={styles.page}>
      <div style={styles.center}>

        <div style={{
          fontSize:     '4rem',
          marginBottom: '1rem',
          animation:    'breathe 4s ease-in-out infinite',
          display:      'inline-block',
        }}>
          {emoji}
        </div>

        <h1 style={styles.titleGold}>Anuloma Quest</h1>

        <p style={{ color: '#94A3B8', marginBottom: '2.5rem' }}>
          С возвращением,{' '}
          <span style={{ color: '#FBBF24', fontFamily: 'Georgia, serif' }}>{heroName}</span>
        </p>

        <div style={{
          display:       'flex',
          flexDirection: 'column',
          gap:           '0.75rem',
          width:         '260px',
          margin:        '0 auto',
        }}>
          <button style={styles.btnGold} onClick={() => router.push('/setup')}>
            🌬️ Начать практику
          </button>

          <button style={styles.btnGlass} onClick={() => router.push('/map')}>
            🗺️ Карта пути
          </button>

          {/* ИСПРАВЛЕНО: alt → "настройки", добавлен текст кнопки */}
          <button style={styles.btnGlass} onClick={() => router.push('/settings')}>
            ⚙️ Настройки
          </button>

          <button
            onClick={() => router.push('/about')}
            style={styles.btnGlass}
          >
            ℹ️ О практике
          </button>
        </div>

        {/* ИСПРАВЛЕНО: #334155 → #475569 */}
        <button
          onClick={reset}
          style={{
            marginTop:  '1.5rem',
            color:      '#475569',
            fontSize:   '0.8rem',
            background: 'none',
            border:     'none',
            cursor:     'pointer',
            transition: 'color 0.2s',
          }}
        >
          Начать заново
        </button>

      </div>
    </main>
  );
}

/* ─── STYLES ────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight:      '100dvh',
    background:     `
      radial-gradient(ellipse at 30% 40%, rgba(96,165,250,0.07)  0%, transparent 50%),
      radial-gradient(ellipse at 70% 60%, rgba(251,191,36,0.05)  0%, transparent 50%),
      #030712
    `,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '2rem',
  } as React.CSSProperties,

  center: {
    textAlign: 'center' as const,
    maxWidth:  '600px',
    width:     '100%',
    animation: 'fadeIn 1s ease forwards',
  },

  titleGold: {
    fontFamily:           'Georgia, serif',
    fontSize:             'clamp(2rem, 5vw, 3.5rem)',
    fontWeight:           700,
    letterSpacing:        '0.1em',
    background:           'linear-gradient(135deg, #FBBF24, #FCD34D, #F59E0B)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor:  'transparent',
    backgroundClip:       'text',
    marginBottom:         '1rem',
  } as React.CSSProperties,

  titleSacred: {
    fontFamily:           'Georgia, serif',
    fontSize:             'clamp(1.5rem, 4vw, 2.5rem)',
    fontWeight:           700,
    background:           'linear-gradient(135deg, #818CF8, #A78BFA, #60A5FA)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor:  'transparent',
    backgroundClip:       'text',
    marginBottom:         '0.5rem',
  } as React.CSSProperties,

  subtitle: {
    color:        '#94A3B8',
    fontSize:     '1.1rem',
    lineHeight:   1.7,
    marginBottom: '2rem',
  },

  quoteBox: {
    background:    'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    border:        '1px solid rgba(255,255,255,0.08)',
    borderRadius:  '1rem',
    padding:       '1.25rem 1.5rem',
    margin:        '1.5rem auto',
    maxWidth:      '400px',
  } as React.CSSProperties,

  quoteText: {
    color:        '#CBD5E1',
    fontStyle:    'italic',
    lineHeight:   1.7,
    fontSize:     '0.95rem',
    marginBottom: '0.5rem',
  },

  quoteSource: {
    color:    '#475569',
    fontSize: '0.8rem',
  },

  card: {
    background:    'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    borderRadius:  '1.5rem',
    padding:       '2rem 2.5rem',
    minWidth:      '180px',
    textAlign:     'center' as const,
  },

  input: {
    background:   'rgba(255,255,255,0.05)',
    border:       '1px solid rgba(167,139,250,0.3)',
    borderRadius: '0.75rem',
    padding:      '0.85rem 1.25rem',
    color:        '#F1F5F9',
    fontSize:     '1.1rem',
    textAlign:    'center' as const,
    width:        '260px',
    outline:      'none',
    marginBottom: '1.5rem',
    fontFamily:   'Georgia, serif',
  } as React.CSSProperties,

  btnGold: {
    background:    'linear-gradient(135deg, #F59E0B, #FBBF24)',
    color:         '#0a0a0a',
    fontWeight:    700,
    fontSize:      '1rem',
    padding:       '0.85rem 2.5rem',
    borderRadius:  '999px',
    border:        'none',
    cursor:        'pointer',
    letterSpacing: '0.05em',
    width:         '100%',
    boxShadow:     '0 0 20px rgba(251,191,36,0.3)',
    transition:    'all 0.2s ease',
  } as React.CSSProperties,

  btnGlass: {
    background:  'rgba(255,255,255,0.05)',
    color:       '#94A3B8',
    fontWeight:  500,
    fontSize:    '1rem',
    padding:     '0.85rem 2.5rem',
    borderRadius: '999px',
    border:      '1px solid rgba(255,255,255,0.08)',
    cursor:      'pointer',
    width:       '100%',
    transition:  'all 0.2s ease',
  } as React.CSSProperties,
};
