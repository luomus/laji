import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PublicationService } from '../service/publication.service';
import { Publication } from '../model/Publication';
import { of, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'publication',
  pure: false
})
export class PublicationPipe implements PipeTransform {
  value: any;
  lastKey: string;
  lastField: string;

  constructor(private translate: TranslateService,
              private publicationService: PublicationService,
              private _ref: ChangeDetectorRef) {

  }

  transform(value: any, field: 'bibliographicCitation'|'URI' = 'bibliographicCitation'): any {
    if (value === this.lastKey && field === this.lastField) {
      return this.value;
    }

    this.lastKey = value;
    this.lastField = field;

    return this.updateValue(value, field);
  }

  private updateValue(value: any, field: string): void {
    (Array.isArray(value) ? forkJoin(value.map(v => this.getValueObservable(v, field))) : this.getValueObservable(value, field))
      .subscribe(res => {
        this.value = res;
        this._ref.markForCheck();
      });
  }

  private getValueObservable(value, field) {
    if (!value || typeof value !== 'string' || value.length === 0) {
      return of(value);
    }

    return this.publicationService.getPublication(value, this.translate.currentLang)
      .pipe(map((res: Publication) => {
        return res && res['dc:' + field] ? res['dc:' + field] : value;
      }));
  }
}

