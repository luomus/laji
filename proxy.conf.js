require('dotenv').config();

if (!process.env.API_BASE) {
  throw new Error("'API_BASE' env variable not configured See README.md for instructions.")
}
const proxyConfig = {
  target:  process.env.API_BASE,
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
