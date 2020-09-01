import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../environments/environment';
import { SourceService } from '../shared/service/source.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HomeDataService, IHomeData } from './home-data.service';
import { Image } from '../shared/gallery/image-gallery/image.interface';

@Component({
  selector: 'laji-home',
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit {

  mapStartDate;
  images$: Observable<Image[]>;
  homeData$: Observable<IHomeData>;
  formId = environment.whichSpeciesForm;

  constructor(
    private sourceService: SourceService,
    private homeDataService: HomeDataService,
    public translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.mapStartDate = HomeDataService.getRecentDate();
    this.homeData$ = this.homeDataService.getHomeData();
    this.images$ = this.homeData$.pipe(
      map(data => data.identify && data.identify.results || []),
      map(data => data.map(item => item.unit.media[0]))
    );
  }

  ngAfterViewInit() {
    if (!document.getElementById('twitter-wjs')) {
      const scriptElem = document.getElementsByTagName('script')[0];
      const newScriptElem = document.createElement('script');
      newScriptElem.id = 'twitter-wjs';
      newScriptElem.src = 'https://platform.twitter.com/widgets.js';
      scriptElem.parentNode.insertBefore(newScriptElem, scriptElem);
    }
  }
}
