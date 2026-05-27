import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';

export const MAX_TAXA_SIZE = 30;

@Injectable()
export class HorizontalChartDataService {
  constructor(
    private api: LajiApiClientService
  ) { }


  getChartDataLabels(ids: string[]): Observable<Record<string, {vernacularName: string; scientificName: string}>> {
    if (ids.length === 0) { return of({}); }
    return this.api.get('/taxa',
      { query: { id: ids.join(','), pageSize: ids.length, selectedFields: 'id,vernacularName,scientificName' } },
      { langFallback: false }
    ).pipe(
      map(({ results }) => results.reduce((idToNames, {id, vernacularName, scientificName }) => {
        idToNames[id] = { vernacularName, scientificName };
        return idToNames;
      }, {} as Record<string, {vernacularName: string; scientificName: string}>))
    );
  }
}
