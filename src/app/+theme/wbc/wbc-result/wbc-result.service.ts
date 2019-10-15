import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { forkJoin, Observable, of } from 'rxjs';
import {map, share, switchMap, tap} from 'rxjs/operators';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Global } from '../../../../environments/global';
import { PagedResult } from '../../../shared/model/PagedResult';

export type SEASON = 'spring'|'fall'|'winter';

interface Censuses {
  [season: string]: {years: number[], documentIds: {[year: string]: string[]}};
}
interface ObservationStats {
  [season: string]: {speciesStats: any[], otherStats: any[], years: number[]};
}
interface CountsPerYearForTaxon {
  [season: string]: {[year: string]: {count: string, censusCount: string}};
}

@Injectable()
export class WbcResultService {
  private collectionId = Global.collections.wbc;
  private birdId = 'MX.37580';
  private mammalId = 'MX.37612';
  private seasonRanges = {
    'fall': [10, 11],
    'winter': [12, 1],
    'spring': [2, 3]
  };

  private yearCache: number[];
  private yearObs: Observable<number[]>;
  private speciesListCache: any[];

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

  getFilterParams(year?: number|number[], season?: SEASON, birdAssociationArea?: string, taxonId?: string|string[])
  : WarehouseQueryInterface {
    const yearMonth = year ? (Array.isArray(year) ? year : [year]).map(y => this.getYearMonthParam(y, season)) : [];
    return {
      collectionId: [this.collectionId],
      birdAssociationAreaId: [birdAssociationArea],
      yearMonth: yearMonth,
      taxonId: taxonId ? (Array.isArray(taxonId) ? taxonId : [taxonId]) : []
    };
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
      this.getFilterParams(year, season, birdAssociationArea, [this.birdId, this.mammalId]),
      ['unit.linkings.taxon.speciesId', 'document.namedPlaceId'],
      undefined,
      10000,
      1
    ).pipe(
      map(res => res.results),
      map(res => {
        const result = {};
        for (let i = 0; i < res.length; i++) {
          this.addCount(result, res[i].aggregateBy['unit.linkings.taxon.speciesId'], 1);
        }
        return result;
      })
    );
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
    );
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
    );
  }

  getIndividualCountSumBySpecies(year?: number|number[], season?: SEASON, birdAssociationArea?: string) {
    return this.warehouseApi.warehouseQueryStatisticsGet(
      this.getFilterParams(year, season, birdAssociationArea, [this.birdId, this.mammalId]),
      ['unit.linkings.taxon.speciesId'],
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
          this.addCount(result, res[i].aggregateBy['unit.linkings.taxon.speciesId'], res[i].individualCountSum);
        }
        return result;
      })
    );
  }

  getSpeciesList(year?: number, season?: SEASON, birdAssociationArea?: string, onlyCount = true, useCache = false): Observable<any[]> {
    if (useCache && this.speciesListCache) {
      return of(this.speciesListCache);
    }

    return this.getList(
      this.warehouseApi.warehouseQueryStatisticsGet(
        this.getFilterParams(year, season, birdAssociationArea, [this.birdId, this.mammalId]),
        ['unit.linkings.taxon.speciesId', 'unit.linkings.taxon.speciesNameFinnish', 'unit.linkings.taxon.speciesScientificName',
          'unit.linkings.taxon.speciesTaxonomicOrder'],
        ['unit.linkings.taxon.speciesTaxonomicOrder'],
        10000,
        1,
        undefined,
        onlyCount
      )
    ).pipe(tap(list => { if (useCache) { this.speciesListCache = list; } }));
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
    const query = this.getFilterParams(year, season);

    return this.getList(
      this.warehouseApi.warehouseQueryGatheringStatisticsGet(
        query,
        ['document.documentId', 'document.namedPlace.name', 'document.namedPlace.municipalityDisplayName',
          'document.namedPlace.ykj10km.lat', 'document.namedPlace.ykj10km.lon',
          'document.namedPlace.birdAssociationAreaDisplayName', 'gathering.eventDate.begin', 'gathering.team'],
        ['document.namedPlace.birdAssociationAreaDisplayName', 'gathering.eventDate.begin DESC'],
        10000,
        1,
        undefined,
        true
      )
    ).pipe(
      switchMap(result => {
        return this.addUnitStatsToResults(result, query);
      })
    );
  }

  getCensusListForRoute(routeId: string): Observable<any[]> {
    const query = {...this.getFilterParams(), namedPlaceId: [routeId]};

    return this.getList(
      this.warehouseApi.warehouseQueryGatheringStatisticsGet(
        query,
        ['document.documentId', 'gathering.eventDate.begin', 'gathering.team'],
        ['gathering.eventDate.begin DESC'],
        10000,
        1,
        undefined,
        true
      )
    ).pipe(
      switchMap(result => {
        return this.addUnitStatsToResults(result, query);
      })
    );
  }

  getObservationStatsForRoute(routeId: string): Observable<ObservationStats> {
    return forkJoin([
      this.getCensusesForRoute(routeId),
      this.getObservationStatsList(routeId, this.birdId),
      this.getObservationStatsList(routeId, this.mammalId)
      ]
    ).pipe(
      map(results => {
        const censuses = results[0];
        const birdResultList = results[1].results;
        const mammalResultList = results[2].results;

        const result = this.parseObservationStatsLists(censuses, birdResultList, mammalResultList);
        this.addStatisticsToObservationStats(result);
        return result;
      })
    );
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
    }));
  }

  private addUnitStatsToResults(result: any[], query: WarehouseQueryInterface) {
    return this.getList(
      this.warehouseApi.warehouseQueryStatisticsGet(
        query,
        ['document.documentId'],
        undefined,
        10000,
        1,
        undefined,
        false
      )
    ).pipe(
      map(list => {
        const statsByDocumentId = {};
        list.map(l => {
          statsByDocumentId[l['document.documentId']] = l;
        });
        return statsByDocumentId;
      }),
      map(statsByDocumentId => {
        for (const r of result) {
          if (statsByDocumentId[r['document.documentId']]) {
            const stats = statsByDocumentId[r['document.documentId']];
            r.count = stats.count;
            r.individualCountSum = stats.individualCountSum;
          } else {
            r.count = 0;
            r.individualCountSum = 0;
          }
        }
        return result;
      })
    );
  }

  private getCensusesForRoute(routeId: string): Observable<Censuses> {
    return this.warehouseApi.warehouseQueryGatheringStatisticsGet(
      {...this.getFilterParams(), namedPlaceId: [routeId]},
      ['gathering.conversions.year', 'gathering.conversions.month', 'document.documentId'],
      ['gathering.conversions.year', 'gathering.conversions.month'],
      10000,
      1,
      undefined,
      false
    ).pipe(
      map(results => results.results),
      map(data => {
        const result: Censuses = {};
        for (const season of ['fall', 'winter', 'spring']) {
          result[season] = {
            'years': [],
            'documentIds': {}
          };
        }

        for (const d of data) {
          const month = parseInt(d.aggregateBy['gathering.conversions.month'], 10);
          const year = this.getCensusStartYear(parseInt(d.aggregateBy['gathering.conversions.year'], 10), month);
          const season = this.getSeason(month);
          const documentId = d.aggregateBy['document.documentId'];

          if (season) {
            if (result[season].years.indexOf(year) === -1) {
              result[season].years.push(year);
            }
            this.addUniqueArrayItem(result[season].documentIds, year + '', documentId);
          }
        }

        return result;
      })
    );
  }

  private getObservationStatsList(routeId: string, taxonId: string): Observable<PagedResult<any[]>> {
    return this.warehouseApi.warehouseQueryStatisticsGet(
      {...this.getFilterParams(undefined, undefined, undefined, taxonId), namedPlaceId: [routeId]},
      ['unit.linkings.taxon.speciesId', 'unit.linkings.taxon.speciesNameFinnish', 'gathering.conversions.year',
        'gathering.conversions.month', 'unit.linkings.taxon.speciesTaxonomicOrder'],
      ['unit.linkings.taxon.speciesTaxonomicOrder'],
      10000,
      1,
      undefined,
      false);
  }

  private parseObservationStatsLists(censuses: Censuses, birdResultList: any[], mammalResultList: any[]): ObservationStats {
    const result: ObservationStats = {};

    for (const season of ['fall', 'winter', 'spring']) {
      result[season] = {
        'speciesStats': [],
        'otherStats': [
          {'name': 'birdSpeciesCount'},
          {'name': 'birdIndividualCount'},
          {'name': 'mammalSpeciesCount'},
          {'name': 'mammalIndividualCount'},
          {'name': 'documentIds', ...censuses[season].documentIds}
        ],
        'years': censuses[season].years
      };
    }

    this.parseObservationStatsList(birdResultList, result);
    this.parseObservationStatsList(mammalResultList, result, true);
    return result;
  }

  private parseObservationStatsList(resultList: any[], result: ObservationStats, isMammal = false) {
    const currentState = {};
    for (const season of ['fall', 'winter', 'spring']) {
      currentState[season] = {taxonId: '', foundYears: [], row: undefined};
    }

    resultList.map(data => {
      const taxonId = data.aggregateBy['unit.linkings.taxon.speciesId'];
      const taxonName = data.aggregateBy['unit.linkings.taxon.speciesNameFinnish'];
      const month = parseInt(data.aggregateBy['gathering.conversions.month'], 10);
      const year = this.getCensusStartYear(parseInt(data.aggregateBy['gathering.conversions.year'], 10), month);
      const season = this.getSeason(month);
      const individualCount = data.individualCountSum;

      if (!season) {
        return;
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
        this.addCount(otherStats[isMammal ? 2 : 0], yearString, 1);
      }

      this.addCount(otherStats[isMammal ? 3 : 1], yearString, individualCount);
    });
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
      for (let j = 0; j < otherStats.length - 1; j++) {
        addStatisticsToObj(otherStats[j], years);
      }
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
    );
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
