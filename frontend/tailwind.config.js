/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        govNavy: {
          50: '#f0f4f9',
          100: '#d9e2f0',
          500: '#1b365d',
          600: '#152b4a',
          800: '#0f1f36',
          900: '#0b1626'
        },
        govGold: {
          400: '#fbbf24',
          500: '#d97706',
          600: '#b45309'
        }
      }
    },
  },
  plugins: [],
}
