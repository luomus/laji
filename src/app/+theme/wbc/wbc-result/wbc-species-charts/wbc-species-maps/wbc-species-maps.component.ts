import {
  Component,
  OnChanges,
  Input,
  AfterViewInit,
  ChangeDetectorRef,
  QueryList,
  ViewChildren
} from '@angular/core';
import { WbcResultService, SEASON } from '../../wbc-result.service';
import { WarehouseQueryInterface } from '../../../../../shared/model/WarehouseQueryInterface';
import { YkjService } from '../../../../../shared-modules/ykj/service/ykj.service';
import { YkjMapComponent } from '../../../../../shared-modules/ykj/ykj-map/ykj-map.component';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import 'leaflet.sync';

@Component({
  selector: 'laji-wbc-species-maps',
  templateUrl: './wbc-species-maps.component.html',
  styleUrls: ['./wbc-species-maps.component.css']
})
export class WbcSpeciesMapsComponent implements OnChanges, AfterViewInit {
  @ViewChildren('maps') mapComponents: QueryList<YkjMapComponent>;
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
  private epsilon = Math.pow(2, -52);
  differenceBreaks = [-Number.MAX_VALUE, -50 + this.epsilon, -1 + this.epsilon, 1, 50];
  differenceLabels = ['≤ -50', '≤ -1', '0', '≥ 1', '≥ 50'];
  differenceColorRange = ['blue', '#9999ff', 'white', '#ff9999', 'red'];

  private maps: any[];

  constructor(
    private resultService: WbcResultService,
    private ykjService: YkjService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges() {
    if (this.taxonId && this.year) {
      this.updateMapData();
    }
  }

  ngAfterViewInit(): void {
    this.maps = this.mapComponents.map(mapComponent => {
      return mapComponent.mapComponent.map;
    });
    this.maps.forEach(m => this.initEventListeners(m));
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
      const dataCounts = this.getCountsForGrid(data, grid);
      const tenYearsDataCounts = this.getCountsForGrid(tenYearsData, grid);
      r.properties.count = dataCounts.count - tenYearsDataCounts.count;
      r.properties.individualCountSum = dataCounts.individualCountSum - tenYearsDataCounts.individualCountSum;
    });
    return result;
  }

  private getCountsForGrid(data, grid) {
    const dataPoint = data.find(d => d.properties.grid === grid);
    if (dataPoint) {
      return {count: dataPoint.properties.count || 0, individualCountSum: dataPoint.properties.individualCountSum || 0}
    }
    return {count: 0, individualCountSum: 0};
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

  private initEventListeners(lajiMap) {
    const otherMaps = this.maps.filter(_map => lajiMap !== _map);
    otherMaps.forEach(otherMap => {
      lajiMap.map.sync(otherMap.map);
    });
    lajiMap._handling = {};
    const sync = (fn) => (e) => {
      const name = e.type;
      const wasHandling = lajiMap._handling[name];
      if (wasHandling) {
        return;
      }
      lajiMap._handling[name] = true;
      otherMaps.forEach(otherMap => {
        otherMap._handling[name] = true;
        fn(otherMap, e);
      });
      lajiMap._handling[name] = false;
    };
    lajiMap.map.addEventListener({
      tileLayerChange: sync((_map) => _map.setTileLayerByName(lajiMap.tileLayerName)),
      tileLayerOpacityChange: sync((_map) => _map.setTileLayerOpacity(lajiMap.tileLayerOpacity)),
      overlaysChange: sync((_map, e) => _map.setOverlaysByName(e.overlayNames))
    });
  }
}
