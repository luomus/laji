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
  transform(value: string, sep = ', ', objKey = ''): string {
    const type = typeof value;
    const values = [];
    if (Array.isArray(value)) {
      for(const item of value) {
        values.push(this.transform(item, sep, objKey));
      }
    } else if (type === 'object') {
      if (objKey) {
        if (value[objKey]) {
          values.push(value[objKey]);
        }
      } else {
        Object.keys(value).map(key => {
          values.push(this.transform(value[key], sep, objKey));
        });
      }
    } else {
      values.push(value);
    }
    return values.join(sep);
  }
}
