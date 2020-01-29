import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';

import * as redis from 'redis';
import * as Redlock from 'redlock';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as compression from 'compression';
import { join } from 'path';
import { readFileSync } from 'fs';
const domino = require('domino');

const app = express();

const PORT = process.env.PORT || 3000;
const DIST_FOLDER = join(process.cwd(), 'dist');
const BROWSER_PATH = join(DIST_FOLDER, 'browser');
const template = readFileSync(join(BROWSER_PATH, 'index.html')).toString();
const win = domino.createWindow(template);

global['window'] = win;
global['document'] = win.document;
global['navigator'] = win.navigator;
global['KeyboardEvent'] = domino.impl.Event;
win.devicePixelRatio = 2; // this is used by the leaflet library
Object.assign(global, domino.impl);

const RedisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost'
});
const Lock = new Redlock([RedisClient]);

app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const {AppServerModuleNgFactory, LAZY_MODULE_MAP, provideModuleMap, renderModuleFactory} = require('./dist/server/main');

app.engine('html', (_, options, callback) => {
  renderModuleFactory(AppServerModuleNgFactory, {
    // Our index.html
    document: template,
    url: options.req.url,
    // DI so that we can get lazy-loading to work differently (since we need it to just instantly render it)
    extraProviders: [
      provideModuleMap(LAZY_MODULE_MAP),
      {
        provide: REQUEST,
        useValue: options.req,
      },
      {
        provide: RESPONSE,
        useValue: options.req.res,
      }
    ]
  }).then(html => {
    callback(null, html);
  });
});

app.set('view engine', 'html');
app.set('views', BROWSER_PATH);

app.get('*.*', express.static(BROWSER_PATH, {
  maxAge: '1y'
}));

app.get('*', (req, res) => {

  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');

  // Skip cache for these requests
  const parts = req.originalUrl.split('?');
  if (req.originalUrl.indexOf('/user') === 0 || parts.length > 1) {
    res.render('index', {req, res}, (err, html) => {
      if (html) {
        res.send(html);
      } else {
        console.error(err);
        return res.sendFile(join(BROWSER_PATH, 'index.html'));
      }
    });
    return;
  }


  const CACHE_TIME = 60 * 30; // This is time in sec for how long will the content be stored in cache
  const CACHE_UPDATE = 60;    // This is time when the content will be updated even if there is already one in the cache

  const redisKey = 'LajiPage:' + req.originalUrl.trimEnd('/');
  RedisClient.get(redisKey, (errRedis: any, resultRedis: string) => {
    let hit = false;
    if (resultRedis) {
      res.send(resultRedis);
      hit = true;
    }

    const updateLock = function(key, cb: () => void) {
      const lockKey = '_lock:' + key;
      Lock.lock(lockKey, CACHE_UPDATE * 1000, (err, lock) => {
        if (lock) {
          cb();
        }
      });
    };

    if (hit) {
      RedisClient.TTL(redisKey, (error, ttl) => {
        if (CACHE_TIME - ttl > CACHE_UPDATE || ttl < 0 || error) {
          updateLock(redisKey, () => {
            res.render('index', {req, res}, (err, html) => {
              if (err) {
                console.error(err);
                return;
              }
              if (res.statusCode === 200 || res.statusCode === 304) {
                RedisClient.set(redisKey, html, 'EX', CACHE_TIME);
              }
            });
          });
        }
      });
    } else {
      res.render('index', {req, res}, (err, html) => {
        if (err) {
          console.error(err);
          return res.sendFile(join(BROWSER_PATH, 'index.html'));
        }
        res.send(html);

        if (res.statusCode === 200 || res.statusCode === 304) {
          RedisClient.set(redisKey, html, 'EX', CACHE_TIME);
        }
      });
    }
  });
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});


exports.app = app;
