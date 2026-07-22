import type { Config } from 'tailwindcss'

// Design tokens — see DESIGN.md for the reasoning behind these choices.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral base — near-black-blue for the gov dashboard (data-dense, focused),
        // used at lower opacity/inverted for the citizen app (simpler, airier).
        ink: {
          950: '#070B12',
          900: '#0B1220',
          800: '#121B2C',
          700: '#1C2A40',
          600: '#2C405C'
        },
        mist: {
          50: '#F7F9FB',
          100: '#EEF2F6',
          200: '#DCE4EC'
        },
        // Safety / low risk — cool blue-teal. Reused for cooling center markers.
        safe: {
          light: '#5EEAD4',
          DEFAULT: '#2DD4BF',
          dark: '#0EA5A0'
        },
        // Risk gradient — low to high. Kept intuitive: green -> yellow -> orange -> red.
        risk: {
          low: '#34D399',
          moderate: '#FBBF24',
          high: '#FB7A34',
          severe: '#EF4444'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular']
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.9)', opacity: '0' },
          '100%': { transform: 'scale(1.9)', opacity: '0' }
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' }
        }
      },
      animation: {
        'pulse-ring': 'pulseRing 2.2s cubic-bezier(0.2,0.6,0.4,1) infinite',
        shimmer: 'shimmer 3s linear infinite'
      }
    }
  },
  plugins: []
} satisfies Config
