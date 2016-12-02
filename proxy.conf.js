const lajiConfig = require('./config');

module.exports = {
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
};
