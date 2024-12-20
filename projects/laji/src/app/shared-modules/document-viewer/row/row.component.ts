import { ChangeDetectionStrategy, Component, Input, OnChanges, ViewChild } from '@angular/core';

const EMPTY_VALUE = ' ';

@Component({
  selector: 'laji-row',
  templateUrl: './row.component.html',
  styleUrls: ['./row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RowComponent implements OnChanges {

  @Input() title?: string;
  @Input() field?: string;
  @Input() value?: string = EMPTY_VALUE;
  @Input() noTitleSpace = false;
  @Input() noRow = false;
  @Input() showWithoutValue = false;
  @Input() hideValue = false;

  public _title = '';
  public show = false;

  ngOnChanges() {
    this.initRow();
  }

  initRow() {
    this._title = this.title || '';
    this.show = this.showWithoutValue || !!this.value || this.value === EMPTY_VALUE;
  }

}
