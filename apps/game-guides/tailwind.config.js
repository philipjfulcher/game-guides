/** @type {import("tailwindcss").Config} */
const path = require('path');

module.exports = {
  content: [path.join(__dirname, 'app/**/*.{js,ts,jsx,tsx}')],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
