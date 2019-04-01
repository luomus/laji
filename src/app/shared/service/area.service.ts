import { share, tap, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, Observer, of as ObservableOf } from 'rxjs';
import { LajiApi, LajiApiService } from './laji-api.service';


export enum AreaType {
  Country = <any>'ML.country',
  Biogeographical = <any>'ML.biogeographicalProvince',
  Municipality = <any>'ML.municipality',
  OldMunicipality = <any>'ML.oldMunicipality',
  BirdAssociationArea = <any>'ML.birdAssociationArea',
  IucnEvaluationArea = <any>'ML.iucnEvaluationArea',
}

@Injectable({providedIn: 'root'})
export class AreaService {

  public types = AreaType;

  private areas;
  private currentLang = '';
  private pending: Observable<any>;

  constructor(private lajiApi: LajiApiService) {
  }

  getAllAsLookUp(lang: string): Observable<any> {
    if (lang === this.currentLang) {
      if (this.areas) {
        return ObservableOf(this.areas);
      } else if (this.pending) {
        return Observable.create((observer: Observer<any>) => {
          const onComplete = (res: any) => {
            observer.next(res);
            observer.complete();
          };
          this.pending.subscribe(
            () => { onComplete(this.areas); }
          );
        });
      }
    }
    this.pending = this.lajiApi
      .getList(LajiApi.Endpoints.areas, {lang, page: 1, pageSize: 10000}).pipe(
      map(paged => paged.results),
      map(areas => {
        const lkObject = {};
        areas.map(area => { lkObject[area['id']] = {
          name: area['name'],
          areaType: area['areaType'],
          provinceCodeAlpha: area['provinceCodeAlpha']
        }; });
        return lkObject;
      })).pipe(
      tap(locations => { this.areas = locations; }),
      share());
    this.currentLang = lang;

    return this.pending;
  }

  getBiogeographicalProvinces(lang: string) {
    return this.getAreaType(lang, this.types.Biogeographical);
  }

  getProvinceCode(id: string, lang: string) {
    return this.getAllAsLookUp(lang).pipe(
      map(data => data[id] && data[id].provinceCodeAlpha || '')
    );
  }

  getMunicipalities(lang: string) {
    return this.getAreaType(lang, this.types.Municipality);
  }

  getBirdAssociationAreas(lang: string) {
    return this.getAreaType(lang, this.types.BirdAssociationArea);
  }

  getCountries(lang: string) {
    return this.getAreaType(lang, this.types.Country);
  }

  getName(id: string, lang) {
    return this.getAllAsLookUp(lang).pipe(
      map(data => data[id] && data[id].name || id )
    );
  }

  public getAreaType(lang: string, type: AreaType) {
    return this.getAllAsLookUp(lang).pipe(
      map(area => {
        if (!area) {
          return [];
        }
        return Object.keys(area).reduce((total, key) => {
          if (this.areas[key].areaType === type) {
            total.push({id: key, value: this.areas[key].name});
          }
          return total;
        }, []);
      }));
  }
}
