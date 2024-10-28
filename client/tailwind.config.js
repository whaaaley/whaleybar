/** @type {import('tailwindcss').Config} */
export default {
  content: [
    '../index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        segoe: ['Segoe UI Variable', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
