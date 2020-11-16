import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SourceService } from '../shared/service/source.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HomeDataService, IHomeData } from './home-data.service';
import { Image } from '../shared/gallery/image-gallery/image.interface';
import { Router } from '@angular/router';
import { Global } from '../../environments/global';

@Component({
  selector: 'laji-home',
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  mapStartDate;
  images$: Observable<Image[]>;
  homeData$: Observable<IHomeData>;
  formId = Global.forms.whichSpecies;

  constructor(
    private sourceService: SourceService,
    private homeDataService: HomeDataService,
    public translate: TranslateService,
    public router: Router
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

  taxonSelect(e) {
    this.router.navigate(['/taxon/' + e]);
  }
}
