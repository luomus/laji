import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'iucnStatus',
    standalone: false
})
export class IucnStatusPipe implements PipeTransform {

  transform(value: string): unknown {
    if (typeof value !== 'string') {
      return value;
    }
    return value.replace('MX.iucn', '');
  }

}
