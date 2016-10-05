import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { News, NewsApi } from '../shared';
import { TranslateService } from 'ng2-translate';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'laij-news',
  templateUrl: './news.component.html',
  providers: [
    NewsApi
  ]
})
export class NewsComponent implements OnInit, OnDestroy {
  public newsItem: News;
  private subTrans: Subscription;

  constructor(private route: ActivatedRoute,
              private newsService: NewsApi,
              private translate: TranslateService) {
  }

  ngOnInit() {
    // TODO remove when https://github.com/ocombe/ng2-translate/issues/232 is fixed
    this.translate.use(SharedModule.currentLang);
    this.subTrans = this.route.params.subscribe(params => {
      this.newsService.findById(params['id']).subscribe(
        newsItem => this.newsItem = newsItem,
        err => console.log(err)
      );
    });
  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
  }
}
