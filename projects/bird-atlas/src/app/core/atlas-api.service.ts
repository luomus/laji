import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { environment } from '../../env/environment';
import { cacheReturnObservable, Lang } from './api.service';

export type AtlasMap = string;
export interface AtlasGridSquare {
  birdAssociationArea: {key: string; value: string};
  coordinates: string;
  id: string;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  name: string;
  data?: {
    atlasClass: {key: string; value: string};
    atlasCode: {key: string; value: string};
    speciesId: string;
    speciesName: string;
  }[];
  atlas?: number;
  atlasClassSum?: number;
  activityCategory?: {key: string; value: string};
};
export type AtlasGrid = AtlasGridSquare[];

interface VernacularName {fi: string; sv: string; en: string};
export interface AtlasTaxon {
  id: string;
  intellectualRights: string;
  scientificName: string;
  vernacularName: VernacularName;
  next?: AtlasTaxon;
  prev?: AtlasTaxon;
}
export type AtlasTaxa = AtlasTaxon[];

const BASE_URL = environment.atlasApiBasePath;

@Injectable()
export class AtlasApiService {
  constructor(private http: HttpClient, private translate: TranslateService) {}

  @cacheReturnObservable()
  getSpeciesMap(speciesId: string, lang: Lang = <Lang>this.translate.currentLang): Observable<AtlasMap> {
    const url = `${BASE_URL}/map/${speciesId}/atlas`;
    return this.http.get(url, {responseType: 'text', params: {lang, scaling: 0}});
  }

  @cacheReturnObservable()
  getGrid(): Observable<AtlasGrid> {
    const url = `${BASE_URL}/grid`;
    return <Observable<AtlasGrid>>this.http.get(url);
  }

  @cacheReturnObservable()
  getGridSquare(gridId: string): Observable<AtlasGridSquare> {
    const url = `${BASE_URL}/grid/${gridId}/atlas`;
    return <Observable<AtlasGridSquare>>this.http.get(url);
  }

  @cacheReturnObservable()
  getTaxa(): Observable<AtlasTaxa> {
    const url = `${BASE_URL}/taxon`;
    return <Observable<AtlasTaxa>>this.http.get(url);
  }

  @cacheReturnObservable()
  getTaxon(id: string): Observable<AtlasTaxon> {
    const url = `${BASE_URL}/taxon/${id}`;
    return <Observable<AtlasTaxon>>this.http.get(url);
  }
}