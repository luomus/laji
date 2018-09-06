import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { LocalDb } from '../local-db/local-db.abstract';
import { isPlatformBrowser } from '@angular/common';

@Injectable({providedIn: 'root'})
export class CacheService extends LocalDb {

  constructor(
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    super('cache', isPlatformBrowser(platformId));
  }

}
