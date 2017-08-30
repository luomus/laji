import { ChangeDetectorRef, EventEmitter, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { WarehouseValueMappingService } from '../service/warehouse-value-mapping.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { TriplestoreLabelService } from '../service/triplestore-label.service';
import { IdService } from '../service/id.service';

type labelType = 'fullUri'|'warehouse';

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
  onLangChange: EventEmitter<LangChangeEvent>;

  constructor(private translate: TranslateService,
              private warehouseService: WarehouseValueMappingService,
              private triplestoreLabelService: TriplestoreLabelService,
              private _ref: ChangeDetectorRef) {
  }

  updateValue(key: string, type?: labelType): void {
    if (type === 'warehouse') {
      this.warehouseService.getOriginalKey(key)
        .timeout(5000)
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

  transform(value: string, type?: labelType): any {
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

  /**
   * Clean any existing subscription to onLangChange events
   * @private
   */
  _dispose(): void {
    if (this.onLangChange) {
      this.onLangChange.unsubscribe();
      this.onLangChange = undefined;
    }
  }

  ngOnDestroy(): void {
    this._dispose();
  }

  private _updateValue(key: string, type?: labelType): void {
    this.triplestoreLabelService.get(type === 'fullUri' ? IdService.getId(key) : key, this.translate.currentLang)
      .subscribe((res: string) => {
        this.value = res ? res : key;
        this._ref.markForCheck();
      });
  }
}
