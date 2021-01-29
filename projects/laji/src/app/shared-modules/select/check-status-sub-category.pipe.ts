import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkStatusSubCategory'
})
export class CheckStatusSubCategoryPipe implements PipeTransform {

  transform(value: any[], ...args: any[]): boolean | undefined {

    if (!value) {
      return undefined;
    }
    if (value.length === args[0].length) {
      return true;
    } else {
      if (value.length > 0) {
        return false;
      } else {
        return undefined;
      }
    }

  }

}
