import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    'name': 'boolToString'
})
export class BoolToStringPipe implements PipeTransform {
    constructor (private translate: TranslateService) {}
    transform(value: boolean) {
        if (typeof value !== 'boolean') {
            return '';
        }
        if (value) {
            return this.translate.instant('yes');
        } else {
            return this.translate.instant('no');
        }
    }
}
