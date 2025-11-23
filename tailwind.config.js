/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        biblical: {
          sand: '#E8DCC4',
          parchment: '#F4ECD8',
          stone: '#8B7355',
          clay: '#A0826D',
          olive: '#6B705C',
          deepblue: '#2C3E50',
          gold: '#D4AF37',
          bronze: '#CD7F32',
        },
      },
      fontFamily: {
        hebrew: ['SBL Hebrew', 'Times New Roman', 'serif'],
        greek: ['SBL Greek', 'Times New Roman', 'serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.800'),
            a: {
              color: theme('colors.biblical.deepblue'),
              '&:hover': {
                color: theme('colors.biblical.gold'),
              },
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
