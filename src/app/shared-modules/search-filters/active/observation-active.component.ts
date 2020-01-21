import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, } from '@angular/core';

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

  active: ActiveList[] = [];
  showList = false;

  private _query: object;

  @Input()
  set query(query: object) {
    this._query = query;
    this.updateSelectedList();
  }

  get query() {
    return this._query;
  }

  toggleActiveList() {
    if (!this.showList && this.active && this.active.length === 0) {
      return;
    }
    this.showList = !this.showList;
  }

  remove(item: ActiveList) {
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

  updateSelectedList() {
    const query = this.query;
    const keys = Object.keys(query);
    const doubles = {};
    const doubleKeys = {
      teamMember: 'teamMember',
      teamMemberId: 'teamMember',
      firstLoadedSameOrBefore: 'firstLoaded',
      firstLoadedSameOrAfter: 'firstLoaded'
    };

    this.active = keys.reduce((result, i) => {
      if (this.skip.indexOf(i) > -1 || i.substr(0, 1) === '_') {
        return result;
      }
      const type = typeof query[i];
      if (type !== 'undefined' && (type === 'boolean' || type === 'number' || (query[i] && query[i].length > 0))) {
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
    }, []);
  }

}

interface ActiveList {
  field: string;
  value: any;
}
