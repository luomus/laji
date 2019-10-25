import { Component, Input } from '@angular/core';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Observable } from 'rxjs';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { map, tap } from 'rxjs/operators';
import { IdService } from '../../../shared/service/id.service';

export interface BiogeographicalArea {
 'ML.270'?: string;
 'ML.271'?: string;
 'ML.268'?: string;
 'ML.269'?: string;
 'ML.266'?: string;
 'ML.267'?: string;
 'ML.265'?: string;
 'ML.264'?: string;
 'ML.263'?: string;
 'ML.259'?: string;
 'ML.260'?: string;
 'ML.261'?: string;
 'ML.262'?: string;
 'ML.255'?: string;
 'ML.256'?: string;
 'ML.257'?: string;
 'ML.258'?: string;
 'ML.251'?: string;
 'ML.252'?: string;
 'ML.253'?: string;
 'ML.254'?: string;
}

@Component({
  selector: 'laji-biogeographical-province',
  templateUrl: './biogeographical-province.component.html',
  styles: [`
    text {
        font-size: 30px;
    }
  `]
})
export class BiogeographicalProvinceComponent {

  @Input() fill: BiogeographicalArea = {};
  @Input() height = '100%';

  borderColor = '#333';
  loading = false;
  results$: Observable<BiogeographicalArea>;

  private colorPalette = [
    '#f7fcfd',
    '#e5f5f9',
    '#ccece6',
    '#99d8c9',
    '#66c2a4',
    '#41ae76',
    '#238b45',
    '#006d2c',
    '#00441b'
  ];

  constructor(
    private warehouseApi: WarehouseApi
  ) {}

  @Input()
  set query(query: WarehouseQueryInterface) {
    const mapQuery: WarehouseQueryInterface = {...query, countryId: ['ML.206']};
    this.results$ = this.warehouseApi.warehouseQueryAggregateGet(
      mapQuery,
      ['gathering.interpretations.biogeographicalProvince'],
      [],
      100,
      1
    ).pipe(
      map((result) => result.results.map(aggr => ({
        count: aggr.count,
        key: IdService.getId(aggr.aggregateBy['gathering.interpretations.biogeographicalProvince'])
      }))),
      tap(counts => this.initFillColors(counts)),
      map(result => result.reduce((cumulative, current) => {
        if (cumulative[current.key]) {
          cumulative[current.key] += current.count;
        } else {
          cumulative[current.key] = current.county;
        }
        return cumulative;
      }, {}))
    );
  }

  private initFillColors(result: {count: number, key: string}[]) {
    const colors = {};
    result.forEach(res => {
      if (res.count > 1000) {
        colors[res.key] = this.colorPalette[this.colorPalette.length - 1];
      } else {
        colors[res.key] = this.colorPalette[Math.floor(res.count / 10) % 10];
      }
    });
    this.fill = colors;
  }
}
