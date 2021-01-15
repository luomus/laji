import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-page-size-select',
  templateUrl: './page-size-select.component.html',
  styleUrls: ['./page-size-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageSizeSelectComponent {

  @Input() pageSizes = [50, 100, 500, 1000, 5000, 10000];
  @Output() pageSizeChange = new EventEmitter<number>();
  _pageSize: number;

  @Input() set pageSize(val: any) {
    this._pageSize = +val;
  }

}
