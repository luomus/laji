import { Component } from '@angular/core';

import {SearchQuery} from "../+observation/search-query.model";
import {NewsApi} from "../shared/api/NewsApi";
import {TranslateService} from "ng2-translate";

@Component({
  selector: 'laji-home',
  providers: [
    SearchQuery,
    NewsApi
  ],
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  constructor(public translate: TranslateService) {}
}
