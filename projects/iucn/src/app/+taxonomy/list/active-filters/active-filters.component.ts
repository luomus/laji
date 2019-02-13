import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FilterQuery } from '../../../iucn-shared/service/result.service';

@Component({
  selector: 'laji-active-filters',
  templateUrl: './active-filters.component.html',
  styleUrls: ['./active-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActiveFiltersComponent {

  _query: FilterQuery;
  queryItems: {field: string, label: string, value: string}[] = [];

  skip = [
    'type',
    'year',
    'onlyPrimaryThreat',
    'onlyPrimaryReason',
    'onlyPrimaryHabitat'
  ];

  includeLabel = [
    'reasons',
    'threats'
  ];

  order = [
    'redListGroup',
    'taxon',
    'habitat',
    'habitatSpecific',
    'reasons',
    'threats',
    'status'
  ];

  constructor() { }

  @Input() set query(q: FilterQuery) {
    this._query = q;
    const items = [];
    Object.keys(q).forEach(field => {
      if (this.skip.indexOf(field) !== -1 || !q[field]) {
        return;
      }
      items.push({
        field: field,
        value: q[field],
        label: this.includeLabel.indexOf(field) > -1 ? 'iucn.filter.' + field : ''
      });
    });
    items.sort((a, b) => this.order.indexOf(a.field) - this.order.indexOf(b.field));
    this.queryItems = items;
  }

  get query() {
    return this._query;
  }

}
