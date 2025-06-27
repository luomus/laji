import { Injectable } from '@angular/core';
import { AreaService } from '../../../../../laji/src/app/shared/service/area.service';
import { Area } from '../../../../../laji/src/app/shared/model/Area';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChecklistVersion } from './taxon.service';

export const REGIONAL_DEFAULT_YEAR = '2020';

export interface RegionalFilterQuery {
  taxon?: string;
  redListGroup?: string;
  habitat?: string;
  threatenedAtArea?: string[];
  page?: number;
  speciesFields?: string;
}

export interface IucnArea {
  id: string;
  label: string;
  shortLabel: string;
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

  private yearToChecklistVersion: {[year: string]: ChecklistVersion} = {
    2020: 'MR.484'
  };

  private yearToStatusEvaluationYear: {[year: string]: string} = {
    2020: '2019'
  };

  constructor(
    private areaService: AreaService
  ) {}

  getAreas(lang: string): Observable<IucnArea[]> {
    return this.areaService.getAreaType(lang, Area.AreaType.IucnEvaluationArea).pipe(
      map(areas => areas.map(area => ({id: area.id, label: area.value, shortLabel: area.value.split(' ')[0]})))
    );
  }

  getChecklistVersion(year: string): ChecklistVersion {
    return this.yearToChecklistVersion[year];
  }

  getYearFromChecklistVersion(checklistVersion: string): string {
    if (!checklistVersion) {
      return REGIONAL_DEFAULT_YEAR;
    }

    const year = Object.keys(this.yearToChecklistVersion).find(key => this.yearToChecklistVersion[key] === checklistVersion);

    return year || REGIONAL_DEFAULT_YEAR;
  }

  getStatusEvaluationYearFromChecklistVersion(checklistVersion: string): string {
    return this.yearToStatusEvaluationYear[this.getYearFromChecklistVersion(checklistVersion)];
  }
}
