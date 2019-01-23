import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'spaceAndComma'
})
export class ArraySpaceAndCommaPipe implements PipeTransform {

  transform(value: any, separator: string = ', '): any {
    if (!(value instanceof Array)) {
      return value;
    }
    return value.join(separator);
  }

}
