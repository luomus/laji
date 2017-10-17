import { Pipe, PipeTransform } from '@angular/core';
/**
 * Format a numeric string
 * Takes the numeric string and adds spaces to it.
 * Usage:
 *   value | formattedNumber
 */
@Pipe({
  name: 'formattedNumber'
})
export class FormattedNumber implements PipeTransform {
  transform(value: string|number, thousandSeparator: string = ''): string {
    if (typeof value !== 'number' && typeof value !== 'string') {
      return '';
    }
    return ('' + value).replace(/(\d)(?=(\d{3})+(\.\d*)?$)/g, '$1' + thousandSeparator);
  }
}
