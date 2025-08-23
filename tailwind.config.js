/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"EB Garamond"', 'serif'],
        calligraphy: ['"Great Vibes"', 'cursive'],
      },
      colors: {
        'primary': '#0047AB', // Cobalt Blue
        'background': '#F5F7FA', // Light silver-blue
        'surface': '#FFFFFF',
        'text': {
          'primary': '#111827', // Gray 900
          'secondary': '#6B7280', // Gray 500
          'on-primary': '#FFFFFF',
        },
        'border': '#E5E7EB', // Gray 200
        'gold': '#B8860B', // DarkGoldenRod - better for watermark
      },
       boxShadow: {
        'focus-primary': '0 0 0 3px rgba(0, 71, 171, 0.4)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}