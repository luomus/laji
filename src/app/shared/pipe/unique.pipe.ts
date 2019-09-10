import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unique',
  pure: false
})

export class UniquePipe implements PipeTransform {
    transform(value: any): any {
      console.log('unique');
        if (value !== undefined && value !== null) {
          return value.filter((v, i, a) => a.indexOf(v) === i);

        }
        return value;
    }
}
