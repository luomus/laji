import { Pipe, PipeTransform } from '@angular/core';
import { FilterByType, FilterService } from '../service/filter.service';


@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  constructor(private filterService: FilterService) {}

  /**
   * Filters the given value
   * @param value array of values
   * @param filterBy filter by these values
   * @param matching if true returns matching if false returns those not matching
   */
  transform(value: any, filterBy: FilterByType, matching = true): any {
    return this.filterService.filter(value, filterBy, matching);
  }

}
