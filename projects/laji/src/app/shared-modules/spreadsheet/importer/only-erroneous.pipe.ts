import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'onlyErroneous'
})
export class OnlyErroneousPipe implements PipeTransform {

  transform(value: any, onlyErroneous = true): any {
    if (onlyErroneous && Array.isArray(value)) {
      return value.filter(val => ['invalid', 'error'].includes(val?._status?.status));
    }
    return value;
  }

}
