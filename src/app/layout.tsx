/* ═══════════════════════════════════════════════════════════
   Anuloma Quest — src/app/layout.tsx
   Корневой layout. AnimatePresence здесь — exit-анимации
   PageTransition работают на всех страницах.
═══════════════════════════════════════════════════════════ */

import type { Metadata, Viewport } from 'next';
import './globals.css';
import AnimatePresenceProvider from '@/components/AnimatePresenceProvider';

/* ─── SEO / PWA метаданные ──────────────────────────────── */
export const metadata: Metadata = {
  title:       'Anuloma Quest — Путь дыхания',
  description: 'Медитативная игра-практика Анулома Виломы пранаямы. Дыши. Расти. Открывай миры.',
  manifest:    '/manifest.json',
  keywords:    ['пранаяма', 'медитация', 'анулома вилома', 'дыхание', 'йога'],

  openGraph: {
    title:       'Anuloma Quest — Путь дыхания',
    description: 'Медитативная игра-практика пранаямы',
    type:        'website',
    locale:      'ru_RU',
  },

  appleWebApp: {
    capable:        true,
    statusBarStyle: 'black-translucent',
    title:          'Anuloma Quest',
  },

  icons: {
    icon:  '/favicon.ico',
    apple: '/icon-192.png',
  },
};

/* ─── Viewport — только здесь ───────────────────────────── */
export const viewport: Viewport = {
  width:        'device-width',
  initialScale:  1,
  maximumScale:  1,
  userScalable:  false,
  themeColor:   '#A78BFA',
};

/* ─── Root Layout ───────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <meta name="theme-color" content="#A78BFA" />
        <meta name="apple-mobile-web-app-capable"           content="yes"               />
        <meta name="apple-mobile-web-app-status-bar-style"  content="black-translucent" />
        <meta name="apple-mobile-web-app-title"             content="Anuloma Quest"     />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        {/* AnimatePresence — клиентский провайдер для exit-анимаций */}
        <AnimatePresenceProvider>
          {children}
        </AnimatePresenceProvider>
      </body>
    </html>
  );
}
