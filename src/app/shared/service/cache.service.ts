import { Injectable } from '@angular/core';
import { LocalDb } from '../local-db/local-db.abstract';

@Injectable({providedIn: 'root'})
export class CacheService extends LocalDb {

  constructor() {
    super('cache');
  }

}
