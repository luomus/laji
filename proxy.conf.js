require('dotenv').config();

const proxyConfig = {
  target:  process.env.API_BASE || "https://dev.laji.fi/api",
  changeOrigin: true,
  xfwd: true,
  secure: false,
  pathRewrite: {
    '^/api/': '/'
  }
};

if (process.env.ACCESS_TOKEN) {
  proxyConfig.headers = {
    Authorization: process.env.ACCESS_TOKEN
  }
}

module.exports = {
  '/api/**': proxyConfig
};
