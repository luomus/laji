import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'includesMultiState'
})
export class IncludesMultiStatePipe implements PipeTransform {

  transform(value: any, args: any, property: string): boolean|undefined {

    console.log(value);
    if (value.filter(v => v[property] === args[property]).length > 0) {
      const tmpValue = value.filter(v => v[property] === args[property]);
      return tmpValue[0]['value'];
    } else {
      return undefined;
    }
  }

}
