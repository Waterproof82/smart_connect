/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand color - blue with slight purple tint
        primary: {
          DEFAULT: 'oklch(65% 0.18 250)',
          light: 'oklch(80% 0.12 250)',
          dark: 'oklch(45% 0.15 250)',
          muted: 'oklch(70% 0.08 250)',
        },
        // Semantic colors
        success: {
          DEFAULT: 'oklch(70% 0.15 150)',
          light: 'oklch(85% 0.08 150)',
          dark: 'oklch(50% 0.12 150)',
        },
        warning: {
          DEFAULT: 'oklch(75% 0.15 50)',
          light: 'oklch(90% 0.08 50)',
          dark: 'oklch(55% 0.12 50)',
        },
        error: {
          DEFAULT: 'oklch(60% 0.18 25)',
          light: 'oklch(80% 0.10 25)',
          dark: 'oklch(45% 0.15 25)',
        },
        // Neutral scale with brand tint (slight blue)
        neutral: {
          50: 'oklch(98% 0.005 250)',
          100: 'oklch(95% 0.008 250)',
          200: 'oklch(88% 0.010 250)',
          300: 'oklch(75% 0.012 250)',
          400: 'oklch(60% 0.015 250)',
          500: 'oklch(50% 0.018 250)',
          600: 'oklch(40% 0.020 250)',
          700: 'oklch(30% 0.022 250)',
          800: 'oklch(20% 0.018 250)',
          900: 'oklch(12% 0.015 250)',
          950: 'oklch(8% 0.010 250)',
        },
        // Surface colors for dark mode
        surface: {
          DEFAULT: 'oklch(12% 0.015 250)',
          elevated: 'oklch(18% 0.015 250)',
          overlay: 'oklch(22% 0.015 250)',
        },
        // Light mode surfaces
        light: {
          DEFAULT: 'oklch(98% 0.005 250)',
          muted: 'oklch(95% 0.008 250)',
          subtle: 'oklch(92% 0.010 250)',
        },
        // Legacy aliases for backward compatibility
        'sc-dark': 'oklch(8% 0.012 250)',
        'sc-dark-alt': 'oklch(12% 0.015 250)',
        'sc-dark-surface': 'oklch(10% 0.014 250)',
        'sc-dark-input': 'oklch(6% 0.010 250)',
        'sc-dark-card': 'oklch(14% 0.015 250)',
        // Brand colors
        whatsapp: 'var(--color-whatsapp, oklch(65% 0.18 150))',
        'whatsapp-hover': 'var(--color-whatsapp-hover, oklch(55% 0.18 150))',
      },
      fontFamily: {
        sans: ['Instrument Sans', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Instrument Sans', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'Instrument Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'fluid-sm': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-base': 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
        'fluid-lg': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-xl': 'clamp(1.5rem, 1.2rem + 1.5vw, 2rem)',
        'fluid-2xl': 'clamp(2rem, 1.5rem + 2.5vw, 3rem)',
        'fluid-3xl': 'clamp(2.5rem, 2rem + 2.5vw, 3.5rem)',
        'fluid-4xl': 'clamp(3rem, 2.5rem + 2.5vw, 4.5rem)',
        'fluid-5xl': 'clamp(3.5rem, 3rem + 2.5vw, 5.5rem)',
      },
      borderRadius: {
        'fluid': 'clamp(0.75rem, 0.5rem + 1vw, 1.5rem)',
        'fluid-lg': 'clamp(1rem, 0.75rem + 1vw, 2rem)',
        'fluid-xl': 'clamp(1.5rem, 1rem + 2vw, 3rem)',
      },
    },
  },
  plugins: [],
}
