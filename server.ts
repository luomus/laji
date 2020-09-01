import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as redis from 'redis';
import * as Redlock from 'redlock';
import * as express from 'express';
import * as compression from 'compression';
import { join } from 'path';
import { readFileSync } from 'fs';
const domino = require('domino');

const CACHE_TIME = 60 * 30; // This is time in sec for how long will the content be stored in cache
const CACHE_UPDATE = 30;    // This is time when the content will be updated even if there is already one in the cache
const distFolder = join(process.cwd(), 'dist', 'browser');
const template = readFileSync(join(distFolder, 'index.html')).toString();
const win = domino.createWindow(template);

win.process = process;
(global as any).window = win;
(global as any).document = win.document;
(global as any).navigator = win.navigator;
(global as any).KeyboardEvent = domino.impl.Event;
(global as any).CSS = null;
(global as any).Prism = null;

win.devicePixelRatio = 2; // this is used by the leaflet library
Object.assign(global, domino.impl);

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';

const RedisClient = redis.createClient({host: process.env.REDIS_HOST || 'localhost'});
const Lock = new Redlock([RedisClient]);

const render = (req, res, cb: (err: any, html: string) => void) => {
  res.render(
    'index',
    {req, res, providers: [{provide: REQUEST, useValue: req}, {provide: RESPONSE, useValue: res}]},
    (err, html) => cb(err, html)
  );
};

const startsWith = (url: string, start: string): boolean => {
  return url.startsWith(start) ||
    url.startsWith('/en' + start) ||
    url.startsWith('/sv' + start) ||
    url.startsWith('/fi' + start);
}

const cache = () => {
  return (req, res, next) => {
    const url = ('' + req.originalUrl);
    const parts = url
      .replace(/\b(token|personToken)=[^&]*\b/, '')
      .split('?')
      .filter((v) => !!v);

    // Skip cache for these requests
    if (req.originalUrl.indexOf('/user') !== -1 || parts.length > 1) {
      // If it start with any of there then cache it
      if (!(startsWith(url, '/view') || startsWith(url, '/taxon') || startsWith(url, '/user/login'))) {
        return next();
      }
    }

    const cacheKey = 'page:' + (parts[0].replace(/\/$/, '') || '/') + '?' + (parts[1] ?? '');
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

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  server.use(compression());

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  server.get('*.(map|txt|js|ico|png|jpg|svg|css)', (req, res) => {
    res.status(404).send('Not found');
  });

  // All regular routes use the Universal engine
  server.get('*', cache(), (req, res) => {
    res.header('Cache-Control', 'public, max-age=' + CACHE_UPDATE);
    res.render(indexHtml, {req, providers: [
      {provide: APP_BASE_HREF, useValue: req.baseUrl},
      {provide: REQUEST, useValue: req},
      {provide: RESPONSE, useValue: res}
    ]});
  });
  server.disable('x-powered-by');

  return server;
}

function run() {
  const port = process.env.PORT || 3000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
