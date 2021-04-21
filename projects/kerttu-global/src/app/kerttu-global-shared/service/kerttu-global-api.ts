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
      { 'vernacularName': 'Mute Swan', 'scientificName': 'Cygnus olor', 'userValidations': 2 },
      { 'vernacularName': 'Whooper Swan', 'scientificName': 'Cygnus cygnus', 'userValidations': 0 },
      { 'vernacularName': 'Tundra Swan', 'scientificName': 'Cygnus columbianus', 'userValidations': 3 }
    ]);
  }
}
