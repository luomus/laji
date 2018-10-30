import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'laji-redlist-year-select',
  templateUrl: './redlist-year-select.component.html',
  styleUrls: ['./redlist-year-select.component.css']
})
export class RedlistYearSelectComponent implements OnInit {

  @Input() active: number;
  @Input() history: {year: number}[] = [];

  constructor() { }

  ngOnInit() {
  }

}
