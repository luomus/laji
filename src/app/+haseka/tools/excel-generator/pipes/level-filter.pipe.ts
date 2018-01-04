import { Pipe, PipeTransform } from '@angular/core';
import { FormField } from '../../model/form-field';

@Pipe({
  name: 'levelFilter'
})
export class LevelFilterPipe implements PipeTransform {

  transform(value: FormField[], level: string): any {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return value;
    }
    return value.filter(val => val.parent === level);
  }

}
