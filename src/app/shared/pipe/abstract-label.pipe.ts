import {ChangeDetectorRef, OnDestroy, PipeTransform} from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';

export abstract class AbstractLabelPipe implements PipeTransform, OnDestroy {
  value = '';
  lastKey: string;
  protected key: string;
  onLangChange: Subscription;

  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
  ) {
  }

  updateValue(key: string): Observable<string> {
    return Observable.create(observer => {
      this.key = key;
      this._updateValue(key).subscribe(value => {
        const _value = this._parseValue(value);
        this.value = _value;
        observer.next(this.value);
        this._ref.markForCheck();
      });
    });
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
    this.updateValue(value).subscribe();

    // if there is a subscription to onLangChange, clean it
    this._dispose();

    // subscribe to onLangChange event, in case the language changes
    if (!this.onLangChange) {
      this.onLangChange = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.lastKey = null; // we want to make sure it doesn't return the same value until it's been updated
        this.updateValue(value).subscribe();
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

  protected abstract _updateValue(key: string): Observable<any>;
  protected abstract _parseValue(key: any): string;
}
