import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { of, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Global } from '../../../../environments/global';
import { PagedResult } from '../../../shared/model/PagedResult';

export type SEASON = 'spring'|'fall'|'winter';

interface CountPerCensusResult {[s: string]: {name: number, value: number, count: number, censusCount: number}[]}

@Injectable()
export class WbcResultService {
  private collectionId = Global.collections.wbc;
  private seasonRanges = {
    'fall': [10, 11],
    'winter': [12, 1],
    'spring': [2, 3]
  };

  private yearCache: number[];

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

  getFilterParams(year?: number, season?: SEASON, birdAssociationArea?: string): WarehouseQueryInterface {
    return {
      collectionId: [this.collectionId],
      birdAssociationAreaId: [birdAssociationArea],
      yearMonth: this.getYearMonthParam(year, season)
    }
  }

  getYears(): Observable<number[]> {
    if (this.yearCache) {
      return of(this.yearCache);
    }
    return this.warehouseApi.warehouseQueryGatheringStatisticsGet(
      this.getFilterParams(),
      undefined,
      undefined,
      1000,
      1,
      undefined,
      false
    ).pipe(
        map(res => res.results[0]),
        map(res => {
          const startYear = this.getCensusStartYear(res.oldestRecord);
          const endYear = this.getCensusStartYear(res.newestRecord);
          const years = [];
          for (let i = endYear; i >= startYear; i--) {
            years.push(i);
          }
          this.yearCache = years;
          return years;
        })
    );
  }

  getSpeciesList(year?: number, season?: SEASON, birdAssociationArea?: string): Observable<any[]> {
    return this.getList(
      this.warehouseApi.warehouseQueryStatisticsGet(
        this.getFilterParams(year, season, birdAssociationArea),
        ['unit.linkings.taxon.id', 'unit.linkings.taxon.nameFinnish', 'unit.linkings.taxon.scientificName',
          'unit.linkings.taxon.cursiveName', 'unit.linkings.taxon.taxonomicOrder'],
        ['unit.linkings.taxon.taxonomicOrder'],
        1000,
        1
      )
    );
  }

  getRoutesList(): Observable<any[]> {
    return this.getList(
      this.warehouseApi.warehouseQueryStatisticsGet(
        this.getFilterParams(),
        ['document.namedPlace.id', 'document.namedPlace.name', 'document.namedPlace.ykj10km.lat',
          'document.namedPlace.ykj10km.lon', 'document.namedPlace.municipalityDisplayName',
          'document.namedPlace.birdAssociationAreaDisplayName'],
        ['document.namedPlace.birdAssociationAreaDisplayName', 'document.namedPlace.name'],
        1000,
        1,
        undefined,
        false
      )
    );
  }

  getCensusListByRoute(routeId: string) {
    return this.getList(
      this.warehouseApi.warehouseQueryAggregateGet(
        {...this.getFilterParams(), namedPlaceId: [routeId], secured: false},
        ['document.documentId', 'gathering.eventDate.begin', 'gathering.team'],
        ['gathering.eventDate.begin'],
        1000,
        1,
        undefined,
        false
      )
    );
  }

  getCountPerCensusByYear(taxonId: string, birdAssociationArea?: string, taxonCensus?: string): Observable<CountPerCensusResult> {
    return forkJoin([
      this.warehouseApi.warehouseQueryGatheringStatisticsGet(
        {...this.getFilterParams(undefined, undefined, birdAssociationArea), taxonCensus: [taxonCensus]},
        ['gathering.conversions.year', 'gathering.conversions.month'],
        undefined,
        1000,
        1
      ),
      this.warehouseApi.warehouseQueryStatisticsGet(
        {...this.getFilterParams(undefined, undefined, birdAssociationArea), taxonId: [taxonId], taxonCensus: [taxonCensus]},
        ['gathering.conversions.year', 'gathering.conversions.month'],
        undefined,
        1000,
        1,
        undefined,
        false
      )
    ]).pipe(map(data => {
      const censusCounts = data[0].results;
      const obsCounts = data[1].results;
      const result = {'fall': {}, 'winter': {}, 'spring': {}};

      obsCounts.map(count => {
        const season = this.getSeason(parseInt(count.aggregateBy['gathering.conversions.month'], 10));
        if (season) {
          const year = count.aggregateBy['gathering.conversions.year'];
          if (!result[season][year]) {
            result[season][year] = {
              'count': 0
            }
          }
          result[season][year]['count'] += count.count;
        }
      });

      censusCounts.map(count => {
        const season = this.getSeason(parseInt(count.aggregateBy['gathering.conversions.month'], 10));
        if (season) {
          const year = count.aggregateBy['gathering.conversions.year'];
          if (result[season][year]) {
            if (!result[season][year]['censusCount']) {
              result[season][year]['censusCount'] = 0;
            }
            result[season][year]['censusCount'] += count.count;
          }
        }
      });

      const finalResult: CountPerCensusResult = {'fall': [], 'winter': [], 'spring': []};
      for (const season in result) {
        if (result.hasOwnProperty(season)) {
          const years = Object.keys(result[season]);
          years.sort();
          finalResult[season] = years.map(year => ({
            name: parseInt(year, 10),
            count: result[season][year]['count'],
            censusCount: result[season][year]['censusCount'],
            value: result[season][year]['count'] / result[season][year]['censusCount']
          }));
        }
      }

      return finalResult;
    }))
  }

  private getList(obs: Observable<PagedResult<any>>): Observable<any[]> {
    return obs.pipe(
      map(res => res.results),
      map(res => res.map(r => {
        return {...r, aggregateBy: undefined, ...r.aggregateBy};
      }))
    )
  }

  private getCensusStartYear(dateString: string): number {
    const date = dateString.split('-');
    const year = parseInt(date[0], 10);
    const month = parseInt(date[1], 10);
    return month <= this.seasonRanges['spring'][1] ? year - 1 : year;
  }

  private getYearMonthParam(year: number, season?: SEASON): string[] {
    if (!year) {
      return [];
    }
    const startMonth = season ? this.seasonRanges[season][0] : this.seasonRanges['fall'][0];
    const endMonth = season ? this.seasonRanges[season][1] : this.seasonRanges['spring'][1];
    const startYear = startMonth > this.seasonRanges['spring'][1] ? year : year + 1;
    const endYear = endMonth > this.seasonRanges['spring'][1] ? year : year + 1;
    return [startYear + '-' + this.padMonth(startMonth) + '/' + endYear + '-' + this.padMonth(endMonth)];
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
}
