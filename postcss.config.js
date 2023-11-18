module.exports = ({ file }) => {
  return {
    plugins: {
      autoprefixer: {},
      'postcss-pxtorem': {
        rootValue: 37.5,
        propList: ['*'],
        exclude: /SpringMain/i,
        mediaQuery: false
      }
    }
  }
}
