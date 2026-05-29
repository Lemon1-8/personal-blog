import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#faf7f2',
          100: '#f5f0e8',
          200: '#ebe3d5',
          300: '#d4c9b5',
          400: '#b8a890',
          500: '#8c7b67',
          600: '#6b5e53',
          700: '#4a3f37',
          800: '#2d2522',
          900: '#1a1714',
        },
        vermilion: {
          50: '#fef7f5',
          100: '#fce9e4',
          200: '#f8d0c7',
          300: '#f0a99a',
          400: '#e6785e',
          500: '#d45333',
          600: '#b83a20',
          700: '#a83232',
          800: '#8b2626',
          900: '#6e1e1e',
        },
        amber: {
          50: '#fdfaf3',
          100: '#faf0db',
          200: '#f2dfa8',
          300: '#e6c76a',
          400: '#c4a35a',
          500: '#a8853a',
          600: '#8b6b2c',
          700: '#6b5022',
          800: '#4d3818',
          900: '#332410',
        },
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.015em' }],
        'h1': ['1.75rem', { lineHeight: '1.3', fontWeight: '700', letterSpacing: '-0.01em' }],
        'h2': ['1.375rem', { lineHeight: '1.35', fontWeight: '600' }],
        'h3': ['1.125rem', { lineHeight: '1.45', fontWeight: '600' }],
        'h4': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body': ['0.938rem', { lineHeight: '1.8' }],
        'body-lg': ['1.063rem', { lineHeight: '1.75' }],
        'body-sm': ['0.813rem', { lineHeight: '1.65' }],
        'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
      },
      maxWidth: {
        content: '680px',
        page: '1120px',
        narrow: '520px',
      },
      fontFamily: {
        serif: [
          'Noto Serif SC',
          'Source Han Serif SC',
          'STSong',
          'SimSun',
          'Georgia',
          'serif',
        ],
        sans: [
          'DM Sans',
          'system-ui',
          '-apple-system',
          'PingFang SC',
          'Noto Sans SC',
          'Microsoft YaHei',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(26, 23, 20, 0.04), 0 1px 2px rgba(26, 23, 20, 0.06)',
        'card-hover': '0 4px 12px rgba(26, 23, 20, 0.06), 0 1px 4px rgba(26, 23, 20, 0.08)',
        'float': '0 8px 24px rgba(26, 23, 20, 0.08), 0 2px 8px rgba(26, 23, 20, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'reveal': 'reveal 0.7s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
