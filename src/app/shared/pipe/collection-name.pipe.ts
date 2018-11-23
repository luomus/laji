import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CollectionService } from '../service/collection.service';
import { AbstractLabelPipe } from './abstract-label.pipe';
import { Observable } from 'rxjs';

@Pipe({
  name: 'collectionName',
  pure: false
})
export class CollectionNamePipe extends AbstractLabelPipe implements PipeTransform {
  key: string;

  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected collectionService: CollectionService) {
    super(translate, _ref);
  }

  protected _updateValue(key: string): Observable<string> {
    this.key = key;
    return Observable.create(observer => {
      this.collectionService
        .getName(key, this.translate.currentLang)
        .map(col => (col[0] || {value: ''}).value)
    });
  }

  protected _parseValue(res: string): string {
    return res ? res : this.key;
  }
}
