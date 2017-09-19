import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal/modal.component';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-theme-observation-list',
  templateUrl: './theme-observation-list.component.html',
  styleUrls: ['./theme-observation-list.component.css']
})
export class ThemeObservationListComponent {

  @ViewChild('documentModal') public modal: ModalDirective;

  @Input() query: WarehouseQueryInterface;
  @Input() height;
  @Output() onListClose = new EventEmitter<WarehouseQueryInterface>();
  @Output() onPageChange = new EventEmitter<number>();

  loading = false;
  results = {results: []};
  shownDocument = '';
  highlightId = '';
  current: string;

  constructor(
    public translate: TranslateService
  ) { }

  showDocument(event) {
    const row = event.row || {};
    if (row.document && row.document.documentId && row.unit && row.unit.unitId) {
      this.highlightId = row.unit.unitId;
      this.shownDocument = row.document.documentId;
      this.modal.show();
    }
  }

  pageChanged(pager) {
    this.onPageChange.emit(pager.page);
  }

}
