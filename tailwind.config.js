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
        admin: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffe',
          300: '#7cc3fd',
          400: '#36a3fa',
          500: '#0c86eb',
          600: '#006ac9',
          700: '#0154a3',
          800: '#054786',
          900: '#0a3c6f',
          950: '#07264a',
        },
        surface: {
          light: '#f8fafc',
          card: '#ffffff',
          dark: '#0b1120',
          darkCard: '#131d33',
          border: '#e2e8f0',
          darkBorder: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
