import {Pipe, PipeTransform, OnDestroy, ChangeDetectorRef, EventEmitter} from '@angular/core';
import {WarehouseValueMappingService} from "../service/warehouse-value-mapping.service";
import {LangChangeEvent, TranslateService } from "ng2-translate";
import {TriplestoreLabelService} from "../service/triplestore-label.service";

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
  value: string = '';
  lastKey: string;
  onLangChange: EventEmitter<LangChangeEvent>;

  constructor(
    private translate: TranslateService,
    private warehouseService:WarehouseValueMappingService,
    private triplestoreLabelService:TriplestoreLabelService,
    private _ref: ChangeDetectorRef
  ) {
  }

  updateValue(key: string, mapWarehouse:boolean = false): void {
    if (mapWarehouse) {
      this.warehouseService.getOriginalKey(key).subscribe(
        (res: string) => {
          if (res) {
            this._updateValue(res);
          } else {
            this.value = key;
            this._ref.markForCheck();
          }
        }
      )
    } else {
      this._updateValue(key)
    }
  }

  private _updateValue(key: string):void {
    this.triplestoreLabelService.get(key)
      .subscribe((res:string) => {
        this.value = res ? res : key;
        this._ref.markForCheck();
      });
  }

  transform(value: string, mapWarehouse:boolean = true): any {
    if(!value || value.length === 0) {
      return value;
    }
    // if we ask another time for the same key, return the last value
    if(value === this.lastKey) {
      return this.value;
    }
    // store the query, in case it changes
    this.lastKey = value;

    // set the value
    this.updateValue(value, mapWarehouse);

    // if there is a subscription to onLangChange, clean it
    this._dispose();

    // subscribe to onLangChange event, in case the language changes
    if(!this.onLangChange) {
      this.onLangChange = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.lastKey = null; // we want to make sure it doesn't return the same value until it's been updated
        this.updateValue(value, mapWarehouse);
      });
    }

    return this.value;
  }

  /**
   * Clean any existing subscription to onLangChange events
   * @private
   */
  _dispose(): void {
    if(this.onLangChange) {
      this.onLangChange.unsubscribe();
      this.onLangChange = undefined;
    }
  }

  ngOnDestroy(): void {
    this._dispose();
  }
}
