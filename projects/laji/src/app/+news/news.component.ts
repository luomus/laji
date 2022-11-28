import { ChangeDetectionStrategy, Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { News } from '../shared/model/News';
import { map, switchMap, tap, filter, delay } from 'rxjs/operators';
import { getDescription, HeaderService } from '../shared/service/header.service';
import { Title } from '@angular/platform-browser';
import { NewsFacade } from './news.facade';


@Component({
  selector: 'laji-news',
  templateUrl: './news.component.html',
  styleUrls: ['../../styles/information.scss', './news.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsComponent implements OnInit {
  public newsItem$: Observable<News>;

  constructor(private route: ActivatedRoute,
              private newsFacade: NewsFacade,
              private headerService: HeaderService,
              private title: Title,
              @Inject(PLATFORM_ID) private platformId
  ) {}

  ngOnInit() {
    this.newsItem$ = this.route.params.pipe(
      map(params => params['id']),
      tap(id => this.newsFacade.activate(id)),
      switchMap((id) => this.newsFacade.active$.pipe(
        filter(news => news?.id === id),
      )),
      delay(0),
      tap(news => this.updateHeaders(news))
    );
  }

  private updateHeaders(news: News): void {
    const pageTitle = news.title + ' | ' + this.title.getTitle();
    const paragraph = getDescription(news.content || '');

    this.headerService.setHeaders({
      title: pageTitle,
      description: paragraph
    });

    if (news.featuredImage) {
      this.headerService.setHeaders({
        image: news.featuredImage
      });
    } else if (isPlatformServer(this.platformId)) {
      const matches = news.content.match(/<img.+?src="(.*?)"/);
      if (matches?.[1]?.length > 0) {
        this.headerService.setHeaders({
          image: matches[1]
        });
      }
    }
  }
}
