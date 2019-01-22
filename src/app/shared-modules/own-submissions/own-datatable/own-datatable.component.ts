import { toArray, mergeAll, tap, switchMap, map, catchError } from 'rxjs/operators';
import {
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
import { DocumentInfoService } from '../../../shared/service/document-info.service';
import { TranslateService } from '@ngx-translate/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { UserService } from '../../../shared/service/user.service';
import { forkJoin as ObservableForkJoin, from as ObservableFrom, Observable, of as ObservableOf, Subscription } from 'rxjs';
import { Person } from '../../../shared/model/Person';
import { FormService } from '../../../shared/service/form.service';
import { Router } from '@angular/router';
import { DocumentExportService } from '../service/document-export.service';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ToastsService } from '../../../shared/service/toasts.service';
import { DocumentService } from '../service/document.service';
import { TemplateForm } from '../models/template-form';
import { Logger } from '../../../shared/logger/logger.service';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';
import * as moment from 'moment';
import { isPlatformBrowser } from '@angular/common';
import { Global } from '../../../../environments/global';
import { SearchDocument } from '../own-submissions.component';


interface ExtendedSearchDocument extends SearchDocument {
  _editUrl?: string;
}

interface RowDocument {
  creator: string;
  templateName: string;
  templateDescription: string;
  publicity: string;
  dateEdited: string;
  dateObserved: string;
  namedPlaceName: string;
  locality: string;
  unitCount: string;
  observer: string;
  formID: string;
  form: string;
  id: string;
  locked: boolean;
  index: number;
  _editUrl: string;
}

export interface DownloadEvent {
  fileType: string;
  documentId?: string;
}

@Component({
  selector: 'laji-own-datatable',
  templateUrl: './own-datatable.component.html',
  styleUrls: ['./own-datatable.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnDatatableComponent implements OnInit, OnDestroy {
  @Input() year: number;
  @Input() loadError = '';
  @Input() showDownloadAll = true;
  @Input() admin = false;
  @Input() columnNameMapping: any;
  @Input() onlyTemplates = false;
  @Input() actions: string[]|false = ['edit', 'view', 'template', 'download', 'stats', 'delete'];
  @Output() documentClicked = new EventEmitter<string>();
  @Output() ready = new EventEmitter<void>();
  @Output() download = new EventEmitter<DownloadEvent>();

  formsById = {};
  namedPlaceNames = {};
  deleteRow: any;
  deleting = false;

  templateForm: TemplateForm = {
    name: '',
    description: '',
    type: 'gathering'
  };

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
    {prop: 'unitCount', mode: 'medium'},
    {prop: 'observer', mode: 'large'},
    {prop: 'form', mode: 'large'},
    {prop: 'id', mode: 'large'}
  ];
  temp = [];
  rows: RowDocument[];
  userId;

  displayMode: string;
  defaultSort: any;

  rowData$: Subscription;
  saveTemplate$: Subscription;
  delete$: Subscription;
  usersId$: Subscription;

  downloadedDocumentId: string;
  fileType = 'csv';

  _documents: ExtendedSearchDocument[];
  _columns = ['dateEdited', 'dateObserved', 'locality', 'unitCount', 'observer', 'form', 'id'];

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
    private cd: ChangeDetectorRef,
    private labelService: TriplestoreLabelService
  ) {}

  @Input()
  set documents(docs: SearchDocument[]) {
    if (!docs) {
      this._documents = [];
      this.rows = [];
      return;
    }
    this._documents = docs.map(row => ({
      ...row,
      _editUrl: this.formService.getEditUrlPath(row.formID, row.id)
    }));
    this.updateRows();
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

  @HostListener('window:resize')
  onResize() {
    this.updateDisplayMode();
  }

  private initRows() {
    this.updateRows();
    this.updateTranslations();
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

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    const columns = this.useColumns;

    this.rows = this.temp.filter(function (row) {
      for (let i = 0; i < columns.length; i++) {
        const rowValue = String(row[columns[i].prop]);
        if (rowValue && (rowValue.toLowerCase().indexOf(val) !== -1 || !val)) {
          return true;
        }
      }
      return false;
    });

    this.table.offset = 0;
  }

  showMakeTemplate(row): boolean {
    if (this.actions === false || this.onlyTemplates === true || this.actions.indexOf('template') === -1) {
      return false;
    }
    return row && row.formID && Global.canHaveTemplate.indexOf(row.formID) > -1;
  }

  private updateRows() {
    this.rowData$ = ObservableFrom(this._documents.map((doc, i) => this.setRowData(doc, i))).pipe(
      mergeAll(),
      toArray()
    ).subscribe((array) => {
      this.temp = array;
      this.rows = this.temp;
      this.ready.emit();
      this.cd.markForCheck();
      // Table is not sorted with external sorter on initial load. So this is here to make sure that when data is received it's sorted.
      setTimeout(() => {
        this.table.onColumnSort({sorts: this.defaultSort});
      });
    });
  }

  private updateTranslations() {
    this.translate.get('haseka.submissions.total').subscribe((value) => {
      this.totalMessage = value;
      this.cd.markForCheck();
    });
  }

  rowIdentity(row) {
    return row.id;
  }

  showViewer(docId: string) {
    this.documentClicked.emit(docId);
  }

  deleteDialog(row: any) {
    const document: any = this._documents[row.index] || {};
    if (document.id && row.id === document.id) {
      this.deleteRow = row;
      this.deleting = false;
      this.deleteModal.show();
    } else {
      this.translate.get('delete.noId')
        .subscribe((value) => this.toastService.showError(value));
    }
  }

  deleteDocument() {
    if (this.delete$) {
      return;
    }
    this.deleting = true;
    this.delete$ = this.documentService.deleteDocument(this.deleteRow.id)
      .subscribe(
        () => {
          this._documents = [
            ...this._documents.slice(0, this.deleteRow.index),
            ...this._documents.slice(this.deleteRow.index + 1)
          ];
          this.initRows();
          this.translate.get('delete.success')
            .subscribe((value) => this.toastService.showSuccess(value));
          this.deleteModal.hide();
          this.delete$ = null;
          this.cd.markForCheck();
        },
        (err) => {
          this.translate.get('delete.error')
            .subscribe((value) => this.toastService.showError(value));
          this.logger.error('Deleting failed', err);
          this.deleteModal.hide();
          this.delete$ = null;
          this.cd.markForCheck();
        }
      );
  }

  makeTemplate(row: any) {
    // TODO FIX THIS
    // this.templateForm.document = this._documents[row.index] || null;
    this.templateModal.show();
  }

  saveTemplate() {
    this.templateModal.hide();
    if (this.saveTemplate$) {
      return;
    }
    if (!this.templateForm.document) {
      this.translate.get('template.missingDocument')
        .subscribe((value) => this.toastService.showError(value));
      return;
    }
    this.saveTemplate$ = this.documentService.saveTemplate(this.templateForm)
      .subscribe(
        () => {
          this.translate.get('template.success')
            .subscribe((value) => this.toastService.showSuccess(value));
          this.templateForm = {
            name: '',
            description: '',
            type: 'gathering'
          };
          this.saveTemplate$ = null;
          this.cd.markForCheck();
        },
        (err) => {
          this.translate.get('template.error')
            .subscribe((value) => this.toastService.showError(value));
          this.logger.error('Template saving failed', err);
          this.saveTemplate$ = null;
          this.cd.markForCheck();
        });
  }

  openChooseFileTypeModal(docId?: string) {
    this.downloadedDocumentId = docId;
    this.modal.show();
  }

  toggleExpandRow(row: any) {
    this.table.rowDetail.toggleExpandRow(row);
  }

  onSort(event) {
    const rows = [...this.rows];
    event.sorts.forEach((sort) => {
      const comparator = this.comparator(sort.prop);
      const dir = sort.dir === 'asc' ? 1 : -1;
      rows.sort((a, b) => dir * comparator(a[sort.prop], b[sort.prop]));
    });
    this.rows = rows;
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

  private setRowData(document: ExtendedSearchDocument, idx: number): Observable<any> {
    return this.getForm(document.formID).pipe(
      switchMap((form) => {
        const gatheringInfo = DocumentInfoService.getGatheringInfoFromSearchDocument(document, form);

        return ObservableForkJoin(
          this.getLocality(gatheringInfo, document.namedPlaceID),
          this.getObservers(document['gatheringEvent.leg']),
          this.getNamedPlaceName(document.namedPlaceID)
        ).pipe(
          map(data => {
            const locality = data[0], observers = data[1], npName = data[2];
            const dateObservedEnd = gatheringInfo.dateEnd ? moment(gatheringInfo.dateEnd).format('DD.MM.YYYY') : '';
            let dateObserved = gatheringInfo.dateBegin ? moment(gatheringInfo.dateBegin).format('DD.MM.YYYY') : '';
            if (dateObservedEnd && dateObservedEnd !== dateObserved) {
              dateObserved += ' - ' + dateObservedEnd;
            }
            return {
              creator: document.creator,
              templateName: document.templateName,
              templateDescription: document.templateDescription,
              publicity: document.publicityRestrictions,
              dateEdited: document.dateEdited ? moment(document.dateEdited).format('DD.MM.YYYY HH:mm') : '',
              dateObserved: dateObserved,
              namedPlaceName: npName,
              locality: locality,
              unitCount: gatheringInfo.unitList.length,
              observer: observers,
              formID: document.formID,
              form: form.title || document.formID,
              id: document.id,
              locked: !!document.locked,
              index: idx,
              _editUrl: document._editUrl
            };
          })
        );
      })
    );
  }

  private getLocality(gatheringInfo: any, namedPlaceID): Observable<string> {
    let locality$ = ObservableOf(gatheringInfo);
    const npID = gatheringInfo.namedPlaceID || namedPlaceID;

    if (!gatheringInfo.locality && npID) {
      locality$ = this.labelService.get(npID, 'multi').pipe(
        map(namedPlace => ({...gatheringInfo, locality: namedPlace})));
    }

    return locality$.pipe(
      switchMap((gathering) => this.translate.get('haseka.users.latest.localityMissing').pipe(
        map(missing => gathering.locality || missing))));
  }

  private getObservers(userArray: string[] = []): Observable<string> {
    return ObservableFrom(userArray.map((userId) => {
      if (userId.indexOf('MA.') === 0) {
        return this.userService.getUser(userId).pipe(
          map((user: Person) => {
            return user.fullName;
          }));
      }
      return ObservableOf(userId);
    })).pipe(
      mergeAll(),
      toArray()
    ).pipe(
      map((array) => {
        return array.join(', ');
      }));
  }

  private getForm(formId: string): Observable<any> {
    if (this.formsById[formId]) { return ObservableOf(this.formsById[formId]); }

    return this.formService.getForm(formId, this.translate.currentLang).pipe(
      catchError((err) => {
        this.logger.error('Failed to load form ' + formId, err);
        return ObservableOf({id: formId});
      }),
      tap((res: any) => {
        this.formsById[formId] = res;
      }));
  }

  private getNamedPlaceName(npId: string): Observable<string> {
    if (!npId || this._columns.indexOf('namedPlaceName') === -1) {return ObservableOf(''); }

    if (this.namedPlaceNames[npId]) { return ObservableOf(this.namedPlaceNames[npId]); }

    return this.labelService.get(npId, 'multi');
  }
}
