// front/webpack.config.js
console.log('WEBPACK CONFIG IS USED');
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.tsx',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    publicPath: '/',
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },

      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },

      // SCSS Modules
      {
        test: /\.module\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: { exportLocalsConvention: 'camelCase' },
              esModule: true,
              sourceMap: true, // можно включить для удобства
            },
          },
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true, // обязательно для resolve-url-loader
            },
          },
        ],
      },

      // Обычные SCSS (не модули)
      {
        test: /\.s[ac]ss$/i,
        exclude: /\.module\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap: true },
          },
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true, // обязательно
            },
          },
        ],
      },

      {
        test: /\.(png|jpe?g|gif|svg|ico|webp|woff2?|eot|ttf|otf)$/i,
        type: 'asset',
        parser: { dataUrlCondition: { maxSize: 8 * 1024 } },
        generator: { filename: 'assets/[name].[contenthash][ext]' },
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: { drop_console: true },
          format: { comments: false },
        },
        extractComments: false,
      }),
    ],
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        reactVendors: {
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store)[\\/]/,
          name: 'react-vendors',
          priority: 30,
          chunks: 'all',
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'all',
        },
        styles: {
          type: 'css/mini-extract',
          name: 'styles',
          chunks: 'all',
          enforce: true,
          priority: 40,
        },
      },
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
    },
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[name].[contenthash].css',
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'src/favicon.ico', to: 'favicon.ico' }],
    }),
  ],

  performance: {
    hints: 'warning',
  },

  devServer: {
    historyApiFallback: true,
    allowedHosts: 'all',
    static: { directory: path.resolve(__dirname, 'dist') },
  },
};
