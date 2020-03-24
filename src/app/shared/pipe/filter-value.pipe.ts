import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterValue'
})
export class FilterValuePipe implements PipeTransform {

  transform (items: any[], field: string, value: string[], except: string, fieldNew: string, elements: string[]): any[] {
    if (!items) {
      return [];
    }
    if (!field || !value || value.length <= 0 || (except !== 'include' && except !== 'exclude') ) {
      return items;
    }
    return items.filter(singleItem => {
      if (except) {
        if (except === 'include') {
          return (singleItem !== null && singleItem[field] !== null &&
            singleItem[field] !== undefined && value.indexOf(singleItem[field]) >= 0 || elements.indexOf(singleItem[fieldNew]) >= 0 );
        }
        if (except === 'exclude') {
          return (singleItem !== null && singleItem[field] !== null &&
            singleItem[field] !== undefined && value.indexOf(singleItem[field]) >= 0 && elements.indexOf(singleItem[fieldNew]) === -1 );
        }

      } else {
        return (singleItem !== null && singleItem[field] !== null &&
          singleItem[field] !== undefined && value.indexOf(singleItem[field]) >= 0);
      }
    });
  }

}
