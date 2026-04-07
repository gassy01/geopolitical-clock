/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        mono: ["'Share Tech Mono'", "monospace"],
        body: ["'Barlow Condensed'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
