import { Pipe, PipeTransform } from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { SearchQueryService } from '../search-query.service';

@Pipe({
  name: 'toSafeQuery'
})
export class ToSafeQueryPipe implements PipeTransform {

  constructor(
    private searchQueryService: SearchQueryService
  ) {}

  transform(value: WarehouseQueryInterface, skip: string[] = ['selected', 'pageSize', 'page']): any {
    if (!value) {
      return value;
    }
    return this.searchQueryService.getQueryObject(value, skip);
  }

}
