import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F5A623',
        background: '#F4F5F7',
        content: '#FFFFFF',
        border: '#EEEEEE',
        heading: '#1A1A2E',
        body: '#555555',
        success: '#16A34A',
        warning: '#D97706',
        error: '#DC2626',
        info: '#2563EB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      width: {
        sidebar: '220px',
      },
    },
  },
  plugins: [],
};

export default config;
