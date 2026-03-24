import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        space: {
          black: '#0a0a0f',
          dark: '#0d0d14',
          card: '#12121c',
          border: '#1a1a2e',
          muted: '#888888',
        },
        cyan: {
          accent: '#00D4FF',
          soft: '#80DEEA',
        },
        gold: {
          accent: '#FFD54F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'space-gradient': 'radial-gradient(ellipse at 20% 50%, rgba(0, 212, 255, 0.03) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255, 213, 79, 0.02) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
};

export default config;
