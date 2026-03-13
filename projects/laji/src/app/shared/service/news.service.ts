import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { PagedResult } from '../model/PagedResult';
import { News } from '../model/News';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

@Injectable({providedIn: 'root'})
export class NewsService {

  constructor(
    private api: LajiApiClientBService
  ) {}

  getPage(page: number, pageSize = 5): Observable<PagedResult<News>> {
    return this.api.get('/news', { query: { page, pageSize } });
  }

  get(id: string): Observable<News> {
    return this.api.get('/news/{id}', { path: { id } });
  }
}
