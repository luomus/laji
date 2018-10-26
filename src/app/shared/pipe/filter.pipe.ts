import { Pipe, PipeTransform } from '@angular/core';
import { FilterByType, FilterService } from '../service/filter.service';


@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  constructor(private filterService: FilterService) {}

  /**
   * Filters the given value so that the r
   * @param value array of values
   * @param filterBy
   */
  transform(value: any, filterBy: FilterByType): any {
    return this.filterService.filter(value, filterBy);
  }

}
