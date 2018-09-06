import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-data-table-footer',
  templateUrl: './data-table-footer.component.html',
  styleUrls: ['./data-table-footer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableFooterComponent {

  @Output() change = new EventEmitter();

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
      count: this.count,
      pageSize: this.pageSize,
      limit: this.pageSize,
      offset: event.page - 1,
      page: event.page
    })
  }

}
