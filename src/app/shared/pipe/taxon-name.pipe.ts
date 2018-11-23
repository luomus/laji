import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AbstractLabelPipe } from './abstract-label.pipe';
import { TaxonomyApi } from '../api/TaxonomyApi';
import { Taxonomy } from '../model/Taxonomy';
import { Observable } from 'rxjs';

/**
 * This is meant for getting single taxon names and is not yet usable on lists
 */
@Pipe({
  name: 'taxon',
  pure: false
})
export class TaxonNamePipe extends AbstractLabelPipe implements PipeTransform {
  private type;

  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected taxonApi: TaxonomyApi) {
    super(translate, _ref);
  }

  transform(value: string, type: 'vernacular'|'scientific' = 'vernacular'): any {
    this.type = type;
    return super.transform(value);
  }

  protected _updateValue(key: string): Observable<any> {
    return this.taxonApi.taxonomyFindBySubject(key, this.translate.currentLang, {selectedFields: 'scientificName,vernacularName'});
  }

  protected _parseValue(res: Taxonomy): string {
    return this.type === 'vernacular' ? res.vernacularName : res.scientificName;
  }
}
