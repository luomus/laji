import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {

  transform(value: any, property?: string): any {
    if (!Array.isArray(value)) {
      return value;
    }
    if (!property) {
      return [...value.sort()];
    }
    return [...value.sort((a, b) => (a[property] > b[property]) ? 1 : ((b[property] > a[property]) ? -1 : 0))];
  }

}
