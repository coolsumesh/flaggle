/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        secondary: '#3b82f6',
        correct: '#22c55e',
        present: '#eab308',
        absent: '#6b7280'
      }
    },
  },
  plugins: [],
}
