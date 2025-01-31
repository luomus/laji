import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lu-datatable-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: [ './paginator.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatablePaginatorComponent {
  @Input() totalPages!: number;
  @Input() currentPageIdx!: number;
  @Output() pageChange = new EventEmitter<number>();

  onChangePage(idx: number) {
    this.pageChange.emit(idx);
  }
}
