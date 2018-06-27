'use strict';

const globby = require('globby');
const rimraf = require('rimraf');

globby(['./node_modules/moment/locale/*', '!./node_modules/moment/locale/fi.js', '!./node_modules/moment/locale/sv.js'])
  .then(function then(paths) {
    paths.map(function map(item) {
      rimraf.sync(item);
    });
  });
