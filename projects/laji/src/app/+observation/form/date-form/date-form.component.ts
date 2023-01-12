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

  @Output() formQueryChange = new EventEmitter<void>();
  @Output() queryChange = new EventEmitter<void>();
  @Output() searchQueryChange = new EventEmitter<any>();
  @Output() updateTime = new EventEmitter<any>();

  get datepickerTimeStart() {
    return isRelativeDate(this.formQuery.timeStart) ? undefined : this.formQuery.timeStart;
  }
  set datepickerTimeStart(time) {
    this.formQuery.timeStart = time;
    this.onFormQueryChange();
  }

  get datepickerTimeEnd() {
    return (!isRelativeDate(this.formQuery.timeStart) || !this.formQuery.timeStart) ? this.formQuery.timeEnd : undefined;
  }
  set datepickerTimeEnd(time) {
    if (isRelativeDate(this.formQuery.timeStart)) {
      this.formQuery.timeStart = undefined;
    }
    this.formQuery.timeEnd = time;
    this.onFormQueryChange();
  }

  get xDaysAgo() {
    return isRelativeDate(this.formQuery.timeStart) ? Math.abs(parseInt(this.formQuery.timeStart, 10)) : undefined;
  }
  set xDaysAgo(days: number) {
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
