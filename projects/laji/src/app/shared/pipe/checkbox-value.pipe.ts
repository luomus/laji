import { Pipe, PipeTransform } from '@angular/core';
import { SelectOptions } from '../../shared-modules/select/select/select.component';

@Pipe({
  name: 'checkboxValue'
})
export class CheckboxValuePipe implements PipeTransform {

  transform(value: Array<string|SelectOptions>, option: SelectOptions): boolean|undefined {
    const match = (value || []).find(v => typeof v === 'string' ? v === option.id : v?.id === option.id);

    if (match) {
      return typeof match === 'string' ?
        true :
        ('checkboxValue' in match ? match.checkboxValue : true);
    } else {
      return undefined;
    }
  }

}
