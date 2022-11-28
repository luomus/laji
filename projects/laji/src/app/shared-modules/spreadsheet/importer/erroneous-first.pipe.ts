import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'erroneousFirst'
})
export class ErroneousFirstPipe implements PipeTransform {

  transform(value: any): any {
    if (Array.isArray(value)) {
      return [...value].sort((val1, val2) => {
        const val1Sort = ['invalid', 'error'].includes(val1?._status?.status) ? 0 : 1;
        const val2Sort = ['invalid', 'error'].includes(val2?._status?.status) ? 0 : 1;
        return val1Sort - val2Sort;
      });
    }
    return value;
  }

}
