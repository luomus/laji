import { Pipe, PipeTransform } from '@angular/core';
import { SelectOption } from '../../shared-modules/select/select/select.component';

@Pipe({
  name: 'checkboxValue'
})
export class CheckboxValuePipe implements PipeTransform {

  transform(value: Array<string|SelectOption>, option: SelectOption): boolean|undefined {
    const match = (value || []).find(v => typeof v === 'object' ? v.id === option.id : v === option.id);

    if (match) {
      return typeof match === 'string' ?
        true :
        ('checkboxValue' in match ? match.checkboxValue : true);
    } else {
      return undefined;
    }
  }

}
