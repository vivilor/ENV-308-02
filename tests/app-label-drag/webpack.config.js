const ExtractTextPlugin = require("extract-text-webpack-plugin");

const ExtractCSS = new ExtractTextPlugin('styles.css');

module.exports = {
  entry: [
    './tests/app-label-drag/app.js'
  ],
  output: {
    path: __dirname + '/',
    filename: "bundle.js"
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
      {
        test: /\.scss$/,
        loaders: 'sass-loader'
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
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
      'vue-sfc': `../../js/vue-sfc`,
      "locale": `../../locale`,
      "styles-root": `../../css`
    }
  },
  plugins: [
    ExtractCSS
  ],
  devtool: "eval-source-map"
};