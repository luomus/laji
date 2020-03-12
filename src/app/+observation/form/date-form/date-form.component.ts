import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { WarehouseQueryInterface } from 'app/shared/model/WarehouseQueryInterface';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { ObservationFormQuery } from '../observation-form-query.interface';

const relativeDateFormat = /^\-?\d+\/\-?\d+$/;
export function isRelativeDate(date: string): boolean {
  if (!date) {
    return false;
  }
  return !!date.match(relativeDateFormat);
}

@Component({
  selector: 'laji-date-form',
  templateUrl: './date-form.component.html'
})
export class DateFormComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();

  @Input() query;
  @Input() formQuery: ObservationFormQuery;
  @Input() dateFormat = 'YYYY-MM-DD';
  @Input() advancedMode = false;
  @Input() visibleAdvanced;

  @Output() formQueryChange = new EventEmitter<void>();
  @Output() queryChange = new EventEmitter<void>();
  @Output() seachQueryChange = new EventEmitter<any>();
  @Output() updateTime = new EventEmitter<any>();

  // Datepicker component emits a value change event every time it receives an update
  // with this hack we ignore value change events that were initiated by xDaysAgo
  private ignoreStartDatepickerEvent = false;
  private ignoreEndDatepickerEvent = false;

  constructor() {}

  ngOnInit() {}

  get datepickerTimeStart() {
    return isRelativeDate(this.formQuery.timeStart) ? undefined : this.formQuery.timeStart;
  }
  set datepickerTimeStart(time) {
    if (this.ignoreStartDatepickerEvent) {
      this.ignoreStartDatepickerEvent = false;
      return;
    }
    this.formQuery.timeStart = time;
  }

  get datepickerTimeEnd() {
    return (!isRelativeDate(this.formQuery.timeStart) || !this.formQuery.timeStart) ? this.formQuery.timeEnd : undefined;
  }
  set datepickerTimeEnd(time) {
    if (this.ignoreEndDatepickerEvent) {
      this.ignoreEndDatepickerEvent = false;
      return;
    }
    if (isRelativeDate(this.formQuery.timeStart)) {
      this.formQuery.timeStart = undefined;
    }
    this.formQuery.timeEnd = time;
  }

  get xDaysAgo() {
    return isRelativeDate(this.formQuery.timeStart) ? Math.abs(parseInt(this.formQuery.timeStart, 10)) : undefined;
  }
  set xDaysAgo(days: number) {
    if (this.formQuery.timeStart) {
      this.ignoreStartDatepickerEvent = true;
    }
    if (this.formQuery.timeEnd) {
      this.ignoreEndDatepickerEvent = true;
    }
    typeof days === 'number' ? this.formQuery.timeStart = (-1) * days + '/0' : this.formQuery.timeStart = undefined;
    this.formQuery.timeEnd = undefined;
    this.onFormQueryChange();
  }

  onFormQueryChange() {
    this.formQueryChange.emit();
  }

  onQueryChange() {
    this.queryChange.emit();
  }

  updateSearchQuery(field, value) {
    this.seachQueryChange.next([field, value]);
  }

  onUpdateTime(...args) {
    this.updateTime.emit(args);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
