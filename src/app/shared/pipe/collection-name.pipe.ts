import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { WarehouseValueMappingService } from '../service/warehouse-value-mapping.service';
import { LangChangeEvent, TranslateService } from 'ng2-translate';
import { TriplestoreLabelService } from '../service/triplestore-label.service';
import { CollectionService } from '../service/collection.service';

@Pipe({
  name: 'collectionName',
  pure: false
})
export class CollectionNamePipe implements PipeTransform, OnDestroy {
  value: string = '';
  lastKey: string;
  onLangChange: EventEmitter<LangChangeEvent>;

  constructor(private translate: TranslateService,
              private collectionService: CollectionService,
              private _ref: ChangeDetectorRef) {
  }

  updateValue(key: string): void {
    this._updateValue(key);
  }

  transform(value: string, mapWarehouse = true): any {
    if (!value || value.length === 0) {
      return value;
    }
    // if we ask another time for the same key, return the last value
    if (value === this.lastKey) {
      return this.value;
    }
    // store the query, in case it changes
    this.lastKey = value;

    // set the value
    this.updateValue(value);

    // if there is a subscription to onLangChange, clean it
    this._dispose();

    // subscribe to onLangChange event, in case the language changes
    if (!this.onLangChange) {
      this.onLangChange = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.lastKey = null; // we want to make sure it doesn't return the same value until it's been updated
        this.updateValue(value);
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

  private _updateValue(key: string): void {
    this.collectionService.getName(key, this.translate.currentLang)
      .do(col => console.log(col))
      .map(col => (col[0] || {value: ''}).value)
      .subscribe((res: string) => {
        this.value = res ? res : key;
        this._ref.markForCheck();
      });
  }
}
