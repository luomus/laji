import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FormField} from '../../../model/form-field';

@Component({
  selector: 'laji-error-list',
  templateUrl: './error-list.component.html',
  styleUrls: ['./error-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorListComponent implements OnInit {

  @Input() fields: {[key: string]: FormField};

  _errors: {field: string, errors: string[]}[] = [];

  constructor() { }

  ngOnInit() {
  }

  @Input()
  set errors(data) {
    if (typeof data === 'object' && !Array.isArray(data)) {
      const errors = [];
      Object.keys(data).forEach(field => {
        errors.push({
          field: this.pathToKey(field),
          errors: data[field]
        })
      });
      this._errors = errors;
    }
  }

  private pathToKey(path: string) {
    if (path.substring(0, 1) === '.') {
      path = path.substring(1);
    }
    return path.replace(/\[[0-9]+]/g, '[*]');
  }

}
