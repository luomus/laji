import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../environments/environment';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { SourceService } from '../shared/service/source.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Global } from '../../environments/global';
import { HomeDataService, IHomeData } from './home-data.service';

@Component({
  selector: 'laji-home',
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  mapStartDate;
  imagesQuery$: Observable<WarehouseQueryInterface>;
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
    this.imagesQuery$ = this.sourceService.getAllAsLookUp().pipe(
      map(sources => Object.keys(sources).filter((source) => source !== Global.sources.kotka)),
      map(sources => ({
        sourceId: sources,
        unidentified: true,
        countryId: ['ML.206'],
        cache: true
      }))
    );
  }
}
