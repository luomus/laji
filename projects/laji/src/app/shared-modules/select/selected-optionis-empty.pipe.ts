import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'selectedOptionisEmpty'
})
export class SelectedOptionisEmptyPipe implements PipeTransform {

  transform(value: Object, args: any): boolean {
    if (!value) {
      return true;
    }

    return Object.keys(value).length === 0;
  }

}
