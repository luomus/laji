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
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output,
  ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject ,  Subscription } from 'rxjs';

export interface CalendarDate {
  day: number;
  month: number;
  year: number;
  enabled: boolean;
  today: boolean;
  selected: boolean;
}

export const CALENDAR_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatePickerComponent),
  multi: true
};

@Component({
  selector: 'laji-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.css'],
  providers: [CALENDAR_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() classAttr: string;
  @Input() expanded: boolean;
  @Input() opened: boolean;
  @Input() format: string;
  @Input() otherFormats: string[] = [];
  @Input() viewFormat: string;
  @Input() firstWeekdaySunday: boolean;
  @Input() toLastOfYear= false;
  @Input() addonText: string;
  @Output() onSelect = new EventEmitter();

  public validDate = true;
  public viewDate: string = null;
  private date: any = moment();
  private el: Element;
  private days: CalendarDate[] = [];
  private currentValue;

  private valueSource = new Subject();
  private value$: Subscription;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private cd: ChangeDetectorRef
  ) {
    this.el = viewContainerRef.element.nativeElement;
  }

  get value(): any {
    return this.viewDate;
  }

  set value(value: any) {
    let date = (value instanceof moment) ? value : moment(value, this.format, true);
    if (!date.isValid()) {
      this.validDate = !value;
      for (const format of [this.format, ...this.otherFormats]) {
        date = moment(value, format, true);
        if (date.isValid()) {
          if (format.length <= 4 && this.toLastOfYear) {
            date = moment(value, format, true).endOf('year');
          }
          this.validDate = true;
          this.value = date.format(this.format);
          return;
        }
      }
    }
    if (value == null || !date.isValid()) {
      this.viewDate = value;
    } else {
      this.viewDate = date.format(this.viewFormat);
      this.date = date;
    }
    this.onChangeCallback(value);
    if (this.currentValue !== value) {
      this.currentValue = value;
      this.onSelect.emit(value);
      this.cd.markForCheck();
    }
  }

  ngOnInit() {
    this.classAttr = `ui-kit-calendar-container ${this.classAttr}`;
    this.opened = this.opened || false;
    this.format = this.format || 'YYYY-MM-DD';
    this.viewFormat = this.viewFormat || 'D MMMM YYYY';
    this.firstWeekdaySunday = this.firstWeekdaySunday || false;
    setTimeout(() => {
      if (this.viewDate) {
        this.value = this.viewDate;
        this.generateCalendar();
        this.cd.markForCheck();
      }
    });
    this.value$ = this.valueSource
      .debounceTime(500)
      .subscribe((val) => this.value = val);
  }

  ngOnDestroy() {
    if (this.value$) {
      this.value$.unsubscribe();
    }
  }

  closeEvent(e) {
    if (!this.opened || !e.target) {
      return;
    }
    if (this.el !== e.target && !this.el.contains((<any>e.target))) {
      this.close();
    }
  }

  generateCalendar() {
    const date = moment(this.date);
    const month = date.month();
    const year = date.year();
    let n = 1;
    const firstWeekDay: number = (this.firstWeekdaySunday) ? date.date(2).day() : date.date(1).day();

    if (firstWeekDay !== 1) {
      n -= (firstWeekDay + 6) % 7;
    }

    this.days = [];
    const selectedDate = moment(this.value, this.viewFormat);
    for (let i = n; i <= date.endOf('month').date(); i += 1) {
      const currentDate = moment(`${i}.${month + 1}.${year}`, 'DD.MM.YYYY');
      const today = (moment().isSame(currentDate, 'day') && moment().isSame(currentDate, 'month'))
        ? true : false;
      const selected = (selectedDate.isSame(currentDate, 'day')) ? true : false;

      if (i > 0) {
        this.days.push({
          day: i,
          month: month + 1,
          year: year,
          enabled: true,
          today: today,
          selected: selected
        });
      } else {
        this.days.push({
          day: null,
          month: null,
          year: null,
          enabled: false,
          today: false,
          selected: selected
        });
      }
    }
  }

  selectDate(e: MouseEvent, i: number) {
    e.preventDefault();

    const date: CalendarDate = this.days[i];
    const selectedDate = moment(`${date.day}.${date.month}.${date.year}`, 'DD.MM.YYYY');
    this.value = selectedDate.format(this.format);
    this.viewDate = selectedDate.format(this.viewFormat);
    this.close();
    this.onSelect.emit(this.value);
    this.generateCalendar();
  }

  public prevYear(): void {
    this.date = this.date.subtract(1, 'Y');
    this.generateCalendar();
  }

  public nextYear(): void {
    this.date = this.date.add(1, 'Y');
    this.generateCalendar();
  }

  prevMonth() {
    this.date = this.date.subtract(1, 'month');
    this.generateCalendar();
  }

  nextMonth() {
    this.date = this.date.add(1, 'month');
    this.generateCalendar();
  }

  updateValue(value) {
    this.valueSource.next(value);
  }

  writeValue(value: any) {
    this.value = value;
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  toggle() {
    if (!this.viewDate) {
      const value = moment();
      this.value = value;
      this.onChangeCallback(value.format(this.format));
    }
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

  clear() {
    this.value = '';
    this.onSelect.emit(undefined);
  }

  private onTouchedCallback: () => void = () => {
  }
  private onChangeCallback: (_: any) => void = () => {
  }
}
