var webpack = require('webpack');
var path = require('path');
var config = require('./config');

// Webpack Config
var webpackConfig = {
  entry: {
    'polyfills': './src/polyfills.browser.ts',
    'vendor':    './src/vendor.browser.ts',
    'main':       './src/main.browser.ts',
  },

  output: {
    path: './dist',
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(true),
    new webpack.optimize.CommonsChunkPlugin({ name: ['main', 'vendor', 'polyfills'], minChunks: Infinity }),
    new webpack.optimize.CommonsChunkPlugin('common.js')
  ],

  module: {
    loaders: [
      // .ts files for TypeScript
      { test: /\.ts$/, loaders: ['awesome-typescript-loader', 'angular2-template-loader'] },
      { test: /\.css$/, loaders: ['to-string-loader', 'css-loader'] },
      { test: /\.html$/, loader: 'raw-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.png$/, loader: "url-loader?limit=100000" },
      { test: /\.jpg$/,loader: "file-loader" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9].[0-9].[0-9])?$/, loader: "file-loader?name=[name].[ext]" },
    ]
  }
};

// Our Webpack Defaults
var defaultConfig = {
  devtool: 'cheap-module-source-map',
  cache: true,
  debug: true,
  output: {
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id].chunk.js'
  },

  resolve: {
    root: [ path.join(__dirname, 'src') ],
    extensions: ['', '.ts', '.js', '.json']
  },

  devServer: {
    historyApiFallback: {
      rewrites: [
        {from: /.*[^(.json|.js|.png|.jpg|.ico|.ts|.css|.svg|.tff|.eot)]$/, to: '/index.html'}
      ]
    },
    watchOptions: { aggregateTimeout: 300, poll: 1000 },
    proxy: {
      '/api/**': {
        target: config['api_base'],
        changeOrigin: true,
        xfwd: true,
        pathRewrite: {
          '^/api/': 'v0/'
        },
        headers: {
          Authorization: config['access_token']
        },
        rewrite: function(req) {
          req.url = req.url.replace(/^\/api/, 'v0') +
            (req.url.indexOf('?') === -1 ? '?' : '&' ) +
            'access_token=' + config['access_token']
        }
      }
    }
  },

  node: {
    global: 1,
    crypto: 'empty',
    module: 0,
    Buffer: 0,
    clearImmediate: 0,
    setImmediate: 0
  }
};

var webpackMerge = require('webpack-merge');
module.exports = webpackMerge(defaultConfig, webpackConfig);
