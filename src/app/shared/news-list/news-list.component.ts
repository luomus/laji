import { Component } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { NewsApi } from "../api/NewsApi";
import { News } from "../model/News";
import { PagedResult } from "../model/PagedResult";

@Component({
  selector:'laji-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css'],
  providers: [ ]
})
export class NewsListComponent {
  private pageSize = '5';
  private currentPage = 1;

  public news:PagedResult<News>;

  constructor(private newsService: NewsApi, private translate:TranslateService) {}

  ngOnInit() {
    this.translate.onLangChange.subscribe(
      () => {
        this.currentPage = 1;
        this.initNews()
      }
    );
    this.initNews();
  }

  gotoPage(page:number):void {
    this.currentPage = page;
    this.initNews();
  }

  private initNews() {
    this.newsService.findAll(this.translate.currentLang, '' + this.currentPage, this.pageSize).subscribe(
      news => { this.news = news },
      err => console.log(err)
    );
  }

}
