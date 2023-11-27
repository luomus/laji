const config = require('./proxy.conf');

module.exports = {
  ...config,
  "/loginInfo": {
    "target": "https://login.laji.fi/loginInfo",
    "secure": true,
    "changeOrigin": true,
    "pathRewrite": {
      "^/loginInfo": ""
    }
  }
}

