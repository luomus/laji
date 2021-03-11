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

  private yearToChecklistVersion = {
    '2020': 'MR.484'
  };

  constructor(

  ) { }
}
