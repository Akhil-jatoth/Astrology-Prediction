import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        'accent-purple': 'var(--color-accent-purple)',
        'accent-blue': 'var(--color-accent-blue)',
        gold: 'var(--color-gold)',
        silver: {
          DEFAULT: 'var(--color-silver)',
          70: 'rgba(229, 231, 235, 0.7)',
          50: 'rgba(229, 231, 235, 0.5)',
        },
      },
      fontFamily: {
        display: ['var(--font-cinzel)', 'serif'],
        sans: ['var(--font-manrope)', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
        pill: '9999px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        '24': '96px',
      },
      boxShadow: {
        glow: '0 0 32px rgba(124, 58, 237, 0.25)',
        'glow-blue': '0 0 40px rgba(79, 157, 255, 0.3)',
      },
      backgroundImage: {
        'gradient-cosmic': 'var(--gradient-bg)',
      },
      animation: {
        'spin-slow': 'spin 120s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
