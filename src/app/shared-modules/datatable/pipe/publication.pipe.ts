import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PublicationService } from '../../../shared/service/publication.service';
import { Publication } from '../../../shared/model/Publication';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'publication',
  pure: true
})
export class PublicationPipe implements PipeTransform, OnDestroy {
  value = '';
  lastKey = '';

  onLangChange: Subscription;

  constructor(private translate: TranslateService,
              private publicationService: PublicationService,
              private _ref: ChangeDetectorRef) {

  }

  transform(value: any): any {
    if (Array.isArray(value)) {
      return value.map(v => this.transform(v));
    }
    if (!value || typeof value !== 'string' || value.length === 0) {
      return value;
    }

    if (value === this.lastKey) {
      return this.value;
    }

    this.lastKey = value;

    this.updateValue(value);
    if (!this.onLangChange) {
      this.onLangChange = this.translate.onLangChange.subscribe(() => {
        this.updateValue(value);
      });
    }
    return this.value;
  }

  ngOnDestroy() {
    if (this.onLangChange) {
      this.onLangChange.unsubscribe();
      this.onLangChange = undefined;
    }
  }

  private updateValue(key: string): void {
    const obs = this.publicationService.getPublication(key, this.translate.currentLang);

    obs.subscribe((res: Publication) => {
      this.value = res && res['dc:bibliographicCitation'] ? res['dc:bibliographicCitation'] : key;
      this._ref.markForCheck();
    });
  }
}

