import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { AreaApi } from '../api/AreaApi';


export enum AreaType {
  Country = <any>'ML.country',
  Biogeographical = <any>'ML.biogeographicalProvince',
  Municipality = <any>'ML.municipality',
  IucnEvaluationArea = <any>'ML.iucnEvaluationArea',
}

@Injectable()
export class AreaService {

  public types = AreaType;

  private areas;
  private currentLang;
  private pending: Observable<any>;

  constructor(private areaApi: AreaApi) {
  }

  getAllAsLookUp(lang: string): Observable<any> {
    if (lang === this.currentLang) {
      if (this.areas) {
        return Observable.of(this.areas);
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
    this.pending = this.areaApi
      .findAll(lang, undefined, '1', '1000')
      .map(paged => paged.results)
      .map(areas => {
        const lkObject = {};
        areas.map(area => { lkObject[area['id']] = {
          name: area['name'],
          areaType: area['areaType'],
          provinceCodeAlpha: area['provinceCodeAlpha']
        }; });
        return lkObject;
      })
      .do(locations => { this.areas = locations; })
      .share();
    this.currentLang = lang;

    return this.pending;
  }

  getBiogeographicalProvinces(lang: string) {
    return this.getAreaType(lang, this.types.Biogeographical);
  }

  getProvinceCode(id: string, lang: string) {
    return this.getAllAsLookUp(lang)
      .map(data => data[id] && data[id].provinceCodeAlpha || '');
  }

  getMunicipalities(lang: string) {
    return this.getAreaType(lang, this.types.Municipality);
  }

  getCountries(lang: string) {
    return this.getAreaType(lang, this.types.Country);
  }

  getName(id: string, lang) {
    return this.getAllAsLookUp(lang)
      .map(data => data[id] && data[id].name || id );
  }

  private getAreaType(lang: string, type: AreaType) {
    return this.getAllAsLookUp(lang)
      .map(area => {
        return Object.keys(area).reduce((total, key) => {
          if (this.areas[key].areaType === type) {
            total.push({id: key, value: this.areas[key].name});
          }
          return total;
        }, []);
      });
  }
}
