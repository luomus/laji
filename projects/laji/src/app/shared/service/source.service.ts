import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { map } from 'rxjs';
import { AbstractCachedHttpService } from './abstract-cached-http.service';


@Injectable({providedIn: 'root'})
export class SourceService extends AbstractCachedHttpService<string> {

  constructor(private api: LajiApiClientBService) {
    super('name');
  }

  getAllAsLookUp(lang?: string): Observable<{[id: string]: string}> {
    if (!lang) {
      lang = this.currentLang || 'fi';
    }
    return this.fetchLookup(this.api.get('/sources', { query: { page: 1, pageSize: 1000 } }).pipe(
      map(paged => paged.results)
    ), lang);
  }

  getName(id: string, lang: string) {
    return this.getAllAsLookUp(lang).pipe(
      map(data => data[id] || id )
    );
  }
}
