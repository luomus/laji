import { Component, OnInit, Input, OnChanges, ViewContainerRef } from '@angular/core';
import { type } from 'os';

@Component({
  selector: 'laji-row',
  templateUrl: './row.component.html',
  styleUrls: ['./row.component.css']
})
export class RowComponent implements OnInit, OnChanges {

  @Input() item: any = {};
  @Input() title: string;
  @Input() field: string;
  @Input() valueIsLabel = true;

  public _title = '';
  public _show = false;

  constructor() {
  }

  ngOnInit() {
    this.initRow();
  }

  ngOnChanges() {
    this.initRow();
  }

  initRow() {
    if (!this.item || !this.field) {
      return;
    }
    this._show = typeof this.item[this.field] !== 'undefined';
    this._title = this.title || this.field;
  }

}
