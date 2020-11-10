import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'laji-quality',
  templateUrl: './quality.component.html',
  styleUrls: ['./quality.component.css']
})
export class QualityComponent implements OnInit {
  group = '';
  timeStart = '';
  timeEnd = '';

  constructor() {}

  ngOnInit() {
  }

  setFilters(filters) {
    this.group = filters.group;
    this.timeStart = filters.timeStart;
    this.timeEnd = filters.timeEnd;
  }
}
