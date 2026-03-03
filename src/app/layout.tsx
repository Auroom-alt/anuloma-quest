import type { Metadata, Viewport } from 'next';
import AuthInit from '@/components/AuthInit';
import './globals.css';

export const metadata: Metadata = {
  title:       'Anuloma Quest',
  description: 'Медитативное путешествие через 10 миров пранаямы',
};

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {/* Initialises Supabase auth listener — renders nothing */}
        <AuthInit />
        {children}
      </body>
    </html>
  );
}