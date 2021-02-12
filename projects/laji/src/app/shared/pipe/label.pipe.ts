import { concatMap, map, toArray } from 'rxjs/operators';
import { Observable, from, of } from 'rxjs';
import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { WarehouseValueMappingService } from '../service/warehouse-value-mapping.service';
import { TranslateService } from '@ngx-translate/core';
import { TriplestoreLabelService } from '../service/triplestore-label.service';
import { IdService } from '../service/id.service';

type labelType = 'qname'|'fullUri'|'warehouse'|'withKey'|'emptyWhenMissing';

/**
 * Triplestores label maker
 * Takes a triplestore id of type alt|property|class and returns it's label
 * Usage:
 *   value | label
 */
@Pipe({
  name: 'label',
  pure: false
})
export class LabelPipe implements PipeTransform {
  value: string|string[] = '';
  lastKey: string;

  constructor(private translate: TranslateService,
              private warehouseService: WarehouseValueMappingService,
              private triplestoreLabelService: TriplestoreLabelService,
              private cdr: ChangeDetectorRef) {
  }

  transform<T extends string|string[]>(value: T, type?: labelType): T {
    if (!value || (typeof value !== 'string' && !Array.isArray(value)) || value.length === 0) {
      return value;
    }
    const key = Array.isArray(value) ? value.join(',') : value;

    // if we ask another time for the same key, return the last value
    if (key === this.lastKey) {
      return this.value as T;
    }
    this.lastKey = key;

    if (Array.isArray(value)) {
      from(value).pipe(
        concatMap(v => this.fetchValue(v, type)),
        toArray()
      ).subscribe(v => {
        this.updateValue(v);
      });
    } else {
      this.fetchValue(value, type).subscribe(v => this.updateValue(v));
    }

    return this.value as T;
  }

  private updateValue(value: string|string[]) {
    this.value = value;
    this.cdr.markForCheck();
  }

  private fetchValue(key: string, type?: labelType): Observable<string> {
    let obs;
    switch (type) {
      case 'warehouse':
        obs = this.warehouseService.getOriginalKey(key).pipe(
          concatMap(res => this.fetchValue(res))
        );
        break;
      case 'fullUri':
        obs = key.indexOf('http') === 0 ?
          this.triplestoreLabelService.get(IdService.getId(key), this.translate.currentLang) :
          of(key);
        break;
      case 'withKey':
        obs = this.triplestoreLabelService.get(key, this.translate.currentLang).pipe(
          map(value => value !== key ? (value || '') + ' (' + key + ')' : value));
        break;
      default:
        obs = this.triplestoreLabelService.get(key, this.translate.currentLang).pipe(
          map((res: string) => res && res !== key ? res : (type === 'emptyWhenMissing' ? '' : key))
        );
        break;
    }
    return obs;
  }
}
