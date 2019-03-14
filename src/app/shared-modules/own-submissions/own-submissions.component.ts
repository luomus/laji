import { catchError, map, mergeAll, share, switchMap, tap, toArray } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Document } from '../../shared/model/Document';
import { UserService } from '../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, forkJoin as ObservableForkJoin, from as ObservableFrom, Observable, of as ObservableOf } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap';
import { LocalStorage } from 'ngx-webstorage';
import { DocumentExportService } from './service/document-export.service';
import { DownloadEvent, LabelEvent, RowDocument, TemplateEvent } from './own-datatable/own-datatable.component';
import { DocumentInfoService } from '../../shared/service/document-info.service';
import * as moment from 'moment';
import { Person } from '../../shared/model/Person';
import { FormService } from '../../shared/service/form.service';
import { TriplestoreLabelService } from '../../shared/service/triplestore-label.service';
import { Logger } from '../../shared/logger';
import { TemplateForm } from './models/template-form';
import { ToastsService } from '../../shared/service/toasts.service';
import { DocumentService } from './service/document.service';
import { PdfLabelService } from '../../shared/service/pdf-label.service';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { Router } from '@angular/router';

interface DocumentQuery {
  year?: number;
  onlyTemplates?: boolean;
  namedPlace?: string;
  collectionID?: string;
  formID?: string;
  selectedFields?: string;
}

export interface SearchDocument {
  id: string;
  formID: string;
  'gatherings[*].units[*].identifications[*]': string;
  'gatherings[*].units[*].count': string;
  'gatherings[*].units[*].individualCount': number[];
  'gatherings[*].units[*].pairCount': number[];
  'gatherings[*].units[*].abundanceString': string[];
  'gatherings[*].units[*].maleIndividualCount': number[];
  'gatherings[*].units[*].femaleIndividualCount': number[];
  'gatherings[*].units[*].informalNameString': string[];
  'gatherings[*].namedPlaceID': string[];
  'gatherings[*].locality': string[];
  'gatherings[*].id': string[];
  'gatherings[*].dateEnd': string[];
  'gatherings[*].dateBegin': string[];
  'gatheringEvent.dateEnd': string;
  'gatheringEvent.dateBegin': string;
  'namedPlaceID': string;
  'gatheringEvent.leg': string[];
  dateEdited: string;
  publicityRestrictions: string;
  templateDescription: string;
  templateName: string;
  locked: boolean;
  creator: string;
}

@Component({
  selector: 'laji-own-submissions',
  templateUrl: './own-submissions.component.html',
  styleUrls: ['./own-submissions.component.css'],
  providers: [DocumentExportService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnSubmissionsComponent implements OnChanges {

  @Input() collectionID;
  @Input() formID;
  @Input() showDownloadAll = true;
  @Input() showPrintLabels = false;
  @Input() admin = false;
  @Input() useInternalDocumentViewer = false;
  @Input() actions: string[]|false = ['edit', 'view', 'template', 'download', 'stats', 'delete'];
  @Input() columns = ['dateEdited', 'dateObserved', 'locality', 'observer', 'form', 'id'];
  @Input() columnNameMapping: any;
  @Input() templateColumns = ['templateName', 'templateDescription', 'dateEdited', 'form', 'id'];
  @Input() onlyTemplates = false;
  @Input() namedPlace: string;
  @Input() header: string;
  @Input() documentViewerGatheringGeometryJSONPath: string;
  @Input() forceLocalDocument = false;

  @ViewChild('documentModal') public modal: ModalDirective;

  publicity = Document.PublicityRestrictionsEnum;

  documents$: Observable<RowDocument[]>;
  shownDocument$: Observable<Document>;
  loading = true;

  @LocalStorage('own-submissions-year', '') year: number;
  yearInfo$: Observable<any[]>;

  yearInfoError: string;
  documentError: string;
  documentModalVisible = false;
  selectedFields = 'creator,id,gatherings[*].id,publicityRestrictions,formID';

  selectedMap = {
    templateName: 'templateName',
    templateDescription: 'templateDescription',
    dateEdited: 'dateEdited',
    form: 'formID',
    dateObserved: 'gatheringEvent.dateEnd,gatheringEvent.dateBegin,gatherings[*].dateBegin,gatherings[*].dateEnd',
    locality: 'gatherings[*].locality,namedPlaceID,gatherings[*].namedPlaceID',
    unitCount: 'gatherings[*].units[*]',
    observer: 'gatheringEvent.leg',
    namedPlaceName: 'namedPlaceID,gatherings[*].namedPlaceID',
    taxon: 'gatherings[*].units[*].identifications[*].taxonID',
  };

  templateForm: TemplateForm = {
    name: '',
    description: '',
    type: 'gathering'
  };

  constructor(
    private documentApi: DocumentApi,
    private userService: UserService,
    private translate: TranslateService,
    private documentExportService: DocumentExportService,
    private documentService: DocumentService,
    private formService: FormService,
    private labelService: TriplestoreLabelService,
    private toastService: ToastsService,
    private logger: Logger,
    private cd: ChangeDetectorRef,
    private pdfLabelService: PdfLabelService,
    private localizeRouterService: LocalizeRouterService,
    private router: Router
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    this.modal.config = {animated: false};
    this.initDocuments(this.onlyTemplates);
  }

  sliderRangeChange(newYear: number) {
    this.year = newYear;
    this.initDocuments(true);
  }

  onDocumentClick(docID: string) {
    this.shownDocument$ = this.documentApi.findById(docID, this.userService.getToken());
    this.modal.show();
  }

  saveTemplate(event: TemplateEvent) {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.documentApi.findById(event.documentID, this.userService.getToken()).pipe(
      switchMap(document => this.documentService.saveTemplate({...this.templateForm, document: document}))
    ).subscribe(
      () => {
        this.translate.get('template.success')
          .subscribe((value) => this.toastService.showSuccess(value));
        this.templateForm = {
          name: '',
          description: '',
          type: 'gathering'
        };
        this.loading = false;
        this.cd.markForCheck();
      },
      (err) => {
        this.translate.get('template.error')
          .subscribe((value) => this.toastService.showError(value));
        this.logger.error('Template saving failed', err);
        this.loading = false;
        this.cd.markForCheck();
      });
  }

  private initDocuments(onlyDocuments = false) {
    this.loading = true;

    if (this.namedPlace) {
      this.documents$ = this.getAllDocuments<SearchDocument>({
        year: !this.namedPlace && !this.onlyTemplates ? this.year : undefined,
        namedPlace: this.namedPlace,
        collectionID: this.collectionID,
        formID: this.formID,
        selectedFields: this.getSelectedFields()
      }).pipe(
        switchMap(documents => this.searchDocumentsToRowDocuments(documents)),
        tap(() => {
          this.loading = false;
          this.cd.markForCheck();
        })
      );
      return;
    }

    if (!onlyDocuments) {
      this.yearInfo$ = this.documentApi.countByYear(this.userService.getToken(), {
        namedPlace: this.namedPlace,
        collectionID: this.collectionID,
        formID: this.formID
      }).pipe(
        map(results => results.map(res => ({...res, year: parseInt(res.year, 10)})).reverse()),
        tap((results: any[]) => {
          if (this.year && results.findIndex(item => item.year === this.year) > -1) {
            return;
          }
          this.year = results.length > 0 ? results[0].year : new Date().getFullYear();
        }),
        catchError(() => {
          this.translate.get('haseka.form.genericError')
            .subscribe(msg => {
              this.yearInfoError = msg;
              this.cd.markForCheck();
            });
          return ObservableOf([]);
        }),
        share()
      );
    }
    this.documents$ = (onlyDocuments ? ObservableOf([]) : this.yearInfo$).pipe(
      switchMap(() => this.getAllDocuments<SearchDocument>({
        year: this.onlyTemplates ? undefined : this.year,
        onlyTemplates: this.onlyTemplates,
        namedPlace: this.namedPlace,
        collectionID: this.collectionID,
        formID: this.formID,
        selectedFields: this.getSelectedFields()
      })),
      switchMap(documents => this.searchDocumentsToRowDocuments(documents)),
      tap(() => {
        this.loading = false;
        this.cd.markForCheck();
      })
    );
  }

  download(e: DownloadEvent) {
    if (e.documentId) {
      this.documentExportService.downloadDocument(
        this.documentApi.findById(e.documentId, this.userService.getToken()), e.fileType
      );
    } else {
      this.documentExportService.downloadDocuments(
        this.getAllDocuments<Document>({year: this.year}), this.year, e.fileType
      );
    }
  }

  delete(docId: string) {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.documentService.deleteDocument(docId)
      .subscribe(
        () => {
          this.translate.get('delete.success')
            .subscribe((value) => this.toastService.showSuccess(value));
          this.loading = false;
          this.cd.markForCheck();
        },
        (err) => {
          this.translate.get('delete.error')
            .subscribe((value) => this.toastService.showError(value));
          this.initDocuments(this.onlyTemplates);
          this.logger.error('Deleting failed', err);
          this.loading = false;
          this.cd.markForCheck();
        }
      );
  }

  private getSelectedFields() {
    const selected = [this.selectedFields];
    const cols = this.onlyTemplates ? this.templateColumns : this.columns;
    cols.forEach(col => {
      if (this.selectedMap[col]) {
        this.selectedMap[col].split(',').forEach(field => {
          if (selected.indexOf(field) === -1) {
            selected.push(field);
          }
        });
      } else {
        this.logger.log('Cannot determinate which fields should be selected for "' + col + '" in OwnSubmissionsComponent');
      }
    });
    return selected.join(',');
  }

  private getAllDocuments<T>(
    query: DocumentQuery = {},
    page = 1,
    documents = []
  ): Observable<T[]> {
    return this.documentApi.findAll(
      this.userService.getToken(),
      String(page),
      String(10000),
      query.year ? String(query.year) : undefined,
      {
        templates: query.onlyTemplates ? 'true' : undefined,
        namedPlace: query.namedPlace,
        collectionID: query.collectionID,
        formID: query.formID,
        selectedFields: query.selectedFields
      }
    ).pipe(
      switchMap(result => {
        documents.push(...result.results);
        if ('currentPage' in result && 'lastPage' in result && result.currentPage !== result.lastPage) {
          return this.getAllDocuments<T>(query, result.currentPage + 1, documents);
        } else {
          return ObservableOf(documents);
        }
      }),
      catchError(() => {
        this.translate.get(query.year ? 'haseka.submissions.loadError' : 'np.loadError', {year: query.year})
          .subscribe(msg => {
            this.documentError = msg;
          });
        return ObservableOf([]);
      })
    );
  }

  private searchDocumentsToRowDocuments(documents: SearchDocument[]): Observable<RowDocument[]> {
    return Array.isArray(documents) && documents.length > 0 ?
      forkJoin(documents.map((doc, i) => this.setRowData(doc, i))) :
      ObservableOf([]);
  }

  private setRowData(document: SearchDocument, idx: number): Observable<RowDocument> {
    return this.getForm(document.formID).pipe(
      switchMap((form) => {
        const gatheringInfo = DocumentInfoService.getGatheringInfoFromSearchDocument(document, form);

        return ObservableForkJoin(
          this.getLocality(gatheringInfo, document.namedPlaceID),
          this.getObservers(document['gatheringEvent.leg']),
          this.getNamedPlaceName(document.namedPlaceID),
          this.getTaxon(document['gatherings[*].units[*].identifications[*].taxonID'])
        ).pipe(
          map<any, RowDocument>(([locality, observers, npName, taxon]) => {
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
              taxon,
              formID: document.formID,
              form: form.title || document.formID,
              id: document.id,
              locked: !!document.locked,
              index: idx,
              formViewerType: form.viewerType,
              _editUrl: this.formService.getEditUrlPath(document.formID, document.id),
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
    return this.formService.getForm(formId, this.translate.currentLang).pipe(
      catchError((err) => {
        this.logger.error('Failed to load form ' + formId, err);
        return ObservableOf({id: formId});
      }));
  }

  private getNamedPlaceName(npId: string): Observable<string> {
    if (!npId || this.columns.indexOf('namedPlaceName') === -1) { return ObservableOf(''); }
    return this.labelService.get(npId, 'multi');
  }

  private getTaxon(taxonId: string[]): Observable<string> {
    if (!taxonId || !taxonId.length || this.columns.indexOf('taxon') === -1) { return ObservableOf(''); }
    return this.labelService.get(taxonId[0], 'multi').pipe(
      map(langResult => langResult[this.translate.currentLang])
    );
  }

  doLabels(event: LabelEvent) {
    this.loading = true;
    const documents$ = ObservableForkJoin(
      event.documentIDs.map(id => this.documentApi.findById(id, this.userService.getToken()))
    );
    const year$ = this.getAllDocuments<Document>({year: event.year}).pipe(
      map(documents => documents.filter(doc => event.documentIDs.indexOf(doc.id) > -1))
    );
    (event.documentIDs.length > 10 ? year$ : documents$).pipe(
      tap((docs) => {
        this.pdfLabelService.setData(docs);
        this.loading = false;
        this.router.navigate(this.localizeRouterService.translateRoute(['/vihko/tools/label']));
      })
    ).subscribe();
  }
}
