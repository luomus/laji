import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'exists',
    standalone: false
})
export class ExistsPipe implements PipeTransform {

  transform(value: any): any {
    return typeof value !== 'undefined';
  }

}
