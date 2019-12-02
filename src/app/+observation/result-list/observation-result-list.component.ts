import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { ISettingResultList } from '../../shared/service/user.service';
import { DocumentViewerFacade } from '../../shared-modules/document-viewer/document-viewer.facade';
import { TableColumnService } from '../../shared-modules/datatable/service/table-column.service';

const DEFAULT_PAGE_SIZE = 100;

@Component({
  selector: 'laji-observation-result-list',
  templateUrl: './observation-result-list.component.html',
  styleUrls: ['./observation-result-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationResultListComponent {
  @ViewChild('documentModal', { static: true }) public modal: ModalDirective;
  @Input() query: WarehouseQueryInterface;
  @Input() visible: boolean;
  @Input() showDownloadMenu = false;
  @Input() resultBase: 'unit' | 'sample' = 'unit';

  @Output() settingsChange = new EventEmitter<ISettingResultList>();

  selectedFields: string[];
  pageSize: number;
  aggregateBy: string[] = [];

  constructor(
    private documentViewerFacade: DocumentViewerFacade,
    private tableColumnService: TableColumnService
  ) {
    this.selectedFields = tableColumnService.getDefaultFields();
  }

  @Input()
  set settings(settings: ISettingResultList) {
    if (!settings) {
      settings = {};
    }
    this.aggregateBy = settings.aggregateBy || [];
    this.selectedFields = settings.selected || this.selectedFields;
    this.pageSize = settings.pageSize || DEFAULT_PAGE_SIZE;
  }

  showDocument(event) {
    const row = event.row || {};
    const query = this.query;
    if (row.document && row.document.documentId && row.unit && row.unit.unitId) {
      this.documentViewerFacade.showDocumentID({
        document: row.document.documentId,
        highlight: this.resultBase === 'sample' ? row.sample.sampleId : row.unit.unitId,
        own: query && (!!query.observerPersonToken || !!query.editorPersonToken || !!query.editorOrObserverPersonToken),
        result: undefined
      });
    }
  }

  setPageSize(size: number) {
    if (size !== this.pageSize) {
      this.pageSize = size;
      this.saveSettings();
    }
  }

  setSelectedFields(fields: string[]) {
    this.selectedFields = [...fields];
    this.saveSettings();
  }

  resetSelectedFields() {
    this.selectedFields = this.tableColumnService.getDefaultFields();
    this.saveSettings();
  }

  private saveSettings() {
    this.settingsChange.emit({
      aggregateBy: this.aggregateBy,
      selected: this.selectedFields,
      pageSize: this.pageSize
    });
  }

}
