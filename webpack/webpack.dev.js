const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const path = require("path");

module.exports = merge(common, {
  mode: "development",
  devtool: 'inline-source-map',
  devServer: {
    static: './build',
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
    clean: true,
  },
  optimization: {
    runtimeChunk: 'single',
  },
});