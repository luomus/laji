
import {concat, take, delay, retryWhen, timeout, map} from 'rxjs/operators';
import { Subscription, throwError as observableThrowError } from 'rxjs';
import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { WarehouseValueMappingService } from '../service/warehouse-value-mapping.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { TriplestoreLabelService } from '../service/triplestore-label.service';
import { IdService } from '../service/id.service';
import 'rxjs-compat/add/operator/timeout';
import 'rxjs-compat/add/operator/retryWhen';
import 'rxjs-compat/add/operator/delay';
import 'rxjs-compat/add/operator/take';
import 'rxjs-compat/add/operator/concat';

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
  value = '';
  lastKey: string;
  onLangChange: Subscription;

  constructor(private translate: TranslateService,
              private warehouseService: WarehouseValueMappingService,
              private triplestoreLabelService: TriplestoreLabelService,
              private _ref: ChangeDetectorRef) {
  }

  updateValue(key: string, type?: labelType): void {
    if (type === 'warehouse') {
      this.warehouseService.getOriginalKey(key).pipe(
        timeout(10000),
        retryWhen(errors => errors.pipe(delay(1000), take(3), concat(observableThrowError(errors)), )), )
        .subscribe(
          (res: string) => {
            if (res) {
              this._updateValue(res);
            } else {
              this.value = key;
              this._ref.markForCheck();
            }
          },
          (err) => this._updateValue(key)
        );
    } else {
      this._updateValue(key, type);
    }
  }

  transform(value: any, type?: labelType, key?: string): any {
    if (Array.isArray(value)) {
      return value.map(v => this.transform(v, type, key));
    }
    if (value && key) {
      value = value[key];
    }
    if (!value || typeof value !== 'string' || value.length === 0 ||
       (type === 'fullUri' && value.indexOf('http') !== 0)) {
      return value;
    }
    // if we ask another time for the same key, return the last value
    if (value === this.lastKey) {
      return this.value;
    }
    // store the query, in case it changes
    this.lastKey = value;

    // set the value
    this.updateValue(value, type);

    // if there is a subscription to onLangChange, clean it
    this._dispose();

    // subscribe to onLangChange event, in case the language changes
    if (!this.onLangChange) {
      this.onLangChange = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.lastKey = null; // we want to make sure it doesn't return the same value until it's been updated
        this.updateValue(value, type);
      });
    }
    return this.value;
  }

  ngOnDestroy(): void {
    this._dispose();
  }

  /**
   * Clean any existing subscription to onLangChange events
   */
  protected _dispose(): void {
    if (this.onLangChange) {
      this.onLangChange.unsubscribe();
      this.onLangChange = undefined;
    }
  }

  private _updateValue(key: string, type?: labelType): void {
    let obs;
    switch (type) {
      case 'fullUri':
        obs = this.triplestoreLabelService.get(IdService.getId(key), this.translate.currentLang);
        break;
      case 'withKey':
        obs = this.triplestoreLabelService.get(key, this.translate.currentLang).pipe(
          map(value => value !== key ? value + ' (' + key + ')' : value));
        break;
      default:
        obs = this.triplestoreLabelService.get(key, this.translate.currentLang);
        break;
    }
    obs.subscribe((res: string) => {
        this.value = res && res !== key ? res : (type === 'emptyWhenMissing' ? '' : key);
        this._ref.markForCheck();
      });
  }
}
