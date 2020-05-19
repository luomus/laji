import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'includes'
})
export class IncludesPipe implements PipeTransform {

  transform(value: any, args: any, arrayCheck: 'some'|'every' = 'some'): boolean {
    if (Array.isArray(value)) {
      if (Array.isArray(args)) {
        return arrayCheck === 'every' ?
          value.every(v => args.includes(v)) :
          value.some(v => args.includes(v));
      }
      return value.includes(args);
    }
    return false;
  }

}
