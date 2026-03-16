/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sc-dark': '#020408',
        'sc-dark-alt': '#0d0d1e',
        'sc-dark-surface': '#0a0c10',
        'sc-dark-input': '#0a0a0a',
        'sc-dark-card': '#0B0E14',
      },
      animation: {
        'float-fancy': 'float-fancy 6s ease-in-out infinite',
        'drift': 'drift 20s ease-in-out infinite',
        'drift-slow': 'drift 30s ease-in-out infinite reverse',
      },
      keyframes: {
        'float-fancy': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        'drift': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(30px, -30px)' },
        },
      },
    },
  },
  plugins: [],
}
