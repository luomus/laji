import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from '../service/form.service';
import { AbstractLabelPipe } from './abstract-label.pipe';
import { Observable } from 'rxjs';

@Pipe({
  name: 'formName',
  pure: false
})
export class FormNamePipe extends AbstractLabelPipe implements PipeTransform {
  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected formService: FormService) {
    super(translate, _ref);
  }

  protected _updateValue(key: string): Observable<string> {
    return this.formService
      .getForm(key, this.translate.currentLang);
  }
  protected _parseValue(res: any): string {
    return res.title || this.key;
  }
}
