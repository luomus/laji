import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from '../service/form.service';
import { AbstractLabelPipe } from './abstract-label.pipe';
import { Observable } from 'rxjs';
import { Form } from '../model/Form';

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

  protected _updateValue(key: string): Observable<Form.List> {
    return this.formService.getFormInListFormat(key);
  }
  protected _parseValue(res: any): string {
    return res.title || this.key;
  }
}
