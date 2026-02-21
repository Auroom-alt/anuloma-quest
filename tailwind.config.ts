import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ida:     { 400: '#60A5FA', 500: '#3B82F6', 900: '#1E3A8A' },
        pingala: { 400: '#FBBF24', 500: '#F59E0B', 900: '#78350F' },
        lotus:   { 400: '#F472B6', 500: '#EC4899', 900: '#831843' },
        prana:   { 400: '#34D399', 500: '#10B981', 900: '#064E3B' },
        akasha:  { 400: '#818CF8', 500: '#6366F1', 900: '#1E1B4B' },
        saffron: { 400: '#FCD34D', 500: '#F59E0B', 900: '#78350F' },
      },
      fontFamily: {
        vedic: ['Georgia', 'serif'],
        body:  ['system-ui', 'sans-serif'],
      },
      animation: {
        'breathe':     'breathe 4s ease-in-out infinite',
        'float':       'float 6s ease-in-out infinite',
        'pulse-soft':  'pulseSoft 2s ease-in-out infinite',
        'glow-blue':   'glowBlue 2s ease-in-out infinite',
        'glow-gold':   'glowGold 2s ease-in-out infinite',
        'fade-in':     'fadeIn 1s ease forwards',
        'spin-slow':   'spin 25s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.07)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        glowBlue: {
          '0%, 100%': { boxShadow: '0 0 15px 3px rgba(96,165,250,0.3)' },
          '50%':      { boxShadow: '0 0 35px 12px rgba(96,165,250,0.7)' },
        },
        glowGold: {
          '0%, 100%': { boxShadow: '0 0 15px 3px rgba(251,191,36,0.3)' },
          '50%':      { boxShadow: '0 0 35px 12px rgba(251,191,36,0.7)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;