import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import webpack from 'webpack';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import { VueLoaderPlugin } from 'vue-loader';

const { ModuleFederationPlugin } = webpack.container;

interface Configuration extends webpack.Configuration {
  devServer?: DevServerConfiguration;
}

const config: Configuration = {
  entry: './src/main.ts',
  mode: 'development',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js', '.vue'],
    alias: {
      '@': path.join(__dirname, './src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
          configFile: 'tsconfig.json',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['vue-style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/icons/[name][ext]',
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new ModuleFederationPlugin({
      name: 'taskbolt',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.vue',
      },
      shared: {
        'vue': {
          singleton: true,
          strictVersion: false,
          requiredVersion: '^3.4.0',
          eager: true,
        },
        'vue-router': {
          singleton: true,
          strictVersion: false,
          requiredVersion: '^4.2.0',
          eager: true,
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body',
    }),
  ],
  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'dist'),
      },
      {
        directory: path.join(__dirname, 'src/assets'),
        publicPath: '/assets',
      },
    ],
    compress: true,
    port: 2001,
    open: false,
    hot: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization',
    },
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true,
    assetModuleFilename: 'assets/[name][ext]',
    publicPath: 'auto',
  },
};

export default config;
