/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sunny-yellow': '#FFD700',
        'sunny-dark': '#1a1a1a',
        'sunny-brown': '#8B4513',
      },
    },
  },
  plugins: [],
}
