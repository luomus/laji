import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'unique',
  pure: false
})

export class UniquePipe implements PipeTransform {


  transform(value: any[], ...args: any[]): any[] {
    if (!Array.isArray(value)) {
      return value;
    }

    const filter = [];

    for (let i = 0; i < value.length; i++) {
      for (let j = 0; j < args.length; j++) {
        if (args[j] !== value[i] && filter.indexOf(value[i]) === -1) {
          filter.push(value[i]);
        }
      }
    }

    return filter;
  }
}


