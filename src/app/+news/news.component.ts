import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { News } from '../shared';
import { NewsService } from '../shared/service/news.service';
import { Logger } from '../shared/logger/logger.service';

@Component({
  selector: 'laji-news',
  templateUrl: './news.component.html'
})
export class NewsComponent implements OnInit, OnDestroy {
  public newsItem: News;
  private subTrans: Subscription;

  constructor(private route: ActivatedRoute,
              private newsService: NewsService,
              private logger: Logger
  ) {
  }

  ngOnInit() {
    this.subTrans = this.route.params.subscribe(params => {
      this.newsService.get(params['id']).subscribe(
        newsItem => this.newsItem = newsItem,
        err => this.logger.warn('Failed to fetch news by id', err)
      );
    });
  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
  }
}
