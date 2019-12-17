const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'index.html')
    })
  ],
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    port: '8080',
    host: 'localhost'
}
};