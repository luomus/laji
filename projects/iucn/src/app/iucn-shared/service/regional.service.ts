import { Injectable } from '@angular/core';

export const REGIONAL_DEFAULT_YEAR = '2020';
// tslint:disable-next-line:no-empty-interface
export interface RegionalFilterQuery {

}

@Injectable({
  providedIn: 'root'
})
export class RegionalService {
  years: string[] = [
    // 'current',
    '2020'
  ];

  private yearToChecklistVersion = {
    '2020': 'MR.484'
  };

  constructor(

  ) { }

  getChecklistVersion(year: string): string {
    return this.yearToChecklistVersion[year];
  }

  getYearFromChecklistVersion(checklistVersion: string) {
    if (!checklistVersion) {
      return REGIONAL_DEFAULT_YEAR;
    }

    return Object.keys(this.yearToChecklistVersion).find(key => this.yearToChecklistVersion[key] === checklistVersion);
  }

}
