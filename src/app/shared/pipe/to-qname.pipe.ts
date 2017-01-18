import { Pipe, PipeTransform } from '@angular/core';

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
    if (!value) {
      return value;
    }
    return value.split('/').pop();
  }
}
