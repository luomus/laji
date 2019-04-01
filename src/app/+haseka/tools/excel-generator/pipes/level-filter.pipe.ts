import { Pipe, PipeTransform } from '@angular/core';
import { IFormField } from '../../model/excel';

@Pipe({
  name: 'levelFilter'
})
export class LevelFilterPipe implements PipeTransform {

  transform(value: IFormField[], level: string): any {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return value;
    }
    return value.filter(val => val.parent === level);
  }

}
