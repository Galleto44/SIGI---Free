module.exports = {
  content: [
  '../templates/**/*.html',
  '../../templates/**/*.html',
  '../../**/templates/**/*.html',
  '../../static/**/*.js',
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}