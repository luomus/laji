import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {WarehouseApi} from 'projects/laji/src/app/shared/api/WarehouseApi';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';

@Component({
  selector: 'laji-invasive-species-control-result-map',
  templateUrl: './invasive-species-control-result-map.component.html',
  styleUrls: ['./invasive-species-control-result-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvasiveSpeciesControlResultMapComponent implements OnInit {

  query$: Observable<any>;

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

  ngOnInit(): void {
    // https://dev.laji.fi/api/warehouse/query/unit/aggregate?aggregateBy=unit.interpretations.invasiveControlEffectiveness,gathering.conversions.year
    this.query$ = this.warehouseApi.warehouseQueryAggregateGet(
      undefined,
      ['unit.interpretations.invasiveControlEffectiveness','gathering.conversions.year']
      // this.getFilterParams(year, season, birdAssociationArea),
      // ['document.namedPlaceId'],
      // undefined,
      // 1,
      // 1
    ).pipe(
      map(res => res.total),
      tap(r => console.log('log', r))
    );
  }

}
