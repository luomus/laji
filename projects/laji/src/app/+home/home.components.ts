import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { Observable } from 'rxjs';
import { HomeDataService, IHomeData } from './home-data.service';
import { Image } from '../shared/gallery/image-gallery/image.interface';
import { Router } from '@angular/router';
import { Global } from '../../environments/global';
import { NewsFacade } from '../+news/news.facade';
import { environment } from '../../environments/environment';
import { MultiLanguage } from '../shared/model/MultiLanguage';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api';

type Information = components['schemas']['Information'];

@Component({
    selector: 'laji-home',
    styleUrls: ['./home.component.scss'],
    templateUrl: './home.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HomeComponent implements OnInit {

  mapStartDate!: string;
  mapQueryParams!: Record<string, string>;
  dashboardLink!: MultiLanguage;
  images$!: Observable<Pick<Image, 'thumbnailURL'>[]>;
  homeData$!: Observable<IHomeData>;
  publications$!: Observable<Information>;

  formId = Global.forms.whichSpecies;


  constructor(
    private homeDataService: HomeDataService,
    public translate: TranslateService,
    public router: Router,
    private api: LajiApiClientBService,
    private newsFacade: NewsFacade
  ) {
  }

  ngOnInit() {
    this.newsFacade.loadPage(1);
    this.mapStartDate = HomeDataService.getRecentDate();
    this.mapQueryParams = {firstLoadedSameOrAfter: this.mapStartDate, countryId: 'ML.206'};
    this.dashboardLink = {
      fi: environment.dashboardUrl + '?_input_&lang="fi"',
      en: environment.dashboardUrl + '?_input_&lang="en"',
      sv: environment.dashboardUrl + '?_input_&lang="en"'
    };
    this.homeData$ = this.homeDataService.getHomeData();
    this.images$ = this.homeData$.pipe(
      map(data => data.identify && data.identify.results || []),
      map(data => data.map(item => item.unit.media[0]))
    );
    this.publications$ = this.api.get('/information/{id}', { path: { id: 'finbif-bib-top' } });
  }

  taxonSelect(e: string) {
    this.router.navigate(['/taxon/' + e]);
  }
}
