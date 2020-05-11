import { Component, OnInit } from '@angular/core';
import { LajiApiService, LajiApi } from 'app/shared/service/laji-api.service';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { News } from 'app/shared/model/News';


@Component({
  selector: 'laji-technical-news',
  templateUrl: './technical-news.component.html',
  styleUrls: ['./technical-news.component.scss']
})
export class TechnicalNewsComponent implements OnInit {
  technicalNews$: Observable<News[] | {}[]>;

  constructor(private apiService: LajiApiService) {}
  ngOnInit() {
    this.technicalNews$ = this.apiService.getList(LajiApi.Endpoints.news, { tag: 'technical', pageSize: 5 }).pipe(
      map((res) => res.results.filter((result) => {
        const days = 1;
        return Date.now() - parseInt(result.posted, 10) < (days * 86400000); // number of milliseconds in a day
      })),
      catchError(() => of([{}]))
    );
    return;
  }
}
