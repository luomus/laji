import { Injectable } from '@angular/core';
import { LajiApi, LajiApiService } from './laji-api.service';
import { map } from 'rxjs';
import { AbstractCachedHttpService } from './abstract-cached-http.service';
import { TranslateService } from '@ngx-translate/core';
import { Checklist } from '../model/Checklist';

@Injectable({providedIn: 'root'})
export class ChecklistService extends AbstractCachedHttpService<Checklist> {

  constructor(
    private lajiApi: LajiApiService,
    private translate: TranslateService
  ) {
    super('name');
  }

  getAllAsLookUp(lang: string = this.translate.getCurrentLang()) {
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
