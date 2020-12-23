import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'excludeSubcategory'
})
export class ExcludeSubcategoryPipe implements PipeTransform {

  transform(categories: string[], filter: string[]): any {
    if (!categories || !filter) {
        return categories;
    }

    return categories.filter(item => filter.indexOf(item) === -1);
  }

}
