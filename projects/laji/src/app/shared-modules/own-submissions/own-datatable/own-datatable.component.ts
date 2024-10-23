import { Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Document } from '../../../shared/model/Document';
import { TranslateService } from '@ngx-translate/core';
import { DatatableComponent } from '@achimha/ngx-datatable';
import { UserService } from '../../../shared/service/user.service';
import { FormService } from '../../../shared/service/form.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PlatformService } from '../../../root/platform.service';
import { Form } from '../../../shared/model/Form';
import { SelectionType } from '@achimha/ngx-datatable';
import { DeleteOwnDocumentService } from '../../../shared/service/delete-own-document.service';
import { ModalComponent } from 'projects/laji-ui/src/lib/modal/modal/modal.component';

export interface RowDocument {
  creator: string;
  templateName: string;
  templateDescription: string;
  publicity: string;
  dateEdited: string;
  dateObserved: string;
  dateCreated: string;
  namedPlaceName: string;
  locality: string;
  gatheringsCount: number;
  unitCount: number;
  observer: string;
  formID: string;
  form: string;
  id: string;
  publicityRestrictions: string;
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
  documentID: string;
}

export interface LabelFilter {
  onlyPreservedSpecimen?: boolean;
  detLaterThan?: string|Date;
  multiplyByCount?: boolean;
}

export interface LabelEvent {
  documentIDs: string[];
  year: string;
  label: string;
  filter: LabelFilter;
}

export interface OwnDatatableColumn {
  prop: string;
  mode: string;
}

@Component({
  selector: 'laji-own-datatable',
  templateUrl: './own-datatable.component.html',
  styleUrls: ['./own-datatable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('labelFilter', [
      state('close', style({
        height: '0',
        padding: '0 15px'
      })),
      state('open', style({
        height: '*',
        padding: '*'
      })),
      transition('close=>open', animate('500ms ease-out')),
      transition('open=>close', animate('100ms ease-in'))
    ]),
  ]
})
export class OwnDatatableComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() year = '';
  @Input() loadError = '';
  @Input() showDownloadAll = true;
  @Input() showPrintLabels = true;
  @Input() admin = false;
  @Input() selected: RowDocument[] = [];
  @Input() columnNameMapping: any;
  @Input() onlyTemplates = false;
  @Input() actions: string[]|false = ['edit', 'view', 'download', 'stats', 'delete'];
  @Input() labels: string[] = [];
  @Output() documentClicked = new EventEmitter<string>();
  @Output() download = new EventEmitter<DownloadEvent>();
  @Output() template = new EventEmitter<TemplateEvent>();
  @Output() delete = new EventEmitter<string>();
  @Output() label = new EventEmitter<LabelEvent>();

  deleteRow: any;
  deleting = false;
  printState: 'none'|'select' = 'none';

  totalMessage = '';
  publicity = Document.PublicityRestrictionsEnum;
  useColumns: OwnDatatableColumn[] = [];
  allColumns: OwnDatatableColumn[] = [
    {prop: 'templateName', mode: 'small'},
    {prop: 'templateDescription', mode: 'small'},
    {prop: 'dateEdited', mode: 'small'},
    {prop: 'dateObserved', mode: 'small'},
    {prop: 'namedPlaceName', mode: 'large'},
    {prop: 'locality', mode: 'medium'},
    {prop: 'taxon', mode: 'medium'},
    {prop: 'gatheringsCount', mode: 'large'},
    {prop: 'unitCount', mode: 'large'},
    {prop: 'observer', mode: 'large'},
    {prop: 'form', mode: 'large'},
    {prop: 'id', mode: 'large'},
    {prop: 'publicityRestrictions', mode: 'large'}
  ];
  allRows: RowDocument[] = [];
  visibleRows: RowDocument[] = [];
  filterBy = '';
  selectionType: SelectionType;
  selectedLabel = '';
  labelLoading = false;

  displayMode = 'medium';
  defaultSort: any;

  usersId?: string;
  usersIdSub!: Subscription;

  subscriptionDeleteOwnDocument!: Subscription;

  downloadedDocumentId?: string;
  fileType = 'csv';

  _columns = ['dateEdited', 'dateObserved', 'locality', 'taxon', 'gatheringsCount', 'unitCount', 'observer', 'form', 'id', 'publicityRestrictions'];
  _goToStartAfterViewCheck = false;
  private lastSort: any;

  @ViewChild(DatatableComponent) table!: DatatableComponent;
  @ViewChild('chooseFileTypeModal', { static: true }) public modal!: ModalComponent;
  @ViewChild('saveAsTemplate', { static: true }) public templateModal!: ModalComponent;
  @ViewChild('deleteModal', { static: true }) public deleteModal!: ModalComponent;

  labelFilter$: Observable<LabelFilter>;
  forms$: Observable<{[id: string]: Form.List}>;

  private readonly labelSettingsKey = 'label-filters';

  constructor(
    private platformService: PlatformService,
    private translate: TranslateService,
    private userService: UserService,
    private formService: FormService,
    private toastService: ToastsService,
    private cd: ChangeDetectorRef,
    private deleteOwnDocument: DeleteOwnDocumentService
  ) {
    this.labelFilter$ = this.userService.getUserSetting<LabelFilter>(this.labelSettingsKey).pipe(
      map(value => value || {})
    );
    this.forms$ = this.formService.getAllForms().pipe(
      map(forms => forms.reduce((fs, f) => ({...fs, [f.id]: f}), {}))
    );
  }

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
      this.updateFilteredRows();
    }
  }

  ngOnInit() {
    this.updateTranslations();

    this.updateDisplayMode();
    this.usersIdSub = this.userService.user$.pipe(
      map(user => user?.id)
    ).subscribe(id => this.usersId = id);

    this.subscriptionDeleteOwnDocument = this.deleteOwnDocument.childEventListner().subscribe(id => {
      if (id !== null) {
        this.allRows = this.allRows.filter(row => row.id !== id);
        this.updateFilteredRows(false);
        this.cd.markForCheck();
      }
    });
  }

  ngAfterViewChecked() {
    if (this._goToStartAfterViewCheck) {
      this._goToStartAfterViewCheck = false;
      if (this.table) {
        this.table.offset = 0;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.usersIdSub) {
      this.usersIdSub.unsubscribe();
    }

    this.subscriptionDeleteOwnDocument?.unsubscribe();
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
      for (const col of columns) {
        const rowValue = String(row[col.prop]);
        if (rowValue && (rowValue.toLowerCase().indexOf(val) !== -1 || !val)) {
          cumulative.push({...row, index: idx});
          break;
        }
      }
      return cumulative;
    }, []);

    this.goToStart(goToStart);
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

  openChooseFileTypeModal(docId?: string) {
    this.downloadedDocumentId = docId;
    this.modal.show();
  }

  toggleExpandRow(row: RowDocument) {
    this.table.rowDetail.toggleExpandRow(row);
  }

  onSort(event) {
    this.lastSort = event;
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
    return (a, b) => ('' + a).localeCompare('' + b);
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
    const useCols: OwnDatatableColumn[] = [];
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
    if (this.platformService.isServer) {
      return;
    }
    const width = window.innerWidth;

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

  cancelLabels() {
    this.selectionType = undefined;
    this.printState = 'none';
    this.resortTable();
  }

  doLabels() {
    if (this.printState === 'none') {
      this.selectionType = SelectionType.checkbox;
      this.printState = 'select';
      this.resortTable();
    } else if (this.printState === 'select' && !this.labelLoading) {
      this.labelLoading = true;
      this.userService.getUserSetting<LabelFilter>(this.labelSettingsKey).pipe(
        take(1),
      ).subscribe(settings => {
        this.label.emit({
          documentIDs: this.selected.map(doc => doc.id),
          year: this.year,
          label: this.selectedLabel,
          filter: settings || {}
        });
      }, () => {
          this.labelLoading = false;
          this.cd.markForCheck();
        }
      );
    }
  }

  updateLabelFilter(key: keyof LabelFilter, value: any) {
    this.userService.getUserSetting<LabelFilter>(this.labelSettingsKey).pipe(
      map(settings => ({...settings, [key]: value})),
      take(1)
    ).subscribe(settings => this.userService.setUserSetting(this.labelSettingsKey, settings));
  }

  private resortTable() {
    if (this.lastSort) {
      // Sorting is lost when sorted by date type column and select type is given. This is work around for that issue.
      setTimeout(() => {
        this.table.onColumnSort(this.lastSort);
      });
    }
  }
}
