import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeEmpty'
})
export class RemoveEmptyPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (Array.isArray(value)) {
      return value.filter(val => val);
    }
    return value;
  }

}
