import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { environment } from '../../env/environment';
import { cacheReturnObservable, Lang } from './api.service';

export type AtlasMap = any;
export interface AtlasGridQueryElem {
  birdAssociationArea: string;
  coordinates: string;
  id: string;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  name: string;
};
export type AtlasGridElement = any;
export type AtlasTaxa = any;
export type AtlasTaxon = any;

const BASE_URL = environment.atlasApiBasePath;

@Injectable({providedIn: 'root'})
export class AtlasApiService {
  constructor(private http: HttpClient, private translate: TranslateService) {}

  @cacheReturnObservable()
  getSpeciesMap(speciesId: string, lang: Lang = <Lang>this.translate.currentLang): Observable<AtlasMap> {
    const url = `${BASE_URL}/map/${speciesId}/atlas`;
    return this.http.get(url, {responseType: 'text', params: {lang, scaling: 0}});
  }

  @cacheReturnObservable()
  getGrid(): Observable<AtlasGridQueryElem[]> {
    const url = `${BASE_URL}/grid`;
    return <Observable<AtlasGridQueryElem[]>>this.http.get(url);
  }

  @cacheReturnObservable()
  getGridElement(gridId: string): Observable<AtlasGridElement> {
    const url = `${BASE_URL}/grid/${gridId}/atlas`;
    return this.http.get(url);
  }

  @cacheReturnObservable()
  getTaxa(): Observable<AtlasTaxa> {
    const url = `${BASE_URL}/taxon`;
    return this.http.get(url);
  }

  @cacheReturnObservable()
  getTaxon(id: string): Observable<AtlasTaxon> {
    const url = `${BASE_URL}/taxon/${id}`;
    return this.http.get(url);
  }
}
