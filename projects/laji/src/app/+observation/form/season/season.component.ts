import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-season',
  templateUrl: './season.component.html',
  styleUrls: ['./season.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeasonComponent {

  startDay;
  startMonth;
  endDay;
  endMonth;

  days: string[];
  months: string[];

  @Output() seasonChange = new EventEmitter<string>();

  constructor() {
    this.days = [''];
    this.months = [''];
    for (let i = 1; i <= 31; i ++) {
      const value = i < 10 ? '0' + i : '' + i;
      this.days.push(value);
      if (i <= 12) {
        this.months.push(value);
      }
    }
  }

  @Input() set season(season: string) {
    if (!season) {
      this.startDay = '';
      this.startMonth = '';
      this.endDay = '';
      this.endMonth = '';
      return;
    }
    const parts = season.split('/');
    if (parts.length !== 2) {
      this.startDay = '';
      this.startMonth = '';
      this.endDay = '';
      this.endMonth = '';
      return;
    }

    this.startDay = parts[0].substring(2, 4);
    this.startMonth = parts[0].substring(0, 2);
    this.endDay = parts[1].substring(2, 4);
    this.endMonth = parts[1].substring(0, 2);
  }

  onChange() {
    if (this.startMonth && !this.startDay) {
      this.startDay = '01';
    }
    if (this.endMonth && !this.endDay) {
      this.endDay = '01';
    }
    if (!this.startDay || !this.startMonth || !this.endDay || !this.endMonth) {
      return;
    }
    this.seasonChange.emit(`${this.startMonth}${this.startDay}/${this.endMonth}${this.endDay}`);
  }
}
