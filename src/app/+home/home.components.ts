import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { SearchQuery } from '../+observation/search-query.model';
import { TranslateService } from '@ngx-translate/core';
import {environment} from '../../environments/environment.vir';
import {WarehouseQueryInterface} from '../shared/model/WarehouseQueryInterface';
import {SourceService} from '../shared/service/source.service';
import { map } from 'rxjs/operators';

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
  query: WarehouseQueryInterface;
  formId = environment.whichSpeciesForm;

  constructor(
    private sourceService: SourceService,
    private cd: ChangeDetectorRef,
    public translate: TranslateService
  ) {
  }

  ngOnInit() {
    const start = moment();
    start.subtract(1, 'd');
    this.mapStartDate = start.format('YYYY-MM-DD');
    this.sourceService.getAllAsLookUp().pipe(
      map(sources => Object.keys(sources).filter((source) => source !== environment.sources.kotka))
    )
      .subscribe(sources => {
        this.query = {
          sourceId: sources,
          unidentified: true,
          countryId: ['ML.206'],
          cache: true
        };
        this.cd.markForCheck();
      });
  }
}
