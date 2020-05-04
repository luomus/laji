import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DatatableColumn } from '../../../../../../../src/app/shared-modules/datatable/model/datatable-column';
import { DatatableHeaderComponent } from '../../../../../../../src/app/shared-modules/datatable/datatable-header/datatable-header.component';
import { ExportService } from '../../../../../../../src/app/shared/service/export.service';
import { BookType } from 'xlsx';

type TableType = 'downloads'|'people'

@Component({
  selector: 'vir-data-table',
  template: `
      <div class="observation-table-wrapper">
          <laji-datatable-header
                  [downloadText]="'haseka.submissions.download' | translate"
                  [downloadLoading]="downloadLoading"
                  [showDownloadMenu]="true"
                  [showSettingsMenu]="false"
                  [count]="0"
                  [maxDownload]="10000"
                  (download)="download($event)"
          ></laji-datatable-header>
          <laji-datatable
                  #dataTable
                  class="observation-table"
                  [showHeader]="true"
                  [showFooter]="false"
                  [virtualScrolling]="true"
                  [height]="'calc(90vh - 195px)'"
                  [rows]='data'
                  (rowSelect)="rowSelect.emit($event)"
                  [count]="0"
                  [page]="1"
                  [pageSize]="20"
                  [columnMode]="'force'"
                  [totalMessage]="'haseka.submissions.total' | translate"
                  [columns]="cols">
          </laji-datatable>
      </div>
  `
})
export class DataTableComponent {

  @ViewChild(DatatableHeaderComponent) header: DatatableHeaderComponent;
  downloadLoading: boolean;

  cols:  DatatableColumn[] = [];
  private allCols: DatatableColumn[] = [
    {
      name: 'organisation',
      label: 'usage.organisation',
      canAutoResize: true,
      sortable: false
    },
    {
      name: 'fullName',
      label: 'usage.name',
      sortable: false
    },
    {
      name: 'emailAddress',
      label: 'usage.email',
      canAutoResize: true,
      sortable: false
    },
    {
      name: 'requested',
      label: 'usage.requested',
      canAutoResize: true,
      sortable: false
    },
    {
      name: 'person',
      label: 'usage.person',
      cellTemplate: 'label',
      canAutoResize: true,
      sortable: false
    },
    {
      name: 'downloadType',
      label: 'usage.downloadType',
      canAutoResize: true,
      sortable: false
    },
    {
      name: 'collectionId',
      label: 'usage.collectionId',
      cellTemplate: 'labelArray',
      canAutoResize: true,
      sortable: false
    },
    {
      name: 'dataUsePurpose',
      label: 'usage.dataUsePurpose',
      canAutoResize: true,
      sortable: false
    }
  ];

  @Input() data: any[];
  @Input() exportFileName = 'export';

  @Output() rowSelect = new EventEmitter<any>();

  private _type: TableType;

  constructor(
    private exportService: ExportService
  ) {
  }

  download(type: string) {
    this.downloadLoading = true;
    this.exportService.exportFromData(this.data, this.getColsFromType(this._type), type as BookType, this.exportFileName)
      .subscribe(() => {
        this.downloadLoading = false;
        this.header.downloadComponent.closeModal();
      }, () => {
        this.downloadLoading = false;
      })
  }

  @Input()
  set type(type: TableType) {
    this._type = type;
    this.cols = this.getColsFromType(type);
  }

  getColsFromType(type: TableType) {
    switch (type) {
      case 'people':
        return this.getCols(['organisation', 'fullName', 'emailAddress']);
      case 'downloads':
        return this.getCols(['requested', 'person', 'collectionId', 'dataUsePurpose']);
    }
  }

  private getCols(cols: string[]) {
    return cols.map(c => ({
      ...this.allCols.find(col => c === col.name)
    }))
  }
}
