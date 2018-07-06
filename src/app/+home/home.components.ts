import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SearchQuery } from '../+observation/search-query.model';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../environments/environment.vir';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { SourceService } from '../shared/service/source.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'laji-home',
  providers: [
    SearchQuery
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
      map(sources => Object.keys(sources).filter((source) => source !== environment.sources.kotka)),
      map(sources => ({
        sourceId: sources,
        unidentified: true,
        countryId: ['ML.206'],
        cache: true
      }))
    );
  }
}
