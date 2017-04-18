import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CollectionService } from '../service/collection.service';
import { AbsractLabelPipe } from './abstract-label.pipe';

@Pipe({
  name: 'collectionName',
  pure: false
})
export class CollectionNamePipe extends AbsractLabelPipe implements PipeTransform {
  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected collectionService: CollectionService) {
    super(translate);
  }

  protected _updateValue(key: string): void {
    this.collectionService
      .getName(key, this.translate.currentLang)
      .map(col => (col[0] || {value: ''}).value)
      .subscribe((res: string) => {
        this.value = res ? res : key;
        this._ref.markForCheck();
      });
  }
}
