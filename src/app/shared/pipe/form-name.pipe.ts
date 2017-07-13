import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { FormService } from '../service/form.service';
import { AbsractLabelPipe } from './abstract-label.pipe';

@Pipe({
  name: 'formName',
  pure: false
})
export class FormNamePipe extends AbsractLabelPipe implements PipeTransform {
  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected formService: FormService) {
    super(translate);
  }

  protected _updateValue(key: string): void {
    this.formService
      .getForm(key, this.translate.currentLang)
      .subscribe((res: any) => {
        this.value = res.title ? res.title : key;
        this._ref.markForCheck();
      });
  }
}
