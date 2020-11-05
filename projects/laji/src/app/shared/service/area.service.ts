import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LajiApi, LajiApiService } from './laji-api.service';
import { AbstractCachedHttpService } from './abstract-cached-http.service';
import { Area } from '../model/Area';

@Injectable({providedIn: 'root'})
export class AreaService extends AbstractCachedHttpService<Area> {

  public types = Area.AreaType;

  constructor(private lajiApi: LajiApiService) {
    super();
  }

  getAllAsLookUp(lang: string): Observable<{[id: string]: Area}> {
    return this.fetchLookup(this.lajiApi
      .getList(LajiApi.Endpoints.areas, {lang, page: 1, pageSize: 10000}).pipe(
        map(paged => paged.results)
      ), lang);
  }

  getBiogeographicalProvinces(lang: string): Observable<{id: string, value: string}[]> {
    return this.getAreaType(lang, this.types.Biogeographical);
  }

  getProvinceCode(id: string, lang: string) {
    return this.getAllAsLookUp(lang).pipe(
      map(data => data[id] && data[id].provinceCodeAlpha || '')
    );
  }

  getMunicipalities(lang: string): Observable<{id: string, value: string}[]> {
    return this.getAreaType(lang, this.types.Municipality);
  }

  getBirdAssociationAreas(lang: string): Observable<{id: string, value: string}[]> {
    return this.getAreaType(lang, this.types.BirdAssociationArea);
  }

  getCountries(lang: string): Observable<{id: string, value: string}[]> {
    return this.getAreaType(lang, this.types.Country);
  }

  getName(id: string, lang) {
    return this.getAllAsLookUp(lang).pipe(
      map(data => data[id] && data[id].name || id )
    );
  }

  public getAreaType(lang: string, type: Area.AreaType): Observable<{id: string, value: string}[]> {
    return this.getAllAsLookUp(lang).pipe(
      map(area => {
        if (!area) {
          return [];
        }
        return Object.keys(area).reduce((total, key) => {
          if (area[key].areaType === type) {
            total.push({id: key, value: area[key].name});
          }
          return total;
        }, []);
      }));
  }
}
