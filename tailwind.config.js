/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        rounded: ['"Baloo 2"', '"Noto Sans TC"', 'sans-serif'],
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.9)' },
          '60%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '75%': { transform: 'translateX(8px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
      },
      animation: {
        pop: 'pop 0.35s ease-out',
        wiggle: 'wiggle 0.5s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
