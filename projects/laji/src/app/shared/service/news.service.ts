import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { PagedResult } from '../model/PagedResult';
import { News } from '../model/News';
import { LajiApi, LajiApiService } from './laji-api.service';

@Injectable({providedIn: 'root'})
export class NewsService {

  constructor(
    private lajiApi: LajiApiService
  ) {}

  getPage(lang: string, page: number, pageSize = 5): Observable<PagedResult<News>> {
    return this.lajiApi.getList(LajiApi.Endpoints.news, {lang, page, pageSize});
  }

  get(id: string): Observable<News> {
    return this.lajiApi.get(LajiApi.Endpoints.news, id);
  }
}
