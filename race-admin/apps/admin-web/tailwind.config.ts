import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--primary-rgb) / <alpha-value>)',
        'primary-dark': 'var(--primary-dark)',
        background: 'var(--background)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        heading: 'var(--heading)',
        body: 'var(--body)',
        muted: 'var(--muted)',
        success: 'rgb(var(--success-rgb) / <alpha-value>)',
        warning: 'rgb(var(--warning-rgb) / <alpha-value>)',
        error: 'rgb(var(--error-rgb) / <alpha-value>)',
        info: 'rgb(var(--info-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      width: {
        sidebar: '260px',
        'sidebar-collapsed': '80px',
      },
      spacing: {
        sidebar: '260px',
        'sidebar-collapsed': '80px',
      },
      padding: {
        sidebar: '260px',
        'sidebar-collapsed': '80px',
      },
      maxWidth: {
        content: '1440px',
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.08)',
        header: '0 1px 0 rgba(0, 0, 0, 0.06)',
      },
      transitionDuration: {
        sidebar: '250ms',
      },
    },
  },
  plugins: [],
};

export default config;
