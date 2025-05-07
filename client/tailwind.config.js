/** @type {import('tailwindcss').Config} */
export default {
  content: [
    '../index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      aspectRatio: {
        phone: '9/16',
      },
      colors: {
        'catppuccin-blue': '#809ddb',
        'catppuccin-purple': '#c6a0f6',
      },
      fontFamily: {
        segoe: ['Segoe UI Variable', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
