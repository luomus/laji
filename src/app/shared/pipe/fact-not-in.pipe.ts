import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'factNotIn'
})
export class FactNotInPipe implements PipeTransform {

  transform(value: {fact: string, value: any}[], args?: string[]): any {
    if (!args || !Array.isArray(args)) {
      return value;
    }
    if (Array.isArray(value)) {
      return value.filter(val => args.indexOf(val.fact) === -1)
    }
    return value;
  }

}
