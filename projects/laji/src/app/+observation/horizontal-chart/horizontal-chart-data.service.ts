import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

export const MAX_TAXA_SIZE = 30;

@Injectable()
export class HorizontalChartDataService {
  constructor(
    private api: LajiApiClientBService
  ) { }


  getChartDataLabels(ids: string[]): Observable<Record<string, {vernacularName: string; scientificName: string}>> {
    if (ids.length === 0) { return of({}); }
    return this.api.get('/taxa', { query: { id: ids.join(','), pageSize: ids.length, selectedFields: 'id,vernacularName,scientificName' } }).pipe(
      map(({ results }) => results.reduce((idToNames, {id, vernacularName, scientificName }) => {
        idToNames[id] = { vernacularName, scientificName };
        return idToNames;
      }, {} as Record<string, {vernacularName: string; scientificName: string}>))
    );
  }
}
