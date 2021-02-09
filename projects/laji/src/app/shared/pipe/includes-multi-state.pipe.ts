import { Pipe, PipeTransform } from '@angular/core';
import { SelectOptions } from '../../shared-modules/select/select/select.component';

@Pipe({
  name: 'checkboxValue'
})
export class CheckboxValuePipe implements PipeTransform {

  transform(value: any, option: SelectOptions): boolean|undefined {
    const match = (value || []).filter(v => v['id'] === option['id']);

    if (match.length > 0) {
      const tmpValue = match;
      return tmpValue[0]['checkboxValue'];
    } else {
      return undefined;
    }
  }

}
