import { Injectable } from '@angular/core';

export const REGIONAL_DEFAULT_YEAR = '2020';
export interface RegionalFilterQuery {
  taxon?: string;
  redListGroup?: string;
  habitat?: string;
  threatenedAtArea?: string[];
  page?: string;
  speciesFields?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegionalService {
  years: string[] = [
    // 'current',
    '2020'
  ];

  rootGroups = ['MVL.721', 'MVL.727', 'MVL.1042', 'MVL.799', 'MVL.729']; // putkilokasvit, sammaleet, sienet ja jäkälät, perhoset, linnut

  areas: string[] = [
    'ML.690',
    'ML.691',
    'ML.692',
    'ML.693',
    'ML.694',
    'ML.695',
    'ML.696',
    'ML.697',
    'ML.698',
    'ML.699',
    'ML.700'
  ];
  shortLabel = {
    'ML.690': '1a',
    'ML.691': '1b',
    'ML.692': '2a',
    'ML.693': '2b',
    'ML.694': '3a',
    'ML.695': '3b',
    'ML.696': '3c',
    'ML.697': '4a',
    'ML.698': '4b',
    'ML.699': '4c',
    'ML.700': '4d'
  };

  private yearToChecklistVersion = {
    '2020': 'MR.484'
  };

  private yearToStatusEvaluationYear = {
    '2020': '2019'
  };

  constructor(

  ) { }

  getChecklistVersion(year: string): string {
    return this.yearToChecklistVersion[year];
  }

  getYearFromChecklistVersion(checklistVersion: string): string {
    if (!checklistVersion) {
      return REGIONAL_DEFAULT_YEAR;
    }

    return Object.keys(this.yearToChecklistVersion).find(key => this.yearToChecklistVersion[key] === checklistVersion);
  }

  getStatusEvaluationYearFromChecklistVersion(checklistVersion: string): string {
    return this.yearToStatusEvaluationYear[this.getYearFromChecklistVersion(checklistVersion)];
  }
}
