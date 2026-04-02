import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { News } from '../../../+news/news.facade';

@Component({
    selector: 'laji-technical-news-dumb',
    templateUrl: './technical-news-dumb.component.html',
    styleUrls: ['./technical-news-dumb.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TechnicalNewsDumbComponent {
  @Input() set news(news: News[] | null) {
    this.technicalNews = (news || []).filter((newsItem => {
      const days = 1;

      let isNew = false;
      if (newsItem.posted) {
        isNew = Date.now() - parseInt(newsItem.posted, 10) < (days * 86400000); // number of milliseconds in a day
      }

      const isTechnical = newsItem.tags?.includes('technical');
      return isTechnical && isNew;
    }));
  }

  @Input() absoluteLink = '';

  technicalNews: News[] = [];
}
