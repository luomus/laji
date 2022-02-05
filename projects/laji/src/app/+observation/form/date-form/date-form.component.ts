import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ObservationFormQuery } from '../observation-form-query.interface';

const relativeDateFormat = /^-?\d+\/-?\d+$/;
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
export class DateFormComponent implements OnDestroy {
  private unsubscribe$ = new Subject();

  @Input() query;
  @Input() formQuery: ObservationFormQuery;
  @Input() dateFormat = 'YYYY-MM-DD';

  @Output() formQueryChange = new EventEmitter<void>();
  @Output() queryChange = new EventEmitter<void>();
  @Output() searchQueryChange = new EventEmitter<any>();
  @Output() updateTime = new EventEmitter<any>();

  // Datepicker component emits a value change event every time it receives an update
  // with this hack we ignore value change events that were initiated by xDaysAgo
  private ignoreStartDatepickerEvent = false;
  private ignoreEndDatepickerEvent = false;

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
    this.formQuery.timeStart = typeof days === 'number'
      ? (-1) * Math.abs(days) + '/0'
      : undefined;
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
    this.searchQueryChange.next([field, value]);
  }

  onUpdateTime(...args) {
    this.updateTime.emit(args);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
