/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
        display: ['YakuHanJP', 'Zen Maru Gothic', 'serif'],
      },
      colors: {
        'deep-soil': '#111111',
        'off-white': '#F4F4F5',
        'neon-lime': '#D4FF00',
        'agri-green': {
          DEFAULT: '#1B5E20',
          dark: '#1B5E20',
          light: '#2e7d32',
        },
        'matte-black': '#1F2937',
        'smoke-white': '#E5E7EB',
      },
      animation: {
        'bounce': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}