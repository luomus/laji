import { Component, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { PlatformService } from '../../shared/service/platform.service';

@Component({
  selector: 'laji-twitter-feed',
  template: '<a class="twitter-timeline" href="https://twitter.com/lajitieto">Tweets by lajitieto</a>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwitterFeedComponent implements AfterViewInit {

  constructor(
    private platformService: PlatformService
  ) { }


  ngAfterViewInit() {
    if (this.platformService.isBrowser) {
      try {
        (<any>window).twttr.widgets.load();
      } catch (e) {}
    }
  }

}
