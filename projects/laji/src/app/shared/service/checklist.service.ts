import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LajiApi, LajiApiService } from './laji-api.service';
import { map } from 'rxjs/operators';
import { AbstractCachedHttpService } from './abstract-cached-http.service';

@Injectable({providedIn: 'root'})
export class ChecklistService extends AbstractCachedHttpService<string> {

  constructor(private lajiApi: LajiApiService) {
    super('dc:bibliographicCitation');
  }

  getAllAsLookUp(lang?: string): Observable<{[id: string]: string}> {
    return this.fetchLookup(this.lajiApi.getList(LajiApi.Endpoints.checklists, {lang, page: 1, pageSize: 1000}).pipe(
      map(paged => paged.results),
    ), lang);
  }

  getName(id: string, lang) {
    return this.getAllAsLookUp(lang).pipe(
      map(data => data[id] || id )
    );
  }
}

