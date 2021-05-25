import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FilterQuery } from '../../service/result.service';
import { RegionalFilterQuery } from '../../service/regional.service';

@Component({
  selector: 'laji-active-filters',
  templateUrl: './active-filters.component.html',
  styleUrls: ['./active-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActiveFiltersComponent {

  _query: FilterQuery & RegionalFilterQuery = {};
  queryItems: {field: string, label: string, value: string, separator: string}[] = [];

  skip = [
    'type',
    'year',
    'page',
    'speciesFields',
    'onlyPrimaryThreat',
    'onlyPrimaryReason',
    'onlyPrimaryHabitat'
  ];

  useLabel: {[key: string]: string} = {
    'reasons': 'iucn.hasEndangermentReason',
    'threats': 'iucn.hasThreat'
  };

  separator: {[key: string]: string}  = {
    'threatenedAtArea': '; '
  };

  order = [
    'redListGroup',
    'taxon',
    'habitat',
    'habitatSpecific',
    'threatenedAtArea',
    'reasons',
    'threats',
    'status'
  ];

  @Input() set query(q: FilterQuery) {
    this._query = q;
    const items: {field: keyof typeof q, value: any, label: string, separator: string}[] = [];
    (Object.keys(q) as Array<keyof typeof q>).forEach(field => {
      if (this.skip.indexOf(field) !== -1 || !q[field]) {
        return;
      }
      items.push({
        field: field,
        value: q[field],
        label: this.useLabel[field] || '',
        separator: this.separator[field] || ','
      });
    });
    items.sort((a, b) => this.order.indexOf(a.field) - this.order.indexOf(b.field));
    this.queryItems = items;
  }

  get query() {
    return this._query;
  }

}
