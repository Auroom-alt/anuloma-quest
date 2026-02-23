/* ═══════════════════════════════════════════════════════════
   Anuloma Quest — src/app/about/page.tsx
   Исправлено: PageTransition добавлен, цитата внизу
   (#1E293B → видимая), подпись к фото (#334155 → #64748B).
═══════════════════════════════════════════════════════════ */

'use client';

import { useState }        from 'react';
import { useRouter }       from 'next/navigation';
import { motion }          from 'framer-motion';
import PageTransition      from '@/components/PageTransition';

const sections = [
  {
    id: 'what',
    emoji: '🕉️',
    title: 'Что такое Анулома Вилома',
    content: [
      'Анулома Вилома — древняя йогическая практика попеременного дыхания через ноздри. В переводе с санскрита «анулома» означает «по направлению», «вилома» — «против направления».',
      'Это одна из самых важных техник пранаямы — управления жизненной силой праной. Практика балансирует два энергетических канала: Иду (лунный, левая ноздря) и Пингалу (солнечный, правая ноздря).',
      'Когда оба канала уравновешены, прана течёт через центральный канал Сушумну — и ум достигает состояния глубокого покоя.',
    ],
  },
  {
    id: 'benefits',
    emoji: '✨',
    title: 'Польза практики',
    content: [
      '🧠 Успокаивает нервную систему и снижает уровень кортизола — гормона стресса',
      '🫁 Улучшает функцию лёгких, увеличивает объём дыхания',
      '❤️ Нормализует артериальное давление и сердечный ритм',
      '💤 Помогает при бессоннице — практика перед сном углубляет отдых',
      '🎯 Развивает концентрацию и ясность ума',
      '⚡ Повышает жизненную энергию при утренней практике',
      '🔄 Синхронизирует работу левого и правого полушарий мозга',
    ],
  },
  {
    id: 'technique',
    emoji: '🤚',
    title: 'Техника выполнения',
    image: '/images/vishnu-mudra.jpg',
    content: [
      'Для практики используется Вишну Мудра — специальное положение правой руки. Указательный и средний пальцы сложены к ладони. Большой палец закрывает правую ноздрю, безымянный и мизинец — левую.',
      'Сядь удобно — в позу лотоса, полулотоса или просто со скрещенными ногами. Спина прямая, плечи расслаблены. Левая рука лежит на колене в Джняна Мудре (большой и указательный пальцы соединены).',
    ],
    steps: [
      { num: '1', text: 'Закрой правую ноздрю большим пальцем. Медленно вдохни через левую ноздрю.' },
      { num: '2', text: 'Закрой обе ноздри. Задержи дыхание.' },
      { num: '3', text: 'Открой правую ноздрю. Медленно выдохни через правую.' },
      { num: '4', text: 'Вдохни через правую ноздрю. Задержи дыхание.' },
      { num: '5', text: 'Открой левую ноздрю. Медленно выдохни через левую.' },
      { num: '6', text: 'Это один полный цикл. Повтори.' },
    ],
  },
  {
    id: 'ratio',
    emoji: '⏱️',
    title: 'Соотношение вдох–задержка–выдох',
    content: [
      'Классическое соотношение — 1:4:2. Если вдох 4 секунды, задержка 16 секунд, выдох 8 секунд. Это соотношение активирует парасимпатическую нервную систему и вводит ум в медитативное состояние.',
      'Начинающим рекомендуется соотношение 1:2:2 или 1:1:1 без задержки. Увеличивай длительность постепенно — только когда текущий уровень даётся легко и без напряжения.',
      '⚠️ Никогда не практикуй через силу. Дыхание должно быть плавным, тихим и без напряжения лица.',
    ],
  },
  {
    id: 'when',
    emoji: '🌅',
    title: 'Когда и как практиковать',
    content: [
      '🌄 Лучшее время — раннее утро на пустой желудок. Практика в Брахма Мухурту (за 1.5 часа до рассвета) считается особенно благоприятной.',
      '🌙 Вечерняя практика успокаивает ум перед сном. Избегай практики сразу после еды — подожди минимум 2–3 часа.',
      '🪑 Практикуй в тихом, проветренном месте. Можно использовать коврик для йоги.',
      '📅 Регулярность важнее длительности. 10 минут каждый день лучше, чем час раз в неделю.',
    ],
  },
];

export default function AboutPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('what');

  return (
    <PageTransition>
      <main style={styles.page}>

        {/* Шапка */}
        <div style={styles.header}>
          <button onClick={() => router.back()} style={styles.backBtn}>← Назад</button>
          <h1 style={styles.title}>О практике</h1>
          <p style={styles.subtitle}>Анулома Вилома Пранаяма</p>
        </div>

        {/* Навигация */}
        <div style={styles.navRow}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                ...styles.navBtn,
                background:   activeSection === s.id ? 'rgba(167,139,250,0.15)' : 'transparent',
                border:       `1px solid ${activeSection === s.id ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.06)'}`,
                color:        activeSection === s.id ? '#A78BFA' : '#64748B',
              }}
            >
              {s.emoji}
            </button>
          ))}
        </div>

        {/* Контент раздела */}
        {sections.map(s => s.id === activeSection && (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={styles.card}
          >
            <h2 style={styles.sectionTitle}>{s.emoji} {s.title}</h2>

            {/* Изображение Вишну Мудры */}
            {'image' in s && (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <img
                  src={s.image}
                  alt="Вишну Мудра — положение руки при практике Анулома Виломы"
                  style={{
                    maxWidth:     '280px',
                    width:        '100%',
                    borderRadius: '1rem',
                    filter:       'sepia(0.3) brightness(0.9)',
                    border:       '1px solid rgba(255,255,255,0.08)',
                  }}
                />
                {/* ИСПРАВЛЕНО: #334155 → #64748B */}
                <p style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  Вишну Мудра — положение руки при практике
                </p>
              </div>
            )}

            {/* Параграфы */}
            {s.content.map((para, i) => (
              <p key={i} style={styles.para}>{para}</p>
            ))}

            {/* Шаги */}
            {'steps' in s && (
              <div style={{ marginTop: '1.25rem' }}>
                <p style={{ color: '#64748B', fontSize: '0.78rem', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
                  ПОСЛЕДОВАТЕЛЬНОСТЬ
                </p>
                {s.steps?.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0  }}
                    transition={{ delay: i * 0.07 }}
                    style={styles.step}
                  >
                    <div style={styles.stepNum}>{step.num}</div>
                    <p style={styles.stepText}>{step.text}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ))}

        {/* Кнопка начать */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/setup')}
          style={styles.startBtn}
        >
          🌬️ Начать практику
        </motion.button>

        {/* Цитата — ИСПРАВЛЕНО: #1E293B → #94A3B8 */}
        <div style={styles.quoteBox}>
          <p style={styles.quoteText}>
            «Когда прана в сушумне — достигается самадхи»
          </p>
          <p style={styles.quoteSource}>— Хатха-йога Прадипика</p>
        </div>

      </main>
    </PageTransition>
  );
}

/* ─── STYLES ────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight:      '100dvh',
    background:     'radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.08) 0%, transparent 60%), #030712',
    display:        'flex',
    flexDirection:  'column' as const,
    alignItems:     'center',
    padding:        '0 1rem 3rem',
  },

  header: {
    width:         '100%',
    maxWidth:      '520px',
    paddingTop:    '1.5rem',
    marginBottom:  '1.5rem',
    textAlign:     'center' as const,
  },

  backBtn: {
    background:   'none',
    border:       'none',
    color:        '#64748B',
    cursor:       'pointer',
    fontSize:     '0.9rem',
    display:      'block',
    marginBottom: '1rem',
    padding:      '0.5rem 0',
  } as React.CSSProperties,

  title: {
    fontFamily:           'Georgia, serif',
    fontSize:             'clamp(1.6rem, 4vw, 2.2rem)',
    background:           'linear-gradient(135deg, #818CF8, #A78BFA)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor:  'transparent',
    backgroundClip:       'text',
    marginBottom:         '0.3rem',
  } as React.CSSProperties,

  subtitle: {
    color:     '#64748B',
    fontSize:  '0.9rem',
    fontStyle: 'italic',
  },

  navRow: {
    display:        'flex',
    gap:            '0.5rem',
    marginBottom:   '1.25rem',
    flexWrap:       'wrap' as const,
    justifyContent: 'center',
  },

  navBtn: {
    borderRadius: '0.75rem',
    padding:      '0.5rem 0.85rem',
    fontSize:     '1.2rem',
    cursor:       'pointer',
    transition:   'all 0.2s',
    minHeight:    '44px',
  } as React.CSSProperties,

  card: {
    width:        '100%',
    maxWidth:     '520px',
    background:   'rgba(255,255,255,0.03)',
    border:       '1px solid rgba(255,255,255,0.07)',
    borderRadius: '1.5rem',
    padding:      'clamp(1.25rem, 4vw, 2rem)',
    marginBottom: '1.25rem',
  } as React.CSSProperties,

  sectionTitle: {
    fontFamily:   'Georgia, serif',
    fontSize:     '1.25rem',
    color:        '#A78BFA',
    marginBottom: '1.25rem',
    fontWeight:   600,
  },

  para: {
    color:        '#94A3B8',
    fontSize:     '0.9rem',
    lineHeight:   1.8,
    marginBottom: '0.85rem',
  },

  step: {
    display:      'flex',
    gap:          '0.75rem',
    alignItems:   'flex-start',
    marginBottom: '0.75rem',
    background:   'rgba(255,255,255,0.03)',
    borderRadius: '0.75rem',
    padding:      '0.6rem 0.85rem',
    border:       '1px solid rgba(255,255,255,0.05)',
  } as React.CSSProperties,

  stepNum: {
    minWidth:       '24px',
    height:         '24px',
    background:     'rgba(167,139,250,0.15)',
    border:         '1px solid rgba(167,139,250,0.3)',
    borderRadius:   '50%',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    color:          '#A78BFA',
    fontSize:       '0.75rem',
    fontWeight:     700,
    flexShrink:     0,
  } as React.CSSProperties,

  stepText: {
    color:     '#94A3B8',
    fontSize:  '0.85rem',
    lineHeight: 1.6,
  },

  startBtn: {
    background:   'linear-gradient(135deg, #F59E0B, #FBBF24)',
    color:        '#0a0a0a',
    fontWeight:   700,
    fontSize:     '1rem',
    padding:      '0.9rem 2.5rem',
    borderRadius: '999px',
    border:       'none',
    cursor:       'pointer',
    width:        '100%',
    maxWidth:     '320px',
    marginBottom: '1.5rem',
    boxShadow:    '0 0 20px 4px rgba(251,191,36,0.2)',
  } as React.CSSProperties,

  /* Цитата внизу страницы */
  quoteBox: {
    textAlign:    'center' as const,
    marginBottom: '2rem',
    padding:      '1rem 1.5rem',
    borderTop:    '1px solid rgba(255,255,255,0.05)',
    maxWidth:     '400px',
  },

  /* ИСПРАВЛЕНО: было #1E293B — невидимый на тёмном фоне */
  quoteText: {
    color:        '#94A3B8',
    fontStyle:    'italic',
    fontSize:     '0.85rem',
    lineHeight:   1.7,
    marginBottom: '0.35rem',
  },

  /* ИСПРАВЛЕНО: добавлен источник как отдельный элемент */
  quoteSource: {
    color:    '#64748B',
    fontSize: '0.75rem',
  },
};
