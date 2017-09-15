import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'laji-page-size-select',
  templateUrl: './page-size-select.component.html',
  styleUrls: ['./page-size-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageSizeSelectComponent {

  @Input() pageSizes = [50, 100, 500, 1000, 5000, 10000];
  @Input() pageSize: number;
  @Output() pageSizeChange = new EventEmitter<number>();

  constructor() { }

}
