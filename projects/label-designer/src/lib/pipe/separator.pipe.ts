import { Pipe, PipeTransform } from '@angular/core';

const DEFAULT_SEPARATOR = ', ';

/**
 * @internal
 */
@Pipe({
    name: 'separator',
    standalone: false
})
export class SeparatorPipe implements PipeTransform {

  transform(value: any): any {
    if (typeof value === 'undefined' || value === null) {
      return DEFAULT_SEPARATOR;
    }
    return value;
  }

}
