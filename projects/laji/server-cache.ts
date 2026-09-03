import * as redis from 'redis';
import { RequestHandler, Request, Response as ExResponse } from 'express';
import { writeResponseToNodeResponse } from '@angular/ssr/node';
import { promisify } from 'node:util';

const CACHE_TIME = 60 * 30; // Secs how long will the content be stored in cache.
const CACHE_UPDATE = 30;    // Secs when the content will be updated even if there is already one in the cache.

const shouldCache = (req: Request) => {
  if (req.method !== 'GET' || 'token' in req.query || 'personToken' in req.query) {
    return false;
  }

  const skipPaths = ['/user'];
  return skipPaths.every(p => !req.path.match(new RegExp(`^(|/en|/fi|/sv)${p}(\/|$)`)));
};

const getQueryStr = (req: Request) => {
  const queryObj = req.query;
  return Object.keys(queryObj).sort().reduce((str, k) => str += `${str.length ? '&' : ''}${k}=${queryObj[k]}`, '');
};

const getCacheKey = (req: Request) => {
  const queryStr = getQueryStr(req);
  return `page:${req.path}?${queryStr}`;
};

interface CacheLocals {
  shouldCache: boolean;
  key: string;
}

interface CacheEntry {
  body: string;
  headers: Record<string, string>;
}

export class SSRCache {
  private redisClient = redis.createClient({host: process.env.REDIS_HOST || 'localhost'});
  private redisGet = promisify(this.redisClient.get).bind(this.redisClient);
  private redisSetEx = promisify(this.redisClient.setex).bind(this.redisClient);
  private redisTTL = promisify(this.redisClient.TTL).bind(this.redisClient);
  private redisDel: (key: string) => Promise<number> = promisify(this.redisClient.del).bind(this.redisClient);

  private async serializeResponse(response: Response): Promise<string> {
    const cloned = response.clone();
    const entry: CacheEntry = {
      body: await cloned.text(),
      headers: Object.fromEntries(response.headers.entries()),
    }
    return JSON.stringify(entry);
  }

  private deserializeResponse(response: string): Response {
    const entry = JSON.parse(response) as CacheEntry;
    return new Response(entry.body, { headers: entry.headers });
  }

  makeLookupMiddleware(): RequestHandler {
    const cacheLookupMiddleware: RequestHandler = async (req, res, next) => {
      const shouldCache_ = this.redisClient.connected && shouldCache(req);
      const cacheKey = getCacheKey(req);
      res.locals.cache = {
        shouldCache: shouldCache_,
        key: cacheKey,
      } as CacheLocals;

      if (!shouldCache_) {
        next();
        return;
      }

      try {
        const redisResponse = await this.redisGet(cacheKey);
        if (!redisResponse) {
          next();
          return;
        }

        try {
          const parsedResponse = this.deserializeResponse(redisResponse);
          parsedResponse.headers.set('x-cache', 'hit');
          parsedResponse.headers.set('Cache-Control', `public, max-age=${CACHE_UPDATE}`);
          await writeResponseToNodeResponse(parsedResponse, res);
        } catch (e) {
          console.error('Failed to parse Redis entry, deleting the key', e);
          try {
            await this.redisDel(cacheKey);
          } catch (e1) {
            console.error('Failed to delete Redis key', e1)
          }
          next();
        }
      } catch (e) {
        console.error('Failed Redis lookup', e);
        next();
      }
    };
    return cacheLookupMiddleware;
  }

  async update(exResponse: ExResponse, ngResponse: Response) {
    const locals = exResponse.locals.cache as CacheLocals;

    if (!locals.shouldCache || ngResponse.status !== 200) {
      return;
    }

    let ttl: number | undefined;
    try {
      ttl = await this.redisTTL(locals.key)
    } catch (e) {
      ttl = undefined;
    }
    if (!ttl || CACHE_TIME - ttl > CACHE_UPDATE || ttl < 0) {
      const res = await this.serializeResponse(ngResponse);
      await this.redisSetEx(locals.key, CACHE_TIME, res);
    }
  }
}
