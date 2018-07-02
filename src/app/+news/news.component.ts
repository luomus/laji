import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NewsService } from '../shared/service/news.service';
import { Logger } from '../shared/logger/logger.service';
import { News } from '../shared/model/News';

@Component({
  selector: 'laji-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsComponent implements OnInit, OnDestroy {
  public newsItem: News;
  private subTrans: Subscription;

  constructor(private route: ActivatedRoute,
              private newsService: NewsService,
              private cd: ChangeDetectorRef,
              private logger: Logger
  ) {
  }

  ngOnInit() {
    this.subTrans = this.route.params.subscribe(params => {
      this.newsService.get(params['id']).subscribe(
        newsItem => {
          this.newsItem = newsItem;
          this.cd.markForCheck();
        },
        err => {
          this.logger.warn('Failed to fetch news by id', err);
          this.cd.markForCheck();
        }
      );
    });
  }

  ngOnDestroy() {
    if (this.subTrans) {
      this.subTrans.unsubscribe();
    }
  }
}
