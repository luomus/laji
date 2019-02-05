import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface IPageChange {
  count: number;
  pageSize: number;
  limit: number;
  offset: number;
  page: number;
}

@Component({
  selector: 'laji-data-table-footer',
  templateUrl: './data-table-footer.component.html',
  styleUrls: ['./data-table-footer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableFooterComponent {

  @Input() totalMessage = '';
  @Input() top = false;
  @Output() change = new EventEmitter<IPageChange>();

  _count: number;
  _pageSize: number;
  _page: number;
  _start: number;
  _end: number;

  constructor() { }

  @Input() set pageSize(size: number) {
    this._pageSize = size;
    this.initStartEnd();
  }

  @Input() set count(count: number) {
    this._count = count;
    this.initStartEnd();
  }

  @Input() set page(page: number) {
    this._page = page;
    this.initStartEnd();
  }

  private initStartEnd() {
    this._start = ((this._page - 1) * this._pageSize) + 1;
    this._end = Math.min(this._start + this._pageSize - 1, this._count);
  }

  onChange(event) {
    this.change.emit({
      count: this._count,
      pageSize: this._pageSize,
      limit: this._pageSize,
      offset: event.page - 1,
      page: event.page
    });
  }

}
