/* ═══════════════════════════════════════════════════════════
   Anuloma Quest — src/components/AnimatePresenceProvider.tsx

   Тонкая клиентская обёртка для AnimatePresence.
   Layout — серверный компонент, поэтому AnimatePresence
   нельзя использовать там напрямую. Выносим сюда.
═══════════════════════════════════════════════════════════ */

'use client';

import { AnimatePresence } from 'framer-motion';

export default function AnimatePresenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
}
