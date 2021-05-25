import { Component, OnInit } from '@angular/core';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { HomeDataService } from '../../+home/home-data.service';
import { News } from '../../shared/model/News';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';


@Component({
  selector: 'laji-technical-news',
  templateUrl: './technical-news.component.html',
  styleUrls: ['./technical-news.component.scss']
})
export class TechnicalNewsComponent implements OnInit {
  technicalNews$: Observable<News[]>;

  constructor(
    private apiService: LajiApiService,
    private homeDataService: HomeDataService
  ) {}

  ngOnInit() {
    const news$ = this.apiService.getList(LajiApi.Endpoints.news, { tag: 'technical', pageSize: 5 });
    this.technicalNews$ = this.homeDataService.getHomeData().pipe(
      switchMap(data => data?.news ? of(data.news) : news$),
      map(res => res.results),
      map((res) => res.filter((result) => {
        const days = 1;
        const isNew = Date.now() - parseInt(result.posted, 10) < (days * 86400000); // number of milliseconds in a day
        const isTechnical = result.tag === 'technical';
        return isTechnical && isNew;
      })),
      catchError(() => of([{} as News]))
    );
    return;
  }
}
