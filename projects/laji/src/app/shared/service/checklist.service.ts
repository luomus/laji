import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LajiApi, LajiApiService } from './laji-api.service';
import { map } from 'rxjs/operators';
import { AbstractCachedHttpService } from './abstract-cached-http.service';
import { Checklist } from 'projects/laji-api-client/src/lib/models/checklist';
import { TranslateService } from '@ngx-translate/core';

@Injectable({providedIn: 'root'})
export class ChecklistService extends AbstractCachedHttpService<Checklist> {

  constructor(
    private lajiApi: LajiApiService,
    private translate: TranslateService
  ) {
    super('dc:bibliographicCitation');
  }

  getAllAsLookUp(lang: string = this.translate.currentLang) {
    return this.fetchLookup(this.lajiApi.getList(LajiApi.Endpoints.checklists, {lang, page: 1, pageSize: 1000}).pipe(
      map(paged => paged.results),
    ), lang);
  }

  getName(id: string, lang: string) {
    return this.getAllAsLookUp(lang).pipe(
      map(data => data[id] || id )
    );
  }
}

