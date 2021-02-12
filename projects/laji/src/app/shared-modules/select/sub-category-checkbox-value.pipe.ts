import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'subCategoryCheckboxValue'
})
export class SubCategoryCheckboxValuePipe implements PipeTransform {

  transform(value: any[], ...args: any[]): boolean | undefined {
    if (!value) {
      return undefined;
    } else if (value.length === args[0].length) {
      return true;
    }
    return value.length > 0 ? false : undefined;
  }

}
