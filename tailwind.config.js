/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E94E1B',
          hover:   '#FF5E28',
          muted:   '#E94E1B22',
          border:  '#E94E1B55',
        },
        arena: {
          bg:       '#080808',
          surface:  '#0E0E0E',
          card:     '#181818',
          cardHigh: '#1E1E1E',
          border:   '#2c2c2c',
          muted:    '#383838',
        },
        text: {
          primary:   '#F2F2F2',
          secondary: '#909090',
          muted:     '#585858',
        },
      },
      boxShadow: {
        glow:      '0 0 20px rgba(233, 78, 27, 0.32)',
        'glow-sm': '0 0 10px rgba(233, 78, 27, 0.22)',
        'glow-xs': '0 0 5px  rgba(233, 78, 27, 0.16)',
        card:      '0 4px 24px rgba(0,0,0,0.60), 0 1px 0 rgba(255,255,255,0.04)',
        'card-sm': '0 2px 12px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.03)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
