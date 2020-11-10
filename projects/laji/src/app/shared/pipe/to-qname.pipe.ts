import { Pipe, PipeTransform } from '@angular/core';
import { IdService } from '../service/id.service';

/**
 * QName picker
 * Usage:
 *   value | qname
 */
@Pipe({
  name: 'toQName'
})
export class ToQNamePipe implements PipeTransform {
  transform(value: string): any {
    if (Array.isArray(value)) {
      return value.map(val => this.transform(val));
    }
    return IdService.getId(value);
  }
}
