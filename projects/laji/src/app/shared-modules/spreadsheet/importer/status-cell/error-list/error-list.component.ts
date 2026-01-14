import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { IFormField } from '../../../model/excel';
import { TranslateService } from '@ngx-translate/core';
import { Util } from '../../../../../shared/service/util.service';

interface ErrorGroup {
  title: string;
  errors: string[];
}

@Component({
  selector: 'laji-error-list',
  templateUrl: './error-list.component.html',
  styleUrls: ['./error-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorListComponent implements OnChanges {

  @Input({ required: true }) fields!: {[key: string]: IFormField};
  @Input() errors: unknown;

  _errors: ErrorGroup[] = [];

  constructor(private translateService: TranslateService) { }

  ngOnChanges() {
    this._errors = this.processErrors(this.errors, this.fields);
  }

  processErrors(data: unknown, fields: {[key: string]: IFormField}): ErrorGroup[] {
    const errors: ErrorGroup[] = [];

    if (Util.isObject(data)) {
      if (Util.hasOwnProperty(data, 'status')) {
        switch (data.status) {
          case 403:
            errors.push({
              title: this.translateService.instant('error'),
              errors: [this.translateService.instant('form.permission.no-access')]
            });
            break;
          case 422:
          default:
            errors.push({
              title: this.translateService.instant('error'),
              errors: [this.translateService.instant('haseka.form.genericError')]
            });
        }
      } else {
        Object.keys(data).forEach(field => {
          errors.push({
            title: this.getFieldName(field, fields),
            errors: data[field] as string[]
          });
        });
      }
    }

    return errors;
  }

  private getFieldName(path: string, fields: {[key: string]: IFormField}): string {
    if (path.substring(0, 1) === '.') {
      path = path.substring(1);
    }

    const key = path.replace(/\[[0-9]+]/g, '[*]');

    if (fields[key]) {
      return fields[key].fullLabel;
    }

    const arrayKey = key + '[*]';

    if (fields[arrayKey]) {
      return fields[arrayKey].fullLabel;
    }

    return '';
  }
}
