
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dopa-red': '#FF0033',
        'dopa-red-light': '#FF6B6B',
        'dopa-gold': '#FFD700',
        'dopa-dark': '#1A1A1A',
      },
      backgroundImage: {
        'dopa-gradient': 'linear-gradient(135deg, #FF0033 0%, #FF6B6B 100%)',
        'dopa-radial': 'radial-gradient(circle at center, #FF0033 0%, #FF6B6B 100%)',
      },
      animation: {
        'dopa-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'dopa-glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 0, 51, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 0, 51, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
  