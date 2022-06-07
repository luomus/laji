import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AbstractLabelPipe } from './abstract-label.pipe';
import { SourceService } from '../service/source.service';
import { Observable, of } from 'rxjs';

@Pipe({
  name: 'source',
  pure: false
})
export class SourcePipe extends AbstractLabelPipe implements PipeTransform {
  private sources?: Record<string, string>;

  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected sourceService: SourceService) {
    super(translate, _ref);
  }

  protected _updateValue(): Observable<any> {
    if (this.sources) {
      return of(this.sources);
    }
    const value$ = this.sourceService.getAllAsLookUp(this.translate.currentLang);
    value$.subscribe(sources => {
      this.sources = sources;
    });
    return value$;
  }

  protected _parseValue(sources: any): string {
    return this.key !== undefined && sources?.[this.key] || this.key;
  }
}
