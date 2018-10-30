import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';

const EMPTY_VALUE = ' ';

@Component({
  selector: 'laji-print-row',
  templateUrl: './print-row.component.html',
  styleUrls: ['./print-row.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrintRowComponent implements OnInit, OnChanges {

  @Input() title: string;
  @Input() value: string = EMPTY_VALUE;

  public _title = '';
  public show = false;

  constructor() {
  }

  ngOnInit() {
    this.initRow();
  }

  ngOnChanges() {
    this.initRow();
  }

  initRow() {
    this._title = this.title || '';
    this.show = !!this.value || this.value === EMPTY_VALUE;
  }

}
