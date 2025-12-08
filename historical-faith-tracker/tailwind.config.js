/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Historical faith theme - scholarly, timeless
        faith: {
          parchment: '#F5F1E8',
          ink: '#2C2416',
          gold: '#C9A227',
          burgundy: '#722F37',
          sage: '#5C7A5C',
          stone: '#6B6B6B',
          cream: '#FDF8EE',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      }
    },
  },
  plugins: [],
}
