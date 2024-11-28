import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, } from '@angular/core';
import { SearchQueryService } from '../../../+observation/search-query.service';

export const createActiveFiltersList = (query: Record<string, any>, skip: string[] = []) => {
  const keys = Object.keys(query);
  const doubles: Record<string, boolean> = {};
  const doubleKeys: Record<string, string> = {
    teamMember: 'teamMember',
    teamMemberId: 'teamMember',
    firstLoadedSameOrBefore: 'firstLoaded',
    firstLoadedSameOrAfter: 'firstLoaded'
  };
  return keys.reduce((result, i) => {
    if (skip.indexOf(i) > -1 || i.substr(0, 1) === '_') {
      return result;
    }
    if (SearchQueryService.hasValue(query[i])) {
      // show only one filter in some cases
      if (doubleKeys[i]) {
        if (doubles[doubleKeys[i]]) {
          return result;
        }
        doubles[doubleKeys[i]] = true;
      }

      result.push({field: i, value: query[i]});
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

  @Output() queryChange = new EventEmitter<any>();

  active: ActiveFilter[] = [];
  showList = false;

  private _query: Record<string, any> = {};

  @Input()
  set query(query: Record<string, any>) {
    this._query = query;
    this.active = createActiveFiltersList(this.query, this.skip);
  }

  get query() {
    return this._query;
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
    const query = {...this.query};

    delete query[item.field];
    if (this.active && this.active.length < 2) {
      this.showList = false;
    }
    this.queryChange.emit(query);
  }

  removeAll() {
    const query = {...this.query};

    Object.keys(query).map((key) => {
      if (this.skip.indexOf(key) === -1 && typeof query[key] !== 'undefined') {
        delete query[key];
      }
    });
    this.active = [];
    this.showList = false;
    this.queryChange.emit(query);
  }
}

interface ActiveFilter {
  field: string;
  value: any;
}
