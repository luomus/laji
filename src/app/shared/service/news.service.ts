import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PagedResult } from '../model/PagedResult';
import { News } from '../model/News';
import { NewsApi } from '../api/NewsApi';

@Injectable()
export class NewsService {

  private currentData: PagedResult<News>;

  constructor(
    private newsApi: NewsApi
  ) {}

  getPage(lang: string, page: number, pageSize = 5): Observable<PagedResult<News>> {
    return Observable
      .interval(60100)
      .startWith(0)
      .switchMap(() => this.newsApi.findAll(lang, '' + page,  '' + pageSize))
      .do(data => {
        this.currentData = data;
      })
      .startWith(this.currentData);
  }

  get(id: string): Observable<News> {
    if (this.currentData && this.currentData.results) {
      const result = this.currentData.results.filter(data => data.id === id);
      if (result.length === 1) {
        return Observable.of(result[0]);
      }
    }
    return this.newsApi.findById(id);
  }
}
