import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type SEASON = 'spring'|'fall'|'winter';

@Injectable()
export class WbcResultService {
  private collectionId = 'HR.39';
  private seasonRanges = {
    'fall': [10, 11],
    'winter': [12, 1],
    'spring': [2, 3]
  };

  private yearCache: number[];

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

  getFilterParams(year?: number, season?: SEASON, birdAssociationArea?: string) {
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
      {collectionId: [this.collectionId]},
      undefined,
      undefined,
      undefined,
      undefined,
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
    return this.warehouseApi.warehouseQueryStatisticsGet(
      this.getFilterParams(year, season, birdAssociationArea),
      ['unit.linkings.taxon.id', 'unit.linkings.taxon.nameFinnish', 'unit.linkings.taxon.scientificName',
        'unit.linkings.taxon.cursiveName', 'unit.linkings.taxon.taxonomicOrder'],
      ['unit.linkings.taxon.taxonomicOrder'],
      1000
    ).pipe(
      map(res => res.results),
      map(res => res.map(r => {
        const aggregateBy = {};
        Object.keys(r.aggregateBy).map(key => {
          const keyParts = key.split('.');
          aggregateBy[keyParts[keyParts.length - 1]] = r.aggregateBy[key];
        });
        return {...aggregateBy, count: r.count}
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
}
