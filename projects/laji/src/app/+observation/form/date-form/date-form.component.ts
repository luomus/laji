import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { ObservationFormQuery } from '../observation-form-query.interface';

const relativeDateFormat = /^-?\d+\/-?\d+$/;
export function isRelativeDate(date?: string): boolean {
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

  @Input({ required: true }) query!: WarehouseQueryInterface;
  @Input({ required: true }) formQuery!: ObservationFormQuery;

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

  get loadedSameOrAfter() {
    return this.query.loadedSameOrAfter;
  }
  set loadedSameOrAfter(v: string | undefined) {
    this.query.loadedSameOrAfter = v;
    this.queryChange.emit();
  }

  get loadedSameOrBefore() {
    return this.query.loadedSameOrBefore;
  }
  set loadedSameOrBefore(v: string | undefined) {
    this.query.loadedSameOrBefore = v;
    this.queryChange.emit();
  }

  get firstLoadedSameOrAfter() {
    return this.query.firstLoadedSameOrAfter;
  }
  set firstLoadedSameOrAfter(v: string | undefined) {
    this.query.firstLoadedSameOrAfter = v;
    this.queryChange.emit();
  }

  get firstLoadedSameOrBefore() {
    return this.query.firstLoadedSameOrBefore;
  }
  set firstLoadedSameOrBefore(v: string | undefined) {
    this.query.firstLoadedSameOrBefore = v;
    this.queryChange.emit();
  }

  get xDaysAgo() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return isRelativeDate(this.formQuery.timeStart) ? Math.abs(parseInt(this.formQuery.timeStart!, 10)) : undefined;
  }
  set xDaysAgo(days: number|undefined) {
    this.formQuery.timeStart = typeof days === 'number'
      ? (-1) * Math.abs(days) + '/0'
      : undefined;
    this.formQuery.timeEnd = undefined;
    this.onFormQueryChange();
  }

  onFormQueryChange() {
    this.formQueryChange.emit();
  }

  updateSearchQuery(field: string, value: any) {
    this.searchQueryChange.next([field, value]);
  }

  onUpdateTime(...args: any[]) {
    this.updateTime.emit(args);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
