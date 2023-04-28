/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'ping-fast': 'ping 1s linear infinite',
      },
      fontFamily: {
        'ubuntu': ['Ubuntu', 'sans-serif'],
        'shantell': ['Shantell Sans', 'serif'] 
      },
      backgroundImage:{
        "chat": "url('./assets/bg_back.jpg')",
      }
    },
  },
  plugins: [],
}