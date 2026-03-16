import { Injectable } from '@angular/core';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map, switchMap, take
} from 'rxjs';
import { HomeDataService } from '../+home/home-data.service';
import { TranslateService } from '@ngx-translate/core';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api';

export type News = components['schemas']['LajiBackendCMSNode'];
export type PagedNews = components['schemas']['NewsPagedDto'];

export interface INewsState {
  active: null|News;
  list: PagedNews;
}

let _state: INewsState = {
  active: null,
  list: { results: [], currentPage: 0, total: 0, pageSize: 5, lastPage: 0, '@context': '' },
};

@Injectable({providedIn: 'root'})
export class NewsFacade {
  private readonly store = new BehaviorSubject<INewsState>(_state);
  readonly state$ = this.store.asObservable();

  readonly active$ = this.state$.pipe(map((state) => state.active), distinctUntilChanged());
  readonly list$ = this.state$.pipe(map((state) => state.list), distinctUntilChanged());

  private listSub?: Subscription;
  private currentSub?: Subscription;

  constructor(
    private api: LajiApiClientBService,
    private homeDataService: HomeDataService,
    private translate: TranslateService
  ) {}

  getActivePage(): number {
    return _state.list.currentPage;
  }

  loadPage(page: number): void {
    const lang = this.translate.getCurrentLang();

    if (this.listSub) {
      this.listSub.unsubscribe();
    }

    const newsRemote$ = this.api.get('/news', { query: { page, pageSize: 5 } }).pipe(take(1));
    const newsGraph$ = this.homeDataService.getHomeData().pipe(
      map(data => data.news as any as PagedNews),
      take(1),
      switchMap(news => news ? of(news) : newsRemote$)
    );

    this.listSub = (page === 1 ? newsGraph$ : newsRemote$).pipe(
      catchError(() => newsRemote$),
      map(news => ({...news, results: (news.results || []).map(item => this.fixNews(item as unknown as News))}))
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
      this.currentSub = this.api.get('/news/{id}', { path: { id } }).subscribe(news => this.updateActive(news as unknown as News));
    }
  }

  private updateActive(news: News) {
    this.updateState({..._state, active: this.fixNews(news)});
  }

  private updateState(state: INewsState) {
    this.store.next(_state = state);
  }

  /**
   * News from the api have incorrect time zone causing incorrect hour without this hack.
   */
  private fixNews(news: News) {
    return {
      ...news,
      posted: (news.posted || '').substr(0, 10),
      modified: (news.modified || '').substr(0, 10)
    };
  }

}
