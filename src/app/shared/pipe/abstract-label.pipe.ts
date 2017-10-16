import { EventEmitter, OnDestroy, PipeTransform } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

export abstract class AbsractLabelPipe implements PipeTransform, OnDestroy {
  value = '';
  lastKey: string;
  onLangChange: EventEmitter<LangChangeEvent>;

  constructor(protected translate: TranslateService) {
  }

  updateValue(key: string): void {
    this._updateValue(key);
  }

  transform(value: string): any {
    if (!value || value.length === 0) {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map(v => this.transform(v));
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

  protected abstract _updateValue(key: string): void;
}
