import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DatatableColumn } from '../../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';
import { DatatableHeaderComponent } from '../../../../../../laji/src/app/shared-modules/datatable/datatable-header/datatable-header.component';
import { ExportService } from '../../../../../../laji/src/app/shared/service/export.service';
import { BookType } from 'xlsx';
import { SelectionType } from '@achimha/ngx-datatable';

type TableType = 'downloads'|'people'|'user'|'userKeys'|'apiKeys'|'admin'|'geoapiKeys'|'userGeoapiKeys';

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
                  [showRowAsLink]="showRowAsLink"
                  [height]="height"
                  [rows]='data'
                  (rowSelect)="rowSelect.emit($event)"
                  (datatableSelect)="datatableSelect.emit($event)"
                  [count]="0"
                  [page]="1"
                  [pageSize]="20"
                  [columnMode]="'force'"
                  [totalMessage]="'haseka.submissions.total' | translate"
                  [columns]="cols"
                  [selectionType]="selectionType"
                  [selected]="selected"
                  >
          </laji-datatable>
      </div>
  `
})
export class DataTableComponent implements AfterViewInit {
  @ViewChild(DatatableHeaderComponent) header: DatatableHeaderComponent;

  @Input() showDownloadMenu = true;
  @Input() showRowAsLink = false;
  @Input() height = 'calc(90vh - 195px)';
  @Input() data: any[];
  @Input() exportFileName = 'export';
  @Input() selected: any = [];
  @Input() selectionType: SelectionType;

  @Output() rowSelect = new EventEmitter<any>();
  @Output() datatableSelect = new EventEmitter<any>();

  downloadLoading = false;

  cols:  DatatableColumn[] = [];
  private allCols: DatatableColumn[] = [
    {
      name: 'organisation',
      label: 'usage.organisation',
      cellTemplate: 'pluckValueSemiColonArray',
      canAutoResize: true,
    },
    {
      name: 'section',
      label: 'usage.section',
      cellTemplate: 'pluckValueSemiColonArray',
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
      name: 'personId',
      label: 'usage.person',
      cellTemplate: 'label',
      canAutoResize: true
    },
    {
      name: 'collectionIds',
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
      name: 'download',
      prop: 'id',
      label: 'usage.dataDownload',
      canAutoResize: true
    },
    {
      name: 'apiKeyExpires',
      prop: 'apiKeyExpires',
      label: 'usage.apiKeyExpires',
      canAutoResize: true
    },
    {
      name: 'apiKey',
      label: 'usage.apiKey',
      cellTemplate: 'copyToClipboard',
      canAutoResize: true
    },
    {
      name: 'securePortalUserRoleExpires',
      label: 'usage.admin.securePortalUserRoleExpires',
      canAutoResize: true
    },
    {
      name: 'userId',
      prop: 'id',
      label: 'usage.admin.userId',
      canAutoResize: true
    },
    {
      name: 'check',
      label: 'usage.admin.selectAll',
      canAutoResize: false,
      headerCheckboxable: true,
      checkboxable: true
    }
  ];

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
    this.cols = this.getColsFromType(type);
  }

  getColsFromType(type: TableType) {
    switch (type) {
      case 'people':
        return this.getCols(['organisation', 'section', 'fullName', 'emailAddress']);
      case 'admin':
        return this.getCols(['organisation', 'fullName', 'emailAddress', 'userId', 'securePortalUserRoleExpires', 'check']);
      case 'downloads':
        return this.getCols(['requested', 'personId', 'collectionIds', 'dataUsePurpose']);
      case 'user':
        return this.getCols(['requested', 'collectionIds', 'dataUsePurpose']);
      case 'userKeys':
        return this.getCols(['apiKeyExpires', 'collectionIds', 'dataUsePurpose', 'apiKey']);
      case 'apiKeys':
        return this.getCols(['apiKeyExpires', 'personId', 'collectionIds', 'dataUsePurpose']);
      case 'geoapiKeys':
        return this.getCols(['apiKeyExpires', 'personId', 'dataUsePurpose']);
      case 'userGeoapiKeys':
        return this.getCols(['apiKeyExpires', 'dataUsePurpose', 'apiKey']);
    }
  }

  private getCols(cols: string[]): DatatableColumn[] {
    return cols.map(c => (
      this.allCols.find(col => c === col.name)
    ));
  }
}
