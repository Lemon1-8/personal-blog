import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A5F',
        },
      },
      fontSize: {
        h1: ['2rem', { lineHeight: '1.4', fontWeight: '700' }],
        h2: ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        h3: ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
        h4: ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }],
        body: ['0.938rem', { lineHeight: '1.75' }],
        'body-lg': ['1rem', { lineHeight: '1.75' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
      },
      maxWidth: {
        content: '720px',
        page: '1200px',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Noto Sans SC',
          'PingFang SC',
          'Microsoft YaHei',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
