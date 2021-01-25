import { AfterViewInit, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { DatatableColumn } from '../../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';
import { DatatableHeaderComponent } from '../../../../../../laji/src/app/shared-modules/datatable/datatable-header/datatable-header.component';
import { ExportService } from '../../../../../../laji/src/app/shared/service/export.service';
import { BookType } from 'xlsx';

type TableType = 'downloads'|'people'|'user';

@Component({
  selector: 'vir-data-table',
  template: `
      <div class="observation-table-wrapper">
          <laji-datatable-header
                  [downloadText]="'haseka.submissions.download' | translate"
                  [downloadLoading]="downloadLoading"
                  [showDownloadMenu]="showDownloadMenu"
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
                  [clientSideSorting]="true"
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
      <ng-template let-value="value" let-row="row" let-sort="sortFn" #downloadFileTpl>
        <a [href]="'/api/file-download?id=' + value">{{ ('download.' + row.downloadType) | translate }}</a>
      </ng-template>
  `
})
export class DataTableComponent implements AfterViewInit {

  @ViewChild(DatatableHeaderComponent) header: DatatableHeaderComponent;
  @ViewChild('downloadFileTpl') downloadFileTpl: TemplateRef<any>;

  @Input() showDownloadMenu = true;

  downloadLoading: boolean;

  cols:  DatatableColumn[] = [];
  private allCols: DatatableColumn[] = [
    {
      name: 'organisation',
      label: 'usage.organisation',
      cellTemplate: 'toSemicolon',
      canAutoResize: true,
    },
    {
      name: 'section',
      label: 'usage.section',
      cellTemplate: 'toSemicolon',
      canAutoResize: true
    },
    {
      name: 'fullName',
      label: 'usage.name'
    },
    {
      name: 'emailAddress',
      label: 'usage.email',
      canAutoResize: true
    },
    {
      name: 'requested',
      label: 'usage.requested',
      canAutoResize: true
    },
    {
      name: 'person',
      label: 'usage.person',
      cellTemplate: 'label',
      canAutoResize: true
    },
    {
      name: 'collectionId',
      label: 'usage.collectionId',
      cellTemplate: 'labelArray',
      canAutoResize: true
    },
    {
      name: 'dataUsePurpose',
      label: 'usage.dataUsePurpose',
      canAutoResize: true
    },
    {
      prop: 'id',
      name: 'download',
      label: 'usage.dataDownload',
      canAutoResize: true
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

  ngAfterViewInit() {
    this.cols = this.getColsFromType(this._type);
  }

  download(type: string) {
    this.downloadLoading = true;
    this.exportService.exportFromData(this.data, this.getColsFromType(this._type), type as BookType, this.exportFileName)
      .subscribe(() => {
        this.downloadLoading = false;
        this.header.downloadComponent.closeModal();
      }, () => {
        this.downloadLoading = false;
      });
  }

  @Input()
  set type(type: TableType) {
    this._type = type;
    if (this.downloadFileTpl) {
      this.cols = this.getColsFromType(type);
    }
  }

  getColsFromType(type: TableType) {
    switch (type) {
      case 'people':
        return this.getCols(['organisation', 'section', 'fullName', 'emailAddress']);
      case 'downloads':
        return this.getCols(['requested', 'person', 'collectionId', 'dataUsePurpose']);
      case 'user':
        return this.getCols(['requested', 'collectionId', 'dataUsePurpose', 'download']);
    }
  }

  private getCols(cols: string[]): DatatableColumn[] {
    return cols.map(c => {
      const column = this.allCols.find(col => c === col.name);
      if (column.name === 'download') {
        column.cellTemplate = this.downloadFileTpl;
      }

      return column;
    });
  }
}
