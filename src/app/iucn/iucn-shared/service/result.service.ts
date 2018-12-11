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
    'RE',
    'CR',
    'EN',
    'VU',
    'NT',
    'DD',
    'LC',
    'NA',
    'NE'
  ];

  redListStatuses: string[] = [
    'EN',
    'CR',
    'VU',
    'DD'
  ];

  private yearToChecklistVersion = {
    '2019': 'MR.424',
    '2015': 'MR.425',
    '2010': 'MR.426',
    '2000': 'MR.426',
  };

  constructor(private taxonomyApi: TaxonomyApi) { }

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
