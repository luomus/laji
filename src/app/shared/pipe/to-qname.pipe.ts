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
    if (Array.isArray(value)) {
      return value.map(val => this.transform(val));
    } else if (!value || typeof value !== 'string') {
      return value;
    }
    return value.split('/').pop();
  }
}
