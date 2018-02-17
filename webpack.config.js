const ExtractTextPlugin = require("extract-text-webpack-plugin");
const PACKAGE = require('./package.json');
const path = require('path');

const ExtractCSS = new ExtractTextPlugin(PACKAGE.name + '.styles.css');

module.exports = {
  entry: [
    './js/app.js'
  ],
  output: {
    path: __dirname + "/dist/",
    filename: PACKAGE.name + ".bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.(css|scss)$/,
        use: ExtractCSS.extract({
          use: ["css-loader", "sass-loader"]
        })
      },
      {
        test: /\.vue$/,
        loaders: 'vue-loader',
        options: {
          loaders: {
            scss: 'vue-style-loader!css-loader!sass-loader', // <style lang="scss">
            sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax' // <style lang="sass">
          }
        }
      },
      // {
      //   test: /\.scss$/,
      //   loaders: 'css-loader!sass-loader'
      // },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'file-loader?name=fonts/[name]/[name].[ext]'
      },
      {
        test: /\.(png|svg)$/,
        loader: 'file-loader?name=img/[name].[ext]'
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': `vue/dist/vue.esm.js`,
      'themes': path.resolve(__dirname, `./css/themes/light`),
      'fonts' : path.resolve(__dirname, `./fonts`),
      'img'   : path.resolve(__dirname, `./img`),
      'locale': path.resolve(__dirname, `./locale`),
      'vue-sfc': path.resolve(__dirname, `./js/vue-sfc`)
    }
  },
  plugins: [
    ExtractCSS
  ]
};