
import { throwError as observableThrowError,  Observable, of as ObservableOf, interval as ObservableInterval } from 'rxjs';
import { Injectable } from '@angular/core';
import { PagedResult } from '../model/PagedResult';
import { News } from '../model/News';
import { LajiApi, LajiApiService } from './laji-api.service';

@Injectable({providedIn: 'root'})
export class NewsService {

  private currentData: PagedResult<News>;

  constructor(
    private lajiApi: LajiApiService
  ) {}

  getPage(lang: string, page: number, pageSize = 5): Observable<PagedResult<News>> {
    return ObservableInterval(60100)
      .startWith(0)
      .switchMap(() => this.lajiApi.getList(LajiApi.Endpoints.news, {lang, page, pageSize})
        .retryWhen(errors => errors.delay(1000).take(3).concat(observableThrowError(errors)))
      )
      .do(data => {
        this.currentData = data;
      })
      .startWith(this.currentData);
  }

  get(id: string): Observable<News> {
    if (this.currentData && this.currentData.results) {
      const result = this.currentData.results.filter(data => data.id === id);
      if (result.length === 1) {
        return ObservableOf(result[0]);
      }
    }
    return this.lajiApi.get(LajiApi.Endpoints.news, id);
  }
}
