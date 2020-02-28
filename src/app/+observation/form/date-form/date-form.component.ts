import { Component, Input, Output, EventEmitter } from '@angular/core';
import { WarehouseQueryInterface } from 'app/shared/model/WarehouseQueryInterface';
import * as moment from 'moment';

@Component({
  selector: 'laji-date-form',
  templateUrl: './date-form.component.html'
})
export class DateFormComponent {
  @Input() query;
  @Input() formQuery;
  @Input() dateFormat = 'YYYY-MM-DD';
  @Input() advancedMode = false;
  @Input() visibleAdvanced;

  @Output() formQueryChange = new EventEmitter<void>();
  @Output() queryChange = new EventEmitter<void>();
  @Output() seachQueryChange = new EventEmitter<any>();

  constructor() {}


  onFormQueryChange() {
    this.formQueryChange.emit();
  }

  onQueryChange() {
    this.queryChange.emit();
  }

  updateSearchQuery(field, value) {
    this.seachQueryChange.next([field, value]);
  }

  updateTime(dates, startTarget?: 'time');
  updateTime(dates, startTarget: keyof WarehouseQueryInterface, endTarget: keyof WarehouseQueryInterface );
  updateTime(dates, startTarget: 'time' | keyof WarehouseQueryInterface = 'time', endTarget?: keyof WarehouseQueryInterface ) {
    if (dates === 365) {
      const today = new Date();
      const oneJan = new Date(today.getFullYear(), 0, 1);
      dates = Math.ceil(((+today) - (+oneJan)) / 86400000) - 1;
    }
    const now = moment();
    if (startTarget === 'time') {
      this.formQuery.timeStart = now.subtract(dates, 'days').format('YYYY-MM-DD');
      this.formQuery.timeEnd = '';
      this.onFormQueryChange();
    } else {
      this.query[startTarget] = now.subtract(dates, 'days').format('YYYY-MM-DD');
      this.query[endTarget] = undefined;
      this.onQueryChange();
    }
  }
}
