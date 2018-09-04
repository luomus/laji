import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeLeading'
})
export class RemoveLeadingPipe implements PipeTransform {

  transform(value: any, remove: string = '0'): any {
    if (typeof value === 'string' && value.indexOf(remove) === 0) {
      return value.substr(1)
    }
    return value;
  }

}
