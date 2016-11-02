const path = require('path');
const webpack = require('webpack');
const lajiConfig = require('./config');

// Webpack Plugins
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
const ENV = process.env.npm_lifecycle_event;
const isTestWatch = ENV === 'test-watch';
const isTest = ENV === 'test' || isTestWatch;
const isProd = ENV === 'build';

module.exports = function makeWebpackConfig() {
  var config = {};

  if (isProd) {
    config.devtool = 'source-map';
  } else if (isTest) {
    config.devtool = 'inline-source-map';
  } else {
    config.devtool = 'eval-source-map';
  }

  config.entry = isTest ? {} : {
    'polyfills': './src/polyfills.browser.ts',
    'vendor': './src/vendor.browser.ts',
    'main': './src/main.browser.ts'
  };

  config.output = isTest ? {} : {
    path: root('dist'),
    publicPath: isProd ? '/' : 'http://localhost:3000/',
    filename: isProd ? 'js/[name].[hash].js' : 'js/[name].js',
    chunkFilename: isProd ? '[id].[hash].chunk.js' : '[id].chunk.js'
  };

  config.resolve = {
    // only discover files that have those extensions
    extensions: ['.ts', '.js', '.json', '.css', '.scss', '.html'],
    modules: [root('src'), 'node_modules']
  };

  var atlOptions = '';
  if (isTest && !isTestWatch) {
    // awesome-typescript-loader needs to output inlineSourceMap for code coverage to work with source maps.
    atlOptions = 'inlineSourceMap=true&sourceMap=false';
  }

  config.module = {
    noParse: /laji-map\.js$/,
    rules: [
      {
        test: /\.ts$/,
        loaders: ['awesome-typescript-loader?' + atlOptions, 'angular2-template-loader', '@angularclass/hmr-loader', 'angular2-router-loader'],
        exclude: [isTest ? /\.(e2e)\.ts$/ : /\.(spec|e2e)\.ts$/, /node_modules\/(?!(ng2-.+))/]
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file?name=fonts/[name].[hash].[ext]?'
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      // all css required in src/app files will be merged in js files
      {
        test: /\.css$/,
        include: root('src', 'app'),
        loader: 'to-string!css-loader!postcss-loader'
      },
      {
        test: /\.html$/,
        loader: 'raw',
        exclude: root('src', 'index.html')
      }
    ]
  };

  if (isTest && !isTestWatch) {
    config.module.rules.push({
      test: /\.ts$/,
      enforce: 'post',
      include: path.resolve('src'),
      loader: 'istanbul-instrumenter-loader',
      exclude: [/\.spec\.ts$/, /\.e2e\.ts$/, /node_modules/]
    });
  }

  if (!isTest || !isTestWatch) {
    config.module.rules.push({
      test: /\.ts$/,
      enforce: 'pre',
      loader: 'tslint'
    });
  }

  config.plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        ENV: JSON.stringify(ENV)
      }
    }),

    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      root('./src')
    ),

    new webpack.LoaderOptionsPlugin({
      options: {
        tslint: {
          emitErrors: false,
          failOnHint: false
        },
        sassLoader: {
          //includePaths: [path.resolve(__dirname, "node_modules/foundation-sites/scss")]
        },
        postcss: [
          require('postcss-cssnext')({
            browsers: ['ie >= 9', 'last 2 versions']
          })
        ]
      }
    }),

    new CopyWebpackPlugin([{
      from: root('src/static'),
      to: 'static'
    }]),

    new CopyWebpackPlugin([{
      from: root('src/i18n'),
      to: 'i18n'
    }])
  ];

  if (!isTest && !isProd) {
    config.plugins.push(new DashboardPlugin());
  }

  if (!isTest || !isTestWatch) {
    config.plugins.push(
      new ForkCheckerPlugin(),

      new CommonsChunkPlugin({
        name: ['polyfills','vendor']
      }),

      new HtmlWebpackPlugin({
        template: './src/index.html',
        chunksSortMode: 'dependency'
      }),

      new ExtractTextPlugin({filename: 'css/[name].[hash].css', disable: !isProd})
    );
  }

  if (isProd) {
    config.plugins.push(
      new webpack.NoErrorsPlugin(),

      new webpack.optimize.UglifyJsPlugin({sourceMap: true, mangle: { keep_fnames: true }})
    );
  }

  config.devServer = {
    historyApiFallback: {
      rewrites: [
        {from: /.*[^(.json|.js|.png|.jpg|.ico|.ts|.css|.svg|.tff|.eot)]$/, to: '/index.html'}
      ]
    },
    quiet: true,
    stats: 'minimal',
    watchOptions: { aggregateTimeout: 300, poll: 1000 },
    proxy: {
      '/api/**': {
        target: lajiConfig['api_base'],
          changeOrigin: true,
          xfwd: true,
          pathRewrite: {
          '^/api/': 'v0/'
        },
        headers: {
          Authorization: lajiConfig['access_token']
        },
        rewrite: function(req) {
          req.url = req.url.replace(/^\/api/, 'v0') +
            (req.url.indexOf('?') === -1 ? '?' : '&' ) +
            'access_token=' + lajiConfig['access_token']
        }
      }
    }
  };

  return config;
}();

// Helper functions
function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [__dirname].concat(args));
}
