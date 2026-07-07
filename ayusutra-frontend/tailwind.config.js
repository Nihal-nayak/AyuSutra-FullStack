/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#a04100",
        "primary-container": "#f37021",
        "secondary": "#006d37",
        "secondary-container": "#93f4ac",
        "on-secondary-container": "#007239",
        "background": "#fcf9f8",
        "on-surface": "#1c1b1b",
        "on-surface-variant": "#584237",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f6f3f2",
        "surface-container-highest": "#e5e2e1",
        "outline-variant": "#e0c0b2",
        "error": "#ba1a1a",
        "tertiary": "#1260a5"
      },
      fontFamily: {
        serif: ["Libre Caslon Text", "serif"],
        sans: ["Manrope", "sans-serif"],
      },
      maxWidth: {
        'container-max': '1280px',
      },
      spacing: {
        'margin-desktop': '40px',
      }
    },
  },
  plugins: [],
}