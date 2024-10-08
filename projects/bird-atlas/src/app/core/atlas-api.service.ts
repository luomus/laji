import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { environment } from '../../env/environment';
import { cacheReturnObservable, Lang } from './api.service';
import { Taxon } from 'projects/laji-api-client/src/public-api';

export type AtlasMap = string;
export type AtlasActivityCategory =
  'MY.atlasActivityCategoryEnum0'
  | 'MY.atlasActivityCategoryEnum1'
  | 'MY.atlasActivityCategoryEnum2'
  | 'MY.atlasActivityCategoryEnum3'
  | 'MY.atlasActivityCategoryEnum4'
  | 'MY.atlasActivityCategoryEnum5';

export type AtlasClass = 'MY.atlasClassEnumA' | 'MY.atlasClassEnumB' | 'MY.atlasClassEnumC' | 'MY.atlasClassEnumD';

export interface KeyValueObject<K, T> {
  key: K;
  value: T;
}
export interface AtlasGridSquare {
  birdAssociationArea: KeyValueObject<string, string>;
  coordinates: string;
  id: string;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  name: string;
  data?: {
    atlasClass: KeyValueObject<AtlasClass, string>;
    atlasCode: KeyValueObject<string, string>;
    speciesId: string;
    speciesName: string;
  }[];
  atlas?: number;
  atlasClassSum?: number;
  activityCategory?: KeyValueObject<AtlasActivityCategory, string>;
  speciesCount?: number;
};

export interface BirdSociety {
  gridSquares: AtlasGridSquare[];
  birdAssociationArea: KeyValueObject<string, string>;
  activityCategories: Record<AtlasActivityCategory, {
    name: string;
    squareSum: number;
    squarePercentage: number;
  }>;
  taxa: AtlasTaxon[];
}

interface VernacularName {fi: string; sv: string; en: string};
export interface AtlasTaxon {
  id: string;
  intellectualRights: string;
  scientificName: string;
  vernacularName: VernacularName;
  taxonomicOrder?: number;
  sensitive?: boolean;
  next?: AtlasTaxon;
  prev?: AtlasTaxon;
  classCounts?: {
    'MY.atlasClassEnumB': number;
    'MY.atlasClassEnumC': number;
    'MY.atlasClassEnumD': number;
    all: number;
  };
}

export type ActivityCategoryStatsObject = Record<AtlasActivityCategory, AtlasActivityCategoryElement>;

export interface AtlasGridResponse {
  activityCategories: ActivityCategoryStatsObject;
  gridSquares: AtlasGridSquare[];
  targetPercentage: number;
  totalSquares: number;
  targetSquares: number;
}

export interface AtlasActivityCategoryElement {
  name: string;
  squareSum: number;
  squarePercentage: number;
}

export interface ActivityCategoryStats {
  targetPercentage: number;
  totalSquares: number;
  targetSquares: number;
  activityCategories: ActivityCategoryStatsObject;
}

export interface AtlasSocietyStatsResponseElement extends ActivityCategoryStats {
  birdAssociationArea: KeyValueObject<string, string>;
}

export interface LappiStatsResponseGridsElement {
  id: string;
  name: string;
  coordinates: string;
  atlasClassSum: number;
  activityCategory: KeyValueObject<string, string>;
}

export interface LappiStatsResponseElement {
  targetMet: boolean;
  targetPercentage: number;
  targetSquares: number;
  totalSquares: number;
  grid: string;
  latMin: number;
  lonMin: number;
  latMax: number;
  lonMax: number;
  grids: LappiStatsResponseGridsElement[];
}


export interface BirdSocietyTaxaResponseElem {
  coordinates: string;
  atlasClassSum: number;
  activityCategory: KeyValueObject<AtlasActivityCategory, string>;
  atlasClass?: KeyValueObject<AtlasClass, string>;
}

export interface TaxonStatsResponse {
  'MY.atlasClassEnumB': number;
  'MY.atlasClassEnumC': number;
  'MY.atlasClassEnumD': number;
}

export interface ObserverStatsParams {
  birdAssociationId?: string;
  limit: number;
}

export interface ObserverStatsResponseElement {
  memberName: string;
  total: number;
  'MY.atlasClassEnumB': number;
  'MY.atlasClassEnumC': number;
  'MY.atlasClassEnumD': number;
}

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
  getGrid(): Observable<AtlasGridResponse> {
    const url = `${BASE_URL}/grid`;
    return <Observable<AtlasGridResponse>>this.http.get(url);
  }

  @cacheReturnObservable(86400000) // 1 day
  getBirdSociety(id: string): Observable<BirdSociety> {
    const url = `${BASE_URL}/grid/birdAssociation/${id}`;
    return <Observable<BirdSociety>>this.http.get(url);
  }

  @cacheReturnObservable(86400000) // 1 day
  getBirdSocietyTaxa(societyId: string, taxonId: string): Observable<BirdSocietyTaxaResponseElem[]> {
    const url = `${BASE_URL}/grid/birdAssociation/${societyId}/taxon/${taxonId}`;
    return <Observable<BirdSocietyTaxaResponseElem[]>>this.http.get(url);
  }

  @cacheReturnObservable(86400000) // 1 day
  getLappiStats(): Observable<LappiStatsResponseElement[]> {
    const url = `${BASE_URL}/birdAssociation/stats/lappi`;
    return <Observable<LappiStatsResponseElement[]>>this.http.get(url);
  }

  @cacheReturnObservable(30000) // 30 seconds
  getGridSquare(gridId: string): Observable<AtlasGridSquare> {
    const url = `${BASE_URL}/grid/${gridId}/atlas`;
    return <Observable<AtlasGridSquare>>this.http.get(url);
  }

  @cacheReturnObservable(86400000) // 1 day
  getBirdSocieties(): Observable<KeyValueObject<string, string>[]> {
    const url = `${BASE_URL}/birdAssociation`;
    return <Observable<KeyValueObject<string, string>[]>>this.http.get(url);
  }

  @cacheReturnObservable(86400000) // 1 day
  getBirdSocietyStats(): Observable<AtlasSocietyStatsResponseElement[]> {
    const url = `${BASE_URL}/birdAssociation/stats`;
    return <Observable<AtlasSocietyStatsResponseElement[]>>this.http.get(url);
  }

  @cacheReturnObservable(86400000) // 1 day
  getTaxa(): Observable<AtlasTaxon[]> {
    const url = `${BASE_URL}/taxon`;
    return <Observable<AtlasTaxon[]>>this.http.get(url);
  }

  @cacheReturnObservable(60000) // 1 minute
  getTaxon(id: string): Observable<AtlasTaxon> {
    const url = `${BASE_URL}/taxon/${id}`;
    return <Observable<AtlasTaxon>>this.http.get(url);
  }

  @cacheReturnObservable(60000) // 1 minute
  getTaxonStats(id: string): Observable<TaxonStatsResponse> {
    const url = `${BASE_URL}/taxon/${id}/gridStats`;
    return <Observable<TaxonStatsResponse>>this.http.get(url);
  }

  @cacheReturnObservable(60000) // 1 minute
  getObserverStats(params: ObserverStatsParams): Observable<ObserverStatsResponseElement[]> {
    const url = `${BASE_URL}/observer/stats`;
    const options = { params: { ...params }};
    return this.http.get<ObserverStatsResponseElement[]>(url, options);
  }
}
