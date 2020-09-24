import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { NewsService } from '../shared/service/news.service';
import { Logger } from '../shared/logger/logger.service';
import { News } from '../shared/model/News';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { NewsStore } from './news.store';
import { BrowserModule, Meta } from '@angular/platform-browser';

@Component({
  selector: 'laji-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsComponent implements OnInit, OnDestroy {
  public newsItem$: Observable<News>;
  private subTrans: Subscription;

  constructor(private route: ActivatedRoute,
              private newsService: NewsService,
              private cd: ChangeDetectorRef,
              private logger: Logger,
              private store: NewsStore,
              private metaService: Meta
  ) {
    //this.addTag(newsItem);
  }

  ngOnInit() {
    this.newsItem$ = this.store.state$.pipe(
      map(state => state.current),
      distinctUntilChanged()
    );
    this.subTrans = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.store.state.current && this.store.state.current.id === id ?
        ObservableOf(this.store.state.current) : this.newsService.get(id))
    ).subscribe(newsItem => {
      this.store.setCurrent(newsItem);
      this.addTag(newsItem);
    });
  }

  addTag(news) {
    this.metaService.addTag({ property: 'og:title', content: news.title });
    this.metaService.addTag({ property: 'og:description', content: 'Content Title for social media' });
    this.metaService.addTag({ property: 'twitter:title', content: news.title });
    this.metaService.addTag({ property: 'twitter:description', content: 'Content Title for social media' });
  }

  ngOnDestroy() {
    if (this.subTrans) {
      this.subTrans.unsubscribe();
    }
  }
}
