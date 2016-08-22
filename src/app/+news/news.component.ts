import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { News, NewsApi, NewsListComponent } from "../shared";

@Component({
  selector: 'laij-news',
  templateUrl: './news.component.html',
  directives: [ NewsListComponent]
})
export class NewsComponent implements OnInit, OnDestroy {
  public newsItem:News;
  private subTrans:Subscription;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsApi
  ) {}

  ngOnInit() {
    this.subTrans = this.route.params.subscribe(params => {
      this.newsService.findById(params['id']).subscribe(
        newsItem => this.newsItem = newsItem,
        err => console.log(err)
      )
    });
  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
  }
}
