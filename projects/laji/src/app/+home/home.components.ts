import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SourceService } from '../shared/service/source.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HomeDataService, IHomeData } from './home-data.service';
import { Image } from '../shared/gallery/image-gallery/image.interface';
import { Router } from '@angular/router';
import { Global } from '../../environments/global';
import { LajiApi, LajiApiService } from '../shared/service/laji-api.service';
import { Information } from '../shared/model/Information';
import { NewsFacade } from '../+news/news.facade';


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
  publications$: Observable<Information>;

  formId = Global.forms.whichSpecies;

  constructor(
    private sourceService: SourceService,
    private homeDataService: HomeDataService,
    public translate: TranslateService,
    public router: Router,
    private apiService: LajiApiService,
    private newsFacade: NewsFacade
  ) {
  }

  ngOnInit() {
    this.newsFacade.loadPage(1);
    this.mapStartDate = HomeDataService.getRecentDate();
    this.homeData$ = this.homeDataService.getHomeData();
    this.images$ = this.homeData$.pipe(
      map(data => data.identify && data.identify.results || []),
      map(data => data.map(item => item.unit.media[0]))
    );
    this.publications$ = this.apiService.get(LajiApi.Endpoints.information, 'finbif-bib-top', {});
  }

  taxonSelect(e) {
    this.router.navigate(['/taxon/' + e]);
  }
}
