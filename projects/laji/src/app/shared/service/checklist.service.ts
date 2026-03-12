import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { AbstractCachedHttpService } from './abstract-cached-http.service';
import { TranslateService } from '@ngx-translate/core';
import { Checklist } from '../model/Checklist';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

@Injectable({providedIn: 'root'})
export class ChecklistService extends AbstractCachedHttpService<Checklist> {

  constructor(
    private api: LajiApiClientBService,
    private translate: TranslateService
  ) {
    super('name');
  }

  getAllAsLookUp(lang: string = this.translate.getCurrentLang()) {
    return this.fetchLookup(this.api.get('/checklists', { query: { page: 1, pageSize: 1000 } }).pipe(
      map(paged => paged.results),
    ), lang);
  }

  getName(id: string, lang: string) {
    return this.getAllAsLookUp(lang).pipe(
      map(data => data[id] || id )
    );
  }
}
