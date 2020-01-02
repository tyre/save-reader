const path = require('path');

module.exports = {
  entry: {
    background: './src/background.js',
    foreground: './src/foreground.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production'
};
