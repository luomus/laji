import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { SearchQueryService } from '../+observation/search-query.service';
import { Observable } from 'rxjs';

@Component({
  template: `
    <laji-observation-map
      [height]="-1"
      [query]="query$ | async"
      [initWithWorldMap]="true"
      [controls]="{layer: false}"
      [visualizationMode]="'recordAge'"
      [settingsKey]="'embeddedObservationMap'"
      [noClick]="true"
    ></laji-observation-map>
  `,
  selector: 'laji-embedded-observation-map',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmbeddedObservationMapComponent implements OnInit {
  query$: Observable<WarehouseQueryInterface>;

  constructor(
    private route: ActivatedRoute,
    private searchQueryService: SearchQueryService
  ) {}

  ngOnInit() {
    this.query$ = this.route.queryParams.pipe(
      map(params => this.searchQueryService.getQueryFromUrlQueryParams(params))
    );
  }
}
