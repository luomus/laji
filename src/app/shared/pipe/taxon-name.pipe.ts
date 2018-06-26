import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AbsractLabelPipe } from './abstract-label.pipe';
import { TaxonomyApi } from '../api/TaxonomyApi';
import { Taxonomy } from '../model/Taxonomy';

/**
 * This is meant for getting single taxon names and is not yet usable on lists
 */
@Pipe({
  name: 'taxon',
  pure: false
})
export class TaxonNamePipe extends AbsractLabelPipe implements PipeTransform {
  private type;

  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected taxonApi: TaxonomyApi) {
    super(translate);
  }

  transform(value: string, type: 'vernacular'|'scientific' = 'vernacular'): any {
    this.type = type;
    return super.transform(value);
  }

  protected _updateValue(key: string): void {
    const value$ = this.taxonApi.taxonomyFindBySubject(key, this.translate.currentLang, {selectedFields: 'scientificName,vernacularName'});

    value$.subscribe((res: Taxonomy) => {
      this.value = this.type === 'vernacular' ? res.vernacularName : res.scientificName;
      this._ref.markForCheck();
    });
  }
}
