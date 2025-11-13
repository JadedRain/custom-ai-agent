/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom green palette (HSL values)
        normal: {
          50: 'hsl(129, 53%, 90%)',
          100: 'hsl(141, 45%, 81%)',
          200: 'hsl(147, 43%, 71%)',
          300: 'hsl(150, 42%, 62%)',
          400: 'hsl(152, 41%, 52%)',
          500: 'hsl(153, 39%, 41%)',
          600: 'hsl(153, 40%, 30%)',
          700: 'hsl(155, 43%, 18%)', 
          800: 'hsl(159, 56%, 7%)',
        },
        // Custom gray palette (HSL values)
        neutral: {
          50: 'hsl(210, 17%, 98%)',
          100: 'hsl(210, 16%, 93%)',
          200: 'hsl(210, 14%, 89%)',
          300: 'hsl(210, 14%, 83%)',
          400: 'hsl(210, 11%, 71%)',
          500: 'hsl(208, 7%, 46%)',
          600: 'hsl(210, 9%, 31%)',
          700: 'hsl(210, 10%, 23%)',
          800: 'hsl(210, 11%, 15%)',
        },
      },
    },
  },
  plugins: [],
};
