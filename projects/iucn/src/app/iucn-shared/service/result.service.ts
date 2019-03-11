import { Injectable } from '@angular/core';
import { forkJoin, Observable, of as ObservableOf } from 'rxjs';
import { TaxonomyApi } from '../../../../../../src/app/shared/api/TaxonomyApi';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { TriplestoreLabelService } from '../../../../../../src/app/shared/service/triplestore-label.service';
import { TranslateService } from '@ngx-translate/core';

export const DEFAULT_YEAR = '2019';
const AGG_STATUS = 'latestRedListEvaluation.redListStatus';

export interface FilterQuery {
  taxon?: string;
  redListGroup?: string;
  habitat?: string;
  habitatSpecific?: string;
  threats?: string;
  reasons?: string;
  status?: string[];
  onlyPrimaryHabitat?: boolean;
  onlyPrimaryReason?: boolean;
  onlyPrimaryThreat?: boolean;
  page?: string;
  speciesFields?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResultService {

  private requestCache: {[key: string]: any} = {};
  private resultCache: {[key: string]: any} = {};

  years: string[] = [
    // 'current',
    '2019',
    '2015',
    // '2010',
    // '2000'
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

  evaluatedStatuses: string[] = [
    'MX.iucnRE',
    'MX.iucnCR',
    'MX.iucnEN',
    'MX.iucnVU',
    'MX.iucnDD',
    'MX.iucnNT',
    'MX.iucnLC',
  ];

  redListStatuses: string[] = [
    'MX.iucnRE',
    'MX.iucnCR',
    'MX.iucnEN',
    'MX.iucnVU',
    'MX.iucnDD',
    'MX.iucnNT',
  ];

  endangered: string[] = [
    'MX.iucnCR',
    'MX.iucnEN',
    'MX.iucnVU'
  ];

  habitatStatuses: string[] = [
    'MX.iucnRE',
    'MX.iucnCR',
    'MX.iucnEN',
    'MX.iucnVU',
    'MX.iucnNT',
    'MX.iucnDD'
  ];

  private yearToChecklistVersion = {
    '2019': 'MR.424',
    '2015': 'MR.425',
    '2010': 'MR.426',
    '2000': 'MR.427',
  };

  constructor(
    private taxonomyApi: TaxonomyApi,
    private triplestoreLabelService: TriplestoreLabelService,
    private translationService: TranslateService
  ) { }

  getChecklistVersion(year: string): string {
    return this.yearToChecklistVersion[year];
  }

  getYearFromChecklistVersion(checklistVersion: string) {
    if (!checklistVersion) {
      return DEFAULT_YEAR;
    }

    return Object.keys(this.yearToChecklistVersion).find(key => this.yearToChecklistVersion[key] === checklistVersion);
  }

  getYearsStats(year: number): Observable<{name: string, value: number, key: string}[]> {
    if (this.resultCache[year]) {
      return ObservableOf(this.resultCache[year]);
    }
    if (!this.requestCache[year]) {
      this.requestCache[year] = this.taxonomyApi.species({
        checklistVersion: this.yearToChecklistVersion[year],
        'latestRedListEvaluation.redListStatus': 'MX.iucnEN,MX.iucnCR,MX.iucnVU,MX.iucnDD,MX.iucnRE,MX.iucnNT,MX.iucnLC,MX.iucnDD',
        aggregateBy: AGG_STATUS,
        aggregateBySize: 1000
      }, 'multi', '1', '0').pipe(
        map(data => this.mapAgg(data)),
        switchMap(data => forkJoin(data.map(res => this.triplestoreLabelService.get(res.name, this.translationService.currentLang))).pipe(
          map(translations => data.map((res, idx) => ({...res, name: translations[idx]})))
        )),
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
      .map(res => ({name: res.values[AGG_STATUS], value: res.count, key: res.values[AGG_STATUS]}));
  }

}
