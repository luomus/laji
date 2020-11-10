import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lcFirst'
})
export class LcFirstPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (typeof value === 'string') {
      return value.charAt(0).toLowerCase() + value.substring(1);
    }
    return value;
  }

}
