import { Component } from '@angular/core';

@Component({
  selector: 'laji-quality',
  templateUrl: './quality.component.html',
  styleUrls: ['./quality.component.css']
})
export class QualityComponent {
  group = '';
  timeStart = '';
  timeEnd = '';

  setFilters(filters) {
    this.group = filters.group;
    this.timeStart = filters.timeStart;
    this.timeEnd = filters.timeEnd;
  }
}
