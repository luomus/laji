import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SearchQueryService } from '../+observation/search-query.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../environments/environment';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { SourceService } from '../shared/service/source.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { Global } from '../../environments/global';

@Component({
  selector: 'laji-home',
  providers: [
    SearchQueryService
  ],
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  mapStartDate;
  imagesQuery$: Observable<WarehouseQueryInterface>;
  formId = environment.whichSpeciesForm;

  constructor(
    private sourceService: SourceService,
    public translate: TranslateService
  ) {
  }

  ngOnInit() {
    const start = moment();
    start.subtract(1, 'd');
    this.mapStartDate = start.format('YYYY-MM-DD');
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
