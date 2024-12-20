/**
 * Originally from here: https://github.com/jkuri/ng2-datepicker
 *
 * Modified to meet our needs
 *
 * Original license:
 * The MIT License (MIT)
 * Copyright (c) 2015 Jan Kuri
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ENTER } from '@angular/cdk/keycodes';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';

export interface CalendarDate {
  day: string | null;
  month: string | null;
  year: string | null;
  today: boolean;
  selected: boolean;
}

export const CALENDAR_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatePickerComponent),
  multi: true
};

const FORMAT = 'YYYY-MM-DD'; // ISO-8601 format.
const VIEW_FORMAT = 'D.M.YYYY'; // Allows e.g. '01.9.2022" and "1.09.2022".

@Component({
  selector: 'laji-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.css'],
  providers: [CALENDAR_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() toLastOfYear = false;
  @Input() addonText!: string;
  @Input() popoverAlign: 'right' | 'left' = 'right';
  @Output() dateSelect = new EventEmitter();

  @ViewChild('dateInput') dateInput?: ElementRef;

  public moment = moment;
  public validDate = true;
  public viewValue= '';
  public calendarUIValue? = ''; // The active calendar date in ISO-8601 format.
  public date!: moment.Moment;
  public days: CalendarDate[] = [];
  public opened = false;

  private value: string | undefined;
  private readonly el: Element;
  private onTouchedCallback?: () => void;
  private onChangeCallback?: (_: any) => void;

  constructor(
    viewContainerRef: ViewContainerRef
  ) {
    this.el = viewContainerRef.element.nativeElement;
  }

  keyEvent(e: any, value: any) {
    const viewFormMoment = moment(value, VIEW_FORMAT, true);
    if (viewFormMoment.isValid()) {
      this.validDate = true;
      this.onInputValueChange(value);
    }
  }

  onInputValueChange(viewFormatValue: string): any {
    if (viewFormatValue) {
      // First try formatting with default view format.
      let viewFormMoment = moment(viewFormatValue, VIEW_FORMAT, true);

      if (viewFormMoment.isValid()) {
        this.validDate = true;
        return this.updateValue(viewFormMoment.format(FORMAT));
      }

      // Try formatting a value that is just a year.
      viewFormMoment = moment(viewFormatValue, 'YYYY', true);
      if (viewFormMoment.isValid()) {
        this.validDate = true;
        const momentValue = this.toLastOfYear ? viewFormMoment.endOf('year') : viewFormMoment.startOf('year');
        return this.updateValue(momentValue.format(FORMAT));
      }

      this.validDate = false;
      return this.onInputValueChange(this.viewValue);
    }

    this.updateValue('');
  }

  updateValue(value?: string) { // Expects ISO-8601 formatted value.
    if (value && !moment(value, FORMAT, true).isValid()) {
      throw new Error(`Invalid date for laji-datepicker$ (${value}). only ISO-8601 dates are accepted.`);
    }
    if (!value) {
      value = undefined;
    }
    const prevValue = this.value;
    this.value = value;
    this.viewValue = value
      ? moment(value, FORMAT).format(VIEW_FORMAT)
      : '';

    // Update input elem value manually, as updating the input value attribute doesn't work.
    if ( this.dateInput) {
      this.dateInput.nativeElement.value = this.viewValue;
    }

    this.calendarUIValue = value;
    this.dateSelect.next(this.value);
    if (prevValue !== this.value) {
      this.onChangeCallback?.(this.value);
      this.onTouchedCallback?.();
    }
    this.generateCalendar();
  }

  closeEvent(e: any) {
    if (!this.opened || !e.target) {
      return;
    }
    if (this.el !== e.target && !this.el.contains((<any>e.target))) {
      this.close();
    }
  }

  generateCalendar() {
    const date = moment(this.calendarUIValue);
    const month = date.month() + 1; // Moment month is zero indexed.
    const year = date.format('YYYY');

    // Find out the weekday number for first day of the month (e.g. 1.11.2022 is tuesday so that's number 1).
    let n = 1;
    const firstWeekDay = date.date(1).day();
    if (firstWeekDay !== 1) {
      n -= (firstWeekDay + 6) % 7;
    }

    this.days = [];
    const selectedDate = moment(this.value, FORMAT);
    for (let i = n; i <= date.endOf('month').date(); i += 1) {
      if (i > 0) {
        const iteratedDate = moment(`${year}-${month}-${i}`, 'YYYY-M-D');
        const today = moment().isSame(iteratedDate.format(), 'day');
        const selected = selectedDate.isSame(iteratedDate, 'day');

        this.days.push({
          day: '' + iteratedDate.format('DD'),
          month: '' + iteratedDate.format('MM'),
          year,
          today,
          selected
        });
      } else {
        this.days.push({
          day: null,
          month: null,
          year: null,
          today: false,
          selected: false
        });
      }
    }
  }

  selectDate(e: MouseEvent, i: number) {
    e.preventDefault();

    const date: CalendarDate = this.days[i];
    this.updateValue(`${date.year}-${date.month}-${date.day}`);
    this.close();
    this.generateCalendar();
  }

  public prevYear(): void {
    this.calendarUIValue = moment(this.calendarUIValue).subtract(1, 'year').format();
    this.generateCalendar();
  }

  public nextYear(): void {
    this.calendarUIValue = moment(this.calendarUIValue).add(1, 'year').format();
    this.generateCalendar();
  }

  prevMonth() {
    this.calendarUIValue = moment(this.calendarUIValue).subtract(1, 'month').format();
    this.generateCalendar();
  }

  nextMonth() {
    this.calendarUIValue = moment(this.calendarUIValue).add(1, 'month').format();
    this.generateCalendar();
  }

  writeValue(value: string) {
    this.updateValue(value);
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  toggleEvent(e: MouseEvent) {
    e.stopPropagation(); // the calendar sometimes closes as soon as it is opened without this (lajiClickOutSide directive closes it)
    this.toggle();
  }

  toggle() {
    if (!this.opened) {
      this.generateCalendar();
    }
    this.opened = !this.opened;
  }

  open() {
    this.opened = true;
  }

  close() {
    this.opened = false;
  }
}
