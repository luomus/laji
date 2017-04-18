import { Component, OnInit } from '@angular/core';
import { SearchQuery } from '../+observation/search-query.model';
import { NewsApi } from '../shared/api/NewsApi';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-home',
  providers: [
    SearchQuery,
    NewsApi
  ],
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit{

  mapStartDate;

  constructor(public translate: TranslateService) {
  }

  ngOnInit() {
    const start = moment();
    start.subtract(1, 'd');
    this.mapStartDate = start.format('YYYY-MM-DD');
  }
}
