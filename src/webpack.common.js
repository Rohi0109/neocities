const path = require('path');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'js/app.js'), //no way this is right lmoa
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: 'js/app.js',
  },
};
