import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { BsgApi } from './bsg-api';
import { TaxonTypeEnum } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SoundTypeService {
  private cache = new Map<TaxonTypeEnum, Observable<string[]>>();

  constructor(private bsgApi: BsgApi) {}

  getSoundTypes(taxonType: TaxonTypeEnum): Observable<string[]> {
    if (!this.cache.has(taxonType)) {
      const soundTypes$ = this.bsgApi.getSoundTypes(taxonType).pipe(
        map(result => result.results),
        shareReplay(1)
      );
      this.cache.set(taxonType, soundTypes$);
    }
    return this.cache.get(taxonType)!;
  }
}
