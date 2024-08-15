/** @type {import('tailwindcss').Config} */
module.exports = {
  daisyui: {
    themes: ["night"],
  },
  content: ["./popup/popup.html"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
