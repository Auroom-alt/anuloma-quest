import type { Metadata, Viewport } from 'next';
import AuthInit from '@/components/AuthInit';
import './globals.css';

export const metadata: Metadata = {
  title:       'Anuloma Quest',
  description: 'Медитативное путешествие через 10 миров пранаямы',
  manifest:    '/manifest.json',
  appleWebApp: {
    capable:           true,
    statusBarStyle:    'black-translucent',
    title:             'Anuloma Quest',
  },
  icons: {
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  width:             'device-width',
  initialScale:      1,
  maximumScale:      1,
  themeColor:        '#030712',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AuthInit />
        {children}
        {/* Register service worker */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}} />
      </body>
    </html>
  );
}