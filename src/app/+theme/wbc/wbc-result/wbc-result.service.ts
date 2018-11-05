import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { of, forkJoin, Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Global } from '../../../../environments/global';
import { PagedResult } from '../../../shared/model/PagedResult';

export type SEASON = 'spring'|'fall'|'winter';

interface ObservationStats {
  [s: string]: {speciesStats: any[], otherStats: any[], years: number[]}
}
interface CountsPerYearForTaxon {
  [s: string]: {[s: string]: {count: string, censusCount: string}}
}

@Injectable()
export class WbcResultService {
  private collectionId = Global.collections.wbc;
  private seasonRanges = {
    'fall': [10, 11],
    'winter': [12, 1],
    'spring': [2, 3]
  };

  private yearCache: number[];
  private yearObs: Observable<number[]>;

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

  getFilterParams(year?: number|number[], season?: SEASON, birdAssociationArea?: string): WarehouseQueryInterface {
    const yearMonth = year ? (Array.isArray(year) ? year : [year]).map(y => this.getYearMonthParam(y, season)) : [];
    return {
      collectionId: [this.collectionId],
      birdAssociationAreaId: [birdAssociationArea],
      yearMonth: yearMonth
    }
  }

  getPreviousTenYears(year: number): number[] {
    const previousTenYears = [];
    for (let i = year - 10; i < year; i++) {
      previousTenYears.push(i);
    }
    return previousTenYears;
  }

  getYears(): Observable<number[]> {
    if (this.yearCache) {
      return of(this.yearCache);
    } else if (this.yearObs) {
      return this.yearObs;
    }
    this.yearObs = this.warehouseApi.warehouseQueryGatheringStatisticsGet(
      this.getFilterParams(),
      undefined,
      undefined,
      10000,
      1,
      undefined,
      false
    ).pipe(
        map(res => res.results[0]),
        map(res => {
          const startYear = this.getCensusStartYearFromDateString(res.oldestRecord);
          const endYear = this.getCensusStartYearFromDateString(res.newestRecord);
          const years = [];
          for (let i = endYear; i >= startYear; i--) {
            years.push(i);
          }
          this.yearCache = years;
          return years;
        }),
        share()
    );
    return this.yearObs;
  }

  getRouteCountBySpecies(year: number, season?: SEASON, birdAssociationArea?: string): Observable<any> {
    return this.warehouseApi.warehouseQueryStatisticsGet(
      this.getFilterParams(year, season, birdAssociationArea),
      ['unit.linkings.taxon.id', 'document.namedPlaceId'],
      undefined,
      10000,
      1
    ).pipe(
      map(res => res.results),
      map(res => {
        const result = {};
        for (let i = 0; i < res.length; i++) {
          this.addCount(result, res[i].aggregateBy['unit.linkings.taxon.id'], 1);
        }
        return result;
      })
    )
  }

  getRouteCount(year: number, season?: SEASON, birdAssociationArea?: string): Observable<number> {
    return this.warehouseApi.warehouseQueryGatheringStatisticsGet(
      this.getFilterParams(year, season, birdAssociationArea),
      ['document.namedPlaceId'],
      undefined,
      1,
      1
    ).pipe(
      map(res => res.total)
    )
  }

  getRouteLengthSum(year: number|number[], season?: SEASON, birdAssociationArea?: string): Observable<any> {
    return this.warehouseApi.warehouseQueryGatheringStatisticsGet(
      this.getFilterParams(year, season, birdAssociationArea),
      undefined,
      undefined,
      1,
      1,
      undefined,
      false
    ).pipe(
      map(res => res.results[0].lineLengthSum)
    )
  }

  getIndividualCountSumBySpecies(year?: number|number[], season?: SEASON, birdAssociationArea?: string) {
    return this.warehouseApi.warehouseQueryStatisticsGet(
      this.getFilterParams(year, season, birdAssociationArea),
      ['unit.linkings.taxon.id'],
      undefined,
      10000,
      1,
      undefined,
      false
    ).pipe(
      map(res => res.results),
      map(res => {
        const result = {};
        for (let i = 0; i < res.length; i++) {
          this.addCount(result, res[i].aggregateBy['unit.linkings.taxon.id'], res[i].individualCountSum);
        }
        return result;
      })
    )
  }

  getSpeciesList(year?: number, season?: SEASON, birdAssociationArea?: string, onlyCount = true): Observable<any[]> {
    return this.getList(
      this.warehouseApi.warehouseQueryStatisticsGet(
        this.getFilterParams(year, season, birdAssociationArea),
        ['unit.linkings.taxon.id', 'unit.linkings.taxon.nameFinnish', 'unit.linkings.taxon.scientificName',
          'unit.linkings.taxon.cursiveName', 'unit.linkings.taxon.taxonomicOrder'],
        ['unit.linkings.taxon.taxonomicOrder'],
        10000,
        1,
        undefined,
        onlyCount
      )
    );
  }

  getRouteList(): Observable<any[]> {
    return this.getList(
      this.warehouseApi.warehouseQueryGatheringStatisticsGet(
        this.getFilterParams(),
        ['document.namedPlace.id', 'document.namedPlace.name', 'document.namedPlace.ykj10km.lat',
          'document.namedPlace.ykj10km.lon', 'document.namedPlace.municipalityDisplayName',
          'document.namedPlace.birdAssociationAreaDisplayName'],
        ['document.namedPlace.birdAssociationAreaDisplayName', 'document.namedPlace.name'],
        10000,
        1,
        undefined,
        false
      )
    );
  }

  getCensusList(year?: number, season?: SEASON): Observable<any[]> {
    return this.getList(
      this.warehouseApi.warehouseQueryAggregateGet(
        {...this.getFilterParams(year, season)},
        ['document.documentId', 'document.namedPlace.name', 'document.namedPlace.municipalityDisplayName',
          'document.namedPlace.birdAssociationAreaDisplayName', 'gathering.eventDate.begin', 'gathering.team'],
        ['document.namedPlace.birdAssociationAreaDisplayName', 'gathering.eventDate.begin DESC'],
        10000,
        1,
        undefined,
        false
      )
    )
  }

  getCensusListForRoute(routeId: string): Observable<any[]> {
    return this.getList(
      this.warehouseApi.warehouseQueryAggregateGet(
        {...this.getFilterParams(), namedPlaceId: [routeId]},
        ['document.documentId', 'gathering.eventDate.begin', 'gathering.team'],
        ['gathering.eventDate.begin DESC'],
        10000,
        1,
        undefined,
        false
      )
    );
  }

  getObservationStatsForRoute(routeId: string): Observable<ObservationStats> {
    return this.warehouseApi.warehouseQueryAggregateGet(
      {...this.getFilterParams(), namedPlaceId: [routeId]},
      ['unit.linkings.taxon.id', 'unit.linkings.taxon.nameFinnish', 'gathering.conversions.year',
        'gathering.conversions.month', 'document.documentId', 'unit.linkings.taxon.taxonomicOrder'],
      ['unit.linkings.taxon.taxonomicOrder'],
      10000,
      1,
      undefined,
      false
    ).pipe(
      map(result => result.results),
      map(resultList => {
        const result = this.parseObservationStatsList(resultList);
        this.addStatisticsToObservationStats(result);
        return result;
      })
    )
  }

  getCountsByYearForSpecies(taxonId: string, birdAssociationArea?: string, taxonCensus?: string): Observable<CountsPerYearForTaxon> {
    return forkJoin([
      this.warehouseApi.warehouseQueryGatheringStatisticsGet(
        {...this.getFilterParams(undefined, undefined, birdAssociationArea), taxonCensus: [taxonCensus]},
        ['gathering.conversions.year', 'gathering.conversions.month'],
        undefined,
        10000,
        1
      ),
      this.warehouseApi.warehouseQueryStatisticsGet(
        {...this.getFilterParams(undefined, undefined, birdAssociationArea), taxonId: [taxonId], taxonCensus: [taxonCensus]},
        ['gathering.conversions.year', 'gathering.conversions.month'],
        undefined,
        10000,
        1,
        undefined,
        false
      )
    ]).pipe(map(data => {
      const result = {'fall': {}, 'winter': {}, 'spring': {}};
      this.addCounts(data[1].results, 'count', result, false, 'individualCountSum');
      this.addCounts(data[0].results, 'censusCount', result, true);
      return result;
    }))
  }

  private parseObservationStatsList(resultList): ObservationStats {
    const result: ObservationStats = {};
    const currentState = {};

    for (const season of ['fall', 'winter', 'spring']) {
      result[season] = {
        'speciesStats': [],
        'otherStats': [
          {'name': 'speciesCount'},
          {'name': 'individualCount'},
          {'name': 'documentIds'}
        ],
        'years': []
      };
      currentState[season] = {taxonId: '', foundYears: [], row: undefined};
    }

    resultList.map(data => {
      const taxonId = data.aggregateBy['unit.linkings.taxon.id'];
      const taxonName = data.aggregateBy['unit.linkings.taxon.nameFinnish'];
      const documentId = data.aggregateBy['document.documentId'];
      const month = parseInt(data.aggregateBy['gathering.conversions.month'], 10);
      const year = this.getCensusStartYear(parseInt(data.aggregateBy['gathering.conversions.year'], 10), month);
      const season = this.getSeason(month);
      const individualCount = data.individualCountSum;

      if (!season) {
        return;
      }

      if (result[season].years.indexOf(year) === -1) {
        result[season].years.push(year);
        result[season].years.sort();
      }

      const speciesStats = result[season].speciesStats;
      const otherStats = result[season].otherStats;
      const yearString = year + '';

      if (currentState[season].taxonId === taxonId) {
        this.addCount(currentState[season].row, yearString, individualCount);
      } else {
        const row = {'name': taxonName, [yearString]: individualCount};
        currentState[season] = {taxonId: taxonId, foundYears: [], row: row};
        speciesStats.push(row);
      }

      if (currentState[season].foundYears.indexOf(yearString) === -1) {
        currentState[season].foundYears.push(yearString);
        this.addCount(otherStats[0], yearString, 1);
      }

      this.addCount(otherStats[1], yearString, individualCount);
      this.addUniqueArrayItem(otherStats[2], yearString, documentId);
    });

    return result;
  }

  private addStatisticsToObservationStats(result: ObservationStats) {
    const addStatisticsToObj = (obj, years) => {
      let min = Number.MAX_VALUE;
      let max = 0;

      let sum = 0;
      const counts = [];
      for (let i = 0; i < years.length; i++) {
        const key = years[i] + '';
        if (!obj[key]) {
          obj[key] = 0;
        }
        sum += obj[key];
        counts.push(obj[key]);

        min = Math.min(min, obj[key]);
        max = Math.max(max, obj[key]);
      }

      if (counts.length !== 0) {
        obj.mean = sum / counts.length;
        obj.median = this.median(counts);
        obj.min = min;
        obj.max = max;
      }
    };

    for (const season of ['fall', 'winter', 'spring']) {
      const years = result[season].years;

      const speciesStats = result[season].speciesStats;
      for (let j = 0; j < speciesStats.length; j++) {
        addStatisticsToObj(speciesStats[j], years);
      }

      const otherStats = result[season].otherStats;
      addStatisticsToObj(otherStats[0], years);
      addStatisticsToObj(otherStats[1], years);
    }
  }

  private addCounts(counts, key, result, addToExistingOnly = false, countKey = 'count') {
    counts.map(count => {
      const month = parseInt(count.aggregateBy['gathering.conversions.month'], 10);
      const year = parseInt(count.aggregateBy['gathering.conversions.year'], 10);
      const season = this.getSeason(month);

      if (season) {
        const startYear = this.getCensusStartYear(year, month) + '';
        if (!result[season][startYear]) {
          if (addToExistingOnly) {
            return;
          }
          result[season][startYear] = {};
        }

        this.addCount(result[season][startYear], key, count[countKey]);
      }
    });
  }

  private addCount(obj: any, key: string, count: number) {
    if (!obj[key]) {
      obj[key] = 0;
    }
    obj[key] += count;
  }

  private addUniqueArrayItem(obj: any, key: any, item: any) {
    if (!obj[key]) {
      obj[key] = [item];
    } else if (obj[key].indexOf(item) === -1) {
      obj[key].push(item);
    }
  }

  private getList(obs: Observable<PagedResult<any>>): Observable<any[]> {
    return obs.pipe(
      map(res => res.results),
      map(res => res.map(r => {
        return {...r, aggregateBy: undefined, ...r.aggregateBy};
      }))
    )
  }

  private getCensusStartYear(year: number, month: number) {
    return month <= this.seasonRanges['spring'][1] ? year - 1 : year;
  }

  private getCensusStartYearFromDateString(dateString: string): number {
    const date = dateString.split('-');
    const year = parseInt(date[0], 10);
    const month = parseInt(date[1], 10);
    return this.getCensusStartYear(year, month);
  }

  private getYearMonthParam(year: number, season?: SEASON): string {
    const startMonth = season ? this.seasonRanges[season][0] : this.seasonRanges['fall'][0];
    const endMonth = season ? this.seasonRanges[season][1] : this.seasonRanges['spring'][1];
    const startYear = startMonth > this.seasonRanges['spring'][1] ? year : year + 1;
    const endYear = endMonth > this.seasonRanges['spring'][1] ? year : year + 1;
    return startYear + '-' + this.padMonth(startMonth) + '/' + endYear + '-' + this.padMonth(endMonth);
  }

  private padMonth(month: number): string {
    return month < 10 ? '0' + month : '' + month;
  }

  private getSeason(month: number): SEASON {
    if (this.monthIsInSeasonRange(month, 'fall')) {
      return 'fall';
    } else if (this.monthIsInSeasonRange(month, 'winter')) {
      return 'winter';
    } else if (this.monthIsInSeasonRange(month, 'spring')) {
      return 'spring';
    }

    return undefined;
  }

  private monthIsInSeasonRange(month: number, season: SEASON): boolean {
    if (this.seasonRanges[season][0] > this.seasonRanges[season][1]) {
      return month >= this.seasonRanges[season][0] || month <= this.seasonRanges[season][1];
    }
    return month >= this.seasonRanges[season][0] && month <= this.seasonRanges[season][1];
  }

  private median(array) {
    array.sort((a, b) => (a - b));
    const mid = array.length / 2;
    return mid % 1 ? array[mid - 0.5] : (array[mid - 1] + array[mid]) / 2;
  }
}
