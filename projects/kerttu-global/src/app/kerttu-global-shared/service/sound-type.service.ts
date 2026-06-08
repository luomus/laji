import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { KerttuGlobalApi } from './kerttu-global-api';
import { TaxonTypeEnum } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SoundTypeService {
  private cache = new Map<TaxonTypeEnum, Observable<string[]>>();

  constructor(private kerttuGlobalApi: KerttuGlobalApi) {}

  getSoundTypes(taxonType: TaxonTypeEnum): Observable<string[]> {
    if (!this.cache.has(taxonType)) {
      const soundTypes$ = this.kerttuGlobalApi.getSoundTypes(taxonType).pipe(
        map(result => result.results),
        shareReplay(1)
      );
      this.cache.set(taxonType, soundTypes$);
    }
    return this.cache.get(taxonType)!;
  }
}
