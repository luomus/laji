import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { forkJoin, Observable, of } from 'rxjs';
import {map, share, switchMap, tap} from 'rxjs/operators';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
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

export interface YearDays {
  [year: number]: string[];
}

// comment

@Injectable({
  providedIn: 'root'
})
export class SykeInsectResultService {

  private seasonRanges = [4 , 10];
  private yearCache: YearDays;
  private yearObs: Observable<YearDays>;
  private yearDayObs: Observable<string[]>;
  private speciesListCache: any[];

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

  getFilterParams(year?: number|number[], season?: string, taxonId?: string|string[], collectionId?: string)
  : WarehouseQueryInterface {
    const yearMonth = year ? (Array.isArray(year) ? year : [year]).map(y => this.getYearMonthParam(y, season)) : [];
    return {
      collectionId: [collectionId],
      yearMonth: !season ? yearMonth : undefined,
      time: season ? yearMonth : undefined,
      taxonId: taxonId ? (Array.isArray(taxonId) ? taxonId : [taxonId]) : []
    };
  }

  getYears(routeId?: string, collectionId?: string): Observable<YearDays> {
    this.yearObs = this.warehouseApi.warehouseQueryUnitStatisticsGet(
      {...this.getFilterParams(undefined, undefined, undefined, collectionId), namedPlaceId: [routeId]},
      ['unit.linkings.taxon.taxonSets', 'unit.linkings.taxon.scientificName', 'gathering.conversions.year', 'gathering.conversions.month', 'gathering.conversions.day', 'unit.linkings.taxon.nameFinnish', 'unit.linkings.taxon.nameEnglish', 'unit.linkings.taxon.nameSwedish', 'unit.linkings.taxon.cursiveName'],
      undefined,
      10000,
      1,
      undefined,
      false
    ).pipe(
        map(res => res.results),
        map(res => {
          const yearsDays = {};
          for (let i = 0; i < res.length; i++) {
            const year = res[i]['aggregateBy']['gathering.conversions.year'];
            const date = res[i]['aggregateBy']['gathering.conversions.year'] + '-'
                       + this.padMonthDay(res[i]['aggregateBy']['gathering.conversions.month']) + '-'
                       + this.padMonthDay(res[i]['aggregateBy']['gathering.conversions.day']);
            if (!yearsDays.hasOwnProperty(year)) {
              yearsDays[year] = [date];
            } else {
              if (!yearsDays[year].includes(date)) {
                yearsDays[year].push(date);
              }
            }

            yearsDays[year] = this.sortDate(yearsDays[year]);
          }
          this.yearCache = yearsDays;
          return yearsDays;
        }),
        share()
    );
    return this.yearObs;
  }

  getRouteList(collectionId?: string): Observable<any[]> {
    return this.getList(
      this.warehouseApi.warehouseQueryGatheringStatisticsGet(
        this.getFilterParams(undefined, undefined, undefined, collectionId),
        ['document.namedPlace.id', 'document.namedPlace.name', 'gathering.conversions.ykj10kmCenter.lat',
          'gathering.conversions.ykj10kmCenter.lon', 'document.namedPlace.municipalityDisplayName'],
        ['document.namedPlace.name'],
        10000,
        1,
        undefined,
        false
      )
    );
  }

  getCensusList(year?: number, season?: SEASON, routeId?: string, collectionId?: string): Observable<any[]> {
    const query = {collectionId: [collectionId], namedPlaceId: [routeId]};
    const unitQuery = {...this.getFilterParams(year, season, undefined, collectionId), namedPlaceId: [routeId]};

    return this.getList(
      this.warehouseApi.warehouseQueryGatheringStatisticsGet(
        query,
        ['document.documentId', 'document.namedPlace.name', 'document.namedPlace.municipalityDisplayName',
          'document.namedPlace.ykj10km.lat', 'document.namedPlace.ykj10km.lon', 'gathering.eventDate.begin', 'gathering.eventDate.end'],
        ['gathering.eventDate.begin DESC'],
        10000,
        1,
        undefined,
        true
      )
    ).pipe(
      switchMap(result => {
        return this.addUnitStatsToResults(result, unitQuery, year, routeId);
      })
    );
  }

  private addUnitStatsToResults(result: any[], query: WarehouseQueryInterface, year: number|undefined, routeId: string) {
    const aggregate = year === undefined ? ['document.documentId', 'unit.linkings.taxon.scientificName', 'gathering.conversions.year', 'unit.linkings.taxon.nameFinnish', 'unit.linkings.taxon.nameEnglish', 'unit.linkings.taxon.nameSwedish', 'unit.linkings.taxon.cursiveName'] :
    ['document.documentId', 'unit.linkings.taxon.scientificName', 'gathering.gatheringSection', 'unit.linkings.taxon.nameFinnish', 'unit.linkings.taxon.nameEnglish', 'unit.linkings.taxon.nameSwedish', 'unit.linkings.taxon.cursiveName'];
    query = {...query, namedPlaceId: [routeId]};
    return this.getList(
      this.warehouseApi.warehouseQueryUnitStatisticsGet(
        query,
        aggregate,
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
        if (Object.entries(statsByDocumentId).length === 0) {
          return [];
        }
        for (const r of result) {
          if (statsByDocumentId[r['document.documentId']]) {
            const stats = statsByDocumentId[r['document.documentId']];
            r.count = stats.count;
            r.individualCountSum = stats.individualCountSum;
            r['unit.linkings.taxon.scientificName'] = stats['unit.linkings.taxon.scientificName'];
            year === undefined ? r['gathering.conversions.year'] = stats['gathering.conversions.year'] :
            r['gathering.gatheringSection'] = stats['gathering.gatheringSection'];
          } else {
            r.count = 0;
            r.individualCountSum = 0;
          }
        }
        return result.filter(el => el['count'] > 0);
      })
    );
  }

  getUnitStats(year: number|undefined, season: string, routeId: string, onlySections: boolean, collectionId?: string) {
    const aggregate = year === undefined ? ['unit.linkings.taxon.taxonSets', 'unit.linkings.taxon.scientificName', 'gathering.conversions.year', 'gathering.conversions.month', 'gathering.conversions.day', 'unit.linkings.taxon.nameFinnish', 'unit.linkings.taxon.nameEnglish', 'unit.linkings.taxon.nameSwedish', 'unit.linkings.taxon.cursiveName'] :
    season ? ['unit.linkings.taxon.taxonSets', 'unit.linkings.taxon.scientificName', 'gathering.gatheringSection', 'unit.linkings.taxon.nameFinnish', 'unit.linkings.taxon.nameEnglish', 'unit.linkings.taxon.nameSwedish', 'unit.linkings.taxon.cursiveName'] :
    !onlySections ? ['unit.linkings.taxon.taxonSets', 'unit.linkings.taxon.scientificName', 'gathering.conversions.year', 'gathering.conversions.month', 'gathering.conversions.day', 'unit.linkings.taxon.nameFinnish', 'unit.linkings.taxon.nameEnglish', 'unit.linkings.taxon.nameSwedish', 'unit.linkings.taxon.cursiveName'] :
    ['unit.linkings.taxon.taxonSets', 'unit.linkings.taxon.scientificName', 'gathering.gatheringSection', 'unit.linkings.taxon.nameFinnish', 'unit.linkings.taxon.nameEnglish', 'unit.linkings.taxon.nameSwedish', 'unit.linkings.taxon.cursiveName'];
    const query = {...this.getFilterParams(year, season, undefined, collectionId), namedPlaceId: [routeId]};
    return this.getList(
      this.warehouseApi.warehouseQueryUnitStatisticsGet(
        query,
        aggregate,
        aggregate.filter((el, index) => index === 2),
        10000,
        1,
        undefined,
        false
      )
    ).pipe(
      map(result => {
        return this.mergeElementsByProperties(collectionId, result, onlySections, year, season, year === undefined ? ['unit.linkings.taxon.taxonSets', 'unit.linkings.taxon.scientificName', 'gathering.conversions.year', 'gathering.conversions.month', 'gathering.conversions.day', 'unit.linkings.taxon.nameFinnish', 'unit.linkings.taxon.nameEnglish', 'unit.linkings.taxon.nameSwedish', 'unit.linkings.taxon.cursiveName'] :
        (!onlySections ? ['unit.linkings.taxon.taxonSets', 'unit.linkings.taxon.scientificName', 'gathering.conversions.year', 'gathering.conversions.month', 'gathering.conversions.day', 'unit.linkings.taxon.nameFinnish', 'unit.linkings.taxon.nameEnglish', 'unit.linkings.taxon.nameSwedish', 'unit.linkings.taxon.cursiveName'] : ['unit.linkings.taxon.taxonSets', 'unit.linkings.taxon.scientificName', 'gathering.gatheringSection', 'unit.linkings.taxon.nameFinnish', 'unit.linkings.taxon.nameEnglish', 'unit.linkings.taxon.nameSwedish', 'unit.linkings.taxon.cursiveName']));
      })
    );
  }

  private getList(obs: Observable<PagedResult<any>>): Observable<any[]> {
    return obs.pipe(
      map(res => res.results),
      map(res => res.map(r => {
        return {...r, aggregateBy: undefined, ...r.aggregateBy};
      }))
    );
  }

  private getYearMonthParam(year: number, date?: string): string {
    let startMonth, endMonth, startYear, endYear;
    if (!date) {
      startMonth = this.seasonRanges[0];
      endMonth = this.seasonRanges[1];
      startYear = startMonth > this.seasonRanges[1] ? year - 1 : year;
      endYear = endMonth > this.seasonRanges[1] ? year - 1 : year;
    }
    return !date ? startYear + '-' + this.padMonthDay(startMonth) + '/' + endYear + '-' + this.padMonthDay(endMonth) :
    date + '/' + date;
  }

  private padMonthDay(monthDay: number): string {
    return monthDay < 10 ? '0' + monthDay : '' + monthDay;
  }

  private mergeElementsByProperties(collectionId: string, result: any[], onlySections: boolean, year: number, season: string, filters: string[]) {
    const objectFilter = [];

    if (onlySections) {
      const minMax = this.findMaxMinFilter(result, filters[2]);
      for (let i = minMax[0]; i < (minMax[0] === 0 ? minMax[1] + 1 : minMax[1] + 1 ); i++) {
        if (i === 0) {
         objectFilter.push(filters[2].substring(filters[2].lastIndexOf('.') + 1) + '_undefined');
        } else {
         objectFilter.push(filters[2].substring(filters[2].lastIndexOf('.') + 1) + '_' + i);
        }
       }
    } else {
      result.forEach(item => {
        const value = this.padMonthDay(item['gathering.conversions.day']) + '-'
        + this.padMonthDay(item['gathering.conversions.month']) + '-'
        + item['gathering.conversions.year'];
        if (parseInt(item['gathering.conversions.year'], 10) === year) {
          if (objectFilter.indexOf(value) === -1) {
            objectFilter.push('day_' + value);
          }
        }
      });
    }

    let uniqueTaxonSets = [...new Set(result.map(item => item['unit.linkings.taxon.taxonSets']))];

    const arrayMerged = [{'dataSets': [], 'yearsDays': [], 'taxonSets': []}];
    uniqueTaxonSets.forEach(item => {
      arrayMerged[0].dataSets[item] = [];
    });

    result.forEach(item => {
      const existing = arrayMerged[0]['dataSets'][item['unit.linkings.taxon.taxonSets']].filter((v) => {
        return (v['scientificName'] === item['unit.linkings.taxon.scientificName']);
      });
      const property = season ? filters[2].substring(filters[2].lastIndexOf('.') + 1) + '_' +  (item[filters[2]] !== '' ? item[filters[2]] : 'undefined') :
       !onlySections ? 'day' + '_' + this.padMonthDay(item['gathering.conversions.day']) + '-' + this.padMonthDay(item['gathering.conversions.month']) + '-' + item['gathering.conversions.year']
      : filters[2].substring(filters[2].lastIndexOf('.') + 1) + '_' +  (item[filters[2]] !== '' ? item[filters[2]] : 'undefined');

      if (existing.length) {
        const existingIndex = arrayMerged[0]['dataSets'][item['unit.linkings.taxon.taxonSets']].indexOf(existing[0]);
        arrayMerged[0]['dataSets'][item['unit.linkings.taxon.taxonSets']][existingIndex]['total'] =
        arrayMerged[0]['dataSets'][item['unit.linkings.taxon.taxonSets']][existingIndex]['total'] += item['individualCountSum'];

        if (arrayMerged[0]['dataSets'][item['unit.linkings.taxon.taxonSets']][existingIndex][property]) {
          arrayMerged[0]['dataSets'][item['unit.linkings.taxon.taxonSets']][existingIndex][property] += item['individualCountSum'];
        } else {
          arrayMerged[0]['dataSets'][item['unit.linkings.taxon.taxonSets']][existingIndex][property] = (item['individualCountSum']);
        }
      } else {
        arrayMerged[0]['dataSets'][item['unit.linkings.taxon.taxonSets']].push(
          {
            'scientificName': item['unit.linkings.taxon.scientificName'],
            'vernacularName': {
              'fi': item['unit.linkings.taxon.nameFinnish'],
              'sv': item['unit.linkings.taxon.nameSwedish'],
              'en': item['unit.linkings.taxon.nameEnglish']
            },
            'cursiveName': item['unit.linkings.taxon.cursiveName'],
           'total': item['individualCountSum'],
           [property] : item['individualCountSum'],
           ...objectFilter.filter(
            el => el !== (property)).reduce((acc, curr) => (acc[curr] = '', acc) , {})
          });
      }
      arrayMerged[0]['yearsDays'].push(item['oldestRecord']);
    });

    // meant to reorgainze butterfly census by removing and additional unwanted MVL-collection, and moving taxon set
    // with other butterflies to be the last shown set
    uniqueTaxonSets = uniqueTaxonSets.filter(set => set.includes('MX.'));

    const indexOfOther = uniqueTaxonSets.findIndex(set => set.includes('Other'));

    if (indexOfOther !== -1) {
      uniqueTaxonSets.push(...uniqueTaxonSets.splice(indexOfOther, 1));
    }

    arrayMerged[0]['yearsDays'] = this.uniqueYearDaysToDate(arrayMerged[0]['yearsDays'], false);
    arrayMerged[0]['taxonSets'] = uniqueTaxonSets;

    return arrayMerged;
  }

  private findMaxMinFilter(array: any[], filter: string) {
   const tmpArray = [];

    array.forEach(element => {
      for (const key in element) {
        if (key.startsWith(filter)) {
          tmpArray.push(element[key]);
        }
      }
    });

    return [Math.min(...tmpArray), Math.max(...tmpArray)];
  }

  private uniqueYearDaysToDate(array, onlySort) {
    let tmpArray = [];

    if (!onlySort) {
      tmpArray = array.filter((el, index) => {
        return array.indexOf(el) === index;
      });
    }

    tmpArray.sort((a, b) => {
      a = a.split('-').join('');
      b = b.split('-').join('');
      return a > b ? 1 : a < b ? -1 : 0;
    });

    return tmpArray;
  }

  private sortDate(array) {
    array.sort((a, b) => {
      a = a.split('-').join('');
      b = b.split('-').join('');
      return  a < b ? -1 : (a > b ? 1 : 0);
    });

    return array;
  }



}
