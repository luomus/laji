import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IFormField } from '../../../model/excel';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-error-list',
  templateUrl: './error-list.component.html',
  styleUrls: ['./error-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorListComponent {

  @Input() fields: {[key: string]: IFormField};

  _errors: {field: string, errors: string[]}[] = [];

  constructor(private translateService: TranslateService) { }

  @Input()
  set errors(data) {
    const errors = [];
    if (typeof data === 'object' && !Array.isArray(data)) {
      if (data.status || data.status === 0) {
        switch (data.status) {
          case 403:
            errors.push({
              field: 'id',
              errors: [this.translateService.instant('form.permission.no-access')]
            });
            break;
          case 422:
          default:
            errors.push({
              field: 'id',
              errors: [data.statusText || this.translateService.instant('haseka.form.genericError')]
            });
        }
      } else {
        Object.keys(data).forEach(field => {
          errors.push({
            field: this.pathToKey(field),
            errors: Array.isArray(data[field]) ? data[field] : this.pickErrors(data[field])
          });
        });
      }
    } else if (Array.isArray(data)) {
      data.forEach(err => {
        errors.push({
          field: err.dataPath
            .substring(err.dataPath.substring(0, 1) === '/' ? 1 : 0)
            .replace(/\/[0-9]+/g, '[*]')
            .replace(/\//g, '.'),
          errors: [this.getMessage(err)]
        });
      });
    }
    this._errors = errors;
  }

  private pathToKey(path: string) {
    if (path.substring(0, 1) === '.') {
      path = path.substring(1);
    }
    return path.replace(/\[[0-9]+]/g, '[*]');
  }

  private pickErrors(value) {
    if (typeof value === 'string') {
      return [value];
    } else if (Array.isArray(value)) {
      return value;
    } else if (typeof value === 'object') {
      return Object.keys(value).reduce((prev, current) => [...prev, ...this.pickErrors(current)], []);
    }
    return [value];
  }

  private getMessage(err: any): string {
    let base = err.message;
    if (err.params) {
      const info = [];
      Object.keys(err.params).forEach(key => {
        info.push(err.params[key]);
      });
      if (info.length) {
        base += ` '${info.join('\', \'')}'`;
      }
    }

    return base;
  }

}
