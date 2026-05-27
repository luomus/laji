import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map, catchError, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { HomeDataService } from '../../+home/home-data.service';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';

@Component({
    selector: 'laji-technical-news',
    template: `<laji-technical-news-dumb [news]="news$ | async"></laji-technical-news-dumb>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TechnicalNewsComponent {
  news$ = this.homeDataService.getHomeData().pipe(
    switchMap(data => data?.news
      ? of(data.news)
      : this.api.get('/news', { query: { tag: 'technical', pageSize: 5 } })),
    map(res => res.results),
    catchError(() => of(null))
  );

  constructor(private api: LajiApiClientService, private homeDataService: HomeDataService) {}
}
