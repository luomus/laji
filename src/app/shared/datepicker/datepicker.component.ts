/**
 Originally from here: https://github.com/jkuri/ng2-datepicker

 Modified to meet our needs

 Original license:
 The MIT License (MIT)

 Copyright (c) 2015 Jan Kuri

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

import {
  Component,
  OnInit,
  ViewContainerRef,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  provide,
  forwardRef
} from '@angular/core';
import {NgModel, ControlValueAccessor} from '@angular/common';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import * as moment from 'moment';

export interface CalendarDate {
  day: number;
  month: number;
  year: number;
  enabled: boolean;
}

@Component({
  selector: 'laji-datepicker',
  templateUrl: 'datepicker.component.html',
  styleUrls: ['./datepicker.component.css'],
  directives: [NgModel],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent implements ControlValueAccessor, AfterViewInit, OnInit {
  public isOpened: boolean;
  public dateValue: string;
  public viewValue: string;
  public days: Array<CalendarDate>;
  public dayNames: Array<string>;
  private el: any;
  private date: any;
  private viewContainer: ViewContainerRef;
  private onChange: Function;
  private onTouched: Function;
  private cd: any;
  private cannonical: number;

  @Input('model-format') modelFormat: string;
  @Input('view-format') viewFormat: string;
  @Input('init-date') initDate: string;
  @Input('first-week-day-sunday') firstWeekDaySunday: boolean;
  @Input('static') isStatic: boolean;

  @Output() changed: EventEmitter<Date> = new EventEmitter<Date>();

  constructor(cd: NgModel, viewContainer: ViewContainerRef) {
    cd.valueAccessor = this;
    this.cd = cd;
    this.viewContainer = viewContainer;
    this.el = viewContainer.element.nativeElement;
    this.init();
  }

  ngAfterViewInit() {
    this.initValue();
  }

  ngOnInit() {
    this.date = moment(this.initDate);
    this.generateCalendar(this.date);
  }

  public openDatepicker(): void {
    this.isOpened = true;
  }

  public closeDatepicker(): void {
    this.isOpened = false;
  }

  public prevYear(): void {
    this.date.subtract(1, 'Y');
    this.generateCalendar(this.date);
  }

  public prevMonth(): void {
    this.date.subtract(1, 'M');
    this.generateCalendar(this.date);
  }

  public nextYear(): void {
    this.date.add(1, 'Y');
    this.generateCalendar(this.date);
  }

  public nextMonth(): void {
    this.date.add(1, 'M');
    this.generateCalendar(this.date);
  }

  public selectDate(e: MouseEvent, date: CalendarDate): void {
    e.preventDefault();
    if (this.isSelected(date)) return;

    let selectedDate = moment(date.day + '.' + date.month + '.' + date.year, 'DD.MM.YYYY');
    this.setValue(selectedDate);
    this.closeDatepicker();
    this.changed.emit(selectedDate.toDate());
  }

  public clear() {
    this.setValue('');
  }

  private generateCalendar(date: any): void {
    let lastDayOfMonth = date.endOf('month').date();
    let month = date.month();
    let year = date.year();
    let n = 1;
    let firstWeekDay: number = null;

    this.dateValue = date.format('MMMM YYYY');
    this.days = [];

    if (this.firstWeekDaySunday === true) {
      firstWeekDay = date.date(2).day();
    } else {
      firstWeekDay = date.date(1).day();
    }

    if (firstWeekDay !== 1) {
      n -= (firstWeekDay + 6) % 7;
    }

    for (let i = n; i <= lastDayOfMonth; i += 1) {
      if (i > 0) {
        this.days.push({ day: i, month: month + 1, year: year, enabled: true });
      } else {
        this.days.push({ day: null, month: null, year: null, enabled: false });
      }
    }
  }

  isSelected(date: CalendarDate) {
    let selectedDate = moment(date.day + '.' + date.month + '.' + date.year, 'DD.MM.YYYY');
    return selectedDate.toDate().getTime() === this.cannonical;
  }

  private generateDayNames(): void {
    this.dayNames = [];
    let date = this.firstWeekDaySunday === true ? moment('2015-06-07') : moment('2015-06-01');
    for (let i = 0; i < 7; i += 1) {
      this.dayNames.push(date.format('ddd'));
      date.add('1', 'd');
    }
  }

  private initMouseEvents(): void {
    let body = document.getElementsByTagName('body')[0];

    body.addEventListener('click', (e) => {
      if (!this.isOpened || !e.target) return;
      if (this.el !== e.target && !this.el.contains(e.target)) {
        this.closeDatepicker();
      }
    }, false);
  }

  private setValue(value: any): void {
    if (value !== '') {
      let val = moment(value, this.modelFormat || 'YYYY-MM-DD');
      this.viewValue = val.format(this.viewFormat || 'Do MMMM YYYY');
      this.cd.viewToModelUpdate(val.format(this.modelFormat || 'YYYY-MM-DD'));
      this.cannonical = val.toDate().getTime();
    } else {
      this.viewValue = '';
    }
  }

  private initValue(): void {
    setTimeout(() => {
      if (!this.initDate) {
        this.setValue('');
      } else {
        this.setValue(moment(this.initDate, this.modelFormat || 'YYYY-MM-DD'));
      }
    });
  }

  writeValue(value: string): void {
    this.setValue(value);
  }

  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: (_: any) => {}): void {
    this.onTouched = fn;
  }

  private init(): void {
    this.isOpened = false;
    this.firstWeekDaySunday = false;
    this.generateDayNames();
    this.initMouseEvents();
  }
}
