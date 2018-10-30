import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iucnStatus'
})
export class IucnStatusPipe implements PipeTransform {

  transform(value: any, short?: boolean): any {
    const parts = value.split('-');
    return short ? parts[0] : parts[parts.length - 1];
  }

}
