
import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Anuloma Quest — Путь дыхания',
  description: 'Медитативная игра-практика Анулома Виломы пранаямы',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#A78BFA" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Anuloma Quest" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <body>{children}</body>
    </html>
  );
}