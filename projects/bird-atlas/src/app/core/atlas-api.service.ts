import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { environment } from '../../env/environment';
import { cacheReturnObservable, Lang } from './api.service';

export type AtlasMap = string;
export type AtlasActivityCategory =
  'MY.atlasActivityCategoryEnum0'
  | 'MY.atlasActivityCategoryEnum1'
  | 'MY.atlasActivityCategoryEnum2'
  | 'MY.atlasActivityCategoryEnum3'
  | 'MY.atlasActivityCategoryEnum4'
  | 'MY.atlasActivityCategoryEnum5';
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
  activityCategory?: {key: AtlasActivityCategory; value: string};
  speciesCount?: number;
};
export type AtlasGrid = AtlasGridSquare[];
export interface BirdSociety {
  gridSquares: AtlasGrid;
  birdAssociationArea: {
    key: string;
    value: string;
  };
  activityCategories: Record<AtlasActivityCategory, {
    name: string;
    squareSum: number;
    squarePercentage: number;
  }>;
}

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

  @cacheReturnObservable(60000) // 1 minute
  getSpeciesMap(speciesId: string, lang: Lang = <Lang>this.translate.currentLang): Observable<AtlasMap> {
    const url = `${BASE_URL}/map/${speciesId}/atlas`;
    return this.http.get(url, {responseType: 'text', params: {lang, scaling: 0}});
  }

  @cacheReturnObservable(86400000) // 1 day
  getGrid(): Observable<AtlasGrid> {
    const url = `${BASE_URL}/grid`;
    return <Observable<AtlasGrid>>this.http.get(url);
  }

  @cacheReturnObservable(86400000) // 1 day
  getBirdSociety(id: string): Observable<BirdSociety> {
    const url = `${BASE_URL}/grid/birdAssociation/${id}`;
    return <Observable<BirdSociety>>this.http.get(url);
  }

  @cacheReturnObservable(30000) // 30 seconds
  getGridSquare(gridId: string): Observable<AtlasGridSquare> {
    const url = `${BASE_URL}/grid/${gridId}/atlas`;
    return <Observable<AtlasGridSquare>>this.http.get(url);
  }

  @cacheReturnObservable(86400000) // 1 day
  getTaxa(): Observable<AtlasTaxa> {
    const url = `${BASE_URL}/taxon`;
    return <Observable<AtlasTaxa>>this.http.get(url);
  }

  @cacheReturnObservable(60000) // 1 minute
  getTaxon(id: string): Observable<AtlasTaxon> {
    const url = `${BASE_URL}/taxon/${id}`;
    return <Observable<AtlasTaxon>>this.http.get(url);
  }
}
