import { Pipe, PipeTransform } from '@angular/core';

/**
 * @internal
 */
@Pipe({
  name: 'insertWordBreaks'
})
export class InsertWordBreaksPipe implements PipeTransform {

  transform(value: any): any {
    if (typeof value === 'string') {
      return value.replace(/\//g, '/&#8203;');
    }
    return value;
  }

}
