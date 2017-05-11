import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nlToBr'
})
export class NlToBrPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (typeof value !== 'string') {
      return value;
    }
    return value.replace(/\n/g, '<br />');
  }

}
