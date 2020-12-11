import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iucnStatus'
})
export class IucnStatusPipe implements PipeTransform {

  transform(value: string): unknown {
    if (typeof value !== 'string') {
      return value;
    }
    return value.replace('MX.iucn', '');
  }

}
