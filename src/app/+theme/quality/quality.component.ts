import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'laji-quality',
  templateUrl: './quality.component.html',
  styleUrls: ['./quality.component.css']
})
export class QualityComponent implements OnInit {
  filters = {
    group: '',
    timeStart: '',
    timeEnd: ''
  };

  constructor() {}

  ngOnInit() {
  }

  setFilters(filters) {
    this.filters = filters;
  }
}
