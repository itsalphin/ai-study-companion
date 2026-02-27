/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Nunito", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 32px rgba(63, 88, 138, 0.13)",
      },
    },
  },
  plugins: [],
};
