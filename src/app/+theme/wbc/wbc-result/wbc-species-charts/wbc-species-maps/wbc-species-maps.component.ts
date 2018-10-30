import { Component, OnInit, OnChanges, Input, ChangeDetectorRef } from '@angular/core';
import { WbcResultService, SEASON } from '../../wbc-result.service';
import { WarehouseQueryInterface } from '../../../../../shared/model/WarehouseQueryInterface';
import { YkjService } from '../../../../../shared-modules/ykj/service/ykj.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'laji-wbc-species-maps',
  templateUrl: './wbc-species-maps.component.html',
  styleUrls: ['./wbc-species-maps.component.css']
})
export class WbcSpeciesMapsComponent implements OnInit, OnChanges {
  @Input() taxonId: string;
  @Input() taxonCensus = undefined;
  @Input() showSeasonComparison = true;
  @Input() year: number;
  @Input() season: SEASON;
  @Input() birdAssociationArea: string;

  querys: WarehouseQueryInterface[] = [];
  zeroQuerys: WarehouseQueryInterface[] = [];
  data: any = [];
  loading = false;

  breaks = [0, 1, 2, 8, 32, 128, 512];
  labels = ['0', '1', '2-7', '8-31', '32-127', '128-511', '512-'];
  colorRange = ['#ffffff', 'violet', 'blue', 'lime', 'yellow', 'orange', 'red'];

  differenceBreaks = [-31, -1, 0, 1, 31];
  differenceLabels = ['< -30', '< -1', '0', '> 1', '> 30'];
  differenceColorRange = ['blue', 'violet', 'white', 'orange', 'red'];

  constructor(
    private resultService: WbcResultService,
    private ykjService: YkjService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() { }

  ngOnChanges() {
    if (this.taxonId && this.year) {
      this.updateMapData();
    }
  }

  private updateMapData() {
    this.querys = [];
    this.zeroQuerys = [];
    this.data = [];

    if (this.showSeasonComparison) {
      this.setQuery(0, 'fall');
      this.setQuery(1, 'winter');
      this.setQuery(2, 'spring');
    } else {
      this.setYearComparisonData();
    }
  }

  private setQuery(nbr: number, season: SEASON) {
    const querys = this.getQuerys(season);
    this.querys[nbr] = querys.query;
    this.zeroQuerys[nbr] = querys.zeroQuery;
  }

  private setYearComparisonData() {
    this.loading = true;
    forkJoin([
      this.getData(this.year),
      this.getData(this.resultService.getPreviousTenYears(this.year))
    ]).pipe(
      map(data => ({
        data: data[0][0],
        zeroData: data[0][1],
        previousTenYearsData: data[1][0],
        previousTenYearsZeroData: data[1][1]
      }))
    ).subscribe(data => {
      this.data[0] = this.ykjService.combineGeoJsons(data.data, data.zeroData);
      this.data[1] = this.ykjService.combineGeoJsons(this.getAverageData(data.previousTenYearsData), data.previousTenYearsZeroData);
      this.data[2] = this.getDifferenceData(this.data[0], this.data[1], data.zeroData, data.previousTenYearsZeroData);
      this.loading = false;
      this.cd.markForCheck();
    })
  }

  private getAverageData(data: any, years = 10) {
    data.map(d => {
      d.properties.count /= years;
      d.properties.individualCountSum /= years;
    });
    return data;
  }

  private getDifferenceData(data, tenYearsData, zeroData, tenYearsZeroData) {
    const result = this.ykjService.combineGeoJsons(tenYearsZeroData, zeroData);
    result.map(r => {
      const grid = r.properties.grid;
      const dataPoint = data.find(d => d.properties.grid === grid);
      const tenYearsDataPoint = tenYearsData.find(d => d.properties.grid === grid);
      r.properties.count = (dataPoint ? dataPoint.properties.count : 0) - (tenYearsDataPoint ? tenYearsDataPoint.properties.count : 0);
      r.properties.individualCountSum = (dataPoint ? dataPoint.properties.individualCountSum : 0) - (tenYearsDataPoint ? tenYearsDataPoint.properties.individualCountSum : 0);
    });
    // const grids = geoJson.map(g => (g.properties.grid));
    // zeroObsGeoJson = zeroObsGeoJson.filter(z => (grids.indexOf(z.properties.grid) === -1));
    return result;
  }

  private getData(year: number|number[]) {
    const querys = this.getQuerys(this.season, year);
    return forkJoin([
      this.ykjService.getGeoJson(querys.query, undefined, undefined, true),
      this.ykjService.getGeoJson(querys.zeroQuery, undefined, undefined, true, true)
    ]);
  }

  private getQuerys(season = this.season, year: number|number[] = this.year) {
    const filterParams = this.resultService.getFilterParams(year, season, this.birdAssociationArea);
    return {query: {...filterParams, taxonId: [this.taxonId]}, zeroQuery: {...filterParams, taxonCensus: [this.taxonCensus]}};
  }
}
