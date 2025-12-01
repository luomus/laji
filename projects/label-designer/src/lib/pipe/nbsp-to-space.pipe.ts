import { Pipe, PipeTransform } from '@angular/core';

/**
 * @internal
 */
@Pipe({
    name: 'nbspToSpace',
    standalone: false
})
export class NbspToSpacePipe implements PipeTransform {

  transform(value: any): any {
    if (typeof value === 'string') {
      return value.replace(/&nbsp;/g, ' ');
    }
    return value;
  }

}
