import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PagedResult } from 'projects/laji/src/app/shared/model/PagedResult';
import { IKerttuSpeciesQuery, IKerttuSpecies, IKerttuSpeciesFilters } from '../models';
import { Observable, of, timer } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KerttuGlobalApi {

  constructor(protected httpClient: HttpClient) {
  }
  protected basePath = environment.kerttuApi + '/global';

  public getSpeciesList(personToken: string, query: IKerttuSpeciesQuery): Observable<PagedResult<IKerttuSpecies>> {
    const path = this.basePath + '/species';

    let params = new HttpParams().set('personToken', personToken);
    Object.keys(query).forEach(function (key) {
        params = params.append(key, '' + query[key]);
    });

    return this.httpClient.get<PagedResult<IKerttuSpecies>>(path, { params });
  }

  public getSpeciesFilters(): Observable<IKerttuSpeciesFilters> {
    const path = this.basePath + '/species/filters';

    return this.httpClient.get<IKerttuSpeciesFilters>(path);
  }

  public getDataForValidation(taxonId: string): Observable<any[]> {
    return of([
      { 'audio': {'url': 'https://image.laji.fi/HLO01/HLO01_20180516_031304_48.mp3'}, 'xRange': [25, 27], 'yRange': [3000, 6000]},
      { 'audio': {'url': 'https://image.laji.fi/HLO01/HLO01_20180516_031304_48.mp3'}, 'xRange': [2, 4], 'yRange': [1000, 5000]},
      { 'audio': {'url': 'https://image.laji.fi/HLO01/HLO01_20180516_031304_48.mp3'}, 'xRange': [2, 4], 'yRange': [1000, 5000]},
      { 'audio': {'url': 'https://image.laji.fi/HLO01/HLO01_20180516_031304_48.mp3'}, 'xRange': [2, 4], 'yRange': [1000, 5000]},
      { 'audio': {'url': 'https://image.laji.fi/HLO01/HLO01_20180516_031304_48.mp3'}, 'xRange': [2, 4], 'yRange': [1000, 5000]}
    ]);
  }

  public saveAnnotations(annotations): Observable<any> {
    return timer(1000);
  }
}
