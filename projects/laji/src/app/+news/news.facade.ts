import { Injectable } from '@angular/core';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map, switchMap, take
} from 'rxjs/operators';
import { News } from '../shared/model/News';
import { PagedResult } from '../shared/model/PagedResult';
import { NewsService } from '../shared/service/news.service';
import { HomeDataService } from '../+home/home-data.service';
import { TranslateService } from '@ngx-translate/core';

export interface INewsState {
  active: null|News;
  list: PagedResult<News>;
}

let _state: INewsState = {
  active: null,
  list: { results: [], currentPage: 0, total: 0, pageSize: 5 },
};

@Injectable({providedIn: 'root'})
export class NewsFacade {
  private readonly store = new BehaviorSubject<INewsState>(_state);
  readonly state$ = this.store.asObservable();

  readonly active$ = this.state$.pipe(map((state) => state.active), distinctUntilChanged());
  readonly list$ = this.state$.pipe(map((state) => state.list), distinctUntilChanged());

  private listSub: Subscription;
  private currentSub: Subscription;

  constructor(
    private newsService: NewsService,
    private homeDataService: HomeDataService,
    private translate: TranslateService
  ) {}

  getActivePage(): number {
    return _state.list.currentPage;
  }

  loadPage(page: number): void {
    const lang = this.translate.currentLang;

    if (this.listSub) {
      this.listSub.unsubscribe();
    }

    const newsRemote$ = this.newsService.getPage(lang, page).pipe(take(1));
    const newsGraph$ = this.homeDataService.getHomeData().pipe(
      map(data => data.news as PagedResult<News>),
      take(1),
      switchMap(news => news ? of(news) : newsRemote$)
    );

    this.listSub = (page === 1 ? newsGraph$ : newsRemote$).pipe(
      catchError(() => newsRemote$)
    ).subscribe(news => this.updateState({..._state, list: news}));
  }

  activate(id: string): void {
    const newsItem = _state.list.results.find(news => news.id === id);

    if (this.currentSub) {
      this.currentSub.unsubscribe();
    }
    if (newsItem && newsItem.content) {
      this.updateActive(newsItem);
    } else {
      this.currentSub = this.newsService.get(id).subscribe(news => this.updateActive(news));
    }
  }

  private updateActive(news: News) {
    this.updateState({..._state, active: news});
  }

  private updateState(state: INewsState) {
    this.store.next(_state = state);
  }

}
