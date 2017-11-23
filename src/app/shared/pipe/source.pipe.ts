import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AbsractLabelPipe } from './abstract-label.pipe';
import { SourceService } from '../service/source.service';

@Pipe({
  name: 'source',
  pure: false
})
export class SourcePipe extends AbsractLabelPipe implements PipeTransform {
  private sources;

  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected sourceService: SourceService) {
    super(translate);
  }

  protected _updateValue(key: string): void {
    if (this.sources) {
      this.value = this.sources[key] || key;
      return;
    }
    this.sourceService.getAllAsLookUp(this.translate.currentLang)
      .subscribe(sources => {
        this.sources = sources;
        this.value = sources[key] || key;
        this._ref.markForCheck();
      });
  }
}
