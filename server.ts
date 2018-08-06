import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import {enableProdMode} from '@angular/core';
import {ngExpressEngine} from '@nguniversal/express-engine';
import {provideModuleMap} from '@nguniversal/module-map-ngfactory-loader';

import * as redis from 'redis';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as compression from 'compression';

import {join} from 'path';

enableProdMode();

export const app = express();

const RedisClient = redis.createClient();

app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const DIST_FOLDER = join(process.cwd(), 'dist');

const {AppServerModuleNgFactory, LAZY_MODULE_MAP} = require('./dist/server/main');

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', './dist/browser');

app.get('/redirect/**', (req, res) => {
  const location = req.url.substring(10);
  res.redirect(301, location);
});

app.get('*.*', express.static('./dist/browser', {
  maxAge: '1y'
}));

app.get('/*', (req, res) => {

  // Skip cache for these requests
  if (req.originalUrl.indexOf('/user') === 0) {
    res.render('index', {req, res}, (err, html) => {
      if (html) {
        res.send(html);
      } else {
        console.error(err);
        res.send(err);
      }
    });
    return;
  }

  // Cache these responses for 10min, update cache on every request
  const redisKey = 'LajiPage:' + req.originalUrl;
  RedisClient.get(redisKey, (errRedis: any, resultRedis: string) => {
    let hit = false;
    if (resultRedis) {
      res.send(resultRedis);
      hit = true;
    }

    res.render('index', {req, res}, (err, html) => {
      if (!hit) {
        if (err) {
          console.error(err);
          return (req as any).next(err);
        }
        res.send(html);
      }

      if (!err && res.statusCode === 200) {
        RedisClient.set(redisKey, html, 'EX', 60 * 10);
      }
    });
  });
});
