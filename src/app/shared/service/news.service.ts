import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResult } from '../model/PagedResult';
import { News } from '../model/News';
import { NewsApi } from '../api/NewsApi';

@Injectable()
export class NewsService {

  private currentKey: string;
  private currentData: PagedResult<News>;

  constructor(
    private newsApi: NewsApi
  ) {}

  getPage(lang: string, page: number, pageSize: number = 5): Observable<PagedResult<News>> {
    let cacheKey = lang + page + ':' + pageSize;
    if (cacheKey === this.currentKey) {
      return Observable.of(this.currentData);
    }
    return this.newsApi.findAll(lang, '' + page,  '' + pageSize)
      .do(data => {
        this.currentData = data;
        this.currentKey = cacheKey;
      });
  }

  get(id: string): Observable<News> {
    if (this.currentData && this.currentData.results) {
      let result = this.currentData.results.filter(data => data.id === id);
      if (result.length === 1) {
        return Observable.of(result[0]);
      }
    }
    return this.newsApi.findById(id);
  }
}
