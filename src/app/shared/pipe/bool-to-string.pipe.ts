import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    'name': 'boolToString'
})
export class BoolToStringPipe implements PipeTransform {
    constructor (private translate: TranslateService) {}
    transform(value: boolean) {
      const _value = typeof value === 'boolean'
        ? value
        : typeof value === 'string'
          ? value === 'true' || value === 'false'
            ? value === 'true'
            : value
          : undefined;

        if (_value === undefined) {
          return value;
        }

        if (value) {
            return this.translate.instant('yes');
        } else {
            return this.translate.instant('no');
        }
    }
}
