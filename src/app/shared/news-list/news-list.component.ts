import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { News } from '../model/News';
import { PagedResult } from '../model/PagedResult';
import { Subscription } from 'rxjs';
import { NewsService } from '../service/news.service';
import { Logger } from '../logger/logger.service';

@Component({
  selector: 'laji-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsListComponent implements OnInit, OnDestroy {
  public news: PagedResult<News>;

  private pageSize = 5;
  private currentPage = 1;

  private subLang: Subscription;
  private subNews: Subscription;

  constructor(
    private newsService: NewsService,
    private translate: TranslateService,
    private logger: Logger,
    private cd: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.subLang = this.translate.onLangChange.subscribe(
      () => {
        this.currentPage = 1;
        this.initNews();
      }
    );
    this.initNews();
  }

  ngOnDestroy() {
    if (this.subNews) {
      this.subNews.unsubscribe();
    }
    if (this.subLang) {
      this.subLang.unsubscribe();
    }
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
      .getPage(this.translate.currentLang, this.currentPage, this.pageSize)
      .subscribe(
        news => {
          this.news = news;
          this.cd.markForCheck();
        },
        err => {
          this.logger.warn('Failed to fetch news', err);
          this.cd.markForCheck();
        }
      );
  }
}
