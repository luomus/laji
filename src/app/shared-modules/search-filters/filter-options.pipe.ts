import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterOptions'
})
export class FilterOptionsPipe implements PipeTransform {

  transform(value: any, key: string, ...args: string[][]): any {
    if (!Array.isArray(value) || !Array.isArray(args)) {
      return value;
    }
    const all = [].concat(...args);
    if (key) {
      return value.filter(val => val[key] && all.indexOf(val[key]) !== -1);
    }
    return value.filter(val => all.indexOf(val) !== -1);
  }

}
