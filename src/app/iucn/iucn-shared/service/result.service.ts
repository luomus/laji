import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { map, share, tap } from 'rxjs/operators';

const AGG_STATUS = 'latestRedListStatusFinland.status';

export interface FilterQuery {
  redListGroup?: string;
  habitat?: string;
  threads?: string;
  reasons?: string;
  status?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ResultService {

  private requestCache: {[key: string]: any} = {};
  private resultCache: {[key: string]: any} = {};

  years: string[] = [
    'current',
    '2019',
    '2015',
    '2010',
    '2000'
  ];

  statuses: string[] = [
    'MX.iucnRE',
    'MX.iucnCR',
    'MX.iucnEN',
    'MX.iucnVU',
    'MX.iucnNT',
    'MX.iucnDD',
    'MX.iucnLC',
    'MX.iucnNA',
    'MX.iucnNE'
  ];

  shortLabel = {
    'MX.iucnRE': 'RE',
    'MX.iucnCR': 'CR',
    'MX.iucnEN': 'EN',
    'MX.iucnVU': 'VU',
    'MX.iucnNT': 'NT',
    'MX.iucnDD': 'DD',
    'MX.iucnLC': 'LC',
    'MX.iucnNA': 'NA',
    'MX.iucnNE': 'NE'
  };

  redListStatuses: string[] = [
    'MX.iucnEN',
    'MX.iucnCR',
    'MX.iucnVU',
    'MX.iucnDD'
  ];

  private yearToChecklistVersion = {
    '2019': 'MR.424',
    '2015': 'MR.425',
    '2010': 'MR.426',
    '2000': 'MR.426',
  };

  constructor(private taxonomyApi: TaxonomyApi) { }

  getChecklistVersion(year: string): string {
    return this.yearToChecklistVersion[year];
  }

  getResults(year: number): Observable<{name: string, value: number}[]> {
    if (this.resultCache[year]) {
      return ObservableOf(this.resultCache[year]);
    }
    if (!this.requestCache[year]) {
      this.requestCache[year] = this.taxonomyApi.species({
        // checklistVersion: this.yearToChecklistVersion[year],
        redListStatusFilters: 'MX.iucnEN,MX.iucnCR,MX.iucnVU,MX.iucnDD,MX.iucnRE,MX.iucnNT,MX.iucnLC,MX.iucnDD',
        aggregateBy: AGG_STATUS,
        aggregateBySize: 1000
      }, 'multi', '1', '0').pipe(
        map(data => this.mapAgg(data)),
        tap(data => this.resultCache[year] = data),
        share()
      );
    }
    return this.requestCache[year];
  }

  private mapAgg(data) {
    if (!data.aggregations || !data.aggregations[AGG_STATUS]) {
      return [];
    }
    return data.aggregations[AGG_STATUS]
      .map(res => ({name: res.values[AGG_STATUS].replace('MX.iucn', ''), value: res.count}));
  }

}
