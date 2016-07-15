import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { News, NewsApi, NewsListComponent } from "../shared";

@Component({
  selector: 'laij-news',
  templateUrl: './news.component.html',
  directives: [ NewsListComponent]
})
export class NewsComponent {
  public newsItem:News;

  constructor(private route: ActivatedRoute, private translate: TranslateService, private newsService: NewsApi) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.newsService.findById(params['id']).subscribe(
        newsItem => this.newsItem = newsItem,
        error => console.log(error)
      )
    });
  }
}
