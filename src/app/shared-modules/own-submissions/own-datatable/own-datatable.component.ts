import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { WINDOW } from '@ng-toolkit/universal';
import { Document } from '../../../shared/model/Document';
import { TranslateService } from '@ngx-translate/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { UserService } from '../../../shared/service/user.service';
import { FormService } from '../../../shared/service/form.service';
import { Router } from '@angular/router';
import { DocumentExportService } from '../service/document-export.service';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ToastsService } from '../../../shared/service/toasts.service';
import { DocumentService } from '../service/document.service';
import { TemplateForm } from '../models/template-form';
import { Logger } from '../../../shared/logger/logger.service';
import { isPlatformBrowser } from '@angular/common';
import { Global } from '../../../../environments/global';

export interface RowDocument {
  creator: string;
  templateName: string;
  templateDescription: string;
  publicity: string;
  dateEdited: string;
  dateObserved: string;
  namedPlaceName: string;
  locality: string;
  unitCount: number;
  observer: string;
  formID: string;
  form: string;
  formViewerType: string;
  id: string;
  locked: boolean;
  index: number;
  _editUrl: string;
}

export interface DownloadEvent {
  fileType: string;
  documentId?: string;
}

export interface TemplateEvent {
  name: string;
  description: string;
  type: 'gathering'|'unit';
  documentID: string;
}

export interface LabelEvent {
  documentIDs: string[];
  year: number;
  label: string;
}

@Component({
  selector: 'laji-own-datatable',
  templateUrl: './own-datatable.component.html',
  styleUrls: ['./own-datatable.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnDatatableComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() year: number;
  @Input() loadError = '';
  @Input() showDownloadAll = true;
  @Input() showPrintLabels = true;
  @Input() admin = false;
  @Input() selected: RowDocument[] = [];
  @Input() columnNameMapping: any;
  @Input() onlyTemplates = false;
  @Input() actions: string[]|false = ['edit', 'view', 'template', 'download', 'stats', 'delete'];
  @Input() labels: string[] = [];
  @Input() templateForm: TemplateForm = {
    name: '',
    description: '',
    type: 'gathering'
  };
  @Output() documentClicked = new EventEmitter<string>();
  @Output() download = new EventEmitter<DownloadEvent>();
  @Output() template = new EventEmitter<TemplateEvent>();
  @Output() delete = new EventEmitter<string>();
  @Output() label = new EventEmitter<LabelEvent>();

  deleteRow: any;
  deleting = false;
  templateDocumentID: string;
  printState: 'none'|'select' = 'none';

  totalMessage = '';
  publicity = Document.PublicityRestrictionsEnum;
  useColumns = [];
  allColumns = [
    {prop: 'templateName', mode: 'small'},
    {prop: 'templateDescription', mode: 'small'},
    {prop: 'dateEdited', mode: 'medium'},
    {prop: 'dateObserved', mode: 'small'},
    {prop: 'namedPlaceName', mode: 'small'},
    {prop: 'locality', mode: 'small'},
    {prop: 'taxon', mode: 'small'},
    {prop: 'unitCount', mode: 'medium'},
    {prop: 'observer', mode: 'large'},
    {prop: 'form', mode: 'large'},
    {prop: 'id', mode: 'large'}
  ];
  allRows: RowDocument[] = [];
  visibleRows: RowDocument[];
  userId;
  filterBy: string;
  selectionType: string;
  selectedLabel: string;

  displayMode: string;
  defaultSort: any;

  usersId$: Subscription;

  downloadedDocumentId: string;
  fileType = 'csv';

  _columns = ['dateEdited', 'dateObserved', 'locality', 'taxon', 'unitCount', 'observer', 'form', 'id'];
  _goToStartAfterViewCheck = false;

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('chooseFileTypeModal') public modal: ModalDirective;
  @ViewChild('saveAsTemplate') public templateModal: ModalDirective;
  @ViewChild('deleteModal') public deleteModal: ModalDirective;

  constructor(
    @Inject(WINDOW) private window: Window,
    @Inject(PLATFORM_ID) private platformID: object,
    private translate: TranslateService,
    private router: Router,
    private userService: UserService,
    private formService: FormService,
    private localizeRouterService: LocalizeRouterService,
    private documentExportService: DocumentExportService,
    private documentService: DocumentService,
    private toastService: ToastsService,
    private logger: Logger,
    private cd: ChangeDetectorRef
  ) {}

  @Input()
  set documents(docs: RowDocument[]) {
    if (!docs) {
      this.allRows = [];
      this.visibleRows = [];
      return;
    }
    this.allRows = docs;
    this.updateFilteredRows();

    // Table is not sorted with external sorter on initial load. So this is here to make sure that when data is received it's sorted.
    setTimeout(() => {
      this.table.onColumnSort({sorts: this.defaultSort});
    });
  }

  @Input()
  set columns(cols: string[]) {
    this._columns = cols;
    if (Array.isArray(this._columns)) {
      this.initColumns();
    }
  }

  ngOnInit() {
    this.updateTranslations();

    this.updateDisplayMode();
    this.usersId$ = this.userService.getUser().pipe(
      map(user => user.id))
      .subscribe(userId => {
        this.userId = userId;
        this.cd.markForCheck();
      });
  }

  ngOnDestroy() {
    this.usersId$.unsubscribe();
  }

  ngAfterViewChecked() {
    if (this._goToStartAfterViewCheck) {
      this._goToStartAfterViewCheck = false;
      this.table.offset = 0;
    }
  }

  goToStart(goToStart = true) {
    if (!goToStart) {
      return;
    }
    if (this.table) {
      this.table.offset = 0;
    } else {
      this._goToStartAfterViewCheck = true;
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateDisplayMode();
  }

  updateFilter(event) {
    this.filterBy = event.target.value.toLowerCase();
    this.updateFilteredRows();
  }

  updateFilteredRows(goToStart = true) {
    const val = this.filterBy;
    const columns = this.useColumns;

    this.visibleRows = this.allRows.reduce((cumulative, row, idx) => {
      for (let i = 0; i < columns.length; i++) {
        const rowValue = String(row[columns[i].prop]);
        if (rowValue && (rowValue.toLowerCase().indexOf(val) !== -1 || !val)) {
          cumulative.push({...row, index: idx});
          break;
        }
      }
      return cumulative;
    }, []);

    this.goToStart(goToStart);
  }

  showMakeTemplate(row: RowDocument): boolean {
    if (this.actions === false || this.onlyTemplates === true || this.actions.indexOf('template') === -1) {
      return false;
    }
    return row && row.formID && Global.canHaveTemplate.indexOf(row.formID) > -1;
  }

  rowIdentity(row: RowDocument) {
    return row.id;
  }

  showViewer(docId: string) {
    this.documentClicked.emit(docId);
  }

  deleteDialog(row: RowDocument) {
    if (row.id) {
      this.deleteRow = row;
      this.deleting = false;
      this.deleteModal.show();
    } else {
      this.translate.get('delete.noId')
        .subscribe((value) => this.toastService.showError(value));
    }
  }

  deleteDocument() {
    this.allRows = [
      ...this.allRows.slice(0, this.deleteRow.index),
      ...this.allRows.slice(this.deleteRow.index + 1)
    ];
    this.updateFilteredRows(false);
    this.cd.markForCheck();
    this.deleteModal.hide();
    this.delete.emit(this.deleteRow.id);
  }

  makeTemplate(row: RowDocument) {
    if (!row.id) {
      return;
    }
    this.templateDocumentID = row.id;
    this.templateModal.show();
  }

  saveTemplate() {
    this.templateModal.hide();
    if (!this.templateDocumentID) {
      this.translate.get('template.missingDocument')
        .subscribe((value) => this.toastService.showError(value));
      return;
    }
    this.template.emit({
      ...this.templateForm,
      documentID: this.templateDocumentID
    });
  }

  openChooseFileTypeModal(docId?: string) {
    this.downloadedDocumentId = docId;
    this.modal.show();
  }

  toggleExpandRow(row: RowDocument) {
    this.table.rowDetail.toggleExpandRow(row);
  }

  onSort(event) {
    const rows = [...this.visibleRows];
    event.sorts.forEach((sort) => {
      const comparator = this.comparator(sort.prop);
      const dir = sort.dir === 'asc' ? 1 : -1;
      rows.sort((a, b) => dir * comparator(a[sort.prop], b[sort.prop]));
    });
    this.visibleRows = rows;
  }

  /**
   * When using comparator input these functions are called all the time! Preventing buttons and events from firing
   *
   * @returns any
   */
  comparator(prop) {
    if (prop === 'dateObserved') {
      return (a, b) => {
        a = (a || '').split('-')[0].trim().split('.').reverse().join('');
        b = (b || '').split('-')[0].trim().split('.').reverse().join('');
        return b - a;
      };
    } else if (prop === 'dateEdited') {
      return (a, b) => {
        a = (a || '').split(' ');
        b = (b || '').split(' ');
        a = a.length > 1 ?
          a[0].trim().split('.').reverse().join('') + a[1].replace(':', '') :
          a[0].trim().split('.').reverse().join('');
        b = b.length > 1 ?
          b[0].trim().split('.').reverse().join('') + b[1].replace(':', '') :
          b[0].trim().split('.').reverse().join('');
        return b - a;
      };
    } else if (prop === 'unitCount') {
      return (a, b) => b - a;
    }
    return (a, b) => {
      return ('' + a).localeCompare('' + b);
    };
  }

  getDefaultSort() {
    if (this.useColumns && this.useColumns.length > 0) {
      return [{prop: this.useColumns[0].prop, dir: 'asc'}];
    }
    return [{ prop: 'dateEdited', dir: 'asc' }];
  }

  private updateTranslations() {
    this.translate.get('haseka.submissions.total').subscribe((value) => {
      this.totalMessage = value;
      this.cd.markForCheck();
    });
  }

  private initColumns() {
    const useCols = [];
    this._columns.map(col => {
      const column = this.allColumns.find((value) => value.prop === col);
      if (column) {
        useCols.push(column);
      }
    });
    this.useColumns = useCols;
    this.defaultSort = this.getDefaultSort();
  }

  private updateDisplayMode() {
    if (!isPlatformBrowser(this.platformID)) {
      return;
    }
    const width = this.window.innerWidth;

    if (width > 1150) {
      if (this.table) {
        this.table.rowDetail.collapseAllRows();
      }
      this.displayMode = 'large';
    } else if (width > 570) {
      this.displayMode = 'medium';
    } else {
      this.displayMode = 'small';
    }
  }

  onSelect(event: any) {
    this.selected = event.selected;
  }

  doLabels() {
    if (this.printState === 'none') {
      this.selectionType = 'checkbox';
      this.printState = 'select';
    } else if (this.printState === 'select') {
      this.selectionType = undefined;
      this.printState = 'none';
      this.label.emit({
        documentIDs: this.selected.map(doc => doc.id),
        year: this.year,
        label: this.selectedLabel
      });
    }
  }
}
