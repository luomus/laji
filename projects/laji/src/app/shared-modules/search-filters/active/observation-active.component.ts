import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, } from '@angular/core';
import { SearchQueryService } from '../../../+observation/search-query.service';
import { TaxonomySearch } from '../../../+taxonomy/species/service/taxonomy-search.service';

export const createActiveFiltersList = (taxonId: TaxonomySearch['taxonId'], filters: TaxonomySearch['filters'], skip: string[] = []) => {
  const flattenedSearch = { taxonId, ...filters };
  const keys = Object.keys(flattenedSearch) as (keyof TaxonomySearch['filters'] | 'taxonId' )[];
  const doubles: Record<string, boolean> = {};
  const doubleKeys: Record<string, string> = {
    teamMember: 'teamMember',
    teamMemberId: 'teamMember',
    firstLoadedSameOrBefore: 'firstLoaded',
    firstLoadedSameOrAfter: 'firstLoaded'
  };
  return keys.reduce((result, key) => {
    if (skip.indexOf(key) > -1 || key.substr(0, 1) === '_') {
      return result;
    }
    if (SearchQueryService.hasValue(flattenedSearch[key])) {
      // show only one filter in some cases
      if (doubleKeys[key]) {
        if (doubles[doubleKeys[key]]) {
          return result;
        }
        doubles[doubleKeys[key]] = true;
      }

      result.push({field: key, value: flattenedSearch[key]});
    }
    return result;
  }, [] as ActiveFilter[]);
};

@Component({
  selector: 'laji-observation-active',
  templateUrl: './observation-active.component.html',
  styleUrls: ['./observation-active.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationActiveComponent {
  @Input() skip: string[] = [];
  @Input() queryType = '';

  @Output() searchChange = new EventEmitter<Pick<TaxonomySearch, 'taxonId' | 'filters'>>();

  active: ActiveFilter[] = [];
  showList = false;

  private _taxonId: TaxonomySearch['taxonId'];
  private _filters!: TaxonomySearch['filters'];

  @Input({ required: true })
  set taxonId(taxonId: TaxonomySearch['taxonId']) {
    this._taxonId = taxonId;
    this.active = createActiveFiltersList(this._taxonId, this._filters, this.skip);
  }

  @Input()
  set filters(filters: TaxonomySearch['filters']) {
    this._filters = filters;
    this.active = createActiveFiltersList(this._taxonId, this._filters, this.skip);
  }

  toggleActiveListClick(e: MouseEvent) {
    e.stopPropagation();
    this.toggleActiveList();
  }

  toggleActiveList() {
    if (!this.showList && this.active && this.active.length === 0) {
      return;
    }
    this.showList = !this.showList;
  }

  remove(item: ActiveFilter) {
    if (item.field === 'taxonId') {
      this.taxonId = undefined;
    }
    const filters = { ...this._filters };

    delete filters[item.field as keyof TaxonomySearch['filters']];
    if (this.active && this.active.length < 2) {
      this.showList = false;
    }
    this.searchChange.emit({ taxonId: this.taxonId, filters });
  }

  removeAll() {
    this.taxonId = undefined;
    const filters = { ...this.filters };

    (Object.keys(filters) as (keyof TaxonomySearch['filters'])[]).map(key => {
      if (this.skip.indexOf(key) === -1 && typeof filters[key] !== 'undefined') {
        delete filters[key];
      }
    });
    this.active = [];
    this.showList = false;
    this.searchChange.emit({ taxonId: this.taxonId, filters });
  }
}

interface ActiveFilter {
  field: keyof TaxonomySearch['filters'] | 'taxonId';
  value: any;
}
