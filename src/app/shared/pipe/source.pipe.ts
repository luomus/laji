import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AbstractLabelPipe } from './abstract-label.pipe';
import { SourceService } from '../service/source.service';
import { Observable } from 'rxjs';

@Pipe({
  name: 'source',
  pure: false
})
export class SourcePipe extends AbstractLabelPipe implements PipeTransform {
  private sources;

  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected sourceService: SourceService) {
    super(translate, _ref);
  }

  protected _updateValue(key: string): Observable<any> {
    if (this.sources) {
      this.value = this.sources[key] || key;
      return;
    }
    const value$ = this.sourceService.getAllAsLookUp(this.translate.currentLang);
    value$.subscribe(sources => {
      this.sources = sources;
    });
    return value$;
  }

  protected _parseValue(sources: any): string {
    return sources[this.key] || this.key;
  }
}
