import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-redlist-year-select',
  templateUrl: './redlist-year-select.component.html',
  styleUrls: ['./redlist-year-select.component.css']
})
export class RedlistYearSelectComponent {

  @Input() active: number;
  @Input() history: {year: number}[] = [];

  @Output() activeChange = new EventEmitter();

  constructor() { }

  changeActive(event) {
    event.stopPropagation();
    this.activeChange.emit(event.target.value);
  }

}
