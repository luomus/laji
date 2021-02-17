import { concatMap, map, switchMap, toArray } from 'rxjs/operators';
import { Observable, from, of, Subscription } from 'rxjs';
import { ChangeDetectorRef, Pipe, PipeTransform, OnDestroy } from '@angular/core';
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
export class LabelPipe implements PipeTransform, OnDestroy {
  private value: string|string[] = '';
  private lastKey: string;
  private fetchSub: Subscription;

  constructor(
    private translate: TranslateService,
    private warehouseService: WarehouseValueMappingService,
    private triplestoreLabelService: TriplestoreLabelService,
    private cdr: ChangeDetectorRef
  ) {}

  transform(value: string, type?: labelType): string;
  transform(value: string[], type?: labelType): string[];
  transform(value: string|string[], type?: labelType): string|string[] {
    if (!value || (typeof value !== 'string' && !Array.isArray(value)) || value.length === 0) {
      return value;
    }
    const key = Array.isArray(value) ? value.join(',') : value;

    // if we ask another time for the same key, return the last value
    if (key === this.lastKey) {
      return this.value;
    }
    this.lastKey = key;

    this.clearSub();

    if (Array.isArray(value)) {
      this.fetchSub = from(value).pipe(
        concatMap(v => this.fetchValue(v, type)),
        toArray()
      ).subscribe(v => {
        this.updateValue(v);
      });
    } else {
      this.fetchSub = this.fetchValue(value, type).subscribe(v => this.updateValue(v));
    }

    return this.value;
  }

  ngOnDestroy() {
    this.clearSub();
  }

  private clearSub() {
    if (this.fetchSub) {
      this.fetchSub.unsubscribe();
    }
  }

  private updateValue(value: string|string[]) {
    this.value = value;
    this.cdr.markForCheck();
  }

  private fetchValue(key: string, type?: labelType): Observable<string> {
    switch (type) {
      case 'warehouse':
        return this.warehouseService.getOriginalKey(key).pipe(
          switchMap(res => this.fetchValue(res))
        );
      case 'fullUri':
        return key.indexOf('http') === 0 ?
          this.triplestoreLabelService.get(IdService.getId(key), this.translate.currentLang) :
          of(key);
      case 'withKey':
        return this.triplestoreLabelService.get(key, this.translate.currentLang).pipe(
          map(value => value !== key ? `${value} (${key})` : value)
        );
      case 'emptyWhenMissing':
        return this.fetchValue(key).pipe(
          map(res => res === key ? '' : key)
        );
      default:
        return this.triplestoreLabelService.get(key, this.translate.currentLang);
    }
  }
}
