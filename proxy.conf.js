require('dotenv').config();

module.exports = {
  '/api/**': {
    target:  process.env.API_BASE || "https://apitest.laji.fi",
    changeOrigin: true,
    xfwd: true,
    secure: false,
    pathRewrite: {
      '^/api/': 'v0/'
    },
    headers: {
      Authorization: process.env.ACCESS_TOKEN
    }
  }
};
