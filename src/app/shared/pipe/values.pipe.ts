import { Pipe, PipeTransform } from '@angular/core';
import { IdService } from '../service/id.service';

/**
 * fullUri picker
 * Usage:
 *   value | values:'separator'
 */
@Pipe({
  name: 'values'
})
export class ValuesPipe implements PipeTransform {
  transform(value: string, sep = ', '): string {
    const type = typeof value;
    const values = [];
    if (Array.isArray(value)) {
      for(const item of value) {
        values.push(this.transform(item));
      }
    } else if (type === 'object') {
      Object.keys(value).map(key => {
        values.push(this.transform(value[key]));
      });
    } else {
      values.push(value);
    }
    return values.join(sep);
  }
}
