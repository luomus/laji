import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { HomeDataService } from '../../+home/home-data.service';
import { News } from '../../shared/model/News';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';


@Component({
  selector: 'laji-technical-news',
  template: `<laji-technical-news-dumb [news]="news$ | async"></laji-technical-news-dumb>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechnicalNewsComponent {
  news$: Observable<News[] | null> = this.homeDataService.getHomeData().pipe(
    switchMap(data => data?.news
      ? of(data.news)
      : this.apiService.getList(LajiApi.Endpoints.news, { tag: 'technical', pageSize: 5 })),
    map(res => res.results),
    catchError(() => of(null))
  );

  constructor(private apiService: LajiApiService, private homeDataService: HomeDataService) {}
}
