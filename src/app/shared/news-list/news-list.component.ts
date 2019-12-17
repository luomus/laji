import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { News } from '../model/News';
import { PagedResult } from '../model/PagedResult';
import { Observable, Subscription } from 'rxjs';
import { NewsService } from '../service/news.service';
import { Logger } from '../logger/logger.service';
import { NewsStore } from '../../+news/news.store';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { HomeDataService } from '../../graph-ql/service/home-data.service';

@Component({
  selector: 'laji-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsListComponent implements OnInit, OnDestroy {
  public news$: Observable<PagedResult<News>>;

  private pageSize = 5;
  private currentPage = 1;

  private subLang: Subscription;
  private subNews: Subscription;

  constructor(
    private newsService: NewsService,
    private translate: TranslateService,
    private logger: Logger,
    private store: NewsStore,
    private homeDataService: HomeDataService
  ) {
  }

  ngOnInit() {
    this.news$ = this.store.state$.pipe(
      map(state => state.list),
      distinctUntilChanged()
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
    const list = [this.translate.currentLang, this.currentPage, this.pageSize].join('_');
    if (this.store.state.currentList === list) {
      return;
    }
    if (this.currentPage === 1) {
      this.homeDataService.getHomeData().subscribe(
        (data) => {
          this.store.setList(list, data.news as any);
        }
      );
    } else {
      this.newsService.getPage(this.translate.currentLang, this.currentPage, this.pageSize)
        .subscribe(data => this.store.setList(list, data));
    }
  }
}
