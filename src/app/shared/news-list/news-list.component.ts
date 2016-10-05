import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { NewsApi } from '../api/NewsApi';
import { News } from '../model/News';
import { PagedResult } from '../model/PagedResult';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css'],
  providers: []
})
export class NewsListComponent implements OnInit, OnDestroy {
  private pageSize = '5';
  private currentPage = 1;

  public news: PagedResult<News>;

  private subLang: Subscription;
  private subNews: Subscription;

  constructor(private newsService: NewsApi, private translate: TranslateService) {
  }

  ngOnInit() {
    this.subLang = this.translate.onLangChange.subscribe(
      () => {
        this.currentPage = 1;
        this.initNews()
      }
    );
    this.initNews();
  }

  ngOnDestroy() {
    if (this.subNews) {
      this.subNews.unsubscribe();
    }
    this.subLang.unsubscribe();
  }

  gotoPage(page: number): void {
    this.currentPage = page;
    this.initNews();
  }

  private initNews() {
    if (this.subNews) {
      this.subNews.unsubscribe();
    }
    this.subNews = this.newsService
      .findAll(this.translate.currentLang, '' + this.currentPage, this.pageSize)
      .subscribe(
        news => {
          this.news = news
        },
        err => console.log(err)
      );
  }
}
