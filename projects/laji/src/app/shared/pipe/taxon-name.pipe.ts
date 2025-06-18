import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AbstractLabelPipe } from './abstract-label.pipe';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];

/**
 * This is meant for getting single taxon names and is not yet usable on lists
 */
@Pipe({
  name: 'taxon',
  pure: false
})
export class TaxonNamePipe extends AbstractLabelPipe implements PipeTransform {
  private type!: 'vernacular' | 'scientific';

  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected api: LajiApiClientBService) {
    super(translate, _ref);
  }

  transform(value: string, type: 'vernacular'|'scientific' = 'vernacular'): any {
    this.type = type;
    return super.transform(value);
  }

  protected _updateValue(id: string): Observable<any> {
    return this.api.get('/taxa/{id}', {
      path: { id },
      query: { lang: this.translate.currentLang as any, selectedFields: 'scientificName,vernacularName' }
    }).pipe(
      catchError(() => of({
        vernacularName: id,
        scientificName: id
      }))
    );
  }

  protected _parseValue(res: Taxon): string {
    return (this.type === 'vernacular' ? res.vernacularName : res.scientificName) ?? '';
  }
}
