import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isEmptyArray'
})
export class IsEmptyArrayPipe implements PipeTransform {

  transform(value: any[]): boolean {
    if (!value || !Array.isArray(value)) {
      return true;
    }

    return value.length === 0;
  }

}
