import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KerttuGlobalApi {

  constructor(protected httpClient: HttpClient) {
  }
  protected basePath = environment.kerttuApi;

  public getSpeciesList(): Observable<any[]> {
    return of([
      { 'id': 'MX.26277', 'vernacularName': 'Mute Swan', 'scientificName': 'Cygnus olor', 'userValidations': 2 },
      { 'id': 'MX.26280', 'vernacularName': 'Whooper Swan', 'scientificName': 'Cygnus cygnus', 'userValidations': 0 },
      { 'id': 'MX.26282', 'vernacularName': 'Tundra Swan', 'scientificName': 'Cygnus columbianus', 'userValidations': 3 }
    ]);
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
}
