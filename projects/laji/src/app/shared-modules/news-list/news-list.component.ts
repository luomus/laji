import { ChangeDetectionStrategy, Component } from '@angular/core';
import { News } from '../../shared/model/News';
import { PagedResult } from '../../shared/model/PagedResult';
import { Observable } from 'rxjs';
import { NewsFacade } from '../../+news/news.facade';

@Component({
  selector: 'laji-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsListComponent {
  public news$: Observable<PagedResult<News>>;

  constructor(
    private newsFacade: NewsFacade
  ) {
    this.news$ = this.newsFacade.list$;
    if (this.newsFacade.getActivePage() === 0) {
      this.newsFacade.loadPage(1);
    }
  }

  gotoPage(page: number): void {
    this.newsFacade.loadPage(page);
  }
}
