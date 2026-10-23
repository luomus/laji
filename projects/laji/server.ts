import { AngularNodeAppEngine, writeResponseToNodeResponse } from '@angular/ssr/node';
import express, { ErrorRequestHandler } from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { SSRCache } from './server-cache';
import { createProxyMiddleware } from 'http-proxy-middleware';
require('dotenv').config();

function readBuildId(serverDistFolder: string): string {
  const buildIdPath = resolve(serverDistFolder, 'build_id.txt');

  try {
    return readFileSync(buildIdPath, 'utf8').trim();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`Could not find build ID: ${buildIdPath}`);
      return '';
    }

    throw error;
  }
}

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const appEngine = new AngularNodeAppEngine();

  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const cache = new SSRCache(readBuildId(serverDistFolder));

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // In local builds, initialize proxy to populate access token
  if (process.env.LOCAL_BUILD === 'true') {
    server.use('/api', createProxyMiddleware({
      target: process.env.API_BASE,
      changeOrigin: true,
      followRedirects: true,
      pathRewrite: {
        '^/api': '',
      },
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
      }
    }));
  }

  // Serve static files from /browser (not prerendered pages!)
  server.use(
    express.static(browserDistFolder, {
        maxAge: '1y',
        index: false, // this excludes prerendered pages
        redirect: false, // don't add trailing slash to directory paths
      }
    )
  );

  // Send 404 for any static asset that wasn't hit in the last step
  server.get(
    /\.(?:js|css|map|json|ico|png|jpe?g|gif|svg|webp|woff2?|ttf|otf)$/,
    (_req, res) => {
      res.sendStatus(404);
    },
  );

  // Check if the page is present in the SSR cache
  server.use(cache.makeLookupMiddleware());

  // Otherwise let angular app engine decide which page to serve (SSR or prerendered)
  server.use(async (req, res, next) => {
    try {
      const ngResponse = await appEngine.handle(req);
      if (ngResponse === null) {
        next();
        return;
      }

      try {
        await cache.update(res, ngResponse);
      } catch (error) {
        console.error('Failed to update SSR cache', error);
      }

      await writeResponseToNodeResponse(ngResponse, res);
    } catch (e) {
      next(e);
    }
  });

  const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    console.error(error);

    if (res.headersSent) {
      next(error);
      return;
    }

    res.status(500).send('Internal server error');
  };
  server.use(errorHandler);

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
