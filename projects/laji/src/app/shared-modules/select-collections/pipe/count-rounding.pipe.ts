import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countRounding'
})
export class CountRoundingPipe implements PipeTransform {

  transform(value: any): any {
    if (value >= 10 ** 6) {
      return `${Math.round(value / 10 ** 6)}M`;
    } else if (value >= 10 ** 3) {
      return `${Math.round(value / 10 ** 3)}k`;
    } else {
      return `${ value }`;
    }
  }

}
