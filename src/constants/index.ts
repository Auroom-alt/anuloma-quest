import type { BreathingCycle, Location } from '@/types';

export const BREATHING_CYCLES: BreathingCycle[] = [
  { inhale: 1,  hold: 4,  exhale: 2,  label: '1–4–2'   },
  { inhale: 2,  hold: 8,  exhale: 4,  label: '2–8–4'   },
  { inhale: 3,  hold: 12, exhale: 6,  label: '3–12–6'  },
  { inhale: 4,  hold: 16, exhale: 8,  label: '4–16–8'  },
  { inhale: 5,  hold: 20, exhale: 10, label: '5–20–10' },
  { inhale: 6,  hold: 24, exhale: 12, label: '6–24–12' },
  { inhale: 7,  hold: 28, exhale: 14, label: '7–28–14' },
  { inhale: 8,  hold: 32, exhale: 16, label: '8–32–16' },
  { inhale: 10, hold: 40, exhale: 20, label: '10–40–20'},
  { inhale: 12, hold: 48, exhale: 24, label: '12–48–24'},
  { inhale: 15, hold: 60, exhale: 30, label: '15–60–30'},
  { inhale: 20, hold: 80, exhale: 40, label: '20–80–40'},
];

export const LOCATIONS: Location[] = [
  { id: 1,  slug: 'city',           nameRu: 'Мегаполис',        emoji: '🌆', symbolRu: 'Начало пути. Ум в шуме мира.',           bgFrom: '#78350F', bgTo: '#1C0A00', quote: 'Когда ум успокоен — дыхание становится учителем.',       quoteSource: 'Хатха-йога Прадипика' },
  { id: 2,  slug: 'forest',         nameRu: 'Лес',              emoji: '🌲', symbolRu: 'Очищение. Возвращение к природе.',        bgFrom: '#064E3B', bgTo: '#022C22', quote: 'Прана — жизненная сила, пронизывающая всё сущее.',         quoteSource: 'Прашна Упанишада'     },
  { id: 3,  slug: 'japanese',       nameRu: 'Японский сад',     emoji: '🏯', symbolRu: 'Порядок. Внутренний баланс.',             bgFrom: '#134E4A', bgTo: '#042F2E', quote: 'Контроль над праной — это контроль над умом.',            quoteSource: 'Шива Свародайя'       },
  { id: 4,  slug: 'ocean',          nameRu: 'Берег океана',     emoji: '🌊', symbolRu: 'Сила дыхания как прилив и отлив.',        bgFrom: '#1E3A8A', bgTo: '#0C1445', quote: 'Следуй природе дыхания — это и есть путь.',               quoteSource: 'Йога-сутры Патанджали'},
  { id: 5,  slug: 'forest-path',    nameRu: 'Лесная тропинка', emoji: '🌿', symbolRu: 'Осознанный путь, шаг за шагом.',          bgFrom: '#3F6212', bgTo: '#1A2E05', quote: 'Дыхание — мост между телом и душой.',                     quoteSource: 'Гхеранда Самхита'     },
  { id: 6,  slug: 'riverside',      nameRu: 'Беседка у реки',   emoji: '🏞️', symbolRu: 'Покой. Равновесие противоположностей.',  bgFrom: '#3730A3', bgTo: '#1E1B4B', quote: 'В тишине между вдохом и выдохом — бесконечность.',        quoteSource: 'Вигьяна Бхайрава'     },
  { id: 7,  slug: 'spring',         nameRu: 'Весенний лес',     emoji: '🌸', symbolRu: 'Возрождение. Пробуждение.',               bgFrom: '#9D174D', bgTo: '#4A0022', quote: 'Как цветок раскрывается на рассвете — так ум в пранаяме.', quoteSource: 'Бхагавад Гита 4.29'   },
  { id: 8,  slug: 'meadow',         nameRu: 'Цветочная поляна', emoji: '🌼', symbolRu: 'Радость. Дыхание сердца.',                bgFrom: '#92400E', bgTo: '#3D1A00', quote: 'Через левую ноздрю течёт Ида — лунная нади.',              quoteSource: 'Хатха-йога Прадипика' },
  { id: 9,  slug: 'hilltop',        nameRu: 'Вершина холма',    emoji: '🪷', symbolRu: 'Осознанность. Чистое присутствие.',       bgFrom: '#581C87', bgTo: '#2D0060', quote: 'Через правую ноздрю течёт Пингала — солнечная нади.',     quoteSource: 'Хатха-йога Прадипика' },
  { id: 10, slug: 'mountain',       nameRu: 'Вершина горы',     emoji: '🏔️', symbolRu: 'Освобождение. Единство с бесконечным.',  bgFrom: '#0F172A', bgTo: '#020617', quote: 'Когда прана в сушумне — достигается самадхи.',            quoteSource: 'Хатха-йога Прадипика 4.18' },
];

export const CYCLES_PER_ROUND = 6;
export const ROUND_PAUSE_SECONDS = 10;
export const DEFAULT_ROUNDS = 10;
export const DEFAULT_CYCLE_INDEX = 5; // 6-24-12

export function calcTotalSeconds(cycle: BreathingCycle, rounds: number): number {
  const cycleSeconds = (cycle.inhale + cycle.hold + cycle.exhale) * 2;
  return cycleSeconds * CYCLES_PER_ROUND * rounds;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}ч ${m}м`;
  if (m > 0) return `${m}м ${s}с`;
  return `${s}с`;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getPhasesForCycle(cycle: BreathingCycle) {
  return [
    { phase: 'inhale-left'  as const, duration: cycle.inhale, labelRu: 'Вдох левой',  nostril: 'left'  as const, type: 'inhale' as const },
    { phase: 'hold-1'       as const, duration: cycle.hold,   labelRu: 'Задержка',     nostril: 'both'  as const, type: 'hold'   as const },
    { phase: 'exhale-right' as const, duration: cycle.exhale, labelRu: 'Выдох правой', nostril: 'right' as const, type: 'exhale' as const },
    { phase: 'inhale-right' as const, duration: cycle.inhale, labelRu: 'Вдох правой',  nostril: 'right' as const, type: 'inhale' as const },
    { phase: 'hold-2'       as const, duration: cycle.hold,   labelRu: 'Задержка',     nostril: 'both'  as const, type: 'hold'   as const },
    { phase: 'exhale-left'  as const, duration: cycle.exhale, labelRu: 'Выдох левой',  nostril: 'left'  as const, type: 'exhale' as const },
  ];
}