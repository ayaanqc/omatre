/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        console: {
          950: '#0B0D0E',
          900: '#141719',
          800: '#1C2024',
          700: '#2A2F35',
          600: '#343B43',
          400: '#8A938F',
          300: '#A8B0AB',
          100: '#E8E4DA',
          50: '#F4F1EA',
        },
        paper: {
          50: '#FDFBF7',
          100: '#F7F4EE',
          200: '#EFEAE0',
          300: '#E2DBD0',
          400: '#C8BEAD',
          500: '#9E9484',
          700: '#4A443C',
          800: '#2C2825',
          900: '#1A1816',
        },
        bistro: {
          terracotta: '#E0683A',
          ochre: '#D9A441',
          sage: '#7FB08E',
          ink: '#16191D',
          brass: '#C9A86A',
          brassdim: '#8C733E',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'paper-sm': '0 1px 2px rgba(0, 0, 0, 0.4)',
        'paper-md': '0 4px 12px rgba(0, 0, 0, 0.45)',
        'paper-lg': '0 12px 32px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
