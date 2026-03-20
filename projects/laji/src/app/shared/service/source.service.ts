import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { AbstractCachedHttpService } from './abstract-cached-http.service';


@Injectable({providedIn: 'root'})
export class SourceService extends AbstractCachedHttpService<string> {

  constructor(
    private api: LajiApiClientBService,
    private translate: TranslateService
  ) {
    super('name');
  }

  getAllAsLookUp(lang: string = this.translate.getCurrentLang()): Observable<{[id: string]: string}> {
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
