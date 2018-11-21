import {
  Component,
  OnChanges,
  Input,
  AfterViewInit,
  ChangeDetectorRef,
  QueryList,
  ViewChildren,
  SimpleChanges
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
  bounds = [];
  lastZoomedArea: string;

  breaks = [0, 1, 2, 8, 32, 128, 512];
  labels = ['0', '1', '2-7', '8-31', '32-127', '128-511', '512-'];
  colorRange = ['#ffffff', 'violet', 'blue', 'lime', 'yellow', 'orange', 'red'];
  private epsilon = Math.pow(2, -52);
  differenceBreaks = [-Number.MAX_VALUE, -50 + this.epsilon, -1 + this.epsilon, 1, 100];
  differenceLabels = ['≤ -50%', '≤ -1%', '~0%', '≥ 1%', '≥ 100%'];
  differenceColorRange = ['blue', '#9999ff', 'white', '#ff9999', 'red'];

  private maps: any[];

  constructor(
    private resultService: WbcResultService,
    private ykjService: YkjService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
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
    this.bounds = [];

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
        prevTenYearsData: data[1][0],
        prevTenYearsZeroData: data[1][1]
      }))
    ).subscribe(data => {
      this.data[0] = this.ykjService.combineGeoJsons(this.dataToGeoJson(data.data), this.dataToGeoJson(data.zeroData, true));
      this.data[1] = this.ykjService.combineGeoJsons(
        this.dataToGeoJson(data.prevTenYearsData),
        this.dataToGeoJson(data.prevTenYearsZeroData, true)
      );
      this.data[2] = this.getDifferenceGeoJson(data.data, data.zeroData, data.prevTenYearsData, data.prevTenYearsZeroData);
      this.loading = false;
      this.cd.markForCheck();
    })
  }

  private getDifferenceGeoJson(data, zeroData, tenYearsData, tenYearsZeroData) {
    const censusList = zeroData.map(d => (d.aggregateBy['document.namedPlaceId']));
    const tenYearsCensusList = tenYearsData.map(d => (d.aggregateBy['document.namedPlaceId']));
    const commonCensuses = censusList.filter((c) => (tenYearsCensusList.indexOf(c) > -1));

    const filterFunc = (d) => (commonCensuses.indexOf(d.aggregateBy['document.namedPlaceId']) > -1);
    data = data.filter(d => filterFunc(d));
    zeroData = zeroData.filter(d => filterFunc(d));
    tenYearsData = tenYearsData.filter(d => filterFunc(d));
    tenYearsZeroData = tenYearsZeroData.filter(d => filterFunc(d));

    const geoJson = this.ykjService.combineGeoJsons(this.dataToGeoJson(data), this.dataToGeoJson(zeroData, true));
    const tenYearsGeoJson = this.ykjService.combineGeoJsons(this.dataToGeoJson(tenYearsData), this.dataToGeoJson(tenYearsZeroData, true));

    const result = [];
    geoJson.map(g => {
      const grid = g.properties.grid;
      const tenYearsDataPoint = tenYearsGeoJson.find(d => d.properties.grid === grid);

      if (tenYearsDataPoint && tenYearsDataPoint.properties.individualCountSum !== 0) {
        const value = g.properties.individualCountSum / g.properties.lineLengthSum;
        const oldValue = tenYearsDataPoint.properties.individualCountSum / tenYearsDataPoint.properties.lineLengthSum;
        result.push({...g, properties: {grid: g.properties.grid, individualCountSum: (value - oldValue) / oldValue * 100}});
      }
    });
    return result;
  }

  private getData(year: number|number[]) {
    const querys = this.getQuerys(this.season, year);
    return forkJoin([
      this.ykjService.getList(querys.query, '10kmCenter', undefined, true, false, ['document.namedPlaceId']),
      this.ykjService.getList(querys.zeroQuery, '10kmCenter', undefined, true, true, ['document.namedPlaceId']),
    ]);
  }

  private dataToGeoJson(data: any[], zeroObservations = false) {
    const lat = 'gathering.conversions.ykj10kmCenter.lat';
    const lon = 'gathering.conversions.ykj10kmCenter.lon';
    const result = [];

    data.map(d => {
      const lastResult = result.length > 0 ? result[result.length - 1] : undefined;
      if (lastResult && lastResult.aggregateBy[lat] === d.aggregateBy[lat] && lastResult.aggregateBy[lon] === d.aggregateBy[lon]) {
        if (!zeroObservations) {
          lastResult.count += d.count;
          lastResult.individualCountSum += d.individualCountSum;
        } else {
          lastResult.lineLengthSum += d.lineLengthSum || 0;
        }
      } else {
        const res = zeroObservations ? {...d, lineLengthSum: d.lineLengthSum || 0} : {...d};
        result.push(res);
      }
    });

    return this.ykjService.resultToGeoJson(result, '10kmCenter', zeroObservations);
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

  boundsChange(data: any) {
    this.bounds.push(data);
    if (this.bounds.length === 3) {
      const bounds = this.bounds[0].extend(this.bounds[1]).extend(this.bounds[2]);
      if (bounds.isValid() && (this.lastZoomedArea !== this.birdAssociationArea || !this.maps[0].map.getBounds().contains(bounds))) {
        this.maps[0].map.fitBounds(bounds, {maxZoom: 4, padding: [50, 50]});
        this.lastZoomedArea = this.birdAssociationArea;
      }
    }
  }
}
