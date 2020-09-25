import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TitleMetaPageService {

  constructor(
    private metaService: Meta,
    private titleService: Title
  ) { }

  addTag(news) {
    this.updateTitle(news.title);
    this.metaService.removeTag("property='description'");
    this.metaService.addTag({ property: 'description', content: this.prepareDescriptionTag(news.content) });
    this.metaService.addTag({ property: 'og:title', content: news.title });
    this.metaService.addTag({ property: 'og:description', content: this.prepareDescriptionTag(news.content) });
    this.metaService.addTag({ property: 'twitter:title', content: news.title });
    this.metaService.addTag({ property: 'twitter:description', content: this.prepareDescriptionTag(news.content) });
  }

  private prepareDescriptionTag(description) {
    return description.substring(description.indexOf('<p>')+3, description.indexOf('</p>')-1).replace(/<[^>]*>/g, '')
  }

  private updateTitle(newsTitle) {
    const oldTitle = this.titleService.getTitle();
    return this.titleService.setTitle(newsTitle + ' - ' + oldTitle)
  }

}
