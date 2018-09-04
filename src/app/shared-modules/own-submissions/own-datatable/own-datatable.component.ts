import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { WINDOW } from '@ng-toolkit/universal';
import { environment } from '../../../../environments/environment';
import { Document } from '../../../shared/model/Document';
import { DocumentInfoService } from '../service/document-info.service';
import { TranslateService } from '@ngx-translate/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { UserService } from '../../../shared/service/user.service';
import { forkJoin as ObservableForkJoin, from as ObservableFrom, Observable, of as ObservableOf, Subscription } from 'rxjs';
import { Person } from '../../../shared/model/Person';
import { FormService } from '../../../shared/service/form.service';
import { RouterChildrenEventService } from '../service/router-children-event.service';
import { Router } from '@angular/router';
import { DocumentExportService } from '../service/document-export.service';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ToastsService } from '../../../shared/service/toasts.service';
import { DocumentService } from '../service/document.service';
import { TemplateForm } from '../models/template-form';
import { Logger } from '../../../shared/logger/logger.service';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'laji-own-datatable',
  templateUrl: './own-datatable.component.html',
  styleUrls: ['./own-datatable.component.css'],
  providers: [DocumentExportService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnDatatableComponent implements OnInit, OnDestroy, OnChanges {
  @Input() year: number;
  @Input() documents: Document[];
  @Input() loadError = '';
  @Input() showDownloadAll = true;
  @Input() useInternalDocumentViewer = false;
  @Input() columns = ['dateEdited', 'dateObserved', 'locality', 'unitCount', 'observer', 'form', 'id'];
  @Input() onlyTemplates = false;
  @Input() actions: string[]|false = ['edit', 'view', 'template', 'download', 'stats', 'delete'];
  @Output() documentClicked = new EventEmitter<Document>();

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
  rows: any[];
  userId;

  displayMode: string;
  defaultSort: any;

  rowData$: Subscription;
  saveTemplate$: Subscription;
  delete$: Subscription;
  usersId$: Subscription;

  downloadedDocumentIdx: number;
  fileType = 'csv';

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
    private eventService: RouterChildrenEventService,
    private localizeRouterService: LocalizeRouterService,
    private documentExportService: DocumentExportService,
    private documentService: DocumentService,
    private toastService: ToastsService,
    private logger: Logger,
    private cd: ChangeDetectorRef,
    private labelService: TriplestoreLabelService
  ) {}

  ngOnInit() {
    this.initColumns();
    this.updateTranslations();

    this.updateDisplayMode();
    this.usersId$ = this.userService.getUser()
      .map(user => user.id)
      .subscribe(userId => {
        this.userId = userId;
        this.cd.markForCheck();
      });
  }

  ngOnDestroy() {
    this.usersId$.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documents'] && !changes['documents'].isFirstChange()) {
      this.updateRows();
    }
    if (changes['column'] && !changes['column'].isFirstChange()) {
      this.initColumns();
    }
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
    if (!Array.isArray(this.columns)) {
      return;
    }
    const useCols = [];
    this.columns.map(col => {
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
    if (this.actions === false || this.onlyTemplates === true) {
      return false;
    }
    if (row && row.formID && row.formID === environment.wbcForm) {
      return false;
    }
    return this.actions.indexOf('template') > -1;
  }

  private updateRows() {
    if (!this.documents) {
      this.temp = [];
      this.rows = [];
      return;
    }

    this.rows = null;
    if (this.rowData$) {
      this.rowData$.unsubscribe();
    }

    this.rowData$ = ObservableFrom(this.documents.map((doc, i) => {
      return this.setRowData(doc, i);
    }))
      .mergeAll()
      .toArray()
      .subscribe((array) => {
        this.temp = array;
        this.rows = this.temp;
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

  showViewer(row: any) {
    const doc = this.documents[row.index];
    if (!this.useInternalDocumentViewer) {
      this.eventService.showViewerClicked(doc);
    } else {
      this.documentClicked.emit(doc);
    }
  }

  toEditPage(row: any) {
    const formId = this.documents[row.index].formID;
    this.router.navigate(
      this.localizeRouterService.translateRoute([this.formService.getEditUrlPath(formId, row.id)])
    );
  }

  deleteDialog(row: any) {
    const document: any = this.documents[row.index] || {};
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
          this.documents = [
            ...this.documents.slice(0, this.deleteRow.index),
            ...this.documents.slice(this.deleteRow.index + 1)
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
      )
  }

  makeTemplate(row: any) {
    this.templateForm.document = this.documents[row.index] || null;
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

  openChooseFileTypeModal(docIdx: number) {
    this.downloadedDocumentIdx = docIdx;
    this.modal.show();
  }

  download() {
    if (this.downloadedDocumentIdx === -1) {
      this.documentExportService.downloadDocuments(this.documents, this.year, this.fileType);
    } else {
      this.documentExportService.downloadDocument(this.documents[this.downloadedDocumentIdx], this.fileType);
    }
  }

  toStatisticsPage(docId: string) {
    this.router.navigate(this.localizeRouterService.translateRoute(['/theme/linjalaskenta/statistics/' + docId]));
  }

  toggleExpandRow(row: any) {
    this.table.rowDetail.toggleExpandRow(row);
  }

  onSort(event) {
    const rows = [...this.rows];
    event.sorts.forEach((sort) => {
      const comparator = this.comparator(sort.prop);
      const dir = sort.dir === 'asc' ? 1 : -1;
      rows.sort((a, b) => dir * comparator(a[sort.prop], b[sort.prop]))
    });
    this.rows = rows;
  }

  /**
   * When using comparator input these functions are called all the time! Preventing buttons and events from firing
   *
   * @param prop
   * @returns {any}
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

  private setRowData(document: Document, idx: number): Observable<any> {
    return this.getForm(document.formID).switchMap((form) => {
      const gatheringInfo = DocumentInfoService.getGatheringInfo(document, form);

      return ObservableForkJoin(
        this.getLocality(gatheringInfo, document.namedPlaceID),
        this.getObservers(document.gatheringEvent && document.gatheringEvent.leg),
        this.getNamedPlaceName(document.namedPlaceID)
      ).pipe(
        map(data => {
          const locality = data[0], observers = data[1], npName = data[2];
          let dateObserved = gatheringInfo.dateBegin ? moment(gatheringInfo.dateBegin).format('DD.MM.YYYY') : '';
          dateObserved += gatheringInfo.dateEnd ? ' - ' + moment(gatheringInfo.dateEnd).format('DD.MM.YYYY') : '';

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
            index: idx
          };
        })
      )
    });
  }

  private getLocality(gatheringInfo: any, namedPlaceID): Observable<string> {
    let locality$ = ObservableOf(gatheringInfo);
    const npID = gatheringInfo.namedPlaceID || namedPlaceID;

    if (!gatheringInfo.locality && npID) {
      locality$ = this.labelService.get(npID, 'multi')
        .map(namedPlace => ({...gatheringInfo, locality: namedPlace}));
    }

    return locality$
      .switchMap((gathering) => this.translate.get('haseka.users.latest.localityMissing')
        .map(missing => gathering.locality || missing));
  }

  private getObservers(userArray: string[] = []): Observable<string> {
    return ObservableFrom(userArray.map((userId) => {
      if (userId.indexOf('MA.') === 0) {
        return this.userService.getUser(userId)
          .map((user: Person) => {
            return user.fullName;
          });
      }
      return ObservableOf(userId);
    }))
      .mergeAll()
      .toArray()
      .map((array) => {
        return array.join(', ');
      });
  }

  private getForm(formId: string): Observable<any> {
    if (this.formsById[formId]) { return ObservableOf(this.formsById[formId]); }

    return this.formService
      .getForm(formId, this.translate.currentLang)
      .do((res: any) => {
        this.formsById[formId] = res;
      });
  }

  private getNamedPlaceName(npId: string): Observable<string> {
    if (!npId || this.columns.indexOf('namedPlaceName') === -1) {return ObservableOf(''); }

    if (this.namedPlaceNames[npId]) { return ObservableOf(this.namedPlaceNames[npId]); }

    return this.labelService.get(npId, 'multi');
  }
}
