'use client';

import { useAuth } from '@/hooks/useAuth';

/** Invisible component — mounts auth listener app-wide. Add to layout.tsx. */
export default function AuthInit() {
  useAuth(); // side-effect only
  return null;
}