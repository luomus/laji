import { Pipe, PipeTransform } from '@angular/core';
import { FilterBaseType, FilterByType, FilterService, SearchRecord } from '../service/filter.service';


@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  constructor(private filterService: FilterService) {}

  /**
   * Filters the given value
   * @param arr array of values
   * @param filterBy filter by these values
   * @param matching if true returns matching if false returns those not matching
   */
  transform<
    T extends FilterBaseType,
    K extends string[],
    S extends SearchRecord<K>,
    Element extends T | S
  >(
    arr: Element[], filterBy: FilterByType<T, K>, matching = true): any {
    return this.filterService.filter(arr, filterBy, matching);
  }
}
