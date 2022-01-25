import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    'name': 'boolToString'
})
export class BoolToStringPipe implements PipeTransform {
    constructor (private translate: TranslateService) {}
    transform(value: any) {
      let asBoolean;
      if (typeof value === 'boolean') {
        asBoolean = value;
      } else if (typeof value === 'string' && (value === 'true' || value === 'false')) {
        asBoolean = value === 'true';
      }

      if (asBoolean === undefined) {
        return value;
      }
      return this.translate.instant(asBoolean ? 'yes' : 'no');
    }
}
