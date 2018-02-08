const config = require('./config');

module.exports = {
  '/api/**': {
    target: config.api_base,
      changeOrigin: true,
      xfwd: true,
      pathRewrite: {
      '^/api/': 'v0/'
    },
    headers: {
      Authorization: config.access_token
    },
    rewrite: function(req) {
      req.url = req.url.replace(/^\/api/, 'v0') +
        (req.url.indexOf('?') === -1 ? '?' : '&' ) +
        'access_token=' + config.access_token
    }
  }
};
