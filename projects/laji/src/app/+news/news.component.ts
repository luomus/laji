import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { NewsService } from '../shared/service/news.service';
import { Logger } from '../shared/logger/logger.service';
import { News } from '../shared/model/News';
import { distinctUntilChanged, map, switchMap, tap, filter } from 'rxjs/operators';
import { NewsStore } from './news.store';
import { HeaderService } from '../shared/service/header.service';
import { Title } from '@angular/platform-browser';


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
              private headerService: HeaderService,
              private title: Title
  ) {}

  ngOnInit() {
    this.newsItem$ = this.store.state$.pipe(
      map(state => state.current),
      distinctUntilChanged(),
      filter(info => !!info),
      tap(info => {
        this.title.setTitle(info.title + ' | ' + this.title.getTitle());
      })
    );
    this.subTrans = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.store.state.current && this.store.state.current.id === id ?
        ObservableOf(this.store.state.current) : this.newsService.get(id))
    ).subscribe(newsItem => {
      this.store.setCurrent(newsItem);
      if (newsItem.featuredImage) {
        this.headerService.updateFeatureImage(newsItem.featuredImage);
      }
      setTimeout(() => {
        const paragraph = (document.getElementById('wrapper')).getElementsByTagName('p').item(0).innerText;
        this.headerService.updateMetaDescription(paragraph);
        this.headerService.createTwitterCard(newsItem.title + ' | ' + this.title.getTitle());
      }, 0);
    });
  }

  ngOnDestroy() {
    if (this.subTrans) {
      this.subTrans.unsubscribe();
    }
  }
}
