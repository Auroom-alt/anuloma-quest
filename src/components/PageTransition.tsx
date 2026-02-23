/* ═══════════════════════════════════════════════════════════
   Anuloma Quest — src/components/PageTransition.tsx
   Обёртка для плавных переходов между страницами.
   AnimatePresence вынесен в layout, здесь только motion.div.
═══════════════════════════════════════════════════════════ */

'use client';

import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  /** Задержка появления — полезно для вложенных экранов */
  delay?: number;
}

export default function PageTransition({
  children,
  delay = 0,
}: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0  }}
      exit={{    opacity: 0, y: -12 }}
      transition={{
        duration: 0.4,
        ease:     [0.25, 0.46, 0.45, 0.94], /* easeOutQuart — плавнее easeOut */
        delay,
      }}
      style={{ minHeight: '100dvh' }}
    >
      {children}
    </motion.div>
  );
}
