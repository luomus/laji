import {
  Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import { Document } from '../../../shared/model/Document';
import { DocumentInfoService } from '../service/document-info.service';
import { TranslateService } from '@ngx-translate/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { UserService } from '../../../shared/service/user.service';
import { Observable } from 'rxjs/Observable';
import { Person } from '../../../shared/model/Person';
import { FormService } from '../../../shared/service/form.service';
import { RouterChildrenEventService } from '../service/router-children-event.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { DocumentExportService } from './document_export.service';
import { WindowRef } from '../../../shared/windows-ref';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ToastsService } from '../../../shared/service/toasts.service';
import { DocumentService } from '../service/document.service';
import { TemplateForm } from '../models/template-form';
import { Logger } from '../../../shared/logger/logger.service';


@Component({
  selector: 'laji-own-datatable',
  templateUrl: './own-datatable.component.html',
  styleUrls: ['./own-datatable.component.css'],
  providers: [DocumentExportService]
})
export class OwnDatatableComponent implements OnInit, OnDestroy, OnChanges {
  @Input() year: number;
  @Input() documents: Document[];
  @Input() loadError = '';
  @Input() showDownloadAll = true;
  @Input() useInternalDocumentViewer = false;
  @Input() columns = ['dateEdited', 'dateObserved', 'locality', 'unitCount', 'observer', 'form', 'id'];
  @Input() onlyTemplates = false;
  @Output() documentClicked = new EventEmitter();

  formsById = {};
  deleteRow: any;

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
    {prop: 'locality', mode: 'small'},
    {prop: 'unitCount', mode: 'medium'},
    {prop: 'observer', mode: 'large'},
    {prop: 'form', mode: 'large'},
    {prop: 'id', mode: 'large'}
  ];
  temp = [];
  rows: any[];

  displayMode: string;

  subTrans: Subscription;
  rowData$: Subscription;

  downloadedDocumentIdx: number;
  fileType = 'csv';

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('chooseFileTypeModal') public modal: ModalDirective;
  @ViewChild('saveAsTemplate') public templateModal: ModalDirective;
  @ViewChild('deleteModal') public deleteModal: ModalDirective;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private userService: UserService,
    private formService: FormService,
    private eventService: RouterChildrenEventService,
    private localizeRouterService: LocalizeRouterService,
    private documentExportService: DocumentExportService,
    private documentService: DocumentService,
    private toastService: ToastsService,
    private window: WindowRef,
    private logger: Logger
  ) {}

  ngOnInit() {
    this.initColumns();
    this.updateTranslations();

    this.subTrans = this.translate.onLangChange.subscribe(() => {
      this.formsById = {};
      this.initRows();
    });

    this.updateDisplayMode();
  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documents']) {
      this.updateRows();
    }
    if (changes['column']) {
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
    this.useColumns = this.allColumns.filter(column => this.columns.indexOf(column.prop) > -1);
  }

  private updateDisplayMode() {
    const width = this.window.nativeWindow.innerWidth;

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

    this.rowData$ = Observable.from(this.documents.map((doc, i) => {
      return this.setRowData(doc, i);
    }))
      .mergeAll()
      .toArray()
      .subscribe((array) => {
        this.temp = array;
        this.rows = this.temp;
      });
  }

  private updateTranslations() {
    this.translate.get('haseka.submissions.total').subscribe((value) => this.totalMessage = value);
  }

  showViewer(docId: string) {
    if (!this.useInternalDocumentViewer) {
      this.eventService.showViewerClicked(docId);
    } else {
      this.documentClicked.emit(docId);
    }
  }

  toEditPage(row: any) {
    const formId = this.documents[row.index].formID;
    this.router.navigate(
      this.localizeRouterService.translateRoute([this.formService.getEditUrlPath(formId, row.id)])
    );
  }

  deleteDialog(row: any) {
    const document = this.documents[row.index] || {};
    if (document.id && row.id === document.id) {
      this.deleteRow = row;
      this.deleteModal.show();
    } else {
      this.toastService.showError('No id found for the row. Place refresh the page and try again.')
    }
  }

  deleteDocument() {
    this.documentService.deleteDocument(this.deleteRow.id)
      .subscribe(
        () => {
          this.documents = [
            ...this.documents.slice(0, this.deleteRow.index),
            ...this.documents.slice(this.deleteRow.index + 1)
          ];
          this.initRows();
          this.toastService.showSuccess('Observation deleted');
          this.deleteModal.hide();
        },
        (err) => {
          this.toastService.showError('Failed delete. Try again little later');
          this.logger.error('Deleting failed', err);
          this.deleteModal.hide();
        }
      )
  }

  makeTemplate(row: any) {
    this.templateForm.document = this.documents[row.index] || null;
    this.templateModal.show();
  }

  saveTemplate() {
    this.templateModal.hide();
    if (!this.templateForm.document) {
      this.toastService.showError('No document to save!');
      return;
    }
    this.documentService.saveTemplate(this.templateForm)
      .subscribe(
        () => {
          this.toastService.showSuccess('Tempalate saved');
          this.templateForm = {
            name: '',
            description: '',
            type: 'gathering'
          };
        },
        (err) => {
          this.toastService.showError('Failed to save template. Try again little later');
          this.logger.error('Template saving failed', err);
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
    this.router.navigate(this.localizeRouterService.translateRoute(['/vihko/statistics/' + docId]));
  }

  toggleExpandRow(row: any) {
    this.table.rowDetail.toggleExpandRow(row);
  }

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

  private setRowData(document: Document, idx: number): Observable<any> {
    return this.getForm(document.formID).switchMap((form) => {
      const gatheringInfo = DocumentInfoService.getGatheringInfo(document, form);

      return Observable.forkJoin(
        this.getLocality(gatheringInfo),
        this.getObservers(document.gatheringEvent && document.gatheringEvent.leg),
        (locality, observers) => {
          let dateObserved = gatheringInfo.dateBegin ? moment(gatheringInfo.dateBegin).format('DD.MM.YYYY') : '';
          dateObserved += gatheringInfo.dateEnd ? ' - ' + moment(gatheringInfo.dateEnd).format('DD.MM.YYYY') : '';

          return {
            templateName: document.templateName,
            templateDescription: document.templateDescription,
            publicity: document.publicityRestrictions,
            dateEdited: document.dateEdited ? moment(document.dateEdited).format('DD.MM.YYYY HH:mm') : '',
            dateObserved: dateObserved,
            locality: locality,
            unitCount: gatheringInfo.unitList.length,
            observer: observers,
            form: form.title || document.formID,
            id: document.id,
            index: idx
          };
        }
      );
    });
  }

  private getLocality(gatheringInfo: any): Observable<string> {
    let locality = gatheringInfo.locality;

    return this.translate.get('haseka.users.latest.localityMissing').switchMap((localityMissing) => {
      if (!locality) {
        locality = localityMissing;
      }

      return this.translate.get('haseka.users.latest.other').switchMap((other) => {
        if (gatheringInfo.localityCount > 0) {
          locality += ' (' + gatheringInfo.localityCount + ' ' + other + ')';
        }
        return Observable.of(locality);
      });
    });
  }

  private getObservers(userArray: string[] = []): Observable<string> {
    return Observable.from(userArray.map((userId) => {
      if (userId.indexOf('MA.') === 0) {
        return this.userService.getUser(userId)
          .map((user: Person) => {
            return user.fullName;
          });
      }
      return Observable.of(userId);
    }))
      .mergeAll()
      .toArray()
      .map((array) => {
        return array.join(', ');
      });
  }

  private getForm(formId: string): Observable<any> {
    if (this.formsById[formId]) { return Observable.of(this.formsById[formId]); }

    return this.formService
      .getForm(formId, this.translate.currentLang)
      .do((res: any) => {
        this.formsById[formId] = res;
      });
  }
}
