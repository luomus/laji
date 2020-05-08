import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import * as redis from 'redis';
import * as Redlock from 'redlock';
import * as express from 'express';
import * as compression from 'compression';
import { join } from 'path';
import { readFileSync } from 'fs';
const domino = require('domino');

const CACHE_TIME = 60 * 30; // This is time in sec for how long will the content be stored in cache
const CACHE_UPDATE = 60;    // This is time when the content will be updated even if there is already one in the cache
const PORT = process.env.PORT || 3000;
const DIST_FOLDER = join(process.cwd(), 'dist');
const BROWSER_PATH = join(DIST_FOLDER, 'browser');
const template = readFileSync(join(BROWSER_PATH, 'index.html')).toString();
const win = domino.createWindow(template);

global['window'] = win;
global['document'] = win.document;
global['navigator'] = win.navigator;
global['KeyboardEvent'] = domino.impl.Event;
global['CSS'] = null;
global['Prism'] = null;

win.devicePixelRatio = 2; // this is used by the leaflet library
Object.assign(global, domino.impl);

const RedisClient = redis.createClient({host: process.env.REDIS_HOST || 'localhost'});
const Lock = new Redlock([RedisClient]);
const app = express();
const { AppServerModuleNgFactory, LAZY_MODULE_MAP, ngExpressEngine, provideModuleMap, REQUEST, RESPONSE } = require('./dist/server/main');

app.use(compression());
app.engine(
  'html',
  ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    providers: [ provideModuleMap(LAZY_MODULE_MAP) ],
  }),
);

app.set('view engine', 'html');
app.set('views', BROWSER_PATH);

app.get('*.*', express.static(BROWSER_PATH, {
  maxAge: '1y'
}));

const render = (req, res, cb: (err: any, html: string) => void) => {
  res.render(
    'index',
    {req, res, providers: [{provide: REQUEST, useValue: req}, {provide: RESPONSE, useValue: res}]},
    (err, html) => cb(err, html)
  );
};

const cache = () => {
  return (req, res, next) => {
    res.header('Cache-Control', 'public, max-age=' + CACHE_UPDATE);

    const parts = ('' + req.originalUrl)
      .replace('showTree=true', '')
      .replace('onlyFinnish=true', '')
      .split('?')
      .filter((v) => !!v);

    // Skip cache for these requests
    if (req.originalUrl.indexOf('/user') !== -1 || parts.length > 1) {
      return next();
    }

    const cacheKey = 'page:' + parts[0].replace(/\/$/, '');
    const updateLock = function(key, cb: () => void) {
      const lockKey = '_lock:' + key;
      Lock.lock(lockKey, CACHE_UPDATE * 1000, (err, lock) => {
        if (lock) {
          cb();
        }
      });
    };
    const cacheSet = function(html) {
      if (res.statusCode === 200 || res.statusCode === 304) {
        RedisClient.set(cacheKey, html, 'EX', CACHE_TIME);
      }
    };

    RedisClient.get(cacheKey, (errRedis: any, resultRedis: string) => {
      if (resultRedis) {
        res.header('x-cache', 'hit');
        res.send(resultRedis);

        RedisClient.TTL(cacheKey, (error, ttl) => {
          if (CACHE_TIME - ttl > CACHE_UPDATE || ttl < 0 || error) {
            updateLock(cacheKey, () => {
              render(req, res, (err, html) => {
                if (err) {
                  return;
                }
                cacheSet(html);
              });
            });
          }
        });
        return;
      } else {
        res.header('x-cache', 'miss');
        res.sendResponse = res.send;
        res.send = (body) => {
          cacheSet(body);
          res.sendResponse(body);
        };
        next();
      }
    });
  };
};

app.get('*.(map|txt|js|ico|png|jpg|svg|css)', (req, res) => {
  res.status(404).send('Not found');
});

app.get('*', cache(), (req, res) => {
  render(req, res, (err, html) => {
    if (!!err) {
      throw err;
    }
    res.send(html);
  });
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});

exports.app = app;
