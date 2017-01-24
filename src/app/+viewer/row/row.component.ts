import {
  Component, OnInit, Input, OnChanges, ViewContainerRef, ViewChild, AfterViewInit,
  ViewRef, ViewEncapsulation, AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { type } from 'os';

const EMPTY_VALUE = ' ';

@Component({
  selector: 'laji-row',
  templateUrl: './row.component.html',
  styleUrls: ['./row.component.css']
})
export class RowComponent implements OnInit, OnChanges {

  @ViewChild('valueRow') valueRow;
  @Input() title: string;
  @Input() field: string;
  @Input() value: string = EMPTY_VALUE;
  @Input() noTitleSpace = false;
  @Input() noRow = false;

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
