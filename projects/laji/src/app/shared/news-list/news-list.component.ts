import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { NewsFacade, PagedNews } from '../../news/news.facade';

@Component({
    selector: 'laji-news-list',
    templateUrl: './news-list.component.html',
    styleUrls: ['./news-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NewsListComponent {
  public news$: Observable<PagedNews>;

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
