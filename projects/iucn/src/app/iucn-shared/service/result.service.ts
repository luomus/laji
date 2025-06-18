import { Injectable } from '@angular/core';
import { forkJoin, Observable, of as ObservableOf } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { TriplestoreLabelService } from '../../../../../laji/src/app/shared/service/triplestore-label.service';
import { TranslateService } from '@ngx-translate/core';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { paths } from 'projects/laji-api-client-b/generated/api.d';
import { ChecklistVersion } from './taxon.service';

type RedListStatus = NonNullable<paths['/taxa/species/aggregate']['post']['requestBody']['content']['application/json']['latestRedListEvaluation.redListStatus']>;

export const DEFAULT_YEAR = '2019';
const AGG_STATUS = 'latestRedListEvaluation.redListStatus';

export interface YearChecklists {
  2000: ChecklistVersion;
  2010: ChecklistVersion;
  2015: ChecklistVersion;
  2019: ChecklistVersion;
}

export type ChecklistYear = keyof YearChecklists;

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
  page?: number;
  speciesFields?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResultService {

  private requestCache: {[key: string]: any} = {};
  private resultCache: {[key: string]: any} = {};

  years: string[] = [
    '2019',
    '2015',
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

  habitatStatuses: RedListStatus[] = [
    'MX.iucnRE',
    'MX.iucnCR',
    'MX.iucnEN',
    'MX.iucnVU',
    'MX.iucnNT',
    'MX.iucnDD'
  ];

  private yearToChecklistVersion: YearChecklists = {
    2019: 'MR.424',
    2015: 'MR.425',
    2010: 'MR.426',
    2000: 'MR.427',
  };

  constructor(
    private api: LajiApiClientBService,
    private triplestoreLabelService: TriplestoreLabelService,
    private translationService: TranslateService
  ) { }

  getChecklistVersion(year: ChecklistYear): ChecklistVersion {
    return this.yearToChecklistVersion[year];
  }

  getYearFromChecklistVersion(checklistVersion: ChecklistVersion) {
    if (!checklistVersion) {
      return DEFAULT_YEAR;
    }

    return Object.keys(this.yearToChecklistVersion)
      .find((key) => this.yearToChecklistVersion[key as unknown as keyof YearChecklists] === checklistVersion);
  }

  getYearsStats(year: ChecklistYear): Observable<{name: string; value: number; key: string}[]> {
    if (!this.requestCache[year]) {
      this.requestCache[year] = {};
    }
    if (!this.resultCache[year]) {
      this.resultCache[year] = {};
    }

    if (this.resultCache[year][this.translationService.currentLang]) {
      return ObservableOf(this.resultCache[year][this.translationService.currentLang]);
    }
    if (!this.requestCache[year][this.translationService.currentLang]) {
      this.requestCache[year][this.translationService.currentLang] = this.api.post('/taxa/species/aggregate',
        { query: { aggregateBy: AGG_STATUS, aggregateSize: 100, checklistVersion: this.yearToChecklistVersion[year] } }, {
        'latestRedListEvaluation.redListStatus': ['MX.iucnEN', 'MX.iucnCR', 'MX.iucnVU', 'MX.iucnDD', 'MX.iucnRE', 'MX.iucnNT', 'MX.iucnLC', 'MX.iucnDD'],
      }).pipe(
        map(data => this.mapAgg(data)),
        switchMap(data => forkJoin(data.map((res: any) => this.triplestoreLabelService.get(res.name, this.translationService.currentLang))).pipe(
          map(translations => data.map((res: any, idx: number) => ({...res, name: translations[idx]})))
        )),
        tap(data => this.resultCache[year][this.translationService.currentLang] = data),
        share()
      );
    }
    return this.requestCache[year][this.translationService.currentLang];
  }

  private mapAgg(data: any) {
    return (data[AGG_STATUS] || [])
      .map((res: any) => ({name: res.values[AGG_STATUS], value: res.count, key: res.values[AGG_STATUS]}));
  }

}
